import { z } from "zod";

export const PersonaSchema = z.object({
  id_persona: z.string().uuid(),
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  apellido: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  fecha_nacimiento: z.coerce.date(),
  documento: z.string().min(1).max(30),
  email: z.string().email().max(255).transform(val => val.toLowerCase()),
  creado_en: z.coerce.date().default(() => new Date()),
  telefono: z.string().max(20).nullable().optional(),
  telefono_alternativo: z.string().max(20).nullable().optional(),
  tipo_documento: z.string().max(45).transform(val => val.toUpperCase()),
  nacionalidad: z.string().max(45).transform(val => val.toUpperCase()),
  genero: z.string().transform(val => val.toUpperCase()).pipe(z.enum(["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"])),
});

export const PersonaCreateSchema = PersonaSchema.omit({
  id_persona: true,
  creado_en: true,
});

export const PersonaUpdateSchema = PersonaSchema.omit({
  id_persona: true,
  creado_en: true,
}).partial();

export type Persona = z.infer<typeof PersonaSchema>;
export type PersonaCreate = z.infer<typeof PersonaCreateSchema>;
export type PersonaUpdate = z.infer<typeof PersonaUpdateSchema>;
