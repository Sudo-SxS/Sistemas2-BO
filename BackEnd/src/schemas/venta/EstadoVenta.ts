// ============================================
// BackEnd/src/schemas/venta/EstadoVenta.ts
// ============================================
import { z } from "zod";

export const EstadoVentaEnum = z.enum([
  "PENDIENTE DE CARGA",
  "CREADO SIN DOCU",
  "CREADO DOCU OK",
  "EN TRANSPORTE",
  "ENTREGADO",
  "REPACTAR",
  "ACTIVADO NRO CLARO",
  "ACTIVADO NRO PORTADO",
  "AGENDADO",
  "APROBADO ABD",
  "CANCELADO",
  "CREADO",
  "EVALUANDO DONANTE",
  "PENDIENTE CARGA PIN",
  "PIN INGRESADO",
  "RECHAZADO ABD",
  "RECHAZADO DONANTE",
  "SPN CANCELADA",
 ]);

export const EstadoVentaSchema = z.object({
  estado_id: z.number().int().positive(),
  venta_id: z.number().int().positive(),
  estado: EstadoVentaEnum,
  descripcion: z.string().max(75),
  fecha_creacion: z.coerce.date(),
  usuario_id: z.string().uuid(),
});

export const EstadoVentaCreateSchema = EstadoVentaSchema.omit({
  estado_id: true,
});

export const EstadoVentaUpdateSchema = EstadoVentaSchema.omit({
  estado_id: true,
}).partial();

export type EstadoVenta = z.infer<typeof EstadoVentaSchema>;
export type EstadoVentaCreate = z.infer<typeof EstadoVentaCreateSchema>;
export type EstadoVentaUpdate = z.infer<typeof EstadoVentaUpdateSchema>;
export type EstadoVentaEstado = z.infer<typeof EstadoVentaEnum>;