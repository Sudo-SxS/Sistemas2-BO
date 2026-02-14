// Promocion.ts
import { z } from "zod";

export const PromocionSchema = z.object({
  promocion_id: z.number().int().positive(),
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  descuento: z.string().max(45).optional(),
  beneficios: z.string().max(45).optional(),
  empresa_origen_id: z.number().int().positive(), // FK a empresa_origen.empresa_origen_id
  fecha_creacion: z.coerce.date().optional().default(() => new Date()),
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
