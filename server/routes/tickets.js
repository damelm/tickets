import express from 'express';
import db from '../database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { getTicketsWithSLA, calculateSLA } from '../utils/sla.js';
import { sendEmail, EmailTypes } from '../services/email.js';
import { onTicketPaused, onTicketResumed } from '../services/pauseTracker.js';

const router = express.Router();

// Crear ticket (público - sin autenticación)
router.post('/', async (req, res) => {
  const {
    titulo,
    descripcion,
    prioridad_usuario,
    categoria,
    sede,
    solicitante,
    contacto
  } = req.body;

  // Validaciones básicas
  if (!titulo || !descripcion || !prioridad_usuario || !categoria || !sede || !solicitante || !contacto) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tickets (
        titulo, descripcion, prioridad_usuario, urgencia_validada,
        categoria, sede, solicitante, contacto, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Por defecto, urgencia validada = prioridad del usuario
    const result = stmt.run(
      titulo,
      descripcion,
      prioridad_usuario,
      prioridad_usuario, // urgencia_validada inicial
      categoria,
      sede,
      solicitante,
      contacto,
      'Nuevo'
    );

    const ticketId = result.lastInsertRowid;

    // Registrar en historial
    const historialStmt = db.prepare(`
      INSERT INTO historial (ticket_id, usuario, campo, valor_nuevo, comentario)
      VALUES (?, ?, ?, ?, ?)
    `);

    historialStmt.run(
      ticketId,
      solicitante,
      'creacion',
      'Nuevo',
      'Ticket creado'
    );

    // Obtener ticket completo
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);

    // Enviar email de confirmación
    await sendEmail(
      contacto,
      `Ticket #${ticketId} - Creado`,
      EmailTypes.TICKET_CREADO,
      ticket
    );

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket: {
        ...ticket,
        sla: calculateSLA(ticket)
      }
    });

  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

