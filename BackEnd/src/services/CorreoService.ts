// ============================================
// BackEnd/src/services/CorreoService.ts
// ============================================
import { CorreoModelDB } from "../interface/correo.ts";
import {
  Correo,
  CorreoCreate,
  CorreoCreateSchema,
  CorreoUpdate,
} from "../schemas/correo/Correo.ts";
import { logger } from "../Utils/logger.ts";

export class CorreoService {
  private model: CorreoModelDB;

  constructor(model: CorreoModelDB) {
    this.model = model;
  }

  // Obtener todos con paginación
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
  }): Promise<Correo[] | undefined> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      if (limit > 100) {
        throw new Error("El límite máximo es 100 correos por página");
      }

      logger.info(`Obteniendo correos - Página: ${page}, Límite: ${limit}`);

      const correos = await this.model.getAll(params);

      if (!correos || correos.length === 0) {
        return undefined;
      }

      logger.info(`${correos.length} correos encontrados`);
      return correos;
    } catch (error) {
      logger.error("CorreoService.getAll:", error);
      throw new Error(
        `Error al obtener correos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Obtener por ID (SAP)
  async getById({ id }: { id: string }): Promise<Correo | undefined> {
    try {
      if (!id || id.trim() === "") {
        throw new Error("SAP ID requerido");
      }

      logger.info(`Buscando correo por SAP: ${id}`);
      const correo = await this.model.getById({ id });

      if (!correo) {
        return undefined;
      }

      logger.info(`Correo encontrado: ${correo.sap_id}`);
      return correo;
    } catch (error) {
      logger.error("CorreoService.getById:", error);
      throw new Error(
        `Error al obtener correo por ID: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Obtener por SAP
  async getBySAP({ sap }: { sap: string }): Promise<Correo | undefined> {
    try {
      if (!sap || sap.trim() === "") {
        throw new Error("Código SAP requerido");
      }

      logger.info(`Buscando correo por SAP: ${sap}`);
      const correo = await this.model.getBySAP({ sap });

      if (!correo) {
        return undefined;
      }

      return correo;
    } catch (error) {
      logger.error("CorreoService.getBySAP:", error);
      throw new Error(
        `Error al obtener correo por SAP: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Crear correo
  async create(input: CorreoCreate): Promise<Correo> {
    try {
      if (!input || Object.keys(input).length === 0) {
        throw new Error("Datos de correo requeridos");
      }

      logger.info(`Creando correo: ${input.sap_id}`);

      // Validar con Zod
      const validated = CorreoCreateSchema.parse(input);

      // Verificar que no exista
      const existingCorreo = await this.model.getBySAP({
        sap: validated.sap_id,
      });
      if (existingCorreo) {
        throw new Error(`Ya existe un correo con SAP ID: ${validated.sap_id}`);
      }

      // Validar fechas
      const fechaCreacion = new Date();
      const fechaLimite = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

      // Normalizar datos
      const normalizedInput = {
        ...validated,
        destinatario: validated.destinatario.toUpperCase(),
        persona_autorizada: validated.persona_autorizada?.toUpperCase() || null,
        direccion: validated.direccion.toUpperCase(),
        localidad: validated.localidad.toUpperCase(),
        departamento: validated.departamento.toUpperCase(),
        barrio: validated.barrio?.toUpperCase() || null,
        entre_calles: validated.entre_calles?.toUpperCase() || null,
        fecha_creacion: fechaCreacion,
        fecha_limite: fechaLimite,
      };

      const correo = await this.model.add({ input: normalizedInput });

      if (!correo) {
        throw new Error("Error al crear el correo");
      }

      logger.info(`Correo creado exitosamente: ${correo.sap_id}`);
      return correo;
    } catch (error) {
      logger.error("CorreoService.create:", error);
      throw new Error(
        `Error al crear correo: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Actualizar correo
  async update(params: {
    id: string;
    input: Partial<CorreoUpdate>;
  }): Promise<Correo | undefined> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("SAP ID requerido");
      }

      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      logger.info(`Actualizando correo: ${params.id}`);

      // Verificar existencia
      const existingCorreo = await this.model.getById({ id: params.id });
      if (!existingCorreo) {
        throw new Error(`Correo con SAP ID ${params.id} no encontrado`);
      }

      // Normalizar datos
      const normalizedInput = { ...params.input };

      if (normalizedInput.destinatario) {
        normalizedInput.destinatario = normalizedInput.destinatario
          .toUpperCase();
      }
      if (normalizedInput.persona_autorizada) {
        normalizedInput.persona_autorizada = normalizedInput.persona_autorizada
          .toUpperCase();
      }
      if (normalizedInput.direccion) {
        normalizedInput.direccion = normalizedInput.direccion.toUpperCase();
      }
      if (normalizedInput.localidad) {
        normalizedInput.localidad = normalizedInput.localidad.toUpperCase();
      }
      if (normalizedInput.departamento) {
        normalizedInput.departamento = normalizedInput.departamento
          .toUpperCase();
      }
      if (normalizedInput.barrio) {
        normalizedInput.barrio = normalizedInput.barrio.toUpperCase();
      }
      if (normalizedInput.entre_calles) {
        normalizedInput.entre_calles = normalizedInput.entre_calles
          .toUpperCase();
      }

      const correoActualizado = await this.model.update({
        id: params.id,
        input: normalizedInput,
      });

      if (!correoActualizado) {
        throw new Error("Error al actualizar correo");
      }

      logger.info(
        `Correo actualizado exitosamente: ${correoActualizado.sap_id}`,
      );
      return correoActualizado;
    } catch (error) {
      logger.error("CorreoService.update:", error);
      throw new Error(
        `Error al actualizar correo: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Eliminar correo
  async delete(params: { id: string }): Promise<void> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("SAP ID requerido");
      }

      logger.info(`Eliminando correo: ${params.id}`);

      const existingCorreo = await this.model.getById({ id: params.id });
      if (!existingCorreo) {
        throw new Error(`Correo con SAP ID ${params.id} no encontrado`);
      }

      const deleted = await this.model.delete(params);

      if (!deleted) {
        throw new Error("Error al eliminar correo");
      }

      logger.info(`Correo ${params.id} eliminado exitosamente`);
    } catch (error) {
      logger.error("CorreoService.delete:", error);
      throw new Error(
        `Error al eliminar correo: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Búsquedas especializadas
  async getByLocalidad(
    { localidad }: { localidad: string },
  ): Promise<Correo[]> {
    try {
      if (!localidad || localidad.trim() === "") {
        throw new Error("Localidad requerida");
      }

      logger.info(`Buscando correos por localidad: ${localidad}`);
      const correos = await this.model.getByLocalidad({ localidad });
      logger.info(`${correos.length} correos encontrados en ${localidad}`);

      return correos;
    } catch (error) {
      logger.error("CorreoService.getByLocalidad:", error);
      throw new Error(
        `Error al buscar correos por localidad: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  async getByDepartamento(
    { departamento }: { departamento: string },
  ): Promise<Correo[]> {
    try {
      if (!departamento || departamento.trim() === "") {
        throw new Error("Departamento requerido");
      }

      logger.info(`Buscando correos por departamento: ${departamento}`);
      const correos = await this.model.getByDepartamento({ departamento });
      logger.info(`${correos.length} correos encontrados en ${departamento}`);

      return correos;
    } catch (error) {
      logger.error("CorreoService.getByDepartamento:", error);
      throw new Error(
        `Error al buscar correos por departamento: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  async getProximosAVencer(
    { dias = 3 }: { dias?: number } = {},
  ): Promise<Correo[]> {
    try {
      if (dias < 1) {
        throw new Error("El número de días debe ser mayor a 0");
      }

      logger.info(`Buscando correos próximos a vencer en ${dias} días`);
      const correos = await this.model.getProximosAVencer({ dias });
      logger.info(`${correos.length} correos próximos a vencer`);

      return correos;
    } catch (error) {
      logger.error("CorreoService.getProximosAVencer:", error);
      throw new Error(
        `Error al buscar correos próximos a vencer: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  async getVencidos(): Promise<Correo[]> {
    try {
      logger.info("Buscando correos vencidos");
      const correos = await this.model.getVencidos();
      logger.info(`${correos.length} correos vencidos encontrados`);

      return correos;
    } catch (error) {
      logger.error("CorreoService.getVencidos:", error);
      throw new Error(
        `Error al buscar correos vencidos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  // Estadísticas
  async getStats(): Promise<{
    total: number;
    porLocalidad: Record<string, number>;
    porDepartamento: Record<string, number>;
    proximosAVencer: number;
    vencidos: number;
  }> {
    try {
      logger.info("Obteniendo estadísticas de correos");

      const correos = await this.model.getAll({ page: 1, limit: 10000 });

      if (!correos || correos.length === 0) {
        return {
          total: 0,
          porLocalidad: {},
          porDepartamento: {},
          proximosAVencer: 0,
          vencidos: 0,
        };
      }

      const porLocalidad: Record<string, number> = {};
      const porDepartamento: Record<string, number> = {};

      correos.forEach((correo) => {
        porLocalidad[correo.localidad] = (porLocalidad[correo.localidad] || 0) +
          1;
        porDepartamento[correo.departamento] =
          (porDepartamento[correo.departamento] || 0) + 1;
      });

      const proximosAVencer = await this.model.getProximosAVencer({ dias: 3 });
      const vencidos = await this.model.getVencidos();

      const stats = {
        total: correos.length,
        porLocalidad,
        porDepartamento,
        proximosAVencer: proximosAVencer.length,
        vencidos: vencidos.length,
      };

      logger.info(`Estadísticas calculadas: ${stats.total} correos`);
      return stats;
    } catch (error) {
      logger.error("CorreoService.getStats:", error);
      throw new Error(
        `Error al obtener estadísticas: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }
}
