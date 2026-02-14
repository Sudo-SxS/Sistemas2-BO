// Promocion.ts
import { z } from "zod";

export const PromocionSchema = z.object({
  promocion_id: z.number().int().positive(),
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  beneficios: z.string().max(45).optional(),
  empresa_origen_id: z.number().int().positive(),
  fecha_creacion: z.coerce.date().optional().default(() => new Date()),
  descuento: z.number().int().min(0).max(100).optional().default(0),
  fecha_terminacion: z.coerce.date().nullable().optional(),
});

export const PromocionCreateSchema = PromocionSchema.omit({
  promocion_id: true,
});

export const PromocionUpdateSchema = PromocionSchema.omit({
  promocion_id: true,
}).partial();

export type Promocion = z.infer<typeof PromocionSchema>;
export type PromocionCreate = z.infer<typeof PromocionCreateSchema>;
export type PromocionUpdate = z.infer<typeof PromocionUpdateSchema>;
