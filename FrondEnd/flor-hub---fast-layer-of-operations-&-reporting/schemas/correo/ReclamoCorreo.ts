// ============================================
// BackEnd/src/schemas/correo/ReclamoCorreo.ts (NUEVO)
// ============================================
import { z } from "zod";

export const ReclamoCorreoSchema = z.object({
  reclamo_correo_id: z.number().int().positive(),
  sap_id: z.string().transform((val) => val.toUpperCase()),
  titulo: z.string().max(45),
  comentario: z.string().max(700),
});

export const ReclamoCorreoCreateSchema = ReclamoCorreoSchema.omit({
  reclamo_correo_id: true,
});

export const ReclamoCorreoUpdateSchema = ReclamoCorreoSchema.omit({
  reclamo_correo_id: true,
  sap_id: true,
}).partial();

export type ReclamoCorreo = z.infer<typeof ReclamoCorreoSchema>;
export type ReclamoCorreoCreate = z.infer<typeof ReclamoCorreoCreateSchema>;
export type ReclamoCorreoUpdate = z.infer<typeof ReclamoCorreoUpdateSchema>;
