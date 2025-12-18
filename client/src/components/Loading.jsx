export default function Loading({ message = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-700"></div>
        <p className="mt-4 text-slate-600">{message}</p>
      </div>
    </div>
  );
}
