// Portabilidad.ts
import { z } from "zod";

export const PortabilidadSchema = z.object({
  venta: z.number().int().positive(), // FK a venta.idventa (PK)
  spn: z.string().max(20).transform((val) => val.toUpperCase()),
  empresa_origen: z.number().int().positive(),
  mercado_origen: z.string().max(45).transform((val) => val.toUpperCase()),
  numero_porta: z.string().max(20),
  pin: z.number().int().nullable().optional().default(0), //en la proxima actualizacin de DB de debe sacar 0000
  fecha_portacion: z.date().optional(),
});

//venta_id, spn, empresa_origen, mercado_origen, numero_portar, pin, fecha_portacion

export const PortabilidadCreateSchema = PortabilidadSchema.omit({});

export const PortabilidadUpdateSchema = PortabilidadSchema.omit({
  venta: true,
}).partial();

export type Portabilidad = z.infer<typeof PortabilidadSchema>;
export type PortabilidadCreate = z.infer<typeof PortabilidadCreateSchema>;
export type PortabilidadUpdate = z.infer<typeof PortabilidadUpdateSchema>;
