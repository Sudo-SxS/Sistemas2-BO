// BackEnd/src/services/PromocionService.ts
// ============================================
import { PromocionModelDB } from "../interface/Promocion.ts";
import {
   PromocionCreate,
   PromocionUpdate,
} from "../schemas/venta/Promocion.ts";
import { logger } from '../Utils/logger.ts';

export class PromocionService {
  private modePromocion: PromocionModelDB;

  constructor(modePromocion: PromocionModelDB) {
    this.modePromocion = modePromocion;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const promociones = await this.modePromocion.getAll(params);
      return promociones;
     } catch (error) {
       logger.error("PromocionService.getAll:", error);
       throw error;
     }
  }

  async getById(id: string) {
    try {
      const promocion = await this.modePromocion.getById({ id });
      return promocion;
     } catch (error) {
       logger.error("PromocionService.getById:", error);
       throw error;
     }
  }

  async getByEmpresa(empresa: string) {
    try {
      const promociones = await this.modePromocion.getByEmpresa({ empresa });
      return promociones;
     } catch (error) {
       logger.error("PromocionService.getByEmpresa:", error);
       throw error;
     }
  }

  async create(input: PromocionCreate) {
    try {
      const newPromocion = await this.modePromocion.add({ input });
      return newPromocion;
     } catch (error) {
       logger.error("PromocionService.create:", error);
       throw error;
     }
  }

  async update(id: string, input: PromocionUpdate) {
    try {
      const updatedPromocion = await this.modePromocion.update({ id, input });
      return updatedPromocion;
     } catch (error) {
       logger.error("PromocionService.update:", error);
       throw error;
     }
  }

  async delete(id: string) {
    try {
      const deleted = await this.modePromocion.delete({ id });
      return deleted;
     } catch (error) {
       logger.error("PromocionService.delete:", error);
       throw error;
     }
  }
}
