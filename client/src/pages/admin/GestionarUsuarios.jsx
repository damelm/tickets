import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listDepartments } from '../../api/departments.js';
import { listUsers, updateUser } from '../../api/users.js';
import { ToggleSwitch } from '../../components/ToggleSwitch.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState, InlineError } from '../../components/ErrorState.jsx';
import { SkeletonTableRows } from '../../components/Skeleton.jsx';

const ROLES = [
  { value: 'empleado', label: 'Empleado' },
  { value: 'agente', label: 'Agente' },
  { value: 'admin', label: 'Admin' },
];

const PAGE_SIZE = 50;

export function GestionarUsuarios() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [roleFilter, setRoleFilter] = useState(ROLES.map((r) => r.value));
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    listDepartments(token)
      .then((res) => setDepartments(res.items))
      .catch(() => setDepartments([]));
  }, [token]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers(token, { role: roleFilter, q, page, pageSize: PAGE_SIZE });
      setUsers(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, roleFilter, q, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setQ(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    reload();
  }, [reload]);

  function toggleRole(value) {
    setPage(1);
    setRoleFilter((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]));
  }

  function resetFilters() {
    setSearch('');
    setRoleFilter(ROLES.map((r) => r.value));
  }

  async function saveUser(user, optimistic, payload) {
    const previous = users;
    setSaveError(null);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...optimistic } : u)));
    try {
      await updateUser(token, user.id, payload);
    } catch (err) {
      setUsers(previous);
      setSaveError(`No se pudo actualizar a ${user.full_name}: ${err.message}`);
    }
  }

  const handleRoleChange = (user, role) => saveUser(user, { role }, { role });

  const handleDepartmentChange = (user, departmentId) =>
    saveUser(user, { department_id: departmentId }, { departmentId: Number(departmentId) });

  const handleActiveToggle = (user, isActive) => saveUser(user, { is_active: isActive }, { isActive });

  const filtered = q !== '' || roleFilter.length !== ROLES.length;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="w-[220px] bg-surface border-r border-border p-5 overflow-y-auto flex-shrink-0">
        <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">Rol</div>
        {ROLES.map((r) => (
          <label key={r.value} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={roleFilter.includes(r.value)} onChange={() => toggleRole(r.value)} />
            <span className="text-[13px] text-ink-soft">{r.label}</span>
          </label>
        ))}
        {filtered && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-[13px] text-accent font-medium hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="flex-1 p-7 overflow-y-auto min-w-0">
        <div className="flex items-center justify-between mb-[18px]">
          <div>
            <div className="font-semibold text-xl text-ink">Usuarios</div>
            <div className="text-sm text-ink-muted mt-0.5">Gestioná roles y departamentos de los usuarios.</div>
          </div>
        </div>

        <div className="relative mb-4 max-w-80">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <InlineError message={saveError} className="mb-4" />

        {error ? (
          <div className="bg-surface border border-border rounded-lg">
            <ErrorState title="No pudimos cargar los usuarios" message={error} onRetry={reload} />
          </div>
        ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Departamento</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTableRows rows={10} columns={5} />}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    {roleFilter.length === 0 ? (
                      <EmptyState
                        icon="filter"
                        title="No hay ningún rol seleccionado"
                        description="Elegí al menos un rol en el panel de la izquierda para ver usuarios."
                      />
                    ) : filtered ? (
                      <EmptyState
                        icon="search"
                        title="No hay resultados"
                        description="Ningún usuario coincide con la búsqueda y los filtros aplicados."
                        action={
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="px-4 py-2 bg-white text-ink-soft border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50"
                          >
                            Limpiar filtros
                          </button>
                        }
                      />
                    ) : (
                      <EmptyState icon="users" title="Todavía no hay usuarios registrados" />
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-ink">{u.full_name}</td>
                  <td className="px-4 py-2.5 text-[13px] text-ink-muted">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-[13px]"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={u.department_id ?? ''}
                      onChange={(e) => handleDepartmentChange(u, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-[13px]"
                    >
                      <option value="">—</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <ToggleSwitch checked={u.is_active} onChange={(next) => handleActiveToggle(u, next)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-[13px] text-ink-muted">
              {loading ? 'Cargando usuarios...' : `Mostrando ${from}-${to} de ${total} usuarios`}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-ink-soft hover:bg-gray-50 disabled:text-ink-faint disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={loading || to >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-ink-soft hover:bg-gray-50 disabled:text-ink-faint disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
