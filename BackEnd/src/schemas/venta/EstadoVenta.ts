// ============================================
// BackEnd/src/schemas/venta/EstadoVenta.ts
// ============================================
import { z } from "zod";

export const EstadoVentaEnum = z.enum([
  "INICIAL",
  "EN_PROCESO",
  "EN_TRANSPORTE",
  "EN_REVISION",
  "PENDIENTE_PORTABILIDAD",
  "CREADO_SIN_DOCU",
  "CREADO DOCU OK",
  "PENDIENTE_DOCUMENTACION",
  "COMPLETADO",
  "APROBADO",
  "ACTIVADO NRO PORTADO",
  "ACTIVADO",
  "EXITOSO",
  "RECHAZADO",
  "CANCELADO",
  "ANULADO",
 ]);

export const EstadoVentaSchema = z.object({
  estado_id: z.number().int().positive(),
  venta_id: z.number().int().positive(),
  estado: EstadoVentaEnum,
  descripcion: z.string().max(255),
  fecha_creacion: z.coerce.date(),
  usuario_id: z.string().uuid(),
});

export const EstadoVentaCreateSchema = EstadoVentaSchema.omit({
  estado_id: true,
  fecha_creacion: true,
});

export const EstadoVentaUpdateSchema = EstadoVentaSchema.omit({
  estado_id: true,
}).partial();

export type EstadoVenta = z.infer<typeof EstadoVentaSchema>;
export type EstadoVentaCreate = z.infer<typeof EstadoVentaCreateSchema>;
export type EstadoVentaUpdate = z.infer<typeof EstadoVentaUpdateSchema>;
export type EstadoVentaEstado = z.infer<typeof EstadoVentaEnum>;