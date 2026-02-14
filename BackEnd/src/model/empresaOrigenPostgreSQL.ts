// ============================================
// BackEnd/src/model/empresaOrigenPostgreSQL.ts
// VERSIÓN MEJORADA con queryObject
// ============================================
import {
  EmpresaOrigen,
  EmpresaOrigenCreate,
  EmpresaOrigenModelDB,
} from "../interface/EmpresaOrigen.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class EmpresaOrigenPostgreSQL implements EmpresaOrigenModelDB {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  // ======================
  // MÉTODOS DE LOGGING
  // ======================
  private logSuccess(message: string, details?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.info(`${message} ${details ? JSON.stringify(details) : ""}`);
    } else {
      logger.info(message);
    }
  }

  private logWarning(message: string, details?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.warn(`${message} ${details ? JSON.stringify(details) : ""}`);
    } else {
      logger.warn(message);
    }
  }

  private logError(message: string, error?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.error(`${message} ${error ? JSON.stringify(error) : ""}`);
    } else {
      logger.error(message);
    }
  }

  // ======================
  // GET ALL
  // ======================
  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<EmpresaOrigen[]> {
    const { page = 1, limit = 10 } = params;

    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const offset = (page - 1) * limit;

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<EmpresaOrigen>(
        `SELECT
          empresa_origen_id,
          nombre_empresa,
          pais
         FROM empresa_origen
         ORDER BY nombre_empresa ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      this.logSuccess("Empresas origen obtenidas exitosamente", {
        count: result.rows.length,
      });

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener empresas origen", error);
      throw error;
    }
  }

  // ======================
  // GET BY ID
  // ======================
  async getById({ id }: { id: string }): Promise<EmpresaOrigen | undefined> {
    if (!id) {
      throw new Error("ID es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<EmpresaOrigen>(
        `SELECT
          empresa_origen_id,
          nombre_empresa,
          pais
         FROM empresa_origen
         WHERE empresa_origen_id = $1`,
        [id],
      );

      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      this.logError("Error al obtener empresa origen por ID", error);
      throw error;
    }
  }

  // ======================
  // GET BY NOMBRE
  // ======================
  async getByNombre(
    { nombre }: { nombre: string },
  ): Promise<EmpresaOrigen | undefined> {
    if (!nombre) {
      throw new Error("Nombre es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<EmpresaOrigen>(
        `SELECT
          empresa_origen_id,
          nombre_empresa,
          pais
         FROM empresa_origen
         WHERE nombre_empresa ILIKE $1`,
        [nombre],
      );

      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      this.logError("Error al obtener empresa origen por nombre", error);
      throw error;
    }
  }

  // ======================
  // GET BY PAIS
  // ======================
  async getByPais({ pais }: { pais: string }): Promise<EmpresaOrigen[]> {
    if (!pais) {
      throw new Error("País es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<EmpresaOrigen>(
        `SELECT
          empresa_origen_id,
          nombre_empresa,
          pais
         FROM empresa_origen
         WHERE pais ILIKE $1
         ORDER BY nombre_empresa ASC`,
        [`%${pais}%`],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener empresas origen por país", error);
      throw error;
    }
  }

  // ======================
  // ADD
  // ======================
  async add({ input }: { input: EmpresaOrigenCreate }): Promise<EmpresaOrigen> {
    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando creación de empresa origen", {
        nombre: input.nombre_empresa,
        pais: input.pais,
      });

      // Verificar si ya existe una empresa con el mismo nombre
      const existing = await this.getByNombre({
        nombre: input.nombre_empresa,
      });

      if (existing) {
        throw new Error(
          `Ya existe una empresa origen con el nombre: ${input.nombre_empresa}`,
        );
      }

      const result = await client.queryObject<EmpresaOrigen>(
        `INSERT INTO empresa_origen (nombre_empresa, pais)
         VALUES ($1, $2)
         RETURNING empresa_origen_id, nombre_empresa, pais`,
        [input.nombre_empresa, input.pais],
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Error al crear empresa origen");
      }

      this.logSuccess("Empresa origen creada exitosamente", {
        id: result.rows[0].empresa_origen_id,
      });

      return result.rows[0];
    } catch (error) {
      this.logError("Error al crear empresa origen", error);
      throw error;
    }
  }

  // ======================
  // UPDATE
  // ======================
  async update({
    id,
    input,
  }: {
    id: string;
    input: Partial<EmpresaOrigen>;
  }): Promise<EmpresaOrigen | undefined> {
    if (!id) {
      throw new Error("ID es requerido para actualizar empresa origen");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando actualización de empresa origen", {
        id,
        input,
      });

      // Verificar que la empresa existe
      const existing = await this.getById({ id });
      if (!existing) {
        this.logWarning("Empresa origen no encontrada para actualizar", { id });
        return undefined;
      }

      // Construir query dinámica
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.nombre_empresa !== undefined) {
        // Verificar que no exista otra empresa con el mismo nombre
        const duplicate = await this.getByNombre({
          nombre: input.nombre_empresa,
        });
        if (duplicate && duplicate.empresa_origen_id !== Number(id)) {
          throw new Error(
            `Ya existe otra empresa origen con el nombre: ${input.nombre_empresa}`,
          );
        }

        fields.push(`nombre_empresa = $${paramIndex++}`);
        values.push(input.nombre_empresa);
      }

      if (input.pais !== undefined) {
        fields.push(`pais = $${paramIndex++}`);
        values.push(input.pais);
      }

      if (fields.length === 0) {
        this.logWarning("No hay campos para actualizar", { id });
        return existing;
      }

      values.push(id);

      const result = await client.queryObject<EmpresaOrigen>(
        `UPDATE empresa_origen
         SET ${fields.join(", ")}
         WHERE empresa_origen_id = $${paramIndex}
         RETURNING empresa_origen_id, nombre_empresa, pais`,
        values,
      );

      if (!result.rows || result.rows.length === 0) {
        this.logWarning("No se pudo actualizar empresa origen", { id });
        return undefined;
      }

      this.logSuccess("Empresa origen actualizada exitosamente", { id });

      return result.rows[0];
    } catch (error) {
      this.logError("Error al actualizar empresa origen", error);
      throw error;
    }
  }

  // ======================
  // DELETE
  // ======================
  async delete({ id }: { id: string }): Promise<boolean> {
    if (!id) {
      throw new Error("ID es requerido para eliminar empresa origen");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando eliminación de empresa origen", { id });

      // Verificar que la empresa existe
      const existing = await this.getById({ id });
      if (!existing) {
        this.logWarning("Empresa origen no encontrada para eliminar", { id });
        return false;
      }

      // Verificar si tiene planes asociados
      const plansResult = await client.queryObject<{ count: number }>(
        `SELECT COUNT(*) as count FROM plan WHERE empresa_origen_id = $1`,
        [id],
      );

      const plansCount = plansResult.rows[0]?.count || 0;

      if (plansCount > 0) {
        throw new Error(
          `No se puede eliminar la empresa origen porque tiene ${plansCount} plan(es) asociado(s)`,
        );
      }

      // Verificar si tiene promociones asociadas
      const promosResult = await client.queryObject<{ count: number }>(
        `SELECT COUNT(*) as count FROM promocion WHERE empresa_origen_id = $1`,
        [id],
      );

      const promosCount = promosResult.rows[0]?.count || 0;

      if (promosCount > 0) {
        throw new Error(
          `No se puede eliminar la empresa origen porque tiene ${promosCount} promoción(es) asociada(s)`,
        );
      }

      // Eliminar la empresa origen
      const result = await client.queryObject(
        `DELETE FROM empresa_origen
         WHERE empresa_origen_id = $1
         RETURNING empresa_origen_id`,
        [id],
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("No se pudo eliminar la empresa origen");
      }

      this.logSuccess("Empresa origen eliminada exitosamente", { id });
      return true;
    } catch (error) {
      this.logError("Error al eliminar empresa origen", error);
      throw error;
    }
  }

  // ======================
  // COUNT
  // ======================
  async count(): Promise<number> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<{ count: number }>(
        `SELECT COUNT(*) as count FROM empresa_origen`,
      );

      return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
    } catch (error) {
      this.logError("Error al contar empresas origen", error);
      throw error;
    }
  }

  // ======================
  // SEARCH
  // ======================
  async search({
    query,
    page = 1,
    limit = 10,
  }: {
    query: string;
    page?: number;
    limit?: number;
  }): Promise<EmpresaOrigen[]> {
    if (!query) {
      throw new Error("Query de búsqueda es requerido");
    }

    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const offset = (page - 1) * limit;

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<EmpresaOrigen>(
        `SELECT
          empresa_origen_id,
          nombre_empresa,
          pais
         FROM empresa_origen
         WHERE nombre_empresa ILIKE $1 OR pais ILIKE $1
         ORDER BY nombre_empresa ASC
         LIMIT $2 OFFSET $3`,
        [`%${query}%`, limit, offset],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al buscar empresas origen", error);
      throw error;
    }
  }

  // ======================
  // GET WITH STATS
  // ======================
  async getWithStats({ id }: { id: string }): Promise<
    | (EmpresaOrigen & { planes_count: number; promociones_count: number })
    | undefined
  > {
    if (!id) {
      throw new Error("ID es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<
        EmpresaOrigen & { planes_count: number; promociones_count: number }
      >(
        `SELECT
          eo.empresa_origen_id,
          eo.nombre_empresa,
          eo.pais,
          COALESCE(COUNT(DISTINCT p.plan_id), 0) as planes_count,
          COALESCE(COUNT(DISTINCT pr.promocion_id), 0) as promociones_count
         FROM empresa_origen eo
         LEFT JOIN plan p ON p.empresa_origen_id = eo.empresa_origen_id
         LEFT JOIN promocion pr ON pr.empresa_origen_id = eo.empresa_origen_id
         WHERE eo.empresa_origen_id = $1
         GROUP BY eo.empresa_origen_id, eo.nombre_empresa, eo.pais`,
        [id],
      );

      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      this.logError("Error al obtener empresa origen con estadísticas", error);
      throw error;
    }
  }

  // ======================
  // GET ALL WITH STATS
  // ======================
  async getAllWithStats({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  } = {}): Promise<
    Array<EmpresaOrigen & { planes_count: number; promociones_count: number }>
  > {
    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const offset = (page - 1) * limit;

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<
        EmpresaOrigen & { planes_count: number; promociones_count: number }
      >(
        `SELECT
          eo.empresa_origen_id,
          eo.nombre_empresa,
          eo.pais,
          COALESCE(COUNT(DISTINCT p.plan_id), 0) as planes_count,
          COALESCE(COUNT(DISTINCT pr.promocion_id), 0) as promociones_count
         FROM empresa_origen eo
         LEFT JOIN plan p ON p.empresa_origen_id = eo.empresa_origen_id
         LEFT JOIN promocion pr ON pr.empresa_origen_id = eo.empresa_origen_id
         GROUP BY eo.empresa_origen_id, eo.nombre_empresa, eo.pais
         ORDER BY eo.nombre_empresa ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener empresas origen con estadísticas", error);
      throw error;
    }
  }
}
