// ============================================
// BackEnd/src/schemas/venta/Comentario.ts
// Schema actualizado según tabla DB
// ============================================
import { z } from "zod";

// Enum para tipos de comentario
export const TipoComentarioEnum = z.enum([
  "GENERAL",
  "IMPORTANTE",
  "SISTEMA",
  "SEGUIMIENTO",
]);

// Schema base de comentario (según tabla real en DB)
export const ComentarioSchema = z.object({
  comentario_id: z.number().int().positive(),
  titulo: z.string().min(1).max(200),
  comentario: z.string().min(1).max(2000),
  fecha_creacion: z.coerce.date(),
  venta_id: z.number().int().positive(),
  usuarios_id: z.string().uuid(),
  tipo_comentario: TipoComentarioEnum,
});

// Schema para crear comentario (sin campos autogenerados)
export const ComentarioCreateSchema = ComentarioSchema.omit({
  comentario_id: true,
  fecha_creacion: true,
}).extend({
  fecha_creacion: z.coerce.date().default(() => new Date()).optional(),
});

// Schema para actualizar comentario (todos los campos opcionales excepto IDs)
export const ComentarioUpdateSchema = ComentarioSchema.omit({
  comentario_id: true,
  fecha_creacion: true,
  usuarios_id: true,
  venta_id: true,
}).partial();

// Schema para respuestas con datos del usuario
export const ComentarioConUsuarioSchema = ComentarioSchema.extend({
  usuario_nombre: z.string(),
  usuario_apellido: z.string(),
  usuario_legajo: z.string(),
  usuario_rol: z.string(),
});

// Tipos exportados
export type TipoComentario = z.infer<typeof TipoComentarioEnum>;
export type Comentario = z.infer<typeof ComentarioSchema>;
export type ComentarioCreate = z.infer<typeof ComentarioCreateSchema>;
export type ComentarioUpdate = z.infer<typeof ComentarioUpdateSchema>;
export type ComentarioConUsuario = z.infer<typeof ComentarioConUsuarioSchema>;
