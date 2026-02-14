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
  id_estado: z.number().int().positive(),
  venta: z.number().int().positive(), // FK a venta.idventa
  estado_actual: EstadoVentaEnum.default("INICIAL"),
  estado_descripcion: z.string().max(45),
  fecha_creacion: z.coerce.date(),
  fecha_activacion: z.coerce.date().nullable().optional(),
  usuario_modificador: z.string().max(45),
});

export const EstadosCreateSchema = EstadosSchema.omit({
  id_estado: true,
  fecha_creacion: true,
}).extend({
  fecha_creacion: z.coerce.date().default(() => new Date()),
});

export const EstadosUpdateSchema = EstadosSchema.omit({
  id_estado: true,
  venta: true,
}).partial();

export type Estados = z.infer<typeof EstadosSchema>;
export type EstadosCreate = z.infer<typeof EstadosCreateSchema>;
export type EstadosUpdate = z.infer<typeof EstadosUpdateSchema>;
export type EstadoVenta = z.infer<typeof EstadoVentaEnum>;
