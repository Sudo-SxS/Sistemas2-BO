// Cliente.ts
import { z } from "zod";

export const ClienteSchema = z.object({
  persona_id: z.string().uuid(), // FK a persona.id_persona
});

export const ClienteCreateSchema = z.object({
  // Datos de persona
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  apellido: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  fecha_nacimiento: z.coerce.date(),
  documento: z.string().min(1).max(30),
  email: z.string().email().transform((val) => val.toLowerCase()),
  telefono: z.string().max(20).optional(),
  tipo_documento: z.string().max(45).transform(val => val.toUpperCase()),
  nacionalidad: z.string().max(45).transform(val => val.toUpperCase()),
  genero: z.enum(["MASCULINO", "FEMENINO", "OTRO", "PREFERO NO DECIR"]),
});

export const ClienteUpdateSchema = z.object({
  // Datos de persona para actualizar
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()).optional(),
  apellido: z.string().min(1).max(45).transform(val => val.toUpperCase()).optional(),
  fecha_nacimiento: z.coerce.date().optional(),
  documento: z.string().min(1).max(30).optional(),
  email: z.string().email().transform((val) => val.toLowerCase()).optional(),
  telefono: z.string().max(20).optional(),
  tipo_documento: z.string().max(45).transform(val => val.toUpperCase()).optional(),
  nacionalidad: z.string().max(45).transform(val => val.toUpperCase()).optional(),
  genero: z.enum(["MASCULINO", "FEMENINO", "OTRO", "PREFERO NO DECIR"]).optional(),
}).strict();

// Para respuestas con datos completos
export const ClienteResponseSchema = ClienteSchema.extend({
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  documento: z.string(),
  telefono: z.string().optional(),
  fecha_nacimiento: z.coerce.date(),
});

export type Cliente = z.infer<typeof ClienteSchema>;
export type ClienteCreate = z.infer<typeof ClienteCreateSchema>;
export type ClienteUpdate = z.infer<typeof ClienteUpdateSchema>;
export type ClienteResponse = z.infer<typeof ClienteResponseSchema>;
