import db from '../database.js';

export function getSLAConfig() {
  const configs = db.prepare("SELECT * FROM configuracion WHERE key LIKE 'sla_%'").all();

  return {
    Crítica: parseInt(configs.find(c => c.key === 'sla_critica')?.value || 4),
    Alta: parseInt(configs.find(c => c.key === 'sla_alta')?.value || 8),
    Media: parseInt(configs.find(c => c.key === 'sla_media')?.value || 24),
    Baja: parseInt(configs.find(c => c.key === 'sla_baja')?.value || 72)
  };
}

export function calculateSLA(ticket) {
  const slaConfig = getSLAConfig();
  const slaLimitHours = slaConfig[ticket.urgencia_validada] || 24;
  const slaLimitMinutes = slaLimitHours * 60;

  // Si el ticket está cerrado o pausado
  if (ticket.estado === 'Cerrado') {
    return {
      status: 'closed',
      remaining: 0,
      percentage: 100,
      display: 'Cerrado'
    };
  }

  if (ticket.estado === 'Pausado') {
    return {
      status: 'paused',
      remaining: slaLimitMinutes,
      percentage: 0,
      display: 'Pausado'
    };
  }

  // Calcular tiempo transcurrido
  const createdAt = new Date(ticket.fecha_creacion);
  const now = new Date();
  const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60));

  // Restar tiempo en pausa acumulado
  const pauseMinutes = ticket.pausa_acumulada_min || 0;
  const effectiveElapsed = elapsedMinutes - pauseMinutes;

  const remainingMinutes = slaLimitMinutes - effectiveElapsed;
  const percentage = Math.max(0, Math.min(100, (effectiveElapsed / slaLimitMinutes) * 100));

  let status = 'ok';
  let display = '';

  if (remainingMinutes <= 0) {
    status = 'critical';
    const overdueHours = Math.floor(Math.abs(remainingMinutes) / 60);
    const overdueMinutes = Math.abs(remainingMinutes) % 60;
    display = `Vencido ${overdueHours}h ${overdueMinutes}m`;
  } else {
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    display = `${hours}h ${minutes}m`;

    // Si queda menos del 25% del tiempo
    if (percentage >= 75) {
      status = 'warn';
    }
  }

  return {
    status,
    remaining: remainingMinutes,
    percentage: Math.round(percentage),
    display
  };
}

export function getTicketsWithSLA(tickets) {
  return tickets.map(ticket => ({
    ...ticket,
    sla: calculateSLA(ticket)
  }));
}
