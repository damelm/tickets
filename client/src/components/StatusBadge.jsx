const LABELS = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export function StatusBadge({ status }) {
  return (
    <span
      className="px-2.5 py-0.5 text-xs font-semibold rounded-full"
      style={{
        background: `var(--color-status-${status}-bg)`,
        color: `var(--color-status-${status}-text)`,
      }}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
