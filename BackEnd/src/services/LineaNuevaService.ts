// BackEnd/src/services/LineaNuevaService.ts
// ============================================
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { LineaNueva, LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
import { logger } from '../Utils/logger.ts';

export class LineaNuevaService {
  model: LineaNuevaModelDB;

  constructor(model: LineaNuevaModelDB) {
    this.model = model;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<LineaNueva[]> {
    const result = await this.model.getAll(params);
    return result || [];
  }

  async getById({ id }: { id: number }): Promise<LineaNueva | undefined> {
    return this.model.getById({ id });
  }

  async create({ lineaNueva }: { lineaNueva: LineaNuevaCreate }): Promise<LineaNueva> {
    return this.model.add({ input: lineaNueva });
  }

  async update({ id, lineaNueva }: { id: number; lineaNueva: Partial<LineaNueva> }): Promise<LineaNueva | undefined> {
    return this.model.update({ id, input: lineaNueva });
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    return this.model.delete({ id });
  }

  async getByVenta({ venta }: { venta: number }): Promise<LineaNueva | undefined> {
    return this.model.getByVenta({ venta });
  }

  async getStatistics() {
    try {
      const stats = await this.model.getStatistics();
      return stats;
     } catch (error) {
       logger.error("LineaNuevaService.getStatistics:", error);
       throw error;
     }
  }

  async getByEstado({ estado }: { estado: string }): Promise<LineaNueva[]> {
    return this.model.getByEstado({ estado });
  }
}