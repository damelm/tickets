import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listDepartments } from '../../api/departments.js';
import { listUsers, updateUser } from '../../api/users.js';
import { ToggleSwitch } from '../../components/ToggleSwitch.jsx';

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
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    listDepartments(token).then((res) => setDepartments(res.items));
  }, [token]);

  async function reload() {
    const res = await listUsers(token, { role: roleFilter, q, page, pageSize: PAGE_SIZE });
    setUsers(res.items);
    setTotal(res.total);
  }

  useEffect(() => {
    reload();
  }, [token, roleFilter, q, page]);

  function toggleRole(value) {
    setPage(1);
    setRoleFilter((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]));
  }

  async function handleRoleChange(user, role) {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
    await updateUser(token, user.id, { role });
  }

  async function handleDepartmentChange(user, departmentId) {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, department_id: departmentId } : u)));
    await updateUser(token, user.id, { departmentId: Number(departmentId) });
  }

  async function handleActiveToggle(user, isActive) {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: isActive } : u)));
    await updateUser(token, user.id, { isActive });
  }

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
      </div>

      <div className="flex-1 p-7 overflow-y-auto min-w-0">
        <div className="flex items-center justify-between mb-[18px]">
          <div>
            <div className="font-semibold text-xl text-ink">Usuarios</div>
            <div className="text-sm text-ink-muted mt-0.5">Gestioná roles y departamentos de los usuarios.</div>
          </div>
        </div>

        <div className="relative mb-4 max-w-80">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Buscar por nombre o email..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

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
              {users.map((u) => (
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
              Mostrando {from}-{to} de {total} usuarios
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-ink-soft disabled:text-ink-faint disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={to >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-ink-soft disabled:text-ink-faint disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
