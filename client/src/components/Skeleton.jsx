const ROUNDED = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' };

export function Skeleton({ width = '100%', height = 12, rounded = 'md', className = '' }) {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${ROUNDED[rounded] ?? ROUNDED.md} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={10} />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, columns = 4 }) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r} className="border-b border-gray-100 last:border-b-0">
      {Array.from({ length: columns }, (_, c) => (
        <td key={c} className="px-4 py-3">
          <Skeleton width={c === 1 ? '75%' : '55%'} height={10} />
        </td>
      ))}
    </tr>
  ));
}
