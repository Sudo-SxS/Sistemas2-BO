// BackEnd/src/schemas/venta/EmpresaOrigen.ts
import { z } from "zod";

export const EmpresaOrigenSchema = z.object({
  empresa_origen_id: z.number().int().positive(),
  nombre_empresa: z.string().min(1).max(100),
  pais: z.string().min(1).max(60),
});

export const EmpresaOrigenCreateSchema = EmpresaOrigenSchema.omit({
  empresa_origen_id: true,
});

export const EmpresaOrigenUpdateSchema = EmpresaOrigenSchema.omit({
  empresa_origen_id: true,
}).partial();

export type EmpresaOrigen = z.infer<typeof EmpresaOrigenSchema>;
export type EmpresaOrigenCreate = z.infer<typeof EmpresaOrigenCreateSchema>;
export type EmpresaOrigenUpdate = z.infer<typeof EmpresaOrigenUpdateSchema>;