// Obtener todos los tickets (requiere autenticación)
router.get('/', verifyToken, (req, res) => {
  try {
    const { estado, prioridad, categoria, sede, search, filter } = req.query;

    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];

    // Filtros para auxiliares (solo sus tickets)
    if (req.user.rol === 'Auxiliar') {
      if (filter === 'sin-asignar') {
        query += ' AND asignado IS NULL';
      } else {
        query += ' AND asignado = ?';
        params.push(req.user.nombre);
      }
    }

    // Filtros generales
    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    if (prioridad) {
      query += ' AND urgencia_validada = ?';
      params.push(prioridad);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (sede) {
      query += ' AND sede = ?';
      params.push(sede);
    }

    if (search) {
      query += ' AND (titulo LIKE ? OR solicitante LIKE ? OR descripcion LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Filtros especiales para admin
    if (req.user.rol === 'Admin') {
      if (filter === 'mis-tickets') {
        query += ' AND asignado = ?';
        params.push(req.user.nombre);
      } else if (filter === 'criticos') {
        query += ' AND urgencia_validada = ?';
        params.push('Crítica');
      } else if (filter === 'sin-asignar') {
        query += ' AND asignado IS NULL';
      } else if (filter === 'en-curso') {
        query += ' AND estado = ?';
        params.push('En curso');
      }
    }

    query += ' ORDER BY fecha_creacion DESC';

    const tickets = db.prepare(query).all(...params);
    const ticketsWithSLA = getTicketsWithSLA(tickets);

    res.json({ tickets: ticketsWithSLA });

  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Obtener ticket por ID
router.get('/:id', verifyToken, (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Verificar permisos para auxiliares
    if (req.user.rol === 'Auxiliar' && ticket.asignado !== req.user.nombre && ticket.asignado !== null) {
      return res.status(403).json({ error: 'No tienes permiso para ver este ticket' });
    }

    // Obtener historial
    const historial = db.prepare(`
      SELECT * FROM historial
      WHERE ticket_id = ?
      ORDER BY fecha DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({
      ticket: {
        ...ticket,
        sla: calculateSLA(ticket)
      },
      historial
    });

  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
});

// Tomar ticket (auxiliar)
router.post('/:id/tomar', verifyToken, async (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    if (ticket.asignado) {
      return res.status(400).json({ error: 'El ticket ya está asignado' });
    }

    // Asignar ticket y cambiar a "En curso"
    const stmt = db.prepare(`
      UPDATE tickets
      SET asignado = ?,
          estado = 'En curso',
          fecha_en_curso = datetime('now'),
          ultima_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(req.user.nombre, req.params.id);

    // Registrar en historial
    const historialStmt = db.prepare(`
      INSERT INTO historial (ticket_id, usuario, campo, valor_anterior, valor_nuevo)
      VALUES (?, ?, ?, ?, ?)
    `);

    historialStmt.run(req.params.id, req.user.nombre, 'asignado', null, req.user.nombre);
    historialStmt.run(req.params.id, req.user.nombre, 'estado', ticket.estado, 'En curso');

    // Obtener ticket actualizado
    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    // Enviar email
    await sendEmail(
      ticket.contacto,
      `Ticket #${ticket.id} - Asignado`,
      EmailTypes.TICKET_ASIGNADO,
      { ...updatedTicket, asignado: req.user.nombre }
    );

    res.json({
      message: 'Ticket asignado exitosamente',
      ticket: {
        ...updatedTicket,
        sla: calculateSLA(updatedTicket)
      }
    });

  } catch (error) {
    console.error('Error al tomar ticket:', error);
    res.status(500).json({ error: 'Error al tomar ticket' });
  }
});

// Actualizar ticket
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Verificar permisos
    if (req.user.rol === 'Auxiliar') {
      if (ticket.asignado !== req.user.nombre) {
        return res.status(403).json({ error: 'No tienes permiso para editar este ticket' });
      }

      // Los auxiliares no pueden cambiar ciertos campos
      const allowedFields = ['estado', 'comentarios'];
      const requestedFields = Object.keys(req.body);

      for (const field of requestedFields) {
        if (!allowedFields.includes(field)) {
          return res.status(403).json({ error: `No tienes permiso para cambiar el campo: ${field}` });
        }
      }

      // Los auxiliares no pueden cerrar tickets
      if (req.body.estado === 'Cerrado') {
        return res.status(403).json({ error: 'No tienes permiso para cerrar tickets' });
      }
    }

    const updates = [];
    const params = [];
    const historialEntries = [];

    // Campos actualizables
    const allowedFields = req.user.rol === 'Admin'
      ? ['titulo', 'descripcion', 'estado', 'urgencia_validada', 'categoria', 'sede', 'asignado', 'comentarios']
      : ['estado', 'comentarios'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== ticket[field]) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);

        historialEntries.push({
          campo: field,
          anterior: ticket[field],
          nuevo: req.body[field]
        });
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay cambios para actualizar' });
    }

    // Validaciones especiales
    if (req.body.estado) {
      if (req.body.estado === 'Resuelto' && !req.body.comentarios && !ticket.comentarios) {
        return res.status(400).json({ error: 'Debe agregar un comentario de resolución' });
      }

      if (req.body.estado === 'En curso' && !ticket.asignado && !req.body.asignado) {
        return res.status(400).json({ error: 'Debe asignar un técnico antes de marcar como "En curso"' });
      }

      // Manejo de pausas
      if (req.body.estado === 'Pausado' && ticket.estado !== 'Pausado') {
        onTicketPaused(req.params.id);
      } else if (ticket.estado === 'Pausado' && req.body.estado !== 'Pausado') {
        onTicketResumed(req.params.id);
      }

      // Actualizar fecha según estado
      if (req.body.estado === 'Resuelto') {
        updates.push('fecha_resuelto = datetime("now")');
      } else if (req.body.estado === 'Cerrado') {
        updates.push('fecha_cerrado = datetime("now")');
      }
    }

    updates.push('ultima_actualizacion = datetime("now")');
    params.push(req.params.id);

    const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...params);

    // Registrar en historial
    const historialStmt = db.prepare(`
      INSERT INTO historial (ticket_id, usuario, campo, valor_anterior, valor_nuevo, comentario)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const entry of historialEntries) {
      historialStmt.run(
        req.params.id,
        req.user.nombre,
        entry.campo,
        entry.anterior,
        entry.nuevo,
        req.body.comentarios || null
      );
    }

    // Obtener ticket actualizado
    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    // Enviar email según el cambio
    if (req.body.estado && req.body.estado !== ticket.estado) {
      if (req.body.estado === 'Resuelto') {
        await sendEmail(
          ticket.contacto,
          `Ticket #${ticket.id} - Resuelto`,
          EmailTypes.TICKET_RESUELTO,
          updatedTicket
        );
      } else {
        await sendEmail(
          ticket.contacto,
          `Ticket #${ticket.id} - ${req.body.estado}`,
          EmailTypes.CAMBIO_ESTADO,
          { ...updatedTicket, estadoAnterior: ticket.estado }
        );
      }
    }

    res.json({
      message: 'Ticket actualizado exitosamente',
      ticket: {
        ...updatedTicket,
        sla: calculateSLA(updatedTicket)
      }
    });

  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});

