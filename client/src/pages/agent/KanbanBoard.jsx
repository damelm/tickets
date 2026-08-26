import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listTickets, updateTicketStatus } from '../../api/tickets.js';
import { PriorityBadge } from '../../components/PriorityBadge.jsx';

const COLUMNS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export function KanbanBoard() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);

  async function reload() {
    const res = await listTickets(token, { pageSize: 100 });
    setTickets(res.items);
  }

  useEffect(() => {
    reload();
  }, [token]);

  async function handleStatusChange(ticketId, status) {
    await updateTicketStatus(token, ticketId, status);
    await reload();
  }

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.value);
          return (
            <div key={col.value} className="w-[280px] bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-semibold text-ink-muted uppercase tracking-wide">{col.label}</div>
                <div className="bg-gray-200 text-ink-muted text-xs font-semibold px-2 py-0.5 rounded-full">
                  {colTickets.length}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {colTickets.map((t) => (
                  <div key={t.id} className="bg-surface border border-border rounded-md p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Link to={`/tickets/${t.id}`} className="text-xs text-ink-muted font-medium hover:underline">
                        TCK-{t.id}
                      </Link>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <Link to={`/tickets/${t.id}`} className="block text-sm text-ink mb-2 leading-snug hover:underline">
                      {t.subject}
                    </Link>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-ink-soft"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
