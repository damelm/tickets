import { STATUS_LABELS } from '../constants/tickets.js';

export function StatusBadge({ status }) {
  return (
    <span
      className="px-2.5 py-0.5 text-xs font-semibold rounded-full"
      style={{
        background: `var(--color-status-${status}-bg)`,
        color: `var(--color-status-${status}-text)`,
      }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
