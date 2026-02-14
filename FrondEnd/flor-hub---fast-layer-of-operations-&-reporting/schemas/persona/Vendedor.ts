import { z } from "zod";

// Schema de la tabla vendedor (solo campos propios)
export const VendedorSchema = z.object({
  usuario: z.string().uuid(), // FK a usuario.persona_id
  supervisor: z.string().uuid(), // FK a supervisor.usuario
});

// Para crear un vendedor
export const VendedorCreateSchema = z.object({
  usuario: z.string().uuid(),
  supervisor: z.string().uuid(),
});

// Para respuestas de API con datos del usuario
export const VendedorResponseSchema = VendedorSchema.extend({
  // Datos del vendedor (de joins)
  legajo: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  telefono: z.string().optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
  // Datos del supervisor
  supervisor_nombre: z.string(),
  supervisor_apellido: z.string(),
});

// Tipos
export type Vendedor = z.infer<typeof VendedorSchema>;
export type VendedorCreate = z.infer<typeof VendedorCreateSchema>;
export type VendedorResponse = z.infer<typeof VendedorResponseSchema>;
