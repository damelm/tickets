const TONES = {
  default: 'text-ink',
  accent: 'text-accent',
  alert: 'text-[#991b1b]',
};

export function KpiCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3.5">
      <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-semibold mt-1.5 tabular-nums ${TONES[tone]}`}>{value}</div>
      <div className="text-xs text-ink-faint mt-1 min-h-4">{hint}</div>
    </div>
  );
}
