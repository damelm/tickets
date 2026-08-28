import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listMyTickets } from '../../api/tickets.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { SkeletonTableRows } from '../../components/Skeleton.jsx';

export function MisTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMyTickets(token);
      setTickets(res.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="px-8 py-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-semibold text-xl text-ink">Mis tickets</div>
          <div className="text-sm text-ink-muted mt-0.5">Seguí el estado de las solicitudes que abriste.</div>
        </div>
        <Link
          to="/tickets/nuevo"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo ticket
        </Link>
      </div>

      {error ? (
        <div className="bg-surface border border-border rounded-lg">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Ticket</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Departamento</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Asunto</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Creado</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTableRows rows={5} columns={5} />}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="Todavía no creaste ningún ticket"
                      description="Cuando abras una solicitud a un departamento, la vas a ver acá con su estado."
                      action={
                        <Link
                          to="/tickets/nuevo"
                          className="inline-flex px-4 py-2 bg-accent text-white rounded-md text-[13px] font-semibold hover:bg-blue-600 transition-colors"
                        >
                          Crear mi primer ticket
                        </Link>
                      }
                    />
                  </td>
                </tr>
              )}

              {!loading &&
                tickets.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/tickets/${t.id}`} className="text-[13px] text-ink-muted font-medium hover:underline">
                        TCK-{t.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{t.department_name}</td>
                    <td className="px-4 py-3 text-sm text-ink">
                      <Link to={`/tickets/${t.id}`} className="hover:underline">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-faint">
                      {new Date(t.created_at).toLocaleDateString('es-AR')}
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
