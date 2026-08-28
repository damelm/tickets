const SIZES = { sm: 16, md: 24, lg: 32 };

export function Spinner({ size = 'md', label, className = '' }) {
  const px = SIZES[size] ?? SIZES.md;
  const icon = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${label ? '' : className}`}
      role="status"
      aria-label={label ?? 'Cargando'}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (!label) return icon;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {icon}
      <span className="text-sm text-ink-muted">{label}</span>
    </span>
  );
}

export function LoadingState({ label = 'Cargando...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 px-6 py-14 ${className}`}>
      <Spinner size="lg" className="text-ink-faint" />
      <div className="text-sm text-ink-muted">{label}</div>
    </div>
  );
}
