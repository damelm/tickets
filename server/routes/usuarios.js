import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/', verifyToken, requireAdmin, (req, res) => {
  try {
    const usuarios = db.prepare(`
      SELECT id, email, nombre, rol, activo, created_at
      FROM usuarios
      ORDER BY created_at DESC
    `).all();

    res.json({ usuarios });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario (solo admin)
router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { email, password, nombre, rol, activo } = req.body;

  if (!email || !password || !nombre || !rol) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  if (!['Admin', 'Auxiliar'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      INSERT INTO usuarios (email, password, nombre, rol, activo)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(email, hashedPassword, nombre, rol, activo !== undefined ? activo : 1);

    const newUser = db.prepare(`
      SELECT id, email, nombre, rol, activo, created_at
      FROM usuarios WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: newUser
    });

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario (solo admin)
router.put('/:id', verifyToken, requireAdmin, (req, res) => {
  const { email, password, nombre, rol, activo } = req.body;

  try {
    const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updates = [];
    const params = [];

    if (email && email !== user.email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (nombre && nombre !== user.nombre) {
      updates.push('nombre = ?');
      params.push(nombre);
    }

    if (rol && rol !== user.rol) {
      if (!['Admin', 'Auxiliar'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }
      updates.push('rol = ?');
      params.push(rol);
    }

    if (activo !== undefined && activo !== user.activo) {
      updates.push('activo = ?');
      params.push(activo ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay cambios para actualizar' });
    }

    params.push(req.params.id);

    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...params);

    const updatedUser = db.prepare(`
      SELECT id, email, nombre, rol, activo, created_at
      FROM usuarios WHERE id = ?
    `).get(req.params.id);

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: updatedUser
    });

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  try {
    // Verificar que no se elimine a sí mismo
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);

    res.json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Obtener lista de técnicos (para asignación)
router.get('/tecnicos/lista', verifyToken, (req, res) => {
  try {
    const tecnicos = db.prepare(`
      SELECT nombre
      FROM usuarios
      WHERE rol = 'Auxiliar' AND activo = 1
      ORDER BY nombre
    `).all();

    res.json({ tecnicos: tecnicos.map(t => t.nombre) });

  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({ error: 'Error al obtener técnicos' });
  }
});

export default router;
