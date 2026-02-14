import { z } from "zod";
import { UsuarioResponseSchema } from "./User.ts";

// Schema de la tabla supervisor (solo 1 campo)
export const SupervisorSchema = z.object({
  usuario: z.string().uuid(), // FK a usuario.persona_id
});

// Para crear un supervisor (asume que el usuario ya existe)
export const SupervisorCreateSchema = z.object({
  usuario: z.string().uuid(),
});

// Para respuestas de API con datos completos del supervisor
export const SupervisorResponseSchema = SupervisorSchema.merge(
  UsuarioResponseSchema.pick({
    legajo: true,
    nombre: true,
    apellido: true,
    email: true,
    telefono: true,
    rol: true,
    estado: true,
  }),
);

// Tipos
export type Supervisor = z.infer<typeof SupervisorSchema>;
export type SupervisorCreate = z.infer<typeof SupervisorCreateSchema>;
export type SupervisorResponse = z.infer<typeof SupervisorResponseSchema>;
