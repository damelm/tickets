import jwt from 'jsonwebtoken';
import db from '../database.js';

export function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autorizado - Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario aún existe y está activo
    const user = db.prepare('SELECT * FROM usuarios WHERE id = ? AND activo = 1').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'No autorizado - Usuario no válido' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado - Token inválido' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.rol !== 'Admin') {
    return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de Administrador' });
  }
  next();
}

export function requireAuxiliar(req, res, next) {
  if (req.user.rol !== 'Auxiliar' && req.user.rol !== 'Admin') {
    return res.status(403).json({ error: 'Acceso denegado - Se requiere autenticación' });
  }
  next();
}
