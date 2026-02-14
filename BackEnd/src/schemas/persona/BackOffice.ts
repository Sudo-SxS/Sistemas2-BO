import { z } from "zod";
import { UsuarioSchema } from "./User.ts";

// Esquema BackOffice según BD: solo tiene back_office_id y usuario
export const BackOfficeSchema = z.object({
  back_office_id: z.number().int().positive(),
  usuario: z.string().uuid(), // FK a usuario.persona_id
});

// Si necesitas el usuario completo con datos de back office:
export const BackOfficeConUsuarioSchema = UsuarioSchema.merge(
  z.object({
    back_office_id: z.number().int().positive(),
  }),
);

// Para crear un back office (necesitas el usuario ya creado)
export const BackOfficeCreateSchema = z.object({
  usuario: z.string().uuid(),
});

// Tipos
export type BackOffice = z.infer<typeof BackOfficeSchema>;
export type BackOfficeConUsuario = z.infer<typeof BackOfficeConUsuarioSchema>;
export type BackOfficeCreate = z.infer<typeof BackOfficeCreateSchema>;
