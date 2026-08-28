const ICONS = {
  inbox: (
    <>
      <path d="M3 13h5l1.5 3h5L16 13h5" />
      <path d="M5 5h14l2 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2-8z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 14.2A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
    </>
  ),
};

export function EmptyState({ icon = 'inbox', title, description, action, compact = false, className = '' }) {
  const iconSize = compact ? 24 : 40;
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'px-3 py-5 gap-0.5' : 'px-6 py-14'
      } ${className}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-ink-faint ${compact ? 'mb-1.5' : 'mb-3'}`}
        aria-hidden="true"
      >
        {ICONS[icon] ?? ICONS.inbox}
      </svg>
      <div className={`font-semibold text-ink-soft ${compact ? 'text-[13px]' : 'text-sm'}`}>{title}</div>
      {description && (
        <div className={`text-ink-muted max-w-xs ${compact ? 'text-xs' : 'text-[13px] mt-1'}`}>{description}</div>
      )}
      {action && <div className={compact ? 'mt-2' : 'mt-4'}>{action}</div>}
    </div>
  );
}
