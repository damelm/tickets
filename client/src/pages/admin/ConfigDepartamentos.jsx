import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listDepartments, toggleDepartment } from '../../api/departments.js';
import { ToggleSwitch } from '../../components/ToggleSwitch.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState, InlineError } from '../../components/ErrorState.jsx';
import { SkeletonTableRows } from '../../components/Skeleton.jsx';

export function ConfigDepartamentos() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleError, setToggleError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDepartments(token);
      setDepartments(res.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(id, next) {
    const previous = departments;
    setToggleError(null);
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, accepts_tickets: next } : d)));
    try {
      await toggleDepartment(token, id, next);
    } catch (err) {
      setDepartments(previous);
      setToggleError(`No se pudo guardar el cambio: ${err.message}`);
    }
  }

  return (
    <div className="px-7 py-6 max-w-4xl mx-auto">
      <div className="font-semibold text-xl text-ink mb-1">Configuración de departamentos</div>
      <div className="text-sm text-ink-muted mb-5">Definí qué departamentos pueden recibir tickets nuevos.</div>

      <InlineError message={toggleError} className="mb-4" />

      {error ? (
        <div className="bg-surface border border-border rounded-lg">
          <ErrorState title="No pudimos cargar los departamentos" message={error} onRetry={load} />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Departamento</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Miembros</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Recibe tickets</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTableRows rows={5} columns={3} />}

              {!loading && departments.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      title="No hay departamentos configurados"
                      description="Creá departamentos para que los empleados puedan dirigirles sus tickets."
                    />
                  </td>
                </tr>
              )}

              {!loading &&
                departments.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm text-ink font-medium">{d.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-ink-muted">{d.member_count}</td>
                    <td className="px-4 py-2.5 text-right">
                      <ToggleSwitch checked={d.accepts_tickets} onChange={(next) => handleToggle(d.id, next)} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
