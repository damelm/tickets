import { z } from 'zod';

// Solo campos de negocio no sensibles. Nunca agregar acá un secreto
// (Client ID/Secret, JWT_SECRET, credenciales de DB) — esos van en variables de entorno.
export const updateSettingsSchema = z.object({
  googleAllowedDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, 'Dominio inválido')
    .nullable(),
});
