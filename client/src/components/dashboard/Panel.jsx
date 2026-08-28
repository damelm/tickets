export function Panel({ title, hint, children, className = '' }) {
  return (
    <section className={`bg-surface border border-border rounded-lg p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {hint && <p className="text-xs text-ink-muted mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
