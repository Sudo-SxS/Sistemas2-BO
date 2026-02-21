// ============================================
// BackEnd/src/services/EstadisticaService.ts
// Servicio de estadísticas
// ============================================

import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL.ts";
import {
  EstadisticaFilters,
  EstadisticaCompleta,
  RecargaDetallada,
} from "../interface/Estadistica.ts";
import { logger } from "../Utils/logger.ts";

export class EstadisticaService {
  private model: EstadisticaPostgreSQL;

  constructor(model: EstadisticaPostgreSQL) {
    this.model = model;
  }

  async getEstadisticas(filters: EstadisticaFilters): Promise<EstadisticaCompleta> {
    try {
      logger.info("Obteniendo estadísticas con filtros:", filters);
      const result = await this.model.getEstadisticas(filters);
      logger.info("Estadísticas obtenidas exitosamente");
      return result;
    } catch (error) {
      logger.error("Error en EstadisticaService.getEstadisticas:", error);
      throw error;
    }
  }

  async getRecargas(filters: EstadisticaFilters): Promise<RecargaDetallada> {
    try {
      logger.info("Obteniendo recargas detalladas con filtros:", filters);
      const result = await this.model.getRecargasDetalladas(filters);
      logger.info("Recargas detalladas obtenidas:", result.totalRecargas);
      return result;
    } catch (error) {
      logger.error("Error en EstadisticaService.getRecargas:", error);
      throw error;
    }
  }
}
