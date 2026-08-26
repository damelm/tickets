import jwt from 'jsonwebtoken';
import { HttpError } from './errorHandler.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'No autenticado'));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, departmentId: payload.departmentId };
    next();
  } catch {
    next(new HttpError(401, 'Token inválido o expirado'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'No autorizado'));
    }
    next();
  };
}
