// ============================================
// ✅ NUEVO: BackEnd/src/schemas/Celula.ts
// ============================================
import { z } from "zod";

export const CelulaSchema = z.object({
  id_celula: z.number().int().positive(),
  empresa: z.number().int().positive(),
  nombre: z.string().min(1).max(45).default("default"),
  tipo_cuenta: z.string().max(45),
});

export const CelulaCreateSchema = CelulaSchema.omit({
  id_celula: true,
});

export const CelulaUpdateSchema = CelulaSchema.omit({
  id_celula: true,
  empresa: true,
}).partial();

export type Celula = z.infer<typeof CelulaSchema>;
export type CelulaCreate = z.infer<typeof CelulaCreateSchema>;
export type CelulaUpdate = z.infer<typeof CelulaUpdateSchema>;
