// schemas/venta/Celula.ts

import { z } from "zod";

// Schema para crear célula
export const CelulaCreateSchema = z.object({
  id_celula: z.number().int().positive("El ID debe ser un número positivo"),
  empresa: z.number().int().positive("La empresa debe ser un número positivo"),
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  tipo_cuenta: z.enum(["PREPAGO", "POSPAGO", "CORPORATIVO"], {
    errorMap: () => ({ message: "Tipo de cuenta debe ser PREPAGO, POSPAGO o CORPORATIVO" }),
  }),
});

// Schema para actualizar (todos los campos opcionales)
export const CelulaUpdateSchema = CelulaCreateSchema.partial();

// Tipo TypeScript inferido
export type CelulaCreate = z.infer<typeof CelulaCreateSchema>;
export type CelulaUpdate = z.infer<typeof CelulaUpdateSchema>;

// Exportar el schema completo
export default {
  create: CelulaCreateSchema,
  update: CelulaUpdateSchema,
};