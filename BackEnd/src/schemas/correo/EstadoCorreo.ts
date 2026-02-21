// ============================================
// BackEnd/src/schemas/correo/EstadoCorreo.ts
// ============================================
import { z } from "zod";

const toUpper = (v: string) => v.trim().toUpperCase();

export const LogisticStatusEnum = z.enum([
  "INICIAL",
  "ASIGNADO",
  "EN TRANSITO",
  "INGRESADO CENTRO LOGISTICO - ECOMMERCE",
  "INGRESADO EN AGENCIA",
  "INGRESADO PICK UP CENTER UES",
  "DEVUELTO",
  "DEVUELTO AL CLIENTE",
  "ENTREGADO",
  "NO ENTREGADO",
  "RENDIDO AL CLIENTE",
  "RECLAMO UES",
]);

export const EstadoCorreoSchema = z.object({
  estado_correo_id: z.number().int().positive(),

  sap_id: z
    .string()
    .min(1)
    .max(255)
    .transform(toUpper)
    .optional(),

  estado: LogisticStatusEnum,

  descripcion: z.string().max(255).nullable(),

  fecha_creacion: z.coerce.date(),

  usuario_id: z.string().uuid(),

  ubicacion_actual: z.string().max(255).nullable().optional(),
});

export const EstadoCorreoCreateSchema = EstadoCorreoSchema.omit({
  estado_correo_id: true,
  fecha_creacion: true,
});

export const EstadoCorreoUpdateSchema = z.object({
  estado: z.string().min(1).max(255).transform(toUpper).optional(),
  descripcion: z.string().max(255).nullable().optional(),
  ubicacion_actual: z.string().max(255).nullable().optional(),
});

export type EstadoCorreo = z.infer<typeof EstadoCorreoSchema>;
export type EstadoCorreoCreate = z.infer<typeof EstadoCorreoCreateSchema>;
export type EstadoCorreoUpdate = z.infer<typeof EstadoCorreoUpdateSchema>;
