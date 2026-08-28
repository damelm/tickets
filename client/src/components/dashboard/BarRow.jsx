export function BarRow({ label, value, share, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[104px] shrink-0">{label}</div>
      <div className="flex-1 min-w-0 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${share}%`, background: color }} />
      </div>
      <div className="w-[74px] shrink-0 text-right text-[13px] text-ink tabular-nums">
        {value} <span className="text-ink-faint">{share}%</span>
      </div>
    </div>
  );
}
