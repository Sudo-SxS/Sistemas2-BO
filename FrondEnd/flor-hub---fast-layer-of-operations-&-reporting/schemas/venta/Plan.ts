// Plan.ts
import { z } from "zod";

export const PlanSchema = z.object({
  plan_id: z.number().int().positive(),
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  precio: z.number().positive().multipleOf(0.01), // DECIMAL(6,2)
  gigabyte: z.number().int().positive(),
  llamadas: z.string().min(1).max(45), // Mantener string para compatibilidad con datos existentes
  mensajes: z.string().min(1).max(45), // Mantener string para compatibilidad con datos existentes
  beneficios: z.string().max(100).nullable().optional(),
  whatsapp: z.string().optional().default(""),
  roaming: z.string().optional().default(""),
  fecha_creacion: z.coerce.date().optional().default(() => new Date()),
  empresa_origen_id: z.number().int().positive(), // FK a empresa_origen.empresa_origen_id
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