// Desasignar ticket (auxiliar)
router.post('/:id/desasignar', verifyToken, (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    if (ticket.asignado !== req.user.nombre && req.user.rol !== 'Admin') {
      return res.status(403).json({ error: 'No tienes permiso para desasignar este ticket' });
    }

    const stmt = db.prepare(`
      UPDATE tickets
      SET asignado = NULL,
          estado = 'Nuevo',
          ultima_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(req.params.id);

    // Registrar en historial
    const historialStmt = db.prepare(`
      INSERT INTO historial (ticket_id, usuario, campo, valor_anterior, valor_nuevo)
      VALUES (?, ?, ?, ?, ?)
    `);

    historialStmt.run(req.params.id, req.user.nombre, 'asignado', ticket.asignado, null);
    historialStmt.run(req.params.id, req.user.nombre, 'estado', ticket.estado, 'Nuevo');

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    res.json({
      message: 'Ticket desasignado exitosamente',
      ticket: {
        ...updatedTicket,
        sla: calculateSLA(updatedTicket)
      }
    });

  } catch (error) {
    console.error('Error al desasignar ticket:', error);
    res.status(500).json({ error: 'Error al desasignar ticket' });
  }
});

// Obtener historial completo de un ticket
router.get('/:id/historial', verifyToken, (req, res) => {
  try {
    const historial = db.prepare(`
      SELECT * FROM historial
      WHERE ticket_id = ?
      ORDER BY fecha DESC
    `).all(req.params.id);

    res.json({ historial });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Métricas para dashboard
router.get('/stats/dashboard', verifyToken, (req, res) => {
  try {
    const stats = {};

    if (req.user.rol === 'Admin') {
      // Métricas generales para admin
      stats.total = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE estado != ?').get('Cerrado').count;
      stats.criticos = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE urgencia_validada = ? AND estado NOT IN (?, ?)').get('Crítica', 'Cerrado', 'Resuelto').count;
      stats.sinAsignar = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE asignado IS NULL AND estado != ?').get('Cerrado').count;
      stats.enCurso = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE estado = ?').get('En curso').count;

    } else {
      // Métricas para auxiliar
      stats.misTickets = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE asignado = ? AND estado NOT IN (?, ?)').get(req.user.nombre, 'Cerrado', 'Resuelto').count;
      stats.criticos = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE asignado = ? AND urgencia_validada = ? AND estado NOT IN (?, ?)').get(req.user.nombre, 'Crítica', 'Cerrado', 'Resuelto').count;
      stats.sinAsignar = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE asignado IS NULL AND estado != ?').get('Cerrado').count;
    }

    // SLA próximos a vencer (últimas 3 horas de cualquier prioridad)
    const allTickets = db.prepare(`
      SELECT * FROM tickets
      WHERE estado NOT IN ('Cerrado', 'Pausado')
      ${req.user.rol === 'Auxiliar' ? 'AND asignado = ?' : ''}
    `).all(req.user.rol === 'Auxiliar' ? req.user.nombre : undefined);

    const ticketsWithSLA = getTicketsWithSLA(allTickets);
    stats.proximosVencer = ticketsWithSLA.filter(t =>
      t.sla.status === 'warn' || t.sla.status === 'critical'
    ).length;

    res.json({ stats });

  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

export default router;
