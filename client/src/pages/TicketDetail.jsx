import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  addComment,
  getTicket,
  listAssignableAgents,
  updateTicketAssignment,
  updateTicketPriority,
  updateTicketStatus,
} from '../api/tickets.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { PriorityBadge } from '../components/PriorityBadge.jsx';
import { TicketTimeline } from '../components/TicketTimeline.jsx';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function TicketDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const canManage = user.role === 'agente' || user.role === 'admin';

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    const data = await getTicket(token, id);
    setTicket(data);
  }, [token, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (canManage && ticket) {
      listAssignableAgents(token, ticket.id).then((res) => setAgents(res.items));
    }
  }, [canManage, ticket?.id, token]);

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addComment(token, id, comment);
      setComment('');
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(status) {
    try {
      await updateTicketStatus(token, id, status);
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePriorityChange(priority) {
    try {
      await updateTicketPriority(token, id, priority);
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAssignmentChange(assignedTo) {
    try {
      await updateTicketAssignment(token, id, assignedTo ? Number(assignedTo) : null);
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ticket) return <div className="p-8 text-sm text-ink-muted">Cargando...</div>;

  return (
    <div className="flex gap-6 max-w-6xl mx-auto my-7 px-6 items-start">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-[13px] text-ink-muted font-medium">TCK-{ticket.id}</span>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="font-semibold text-xl text-ink mb-5">{ticket.subject}</div>

        <div className="bg-surface border border-border rounded-lg p-[18px] mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span className="text-[13px] font-semibold text-ink">{ticket.created_by_name}</span>
            <span className="text-xs text-ink-faint">
              {new Date(ticket.created_at).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="text-sm text-ink-soft leading-relaxed">{ticket.description}</div>
        </div>

        <TicketTimeline events={ticket.events} />

        <form onSubmit={handleComment} className="bg-surface border border-border rounded-lg p-3 mt-5">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribí una respuesta..."
            className="w-full h-20 border-none outline-none text-sm text-ink resize-y"
          />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-accent text-white rounded-md text-[13px] font-semibold disabled:opacity-60"
            >
              Responder
            </button>
          </div>
        </form>
      </div>

      <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
        {canManage ? (
          <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3.5">
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Estado</div>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm text-ink"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Asignar a</div>
              <select
                value={ticket.assigned_to ?? ''}
                onChange={(e) => handleAssignmentChange(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm text-ink"
              >
                <option value="">Sin asignar</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Prioridad</div>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm text-ink"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-[18px] flex flex-col gap-4">
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Agente asignado</div>
              <div className="text-sm text-ink">{ticket.assigned_to_name ?? 'Sin asignar'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Departamento</div>
              <div className="text-sm text-ink">{ticket.department_name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Prioridad</div>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">Creado</div>
              <div className="text-sm text-ink">{new Date(ticket.created_at).toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
