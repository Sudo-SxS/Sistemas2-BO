// ============================================
// BackEnd/src/schemas/venta/Alerta.ts
// ============================================
// ESTE ESQUEMA NO ESTÁ IMPLEMENTADO - LA TABLA "alerta" NO EXISTE EN LA BASE DE DATOS
// TODO: Si se necesita implementar alertas, primero crear la tabla en la DB
// import { z } from "zod";

// export const TipoAlertaEnum = z.enum([
//   "DATOS_INCORRECTOS",
//   "PORTABILIDAD_RECHAZADA",
//   "PLAN_INCORRECTO",
//   "DOCUMENTACION",
//   "OTRO",
// ]);

// export const OrigenAlertaEnum = z.enum([
//   "AUTOMATICA",
//   "BACK_OFFICE",
//   "SUPERVISOR",
// ]);

// export const EstadoAlertaEnum = z.enum([
//   "ABIERTA",
//   "EN_REVISION",
//   "RESUELTA",
//   "DESCARTADA",
// ]);

// export const AlertaSchema = z.object({
//   alerta_id: z.number().int().positive(),
//   venta_id: z.number().int().positive(),
//   tipo_alerta: TipoAlertaEnum,
//   comentario: z.string().max(250),
//   origen: OrigenAlertaEnum.default("AUTOMATICA"),
//   estado: EstadoAlertaEnum,
//   creada_por: z.string().uuid().nullable().optional(),
//   fecha_creacion: z.coerce.date(),
//   fecha_resolucion: z.coerce.date().nullable().optional(),
// });

// export const AlertaCreateSchema = AlertaSchema.omit({
//   alerta_id: true,
//   fecha_creacion: true,
// }).extend({
//   fecha_creacion: z.coerce.date().default(() => new Date()),
// });

// export const AlertaUpdateSchema = AlertaSchema.omit({
//   alerta_id: true,
//   venta_id: true,
// }).partial();

// export type Alerta = z.infer<typeof AlertaSchema>;
// export type AlertaCreate = z.infer<typeof AlertaCreateSchema>;
// export type AlertaUpdate = z.infer<typeof AlertaUpdateSchema>;
