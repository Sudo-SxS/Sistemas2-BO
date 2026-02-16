// Plan.ts
import { z } from "zod";

export const PlanSchema = z.object({
  plan_id: z.number().int().positive(),
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  precio: z.number().int().positive(),
  gigabyte: z.number().int().positive(),
  llamadas: z.string().min(1).max(45),
  mensajes: z.string().min(1).max(45),
  beneficios: z.string().max(100).nullable().optional(),
  whatsapp: z.string().min(1).max(20),
  roaming: z.string().min(1).max(20),
  fecha_creacion: z.coerce.date().optional().default(() => new Date()),
  empresa_origen_id: z.number().int().positive(),
  fecha_duracion: z.coerce.date().nullable().optional(),
  promocion_id: z.number().int().positive().nullable().optional(),
  activo: z.boolean().default(true),
});

export const PlanCreateSchema = PlanSchema.omit({
  plan_id: true,
});

export const PlanUpdateSchema = PlanSchema.omit({
  plan_id: true,
}).partial();

export type Plan = z.infer<typeof PlanSchema>;
export type PlanCreate = z.infer<typeof PlanCreateSchema>;
export type PlanUpdate = z.infer<typeof PlanUpdateSchema>;
