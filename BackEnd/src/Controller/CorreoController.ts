// ============================================
// BackEnd/src/Controller/CorreoController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { CorreoService } from "../services/CorreoService.ts";
import {
  Correo,
  CorreoCreate,
  CorreoCreateSchema,
  CorreoUpdate,
  CorreoUpdateSchema,
} from "../schemas/correo/Correo.ts";
import { manejoDeError } from "../Utils/errores.ts";
import { load } from "dotenv";

await load({ export: true });

export class CorreoController {
  private service: CorreoService;

  constructor(model: CorreoModelDB) {
    this.service = new CorreoService(model);
  }

  // GET ALL
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
  }): Promise<Correo[]> {
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

      const correos = await this.service.getAll({
        page,
        limit,
        name: params.name,
      });

      if (!correos) {
        return [];
      }

      console.log(`[INFO] ${correos.length} correos encontrados`);
      return correos;
    } catch (error) {
      manejoDeError("Error al obtener todos los correos", error);
      throw error;
    }
  }

  // GET BY ID
  async getById({ id }: { id: string }): Promise<Correo> {
    try {
      if (!id || id.trim() === "") {
        throw new Error("SAP ID requerido");
      }

      logger.info(`Buscando correo por SAP: ${id}`);

      const correo = await this.service.getById({ id });

      if (!correo) {
        throw new Error(`Correo con SAP ID ${id} no encontrado`);
      }

      logger.info(`Correo encontrado: ${correo.sap_id}`);
      return correo;
    } catch (error) {
      manejoDeError("Error al obtener correo por ID", error);
      throw error;
    }
  }

  // GET BY SAP
  async getBySAP({ sap }: { sap: string }): Promise<Correo> {
    try {
      if (!sap || sap.trim() === "") {
        throw new Error("Código SAP requerido");
      }

      logger.info(`Buscando correo por SAP: ${sap}`);

      const correo = await this.service.getBySAP({ sap });

      if (!correo) {
        throw new Error(`Correo con SAP ${sap} no encontrado`);
      }

      return correo;
    } catch (error) {
      manejoDeError("Error al obtener correo por SAP", error);
      throw error;
    }
  }

  // CREATE
  async create(input: CorreoCreate): Promise<Correo> {
    try {
      if (!input || Object.keys(input).length === 0) {
        throw new Error("Datos de correo requeridos");
      }

      logger.info(`Creando correo: ${input.sap_id}`);

      // Validar con Zod
      const validated = CorreoCreateSchema.parse(input);

      const correo = await this.service.create(validated);

      logger.info(`Correo creado exitosamente: ${correo.sap_id}`);
      return correo;
    } catch (error) {
      manejoDeError("Error al crear correo", error);
      throw error;
    }
  }

  // UPDATE
  async update(params: {
    id: string;
    input: Partial<CorreoUpdate>;
  }): Promise<Correo> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("SAP ID requerido");
      }

      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      logger.info(`Actualizando correo: ${params.id}`);

      // Validar con Zod
      const validatedInput = CorreoUpdateSchema.partial().parse(params.input);

      const correoActualizado = await this.service.update({
        id: params.id,
        input: validatedInput,
      });

      if (!correoActualizado) {
        throw new Error("Error al actualizar correo");
      }

      logger.info(
        `Correo actualizado exitosamente: ${correoActualizado.sap_id}`,
      );
      return correoActualizado;
    } catch (error) {
      manejoDeError("Error al actualizar correo", error);
      throw error;
    }
  }

  // DELETE
  async delete({ id }: { id: string }): Promise<void> {
    try {
      if (!id || id.trim() === "") {
        throw new Error("SAP ID requerido");
      }

      logger.info(`Eliminando correo: ${id}`);

      await this.service.delete({ id });

      console.log(`[INFO] Correo eliminado exitosamente: ${id}`);
    } catch (error) {
      manejoDeError("Error al eliminar correo", error);
      throw error;
    }
  }

  // BÚSQUEDAS ESPECIALIZADAS
  async getByLocalidad(
    { localidad }: { localidad: string },
  ): Promise<Correo[]> {
    try {
      if (!localidad || localidad.trim() === "") {
        throw new Error("Localidad requerida");
      }

      logger.info(`Buscando correos por localidad: ${localidad}`);

      const correos = await this.service.getByLocalidad({ localidad });

      console.log(`[INFO] ${correos.length} correos encontrados`);
      return correos;
    } catch (error) {
      manejoDeError("Error al buscar correos por localidad", error);
      throw error;
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

      const correos = await this.service.getByDepartamento({ departamento });

      console.log(`[INFO] ${correos.length} correos encontrados`);
      return correos;
    } catch (error) {
      manejoDeError("Error al buscar correos por departamento", error);
      throw error;
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

      const correos = await this.service.getProximosAVencer({ dias });

      console.log(`[INFO] ${correos.length} correos próximos a vencer`);
      return correos;
    } catch (error) {
      manejoDeError("Error al buscar correos próximos a vencer", error);
      throw error;
    }
  }

  async getVencidos(): Promise<Correo[]> {
    try {
      logger.info("Buscando correos vencidos");

      const correos = await this.service.getVencidos();

      console.log(`[INFO] ${correos.length} correos vencidos`);
      return correos;
    } catch (error) {
      manejoDeError("Error al buscar correos vencidos", error);
      throw error;
    }
  }

  // ESTADÍSTICAS
  async getStats(): Promise<{
    total: number;
    porLocalidad: Record<string, number>;
    porDepartamento: Record<string, number>;
    proximosAVencer: number;
    vencidos: number;
  }> {
    try {
      logger.info("Obteniendo estadísticas de correos");

      const stats = await this.service.getStats();

      logger.info(`Estadísticas calculadas: ${stats.total} correos`);

      return stats;
    } catch (error) {
      manejoDeError("Error al obtener estadísticas de correos", error);
      throw error;
    }
  }
}
