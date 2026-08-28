export function ErrorState({
  title = 'No pudimos cargar la información',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-400 mb-3"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5M12 16h.01" />
      </svg>
      <div className="text-sm font-semibold text-ink-soft">{title}</div>
      {message && <div className="text-[13px] text-ink-muted mt-1 max-w-sm">{message}</div>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-white text-ink-soft border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function InlineError({ message, onRetry, className = '' }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-[13px] text-red-700 ${className}`}
      role="alert"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="flex-shrink-0 mt-px"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5M12 16h.01" />
      </svg>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline shrink-0">
          Reintentar
        </button>
      )}
    </div>
  );
}
