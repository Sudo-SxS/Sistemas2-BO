// Estados.ts
import { z } from "zod";

export const EstadoVentaEnum = z.enum([
  "INICIAL",
  "EN_PROCESO",
  "PENDIENTE_DOCUMENTACION",
  "APROBADO",
  "ACTIVADO",
  "RECHAZADO",
  "CANCELADO",
]);

export const EstadosSchema = z.object({
  estado_id: z.number().int().positive(),
  venta_id: z.number().int().positive(),
  estado: EstadoVentaEnum.default("INICIAL"),
  descripcion: z.string().max(45),
  fecha_creacion: z.coerce.date(),
  usuario_id: z.string().uuid(),
});

export const EstadosCreateSchema = EstadosSchema.omit({
  estado_id: true,
  fecha_creacion: true,
}).extend({
  fecha_creacion: z.coerce.date().default(() => new Date()),
});

export const EstadosUpdateSchema = EstadosSchema.omit({
  estado_id: true,
  venta_id: true,
}).partial();

export type Estados = z.infer<typeof EstadosSchema>;
export type EstadosCreate = z.infer<typeof EstadosCreateSchema>;
export type EstadosUpdate = z.infer<typeof EstadosUpdateSchema>;
export type EstadoVenta = z.infer<typeof EstadoVentaEnum>;
