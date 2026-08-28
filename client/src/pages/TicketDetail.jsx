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
import { Spinner, LoadingState } from '../components/Spinner.jsx';
import { ErrorState, InlineError } from '../components/ErrorState.jsx';

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
  const [loadError, setLoadError] = useState(null);
  const [savingField, setSavingField] = useState(null);

  const reload = useCallback(async () => {
    const data = await getTicket(token, id);
    setTicket(data);
  }, [token, id]);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      await reload();
    } catch (err) {
      setLoadError(err.message);
    }
  }, [reload]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (canManage && ticket) {
      listAssignableAgents(token, ticket.id)
        .then((res) => setAgents(res.items))
        .catch(() => setAgents([]));
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

  async function applyChange(field, action) {
    setSavingField(field);
    setError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingField(null);
    }
  }

  const handleStatusChange = (status) =>
    applyChange('status', () => updateTicketStatus(token, id, status));

  const handlePriorityChange = (priority) =>
    applyChange('priority', () => updateTicketPriority(token, id, priority));

  const handleAssignmentChange = (assignedTo) =>
    applyChange('assignment', () =>
      updateTicketAssignment(token, id, assignedTo ? Number(assignedTo) : null),
    );

  if (loadError && !ticket) {
    return (
      <div className="max-w-md mx-auto my-10 px-6">
        <div className="bg-surface border border-border rounded-lg">
          <ErrorState title="No pudimos cargar el ticket" message={loadError} onRetry={load} />
        </div>
      </div>
    );
  }

  if (!ticket) return <LoadingState label="Cargando ticket..." />;

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
          <InlineError message={error} className="mt-1" />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-[13px] font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Spinner size="sm" />}
              {submitting ? 'Enviando...' : 'Responder'}
            </button>
          </div>
        </form>
      </div>

      <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
        {canManage ? (
          <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3.5">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Estado</span>
                {savingField === 'status' && <Spinner size="sm" className="text-ink-faint" />}
              </div>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={savingField === 'status'}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm text-ink disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Asignar a</span>
                {savingField === 'assignment' && <Spinner size="sm" className="text-ink-faint" />}
              </div>
              <select
                value={ticket.assigned_to ?? ''}
                onChange={(e) => handleAssignmentChange(e.target.value)}
                disabled={savingField === 'assignment'}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm text-ink disabled:opacity-60"
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
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Prioridad</span>
                {savingField === 'priority' && <Spinner size="sm" className="text-ink-faint" />}
              </div>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={savingField === 'priority'}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-sm text-ink disabled:opacity-60"
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
