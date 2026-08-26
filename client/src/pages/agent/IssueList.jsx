import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listTickets } from '../../api/tickets.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { PriorityBadge } from '../../components/PriorityBadge.jsx';

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
  const [q, setQ] = useState('');

  useEffect(() => {
    listTickets(token, { status: statusFilter, q }).then((res) => {
      setTickets(res.items);
      setTotal(res.total);
    });
  }, [token, statusFilter, q]);

  function toggleStatus(value) {
    setStatusFilter((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }

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
      </div>

      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-xl text-ink">Tickets ({total})</div>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por asunto..."
              className="pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm w-64"
            />
          </div>
        </div>

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
              {tickets.map((t) => (
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
      </div>
    </div>
  );
}
