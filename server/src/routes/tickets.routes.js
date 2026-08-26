import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery, validateIdParam } from '../middleware/validate.js';
import {
  createTicketSchema,
  paginationQuerySchema,
  listTicketsQuerySchema,
  updateStatusSchema,
  updatePrioritySchema,
  updateAssignmentSchema,
  createCommentSchema,
} from '../validators/tickets.validators.js';
import {
  create,
  listMine,
  listFiltered,
  getById,
  listAssignableAgents,
  updateStatus,
  updatePriority,
  updateAssignment,
  addComment,
} from '../controllers/tickets.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('empleado'), validateBody(createTicketSchema), create);
router.get('/mine', requireRole('empleado'), validateQuery(paginationQuerySchema), listMine);
router.get('/', requireRole('agente', 'admin'), validateQuery(listTicketsQuerySchema), listFiltered);
router.get('/:id', validateIdParam(), getById);
router.get('/:id/assignable-agents', requireRole('agente', 'admin'), validateIdParam(), listAssignableAgents);
router.patch('/:id/status', requireRole('agente', 'admin'), validateIdParam(), validateBody(updateStatusSchema), updateStatus);
router.patch('/:id/priority', requireRole('agente', 'admin'), validateIdParam(), validateBody(updatePrioritySchema), updatePriority);
router.patch('/:id/assignment', requireRole('agente', 'admin'), validateIdParam(), validateBody(updateAssignmentSchema), updateAssignment);
router.post('/:id/comments', validateIdParam(), validateBody(createCommentSchema), addComment);

export default router;
