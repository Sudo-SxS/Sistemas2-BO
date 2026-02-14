import { z } from "zod";

// Schema de la tabla vendedor según BD: solo tiene vendedor_id y usuario_id
export const VendedorSchema = z.object({
  vendedor_id: z.number().int().positive(),
  usuario: z.string().uuid(), // FK a usuario.persona_id
});

// Para crear un vendedor
export const VendedorCreateSchema = z.object({
  usuario: z.string().uuid(),
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
});

// Tipos
export type Vendedor = z.infer<typeof VendedorSchema>;
export type VendedorCreate = z.infer<typeof VendedorCreateSchema>;
export type VendedorResponse = z.infer<typeof VendedorResponseSchema>;
