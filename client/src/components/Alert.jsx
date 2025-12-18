export default function Alert({ type = 'info', message, onClose }) {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ'
    }
  };

  const style = types[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-start justify-between`}>
      <div className="flex items-start space-x-3">
        <span className={`${style.text} font-bold text-lg`}>{style.icon}</span>
        <p className={`${style.text} text-sm`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-75 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
