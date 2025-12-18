import db from '../database.js';

export function startAutoCloseService() {
  // Ejecutar cada 30 minutos
  const INTERVAL = 30 * 60 * 1000; // 30 minutos en milisegundos

  console.log('🔄 Servicio de autocierre iniciado (cada 30 minutos)');

  const checkAndCloseTickets = () => {
    try {
      // Obtener configuración de autocierre
      const config = db.prepare('SELECT value FROM configuracion WHERE key = ?')
        .get('autocierre_horas');

      const autocierreHoras = parseInt(config?.value || 72);

      // Buscar tickets resueltos que deben cerrarse
      const tickets = db.prepare(`
        SELECT id, titulo, contacto, solicitante
        FROM tickets
        WHERE estado = 'Resuelto'
        AND datetime(fecha_resuelto, '+${autocierreHoras} hours') <= datetime('now')
      `).all();

      if (tickets.length === 0) {
        console.log('✓ Autocierre: No hay tickets para cerrar');
        return;
      }

      const updateStmt = db.prepare(`
        UPDATE tickets
        SET estado = 'Cerrado',
            fecha_cerrado = datetime('now'),
            ultima_actualizacion = datetime('now')
        WHERE id = ?
      `);

      const historialStmt = db.prepare(`
        INSERT INTO historial (ticket_id, usuario, campo, valor_anterior, valor_nuevo, comentario)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const ticket of tickets) {
        // Actualizar ticket
        updateStmt.run(ticket.id);

        // Registrar en historial
        historialStmt.run(
          ticket.id,
          'Sistema',
          'estado',
          'Resuelto',
          'Cerrado',
          `Autocierre automático después de ${autocierreHoras} horas`
        );

        console.log(`✅ Ticket #${ticket.id} cerrado automáticamente: ${ticket.titulo}`);
      }

      console.log(`✅ Autocierre completado: ${tickets.length} ticket(s) cerrado(s)`);

    } catch (error) {
      console.error('❌ Error en servicio de autocierre:', error.message);
    }
  };

  // Ejecutar inmediatamente al iniciar
  checkAndCloseTickets();

  // Luego ejecutar cada 30 minutos
  setInterval(checkAndCloseTickets, INTERVAL);
}
