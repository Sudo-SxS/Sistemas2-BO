// BackEnd/src/Controller/CelulaController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { CelulaCreate, CelulaUpdate } from "../schemas/venta/Celula.ts";
import { CelulaService } from "../services/CelulaService.ts";

export class CelulaController {
  private celulaService: CelulaService;

  constructor(celulaService: CelulaService) {
    this.celulaService = celulaService;
  }

  async getAll(input: { page?: number; limit?: number }) {
    try {
      const celulas = await this.celulaService.getAll(input);
      return celulas;
    } catch (error) {
      logger.error("CelulaController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: number }) {
    try {
      const celula = await this.celulaService.getById(input.id);
      return celula;
    } catch (error) {
      logger.error("CelulaController.getById:", error);
      throw error;
    }
  }

  async getByEmpresa(input: { empresa: number }) {
    try {
      const celulas = await this.celulaService.getByEmpresa(input.empresa);
      return celulas;
    } catch (error) {
      logger.error("CelulaController.getByEmpresa:", error);
      throw error;
    }
  }

  async getAsesoresByCelula(input: { id_celula: number }) {
    try {
      const asesores = await this.celulaService.getAsesoresByCelula(input.id_celula);
      return asesores;
    } catch (error) {
      logger.error("CelulaController.getAsesoresByCelula:", error);
      throw error;
    }
  }

  async create(input: { celula: CelulaCreate }) {
    try {
      const newCelula = await this.celulaService.create(input.celula);
      return newCelula;
    } catch (error) {
      logger.error("CelulaController.create:", error);
      throw error;
    }
  }

  async update(input: { id: number; celula: CelulaUpdate }) {
    try {
      const updatedCelula = await this.celulaService.update(input.id, input.celula);
      return updatedCelula;
    } catch (error) {
      logger.error("CelulaController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: number }) {
    try {
      const deleted = await this.celulaService.delete(input.id);
      return deleted;
    } catch (error) {
      logger.error("CelulaController.delete:", error);
      throw error;
    }
  }
}