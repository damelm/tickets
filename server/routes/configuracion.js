import express from 'express';
import db from '../database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener configuración (solo admin)
router.get('/', verifyToken, requireAdmin, (req, res) => {
  try {
    const configs = db.prepare('SELECT * FROM configuracion').all();

    const configuracion = {};
    configs.forEach(config => {
      configuracion[config.key] = config.value;
    });

    res.json({ configuracion });

  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Actualizar configuración SLA (solo admin)
router.put('/sla', verifyToken, requireAdmin, (req, res) => {
  const { sla_critica, sla_alta, sla_media, sla_baja } = req.body;

  try {
    const stmt = db.prepare('UPDATE configuracion SET value = ? WHERE key = ?');

    if (sla_critica !== undefined) {
      stmt.run(String(sla_critica), 'sla_critica');
    }

    if (sla_alta !== undefined) {
      stmt.run(String(sla_alta), 'sla_alta');
    }

    if (sla_media !== undefined) {
      stmt.run(String(sla_media), 'sla_media');
    }

    if (sla_baja !== undefined) {
      stmt.run(String(sla_baja), 'sla_baja');
    }

    res.json({ message: 'Configuración SLA actualizada exitosamente' });

  } catch (error) {
    console.error('Error al actualizar SLA:', error);
    res.status(500).json({ error: 'Error al actualizar configuración SLA' });
  }
});

// Actualizar configuración de autocierre (solo admin)
router.put('/autocierre', verifyToken, requireAdmin, (req, res) => {
  const { autocierre_horas } = req.body;

  if (!autocierre_horas || autocierre_horas < 1) {
    return res.status(400).json({ error: 'Valor inválido para autocierre' });
  }

  try {
    db.prepare('UPDATE configuracion SET value = ? WHERE key = ?')
      .run(String(autocierre_horas), 'autocierre_horas');

    res.json({ message: 'Configuración de autocierre actualizada exitosamente' });

  } catch (error) {
    console.error('Error al actualizar autocierre:', error);
    res.status(500).json({ error: 'Error al actualizar configuración de autocierre' });
  }
});

// Actualizar configuración de email (solo admin)
router.put('/email', verifyToken, requireAdmin, (req, res) => {
  const { email_enabled } = req.body;

  try {
    db.prepare('UPDATE configuracion SET value = ? WHERE key = ?')
      .run(email_enabled ? 'true' : 'false', 'email_enabled');

    res.json({ message: 'Configuración de email actualizada exitosamente' });

  } catch (error) {
    console.error('Error al actualizar email:', error);
    res.status(500).json({ error: 'Error al actualizar configuración de email' });
  }
});

// Obtener catálogos (sedes, categorías)
router.get('/catalogos', verifyToken, (req, res) => {
  try {
    const catalogos = {
      sedes: [
        'Casa Central',
        'Edificio A',
        'Edificio B',
        'Depósito',
        'Data Center',
        'Parque Industrial',
        'Otro'
      ],
      categorias: [
        'Equipos y Hardware',
        'Conectividad y Red',
        'Accesos y Cuentas',
        'Software y Aplicaciones',
        'Telefonía y Comunicación',
        'Otros / Consultas'
      ],
      prioridades: ['Baja', 'Media', 'Alta', 'Crítica'],
      estados: ['Nuevo', 'En curso', 'Pausado', 'Resuelto', 'Cerrado']
    };

    res.json({ catalogos });

  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    res.status(500).json({ error: 'Error al obtener catálogos' });
  }
});

export default router;
