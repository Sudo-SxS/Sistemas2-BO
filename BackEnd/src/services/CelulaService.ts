// BackEnd/src/services/CelulaService.ts
// ============================================
import { CelulaModelDB } from "../interface/Celula.ts";
import { CelulaCreate, CelulaUpdate } from "../schemas/venta/Celula.ts";
import { logger } from "../Utils/logger.ts";

export class CelulaService {
  private celulaModel: CelulaModelDB;

  constructor(celulaModel: CelulaModelDB) {
    this.celulaModel = celulaModel;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const celulas = await this.celulaModel.getAll(params);
      return celulas;
    } catch (error) {
      logger.error("CelulaService.getAll:", error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const celula = await this.celulaModel.getById({ id });
      return celula;
    } catch (error) {
      logger.error("CelulaService.getById:", error);
      throw error;
    }
  }

  async getByEmpresa(empresa: number) {
    try {
      const celulas = await this.celulaModel.getByEmpresa({ empresa });
      return celulas;
    } catch (error) {
      logger.error("CelulaService.getByEmpresa:", error);
      throw error;
    }
  }

  async getAsesoresByCelula(id_celula: number) {
    try {
      const asesores = await this.celulaModel.getAsesoresByCelula({ id_celula });
      return asesores;
    } catch (error) {
      logger.error("CelulaService.getAsesoresByCelula:", error);
      throw error;
    }
  }

  async create(input: CelulaCreate) {
    try {
      // Verificar si ya existe
      const exists = await this.celulaModel.checkExists({ id: input.id_celula });
      if (exists) {
        throw new Error(`Ya existe una célula con ID ${input.id_celula}`);
      }

      const newCelula = await this.celulaModel.add({ input });
      logger.info(`Célula ${input.id_celula} creada exitosamente`);
      return newCelula;
    } catch (error) {
      logger.error("CelulaService.create:", error);
      throw error;
    }
  }

  async update(id: number, input: CelulaUpdate) {
    try {
      // Verificar que existe
      const exists = await this.celulaModel.checkExists({ id });
      if (!exists) {
        throw new Error(`No existe una célula con ID ${id}`);
      }

      const updatedCelula = await this.celulaModel.update({ id, input });
      logger.info(`Célula ${id} actualizada exitosamente`);
      return updatedCelula;
    } catch (error) {
      logger.error("CelulaService.update:", error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      // Verificar que existe
      const exists = await this.celulaModel.checkExists({ id });
      if (!exists) {
        throw new Error(`No existe una célula con ID ${id}`);
      }

      const deleted = await this.celulaModel.delete({ id });
      logger.info(`Célula ${id} eliminada exitosamente`);
      return deleted;
    } catch (error) {
      logger.error("CelulaService.delete:", error);
      throw error;
    }
  }
}