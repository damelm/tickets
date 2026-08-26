import { z } from 'zod';

const ROLES = ['empleado', 'agente', 'admin'];

export const listUsersQuerySchema = z.object({
  role: z.union([z.enum(ROLES), z.array(z.enum(ROLES))]).optional(),
  departmentId: z.union([z.string(), z.array(z.string())]).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const createUserSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
  departmentId: z.number().int().positive().nullable().optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(ROLES).optional(),
  departmentId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});
