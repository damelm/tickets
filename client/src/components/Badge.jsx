export default function Badge({ children, color = 'gray', className = '' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-slate-100 text-slate-800'
  };

  return (
    <span className={`badge ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
