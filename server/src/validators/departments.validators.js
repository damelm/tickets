import { z } from 'zod';

export const toggleDepartmentSchema = z.object({
  acceptsTickets: z.boolean(),
});
