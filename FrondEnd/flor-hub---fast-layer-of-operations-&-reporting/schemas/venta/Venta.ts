// Venta.ts
import { z } from "zod";

export const ChipEnum = z.enum(["SIM", "ESIM"]);

export const VentaSchema = z.object({
  venta_id: z.number().int().positive(),
  sds: z.string().nullable().transform((val) => val?.toUpperCase()).optional(),
  chip: z.string().transform((val) => val.toUpperCase()).pipe(ChipEnum),
  stl: z.string().nullable().optional().transform((val) =>
    val ? val.toUpperCase() : val
  ),
  tipo_venta: z.string().transform((val) => val.toUpperCase()).pipe(
    z.enum(["PORTABILIDAD", "LINEA_NUEVA"]),
  ),
  sap: z.string().nullable().optional().transform((val) =>
    val ? val.toUpperCase() : val
  ), // FK a correo.sap
  cliente_id: z.string().uuid(), // FK a cliente.persona_id
  vendedor_id: z.string().uuid(), // FK a vendedor.usuario_id
  multiple: z.number().int().default(0),
  plan_id: z.number().int().positive(), // FK a plan.plan_id
  promocion_id: z.number().int().positive().nullable().optional(), // FK a promocion.promocion_id
  empresa_origen_id: z.number().int().positive(), // FK a empresa_origen.empresa_origen_id
  fecha_creacion: z.coerce.date().optional().default(() => new Date()),
});

export const VentaCreateSchema = VentaSchema.omit({
  venta_id: true,
  fecha_creacion: true,
}).refine((data) => {
  if (data.tipo_venta === "PORTABILIDAD" || data.tipo_venta === "LINEA_NUEVA") {
    return data.promocion_id != null;
  }
  return true;
}, {
  message: "Portabilidades y líneas nuevas requieren promoción",
  path: ["promocion_id"],
});

export const VentaUpdateSchema = VentaSchema.omit({
  venta_id: true,
}).partial();

// Para respuestas con datos relacionados
export const VentaResponseSchema = VentaSchema.extend({
  cliente_nombre: z.string(),
  cliente_apellido: z.string(),
  vendedor_nombre: z.string(),
  vendedor_apellido: z.string(),
  plan_nombre: z.string(),
  plan_precio: z.number(),
  promocion_nombre: z.string().optional(),
  estado_actual: z.string().optional(),
});

export type Venta = z.infer<typeof VentaSchema>;
export type VentaCreate = z.infer<typeof VentaCreateSchema>;
export type VentaUpdate = z.infer<typeof VentaUpdateSchema>;
export type VentaResponse = z.infer<typeof VentaResponseSchema>;
export type ChipType = z.infer<typeof ChipEnum>;
