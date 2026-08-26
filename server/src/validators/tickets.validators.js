import { z } from 'zod';

const PRIORITIES = ['baja', 'media', 'alta', 'urgente'];
const STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'];

export const createTicketSchema = z.object({
  departmentId: z.number().int().positive(),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  priority: z.enum(PRIORITIES).default('media'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const listTicketsQuerySchema = paginationQuerySchema.extend({
  departmentId: z.coerce.number().int().positive().optional(),
  status: z.union([z.enum(STATUSES), z.array(z.enum(STATUSES))]).optional(),
  priority: z.union([z.enum(PRIORITIES), z.array(z.enum(PRIORITIES))]).optional(),
  assignedTo: z.coerce.number().int().positive().optional(),
  q: z.string().optional(),
});

export const updateStatusSchema = z.object({ status: z.enum(STATUSES) });
export const updatePrioritySchema = z.object({ priority: z.enum(PRIORITIES) });
export const updateAssignmentSchema = z.object({ assignedTo: z.number().int().positive().nullable() });
export const createCommentSchema = z.object({ body: z.string().min(1).max(5000) });
