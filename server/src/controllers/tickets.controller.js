import * as ticketsModel from '../models/tickets.model.js';
import * as ticketEventsModel from '../models/ticketEvents.model.js';
import * as departmentsModel from '../models/departments.model.js';
import * as usersModel from '../models/users.model.js';
import { HttpError } from '../middleware/errorHandler.js';

function toArray(value) {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

function assertCanView(ticket, user) {
  if (user.role === 'admin') return;
  if (user.role === 'agente' && String(ticket.department_id) === String(user.departmentId)) return;
  if (user.role === 'empleado' && String(ticket.created_by) === String(user.id)) return;
  throw new HttpError(403, 'No autorizado');
}

function assertCanManage(ticket, user) {
  if (user.role === 'admin') return;
  if (user.role === 'agente' && String(ticket.department_id) === String(user.departmentId)) return;
  throw new HttpError(403, 'No autorizado');
}

export async function create(req, res, next) {
  try {
    const { departmentId, subject, description, priority } = req.body;
    const department = await departmentsModel.findById(departmentId);
    if (!department || !department.accepts_tickets) {
      throw new HttpError(400, 'El departamento seleccionado no recibe tickets');
    }
    const ticket = await ticketsModel.create({ departmentId, subject, description, priority, createdBy: req.user.id });
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req, res, next) {
  try {
    const result = await ticketsModel.findMine({ createdBy: req.user.id, page: req.query.page, pageSize: req.query.pageSize });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listFiltered(req, res, next) {
  try {
    const { status, priority, assignedTo, q, page, pageSize } = req.query;
    const departmentId = req.user.role === 'agente' ? req.user.departmentId : req.query.departmentId;
    const result = await ticketsModel.findFiltered({
      departmentId,
      statuses: toArray(status),
      priorities: toArray(priority),
      assignedTo,
      q,
      page,
      pageSize,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const ticket = await ticketsModel.findById(req.params.id);
    if (!ticket) throw new HttpError(404, 'Ticket no encontrado');
    assertCanView(ticket, req.user);
    const events = await ticketEventsModel.listByTicket(ticket.id);
    res.json({ ...ticket, events });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const ticket = await ticketsModel.findById(req.params.id);
    if (!ticket) throw new HttpError(404, 'Ticket no encontrado');
    assertCanManage(ticket, req.user);
    const { status } = req.body;
    await ticketsModel.updateStatus(ticket.id, status);
    await ticketEventsModel.create({
      ticketId: ticket.id,
      authorId: req.user.id,
      eventType: 'status_change',
      fromValue: ticket.status,
      toValue: status,
    });
    res.json(await ticketsModel.findById(ticket.id));
  } catch (err) {
    next(err);
  }
}

export async function updatePriority(req, res, next) {
  try {
    const ticket = await ticketsModel.findById(req.params.id);
    if (!ticket) throw new HttpError(404, 'Ticket no encontrado');
    assertCanManage(ticket, req.user);
    const { priority } = req.body;
    await ticketsModel.updatePriority(ticket.id, priority);
    await ticketEventsModel.create({
      ticketId: ticket.id,
      authorId: req.user.id,
      eventType: 'priority_change',
      fromValue: ticket.priority,
      toValue: priority,
    });
    res.json(await ticketsModel.findById(ticket.id));
  } catch (err) {
    next(err);
  }
}

export async function updateAssignment(req, res, next) {
  try {
    const ticket = await ticketsModel.findById(req.params.id);
    if (!ticket) throw new HttpError(404, 'Ticket no encontrado');
    assertCanManage(ticket, req.user);
    const { assignedTo } = req.body;

    if (assignedTo !== null) {
      const assignee = await usersModel.findById(assignedTo);
      if (!assignee || assignee.role !== 'agente' || String(assignee.department_id) !== String(ticket.department_id)) {
        throw new HttpError(400, 'El usuario asignado debe ser un agente del mismo departamento');
      }
    }

    await ticketsModel.updateAssignment(ticket.id, assignedTo);
    await ticketEventsModel.create({
      ticketId: ticket.id,
      authorId: req.user.id,
      eventType: 'assignment_change',
      fromValue: ticket.assigned_to_name ?? null,
      toValue: assignedTo ? (await usersModel.findById(assignedTo)).full_name : null,
    });
    res.json(await ticketsModel.findById(ticket.id));
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const ticket = await ticketsModel.findById(req.params.id);
    if (!ticket) throw new HttpError(404, 'Ticket no encontrado');
    assertCanView(ticket, req.user);
    const event = await ticketEventsModel.create({
      ticketId: ticket.id,
      authorId: req.user.id,
      eventType: 'comment',
      commentBody: req.body.body,
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}
