import { Promocion, PromocionCreate } from "../schemas/venta/Promocion.ts";
import { ModelDB } from "./model.ts";

export interface PromocionModelDB extends Omit<ModelDB<Promocion>, 'add'> {
  add(params: { input: PromocionCreate }): Promise<Promocion>;

  getByNombre: ({ nombre }: { nombre: string }) => Promise<Promocion | undefined>;

  getByEmpresa: ({ empresa }: { empresa: string }) => Promise<Promocion[]>;
}