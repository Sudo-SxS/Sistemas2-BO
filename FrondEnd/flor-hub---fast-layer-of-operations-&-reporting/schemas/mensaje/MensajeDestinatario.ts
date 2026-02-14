// ============================================
// BackEnd/src/schemas/mensaje/MensajeDestinatario.ts
// VERSIÓN corregida según schema real de DB
// ============================================
import { z } from "zod";

// Schema de destinatario (relación muchos a muchos)
// NOTA: DB usa 'leida' (femenino), no 'leido'
export const MensajeDestinatarioSchema = z.object({
  mensaje_id: z.number().int().positive(),
  usuario_id: z.string().uuid(),
  leida: z.boolean().default(false),
  fecha_lectura: z.coerce.date().nullable().optional(),
});

// Schema para marcar como leído
export const MarcarLeidoSchema = z.object({
  leida: z.boolean().default(true),
  fecha_lectura: z.coerce.date().default(() => new Date()).optional(),
});

// Schema de respuesta con datos del mensaje incluido
export const MensajeConEstadoSchema = z.object({
  mensaje_id: z.number().int().positive(),
  tipo: z.enum(["ALERTA", "NOTIFICACION"]),
  titulo: z.string(),
  comentario: z.string(),
  fecha_creacion: z.coerce.date(),
  resuelto: z.boolean().nullable(),
  fecha_resolucion: z.coerce.date().nullable().optional(),
  usuario_creador_id: z.string().uuid(),
  referencia_id: z.number().nullable().optional(),
  // Campos específicos del destinatario
  leida: z.boolean(),
  fecha_lectura: z.coerce.date().nullable().optional(),
});

// Tipos exportados
export type MensajeDestinatario = z.infer<typeof MensajeDestinatarioSchema>;
export type MarcarLeido = z.infer<typeof MarcarLeidoSchema>;
export type MensajeConEstado = z.infer<typeof MensajeConEstadoSchema>;
