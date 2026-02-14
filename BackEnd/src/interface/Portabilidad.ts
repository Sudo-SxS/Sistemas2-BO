import { Portabilidad, PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { ModelDB } from "./model.ts";

export interface PortabilidadModelDB extends Omit<ModelDB<Portabilidad>, 'add' | 'getById' | 'update' | 'delete' | 'getAll'> {
  getAll: (params: { page?: number; limit?: number }) => Promise<Portabilidad[]>;
  add(params: { input: PortabilidadCreate }): Promise<Portabilidad>;
  getById: ({ id }: { id: number }) => Promise<Portabilidad | undefined>;
  update: ({ id, input }: { id: number; input: Partial<Portabilidad> }) => Promise<Portabilidad | undefined>;
  delete: ({ id }: { id: number }) => Promise<boolean>;
  getByVenta: ({ venta }: { venta: number }) => Promise<Portabilidad | undefined>;
  getStatistics: () => Promise<{
    total: number;
    byEmpresaOrigen: Array<{ empresa_origen: string; cantidad: number }>;
    byMercadoOrigen: Array<{ mercado_origen: string; cantidad: number }>;
  }>;
  getByEstado: ({ estado }: { estado: string }) => Promise<Portabilidad[]>;
}