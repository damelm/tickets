import bcrypt from 'bcryptjs';
import * as usersModel from '../models/users.model.js';
import { HttpError } from '../middleware/errorHandler.js';

function toArray(value) {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

export async function list(req, res, next) {
  try {
    const { role, departmentId, isActive, q, page, pageSize } = req.query;
    const result = await usersModel.list({
      roles: toArray(role),
      departmentIds: toArray(departmentId)?.map(Number),
      isActive: isActive === undefined ? undefined : isActive === 'true',
      q,
      page,
      pageSize,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { fullName, email, password, role, departmentId } = req.body;
    if (role === 'agente' && !departmentId) {
      throw new HttpError(400, 'Un agente debe tener un departamento asignado');
    }
    const existing = await usersModel.findByEmail(email.toLowerCase());
    if (existing) {
      throw new HttpError(409, 'Ya existe un usuario con ese email');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await usersModel.create({ fullName, email: email.toLowerCase(), passwordHash, role, departmentId });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const user = await usersModel.update(req.params.id, req.body);
    if (!user) throw new HttpError(404, 'Usuario no encontrado');
    res.json(user);
  } catch (err) {
    next(err);
  }
}
