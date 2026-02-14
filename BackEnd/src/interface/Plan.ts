import { Plan, PlanCreate } from "../schemas/venta/Plan.ts";
import { ModelDB } from "./model.ts";

export interface PlanModelDB extends Omit<ModelDB<Plan>, 'add'> {
  add(params: { input: PlanCreate }): Promise<Plan>;

  getByNombre: ({ nombre }: { nombre: string }) => Promise<Plan | undefined>;

  getByEmpresa: ({ empresa }: { empresa: number }) => Promise<Plan[]>;
}