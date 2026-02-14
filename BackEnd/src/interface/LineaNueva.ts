import { LineaNueva, LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
import { ModelDB } from "./model.ts";

export interface LineaNuevaModelDB extends Omit<ModelDB<LineaNueva>, 'add' | 'getById' | 'update' | 'delete' | 'getAll'> {
  getAll: (params: { page?: number; limit?: number }) => Promise<LineaNueva[]>;
  add(params: { input: LineaNuevaCreate }): Promise<LineaNueva>;
  getById: ({ id }: { id: number }) => Promise<LineaNueva | undefined>;
  update: ({ id, input }: { id: number; input: Partial<LineaNueva> }) => Promise<LineaNueva | undefined>;
  delete: ({ id }: { id: number }) => Promise<boolean>;
  getByVenta: ({ venta }: { venta: number }) => Promise<LineaNueva | undefined>;
  getStatistics: () => Promise<{
    total: number;
  }>;
  getByEstado: ({ estado }: { estado: string }) => Promise<LineaNueva[]>;
}