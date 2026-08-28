import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listTickets } from '../../api/tickets.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { PriorityBadge } from '../../components/PriorityBadge.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { SkeletonTableRows } from '../../components/Skeleton.jsx';

const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export function IssueList() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(STATUSES.map((s) => s.value));
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTickets(token, { status: statusFilter, q });
      setTickets(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, q]);

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleStatus(value) {
    setStatusFilter((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter(STATUSES.map((s) => s.value));
  }

  const filtered = q !== '' || statusFilter.length !== STATUSES.length;

  return (
    <div className="flex" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="w-60 bg-surface border-r border-border p-5 overflow-y-auto flex-shrink-0">
        <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Estado</div>
        {STATUSES.map((s) => (
          <label key={s.value} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="checkbox" checked={statusFilter.includes(s.value)} onChange={() => toggleStatus(s.value)} />
            <span className="text-sm text-ink-soft">{s.label}</span>
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

      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-xl text-ink">Tickets{!loading && !error && ` (${total})`}</div>
          <div className="relative">
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
              placeholder="Buscar por asunto..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-64"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-surface border border-border rounded-lg">
            <ErrorState title="No pudimos cargar los tickets" message={error} onRetry={load} />
          </div>
        ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Ticket</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Asunto</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Prioridad</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Asignado</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTableRows rows={8} columns={5} />}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    {statusFilter.length === 0 ? (
                      <EmptyState
                        icon="filter"
                        title="No hay ningún estado seleccionado"
                        description="Elegí al menos un estado en el panel de la izquierda para ver tickets."
                      />
                    ) : filtered ? (
                      <EmptyState
                        icon="search"
                        title="No hay resultados"
                        description="Ningún ticket coincide con la búsqueda y los filtros aplicados."
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
                      <EmptyState
                        title="Todavía no hay tickets"
                        description="Cuando los empleados abran solicitudes, van a aparecer acá."
                      />
                    )}
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
                  <td className="px-4 py-3 text-sm text-ink">
                    <Link to={`/tickets/${t.id}`} className="hover:underline">
                      {t.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{t.assigned_to_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
