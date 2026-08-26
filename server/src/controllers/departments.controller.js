import * as departmentsModel from '../models/departments.model.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function list(req, res, next) {
  try {
    const onlyAcceptingTickets = req.user.role === 'empleado';
    const departments = await departmentsModel.list({ onlyAcceptingTickets });
    res.json({ items: departments });
  } catch (err) {
    next(err);
  }
}

export async function toggle(req, res, next) {
  try {
    const department = await departmentsModel.setAcceptsTickets(req.params.id, req.body.acceptsTickets);
    if (!department) throw new HttpError(404, 'Departamento no encontrado');
    res.json(department);
  } catch (err) {
    next(err);
  }
}
