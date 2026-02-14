// ============================================
// BackEnd/src/schemas/mensaje/Mensaje.ts
// VERSIÓN corregida según schema real de DB
// ============================================
import { z } from "zod";

// Tipo de mensaje: Alerta (requiere acción) o Notificación (solo información)
export const TipoMensajeEnum = z.enum(["ALERTA", "NOTIFICACION"]);

// Tipos de destinatarios para la lógica de negocio
export const TipoDestinatarioEnum = z.enum([
  "USUARIO",
  "ROL",
  "CELULA",
  "VENTA_RELACIONADA",
  "GLOBAL",
]);

// Schema base de mensaje (coincide exactamente con tabla DB)
export const MensajeSchema = z.object({
  mensaje_id: z.number().int().positive(),
  tipo: TipoMensajeEnum,
  titulo: z.string().min(1).max(100),
  comentario: z.string().min(1).max(500),
  fecha_creacion: z.coerce.date(),
  resuelto: z.boolean().nullable(),
  fecha_resolucion: z.coerce.date().nullable().optional(),
  usuario_creador_id: z.string().uuid(),
  referencia_id: z.number().int().positive().nullable().optional(),
});

// Schema para crear mensaje (sin campos autogenerados)
export const MensajeCreateSchema = MensajeSchema.omit({
  mensaje_id: true,
  fecha_creacion: true,
  resuelto: true,
  fecha_resolucion: true,
}).extend({
  // Configuración de destinatarios para la lógica de negocio
  destinatarios: z.object({
    tipo: TipoDestinatarioEnum,
    valor: z.string().optional(),
  }).optional(),
});

// Schema para actualizar mensaje (resolver alerta)
export const MensajeUpdateSchema = z.object({
  titulo: z.string().min(1).max(100).optional(),
  comentario: z.string().min(1).max(500).optional(),
  resuelto: z.boolean().optional(),
});

// Schema para el payload de resolución de alerta
export const ResolverAlertaSchema = z.object({
  mensaje_id: z.number().int().positive(),
});

// Tipos exportados
export type TipoMensaje = z.infer<typeof TipoMensajeEnum>;
export type TipoDestinatario = z.infer<typeof TipoDestinatarioEnum>;
export type Mensaje = z.infer<typeof MensajeSchema>;
export type MensajeCreate = z.infer<typeof MensajeCreateSchema>;
export type MensajeUpdate = z.infer<typeof MensajeUpdateSchema>;
