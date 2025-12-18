// Obtener color de badge según estado
export function getStatusColor(estado) {
  const colors = {
    'Nuevo': 'blue',
    'En curso': 'cyan',
    'Pausado': 'yellow',
    'Resuelto': 'green',
    'Cerrado': 'gray'
  };
  return colors[estado] || 'gray';
}

// Obtener color de badge según prioridad
export function getPriorityColor(prioridad) {
  const colors = {
    'Baja': 'gray',
    'Media': 'cyan',
    'Alta': 'yellow',
    'Crítica': 'red'
  };
  return colors[prioridad] || 'gray';
}

// Obtener color de badge según SLA
export function getSLAColor(slaStatus) {
  const colors = {
    'ok': 'green',
    'warn': 'yellow',
    'critical': 'red',
    'closed': 'gray',
    'paused': 'gray'
  };
  return colors[slaStatus] || 'gray';
}

// Formatear fecha
export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatear fecha corta
export function formatDateShort(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Formatear hora
export function formatTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('es-PY', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Obtener icono según categoría
export function getCategoryIcon(categoria) {
  const icons = {
    'Equipos y Hardware': '🖥️',
    'Conectividad y Red': '🌐',
    'Accesos y Cuentas': '🔐',
    'Software y Aplicaciones': '💻',
    'Telefonía y Comunicación': '📞',
    'Otros / Consultas': '📦'
  };
  return icons[categoria] || '📋';
}

// Validar email
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Truncar texto
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Calcular porcentaje
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Formatear número con separadores de miles
export function formatNumber(num) {
  return num.toLocaleString('es-PY');
}
