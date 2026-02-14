// ============================================
// BackEnd/src/Controller/EstadoCorreoController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoCorreoService } from "../services/EstadoCorreoService.ts";
import {
  EstadoCorreo,
  EstadoCorreoCreate,
  EstadoCorreoCreateSchema,
  EstadoCorreoUpdate,
  EstadoCorreoUpdateSchema,
} from "../schemas/correo/EstadoCorreo.ts";
import { manejoDeError } from "../Utils/errores.ts";
import { load } from "dotenv";
import { ZodIssue } from "zod";

await load({ export: true });

/**
 * Controlador de Estado de Correo
 * Coordina las operaciones de tracking y seguimiento
 */
export class EstadoCorreoController {
  private service: EstadoCorreoService;

  constructor(model: EstadoCorreoModelDB) {
    this.service = new EstadoCorreoService(model);
  }

  /**
   * GET ALL - Obtiene todos los estados
   */
  async getAll(params: {
    page?: number;
    limit?: number;
  }): Promise<EstadoCorreo[]> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      if (limit > 100) {
        throw new Error("El límite máximo es 100 estados por página");
      }

      logger.info(
        `Obteniendo estados - Página: ${page}, Límite: ${limit}`,
      );

      const estados = await this.service.getAll({ page, limit });

      if (!estados) {
        return [];
      }

