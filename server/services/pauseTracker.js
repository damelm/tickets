import db from '../database.js';

// Cuando un ticket pasa a estado "Pausado"
export function onTicketPaused(ticketId) {
  const stmt = db.prepare(`
    UPDATE tickets
    SET fecha_pausado = datetime('now')
    WHERE id = ?
  `);
  stmt.run(ticketId);
}

// Cuando un ticket sale del estado "Pausado"
export function onTicketResumed(ticketId) {
  const ticket = db.prepare('SELECT fecha_pausado FROM tickets WHERE id = ?').get(ticketId);

  if (!ticket || !ticket.fecha_pausado) {
    return;
  }

  // Calcular tiempo pausado
  const pausedAt = new Date(ticket.fecha_pausado);
  const now = new Date();
  const pausedMinutes = Math.floor((now - pausedAt) / (1000 * 60));

  // Acumular tiempo de pausa
  const stmt = db.prepare(`
    UPDATE tickets
    SET pausa_acumulada_min = pausa_acumulada_min + ?,
        fecha_pausado = NULL
    WHERE id = ?
  `);
  stmt.run(pausedMinutes, ticketId);
}
