// BackEnd/src/services/PortabilidadService.ts
// ============================================
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { Portabilidad, PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { logger } from '../Utils/logger.ts';

export class PortabilidadService {
  model: PortabilidadModelDB;

  constructor(model: PortabilidadModelDB) {
    this.model = model;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Portabilidad[]> {
    const result = await this.model.getAll(params);
    return result || [];
  }

  async getById({ id }: { id: number }): Promise<Portabilidad | undefined> {
    return this.model.getById({ id });
  }

  async create({ portabilidad }: { portabilidad: PortabilidadCreate }): Promise<Portabilidad> {
    return this.model.add({ input: portabilidad });
  }

  async update({ id, portabilidad }: { id: number; portabilidad: Partial<Portabilidad> }): Promise<Portabilidad | undefined> {
    return this.model.update({ id, input: portabilidad });
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    return this.model.delete({ id });
  }

  async getByVenta({ venta }: { venta: number }): Promise<Portabilidad | undefined> {
    return this.model.getByVenta({ venta });
  }

  async getStatistics() {
    try {
      const stats = await this.model.getStatistics();
      return stats;
     } catch (error) {
       logger.error("PortabilidadService.getStatistics:", error);
       throw error;
     }
  }

  async getByEstado({ estado }: { estado: string }): Promise<Portabilidad[]> {
    return this.model.getByEstado({ estado });
  }
}