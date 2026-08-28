import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge } from '../PriorityBadge.jsx';

export const KanbanCard = memo(function KanbanCard({
  ticket,
  columns,
  dragging,
  pending,
  onDragStart,
  onDragEnd,
  onStatusChange,
}) {
  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      onDragEnd={onDragEnd}
      className={`relative bg-surface border rounded-md p-3 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        dragging ? 'opacity-40 border-accent shadow-md' : 'border-border hover:border-ink-faint hover:shadow-sm'
      } ${pending ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <Link
          to={`/tickets/${ticket.id}`}
          draggable={false}
          className="text-xs text-ink-muted font-medium hover:underline"
        >
          TCK-{ticket.id}
        </Link>
        <PriorityBadge priority={ticket.priority} />
      </div>

      <Link
        to={`/tickets/${ticket.id}`}
        draggable={false}
        className="block text-sm text-ink mb-2 leading-snug hover:underline"
      >
        {ticket.subject}
      </Link>

      {ticket.assigned_to_name && (
        <div className="text-[11px] text-ink-faint mb-2 truncate">{ticket.assigned_to_name}</div>
      )}

      <label className="block">
        <span className="sr-only">Estado de TCK-{ticket.id}</span>
        <select
          value={ticket.status}
          disabled={pending}
          onChange={(e) => onStatusChange(ticket.id, ticket.status, e.target.value)}
          onDragStart={(e) => e.preventDefault()}
          className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-ink-soft cursor-pointer disabled:cursor-wait"
        >
          {columns.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
});
