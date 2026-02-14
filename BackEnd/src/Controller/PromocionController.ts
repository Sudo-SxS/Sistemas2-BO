// BackEnd/src/Controller/PromocionController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { PromocionCreate, PromocionUpdate } from "../schemas/venta/Promocion.ts";
import { PromocionService } from "../services/PromocionService.ts";

export class PromocionController {
  private promocionService: PromocionService;

  constructor(promocionService: PromocionService) {
    this.promocionService = promocionService;
  }

  async getAll(input: { page?: number; limit?: number }) {
    try {
      const promociones = await this.promocionService.getAll(input);
      return promociones;
    } catch (error) {
      logger.error("PromocionController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const promocion = await this.promocionService.getById(input.id);
      return promocion;
    } catch (error) {
      logger.error("PromocionController.getById:", error);
      throw error;
    }
  }

  async getByEmpresa(input: { empresa: string }) {
    try {
      const promociones = await this.promocionService.getByEmpresa(input.empresa);
      return promociones;
    } catch (error) {
      logger.error("PromocionController.getByEmpresa:", error);
      throw error;
    }
  }

  async create(input: { promocion: PromocionCreate }) {
    try {
      const newPromocion = await this.promocionService.create(input.promocion);
      return newPromocion;
    } catch (error) {
      logger.error("PromocionController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; promocion: PromocionUpdate }) {
    try {
      const updatedPromocion = await this.promocionService.update(input.id, input.promocion);
      return updatedPromocion;
    } catch (error) {
      logger.error("PromocionController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.promocionService.delete(input.id);
      return deleted;
    } catch (error) {
      logger.error("PromocionController.delete:", error);
      throw error;
    }
  }
}