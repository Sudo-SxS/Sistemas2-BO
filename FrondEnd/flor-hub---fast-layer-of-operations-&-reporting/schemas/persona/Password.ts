// ============================================
// ✅ NUEVO: BackEnd/src/schemas/Password.ts
// ============================================
import { z } from "zod";

export const PasswordSchema = z.object({
  password_id: z.number().int().positive(),
  password_hash: z.string().min(1).max(255),
  usuario_persona_id: z.string().uuid(),
  fecha_creacion: z.coerce.date(),
  activa: z.boolean().default(true),
});

export const PasswordCreateSchema = PasswordSchema.omit({
  password_id: true,
  fecha_creacion: true,
}).extend({
  fecha_creacion: z.coerce.date().default(() => new Date()),
});

export const PasswordHistoryResponseSchema = z.object({
  fecha_creacion: z.coerce.date(),
  activa: z.boolean(),
});

export type Password = z.infer<typeof PasswordSchema>;
export type PasswordCreate = z.infer<typeof PasswordCreateSchema>;
export type PasswordHistoryResponse = z.infer<typeof PasswordHistoryResponseSchema>;