      logger.info(`${estados.length} estados encontrados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener todos los estados", error);
      throw error;
    }
  }

  /**
   * GET BY ID - Obtiene un estado específico
   */
  async getById({ id }: { id: number }): Promise<EstadoCorreo> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de estado requerido");
      }

      logger.info(`Buscando estado por ID: ${id}`);

      const estado = await this.service.getById({ id });

      if (!estado) {
        throw new Error(`Estado con ID ${id} no encontrado`);
      }

      logger.info(`Estado encontrado: ${estado.estado_correo_id}`);
      return estado;
    } catch (error) {
      manejoDeError("Error al obtener estado por ID", error);
      throw error;
    }
  }

  /**
   * GET BY SAP - Obtiene HISTORIAL COMPLETO de un correo
   */
  async getBySAP({ sap }: { sap: string }): Promise<EstadoCorreo[]> {
    try {
      if (!sap || sap.trim() === "") {
        throw new Error("Código SAP requerido");
      }

      logger.info(`Buscando historial completo por SAP: ${sap}`);

      const estados: EstadoCorreo[] = await this.service.getBySAP({ sap });

      logger.info(
        `${estados.length} estados encontrados para SAP: ${sap}`,
      );
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener historial por SAP", error);
      throw error;
    }
  }

  async getLastBySAP({ sap }: { sap: string }): Promise<EstadoCorreo | undefined> {
    try {
      if (!sap || sap.trim() === "") {
        throw new Error("Código SAP requerido");
      }

      logger.info(`Buscando último estado por SAP: ${sap}`);

      const estado = await this.service.getLastBySAP({ sap });

      logger.info(`Último estado encontrado para SAP: ${sap}`);
      return estado;
    } catch (error) {
      manejoDeError("Error al obtener último estado por SAP", error);
      throw error;
    }
  }

  /**
   * CREATE - Crea un nuevo estado
   */
  async create(input: EstadoCorreoCreate): Promise<EstadoCorreo> {
    try {
      if (!input || Object.keys(input).length === 0) {
        throw new Error("Datos de estado requeridos");
      }

      // Validar con Zod
      const validationResult = EstadoCorreoCreateSchema.safeParse(input);
      if (!validationResult.success) {
        throw new Error(
          `Validación fallida: ${validationResult.error.errors.map((error: ZodIssue) => error.message).join(", ")}`
        );
      }

      const estado = await this.service.create(validationResult.data);

      logger.info(
        `Estado creado exitosamente: ${estado.estado_correo_id}, SAP: ${estado.sap_id}, Estado: ${estado.estado}`,
      );
      return estado;
    } catch (error) {
      // Manejar errores de validación Zod específicamente
      if (error instanceof Error && error.message.startsWith("Validación fallida")) {
        manejoDeError("Error de validación en creación de estado", error);
      } else {
        manejoDeError("Error al crear estado", error);
      }
      throw error;
    }
  }

  /**
   * UPDATE - Actualiza un estado existente
   */
  async update(params: {
    id: number;
    input: Partial<EstadoCorreoUpdate>;
  }): Promise<EstadoCorreo> {
    try {
      if (!params.id || params.id <= 0) {
        throw new Error("ID de estado requerido");
      }

      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      logger.info(`Actualizando estado: ${params.id}`);

      // Validar con Zod
      const validatedInput = EstadoCorreoUpdateSchema.partial().parse(
        params.input,
      );

      const estadoActualizado = await this.service.update({
        id: params.id,
        input: validatedInput,
      });

      if (!estadoActualizado) {
        throw new Error("Error al actualizar estado");
      }

      logger.info(
        `Estado actualizado exitosamente: ${estadoActualizado.estado_correo_id}`,
      );
      return estadoActualizado;
    } catch (error) {
      manejoDeError("Error al actualizar estado", error);
      throw error;
    }
  }

  /**
   * DELETE - Elimina un estado permanentemente
   */
  async delete({ id }: { id: number }): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de estado requerido");
      }

      logger.info(`Eliminando estado: ${id}`);

      await this.service.delete({ id });

      logger.info(`Estado eliminado exitosamente: ${id}`);
    } catch (error) {
      manejoDeError("Error al eliminar estado", error);
      throw error;
    }
  }

  /**
   * GET ENTREGADOS - Obtiene correos entregados (estado = 'ENTREGADO')
   */
  async getEntregados(): Promise<EstadoCorreo[]> {
    try {
      logger.info("Obteniendo correos entregados");

      const estados = await this.service.getEntregados();

      logger.info(`${estados.length} correos entregados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener correos entregados", error);
      throw error;
    }
  }

  /**
   * GET NO ENTREGADOS - Obtiene correos no entregados (estado = 'NO ENTREGADO')
   */
  async getNoEntregados(): Promise<EstadoCorreo[]> {
    try {
      logger.info("Obteniendo correos no entregados");

      const estados = await this.service.getNoEntregados();

      logger.info(`${estados.length} correos no entregados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener correos no entregados", error);
      throw error;
    }
  }

  /**
   * GET DEVUELTOS - Obtiene correos devueltos (estado = 'DEVUELTO AL CLIENTE')
   */
  async getDevueltos(): Promise<EstadoCorreo[]> {
    try {
      logger.info("Obteniendo correos devueltos");

      const estados = await this.service.getDevueltos();

      logger.info(`${estados.length} correos devueltos`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener correos devueltos", error);
      throw error;
    }
  }

  /**
   * GET EN TRANSITO - Obtiene correos en tránsito (estado = 'EN TRANSITO')
   */
  async getEnTransito(): Promise<EstadoCorreo[]> {
    try {
      logger.info("Obteniendo correos en tránsito");

      const estados = await this.service.getEnTransito();

      logger.info(`${estados.length} correos en tránsito`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener correos en tránsito", error);
      throw error;
    }
  }

  /**
   * GET ASIGNADOS - Obtiene correos asignados (estado = 'ASIGNADO')
   */
  async getAsignados(): Promise<EstadoCorreo[]> {
    try {
      logger.info("Obteniendo correos asignados");

      const estados = await this.service.getAsignados();

      logger.info(`${estados.length} correos asignados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener correos asignados", error);
      throw error;
    }
  }

  /**
   * GET BY ESTADO - Obtiene correos por estado específico
   */
  async getByEstado({ estado }: { estado: string }): Promise<EstadoCorreo[]> {
    try {
      if (!estado || estado.trim() === "") {
        throw new Error("Estado requerido");
      }

      logger.info(`Obteniendo correos con estado: ${estado}`);

      const estados = await this.service.getByEstado({ estado });

      logger.info(`${estados.length} correos encontrados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener correos por estado", error);
      throw error;
    }
  }

  /**
   * MARCAR COMO ENTREGADO - Marca un correo como entregado
   */
  async marcarComoEntregado({ id }: { id: number }): Promise<EstadoCorreo> {
    try {
      if (!id || id <= 0) {
        throw new Error("ID de estado requerido");
      }

      logger.info(`Marcando correo como entregado: ${id}`);

      const estado = await this.service.marcarComoEntregado({ id });

      if (!estado) {
        throw new Error("Error al marcar correo como entregado");
      }

      logger.info("Correo marcado como entregado");
      return estado;
    } catch (error) {
      manejoDeError("Error al marcar como entregado", error);
      throw error;
    }
  }

  /**
   * ACTUALIZAR UBICACIÓN - Actualiza la ubicación de un correo
   */
  async actualizarUbicacion(params: {
    id: number;
    ubicacion: string;
  }): Promise<EstadoCorreo> {
    try {
      if (!params.id || params.id <= 0) {
        throw new Error("ID de estado requerido");
      }

      if (!params.ubicacion || params.ubicacion.trim() === "") {
        throw new Error("Ubicación requerida");
      }

      logger.info(`Actualizando ubicación: ${params.id}`);

      const estado = await this.service.actualizarUbicacion(params);

      if (!estado) {
        throw new Error("Error al actualizar ubicación");
      }

      logger.info(`Ubicación actualizada: ${params.ubicacion}`);
      return estado;
    } catch (error) {
      manejoDeError("Error al actualizar ubicación", error);
      throw error;
    }
  }

  /**
   * GET STATS - Obtiene estadísticas de estados
   */
  async getStats(): Promise<{
    total: number;
    entregados: number;
    noEntregados: number;
    devueltos: number;
    enTransito: number;
    asignados: number;
    porcentajeEntrega: number;
  }> {
    try {
      logger.info("Obteniendo estadísticas de estados");

      const stats = await this.service.getStats();

      logger.info(`Estadísticas calculadas: ${stats.total} estados`);
      return stats;
    } catch (error) {
      manejoDeError("Error al obtener estadísticas de estados", error);
      throw error;
    }
  }

  /**
   * GET BY FECHA RANGO - Obtiene estados por rango de fechas
   */
  async getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoCorreo[]> {
    try {
      if (!params.fechaInicio || !params.fechaFin) {
        throw new Error("Fechas de inicio y fin requeridas");
      }

      logger.info(
        `Obteniendo estados por rango: ${params.fechaInicio} - ${params.fechaFin}`,
      );

      const estados = await this.service.getByFechaRango(params);

      logger.info(`${estados.length} estados encontrados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener estados por fecha", error);
      throw error;
    }
  }

  /**
   * GET BY UBICACIÓN - Obtiene estados por ubicación
   */
  async getByUbicacion(
    { ubicacion }: { ubicacion: string },
  ): Promise<EstadoCorreo[]> {
    try {
      if (!ubicacion || ubicacion.trim() === "") {
        throw new Error("Ubicación requerida");
      }

      logger.info(`Obteniendo estados por ubicación: ${ubicacion}`);

      const estados = await this.service.getByUbicacion({ ubicacion });

      logger.info(`${estados.length} estados encontrados`);
      return estados;
    } catch (error) {
      manejoDeError("Error al obtener estados por ubicación", error);
      throw error;
    }
  }
}
