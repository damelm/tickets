import { PRIORITY_LABELS } from '../constants/tickets.js';

export function PriorityBadge({ priority }) {
  return (
    <span
      className="px-2 py-0.5 text-[11px] font-semibold rounded"
      style={{
        background: `var(--color-priority-${priority}-bg)`,
        color: `var(--color-priority-${priority}-text)`,
      }}
    >
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
