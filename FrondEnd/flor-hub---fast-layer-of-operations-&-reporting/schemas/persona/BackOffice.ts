import { z } from "zod";
import { UsuarioSchema } from "./User.ts";

// Esquema BackOffice (solo los campos de la tabla)
export const BackOfficeSchema = z.object({
  usuario_id: z.string().uuid(), // FK a usuario.persona_id
  supervisor: z.string().uuid(), // FK a supervisor.usuario
});

// Si necesitas el usuario completo con datos de back office:
export const BackOfficeConUsuarioSchema = UsuarioSchema.merge(
  z.object({
    supervisor_id: z.string().uuid(),
  }),
);

// Para crear un back office (necesitas el usuario ya creado)
export const BackOfficeCreateSchema = z.object({
  usuario_id: z.string().uuid(),
  supervisor: z.string().uuid(),
});

// Tipos
export type BackOffice = z.infer<typeof BackOfficeSchema>;
export type BackOfficeConUsuario = z.infer<typeof BackOfficeConUsuarioSchema>;
export type BackOfficeCreate = z.infer<typeof BackOfficeCreateSchema>;
