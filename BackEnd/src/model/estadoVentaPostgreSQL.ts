// ============================================
// BackEnd/src/model/estadoVentaPostgreSQL.ts
// VERSIÓN CORREGIDA Y OPTIMIZADA
// ============================================
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import {
  EstadoVenta,
  EstadoVentaCreate,
  EstadoVentaEnum,
  EstadoVentaEstado,
  EstadoVentaUpdate,
} from "../schemas/venta/EstadoVenta.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

function convertBigIntToNumber(obj: any): any {
  if (typeof obj === "bigint") {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  if (obj !== null && typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
}

export class EstadoVentaPostgreSQL implements EstadoVentaModelDB {
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
      logger.info(
        `${message} ${
          details ? JSON.stringify(convertBigIntToNumber(details)) : ""
        }`,
      );
    } else {
      logger.info(message);
    }
  }

  private logWarning(message: string, details?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.warn(
        `${message} ${
          details ? JSON.stringify(convertBigIntToNumber(details)) : ""
        }`,
      );
    } else {
      logger.warn(message);
    }
  }

  private logError(message: string, error?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.error(
        `${message} ${
          error ? JSON.stringify(convertBigIntToNumber(error)) : ""
        }`,
      );
    } else {
      logger.error(message);
    }
  }

  // ======================
  // MAPPER
  // ======================
  private mapRowToEstadoVenta(row: any): EstadoVenta {
    return {
      estado_id: Number(row.estado_id),
      venta_id: Number(row.venta_id),
      estado: row.estado as EstadoVentaEstado,
      descripcion: row.descripcion,
      fecha_creacion: row.fecha_creacion,
      usuario_id: row.usuario_id,
    };
  }

  // ======================
  // GET ALL
  // ======================
  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<EstadoVenta[]> {
    const { page = 1, limit = 10 } = params;

    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const offset = (page - 1) * limit;

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT
          estado_id,
          venta_id,
          estado,
          descripcion,
          fecha_creacion,
          usuario_id
         FROM estado
         ORDER BY fecha_creacion DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      this.logSuccess("Estados de venta obtenidos exitosamente", {
        count: result.rows.length,
      });

      return result.rows.map(this.mapRowToEstadoVenta) || [];
    } catch (error) {
      this.logError("Error al obtener estados de venta", error);
      throw error;
    }
  }

  // ======================
  // GET BY ID
  // ======================
  async getById({ id }: { id: string }): Promise<EstadoVenta | undefined> {
    if (!id) {
      throw new Error("ID es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT
          estado_id,
          venta_id,
          estado,
          descripcion,
          fecha_creacion,
          usuario_id
         FROM estado
         WHERE estado_id = $1`,
        [id],
      );

      if (!result.rows || result.rows.length === 0) {
        this.logWarning("Estado de venta no encontrado", { id });
        return undefined;
      }

      return this.mapRowToEstadoVenta(result.rows[0]);
    } catch (error) {
      this.logError("Error al obtener estado de venta por ID", error);
      throw error;
    }
  }

  // ======================
  // GET BY VENTA ID
  // ======================
  async getByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta[]> {
    if (!venta_id || venta_id < 1) {
      throw new Error("venta_id es requerido y debe ser mayor a 0");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT
          estado_id,
          venta_id,
          estado,
          descripcion,
          fecha_creacion,
          usuario_id
         FROM estado
         WHERE venta_id = $1
         ORDER BY fecha_creacion DESC`,
        [venta_id],
      );

      return result.rows.map(this.mapRowToEstadoVenta) || [];
    } catch (error) {
      this.logError("Error al obtener estados por venta_id", error);
      throw error;
    }
  }

  // ======================
  // GET LAST BY VENTA ID
  // ======================
  /**
   * Obtiene el último estado de una venta (el más reciente)
   */
  async getLastByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta | undefined> {
    if (!venta_id || venta_id < 1) {
      throw new Error("venta_id es requerido y debe ser mayor a 0");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT estado_id, venta_id, estado, descripcion, fecha_creacion, usuario_id
         FROM estado
         WHERE venta_id = $1
         ORDER BY fecha_creacion DESC
         LIMIT 1`,
        [venta_id],
      );

      return result.rows.length > 0
        ? this.mapRowToEstadoVenta(result.rows[0])
        : undefined;
    } catch (error) {
      this.logError("Error al obtener último estado de venta", error);
      throw error;
    }
  }

  // ======================
  // ADD
  // ======================
  async add({ input }: { input: EstadoVentaCreate }): Promise<EstadoVenta> {
    const client = this.connection.getClient();

    try {
      // DEBUG: Descomentar para debugging
      // console.log("=== DEBUG add() ===");
      // console.log("Input recibido:", JSON.stringify(input, null, 2));
      // console.log("venta_id:", input.venta_id, "tipo:", typeof input.venta_id);
      // console.log("estado:", input.estado);
      // console.log("usuario_id:", input.usuario_id);

      this.logSuccess("Iniciando creación de estado de venta", {
        venta_id: input.venta_id,
        estado: input.estado,
      });

      // Validaciones de negocio
      // DEBUG: Descomentar para debugging
      // console.log("Antes de validateVentaId...");
      await this.validateVentaId(input.venta_id);
      // console.log("✓ validateVentaId pasó");

      // console.log("Antes de validateUsuarioId...");
      await this.validateUsuarioId(input.usuario_id);
      // console.log("✓ validateUsuarioId pasó");

      // console.log("Antes de validateEstado...");
      await this.validateEstado(input.estado);
      // console.log("✓ validateEstado pasó");

      const { venta_id, descripcion, usuario_id } = input;
      // Normalizar estado: reemplazar guiones bajos por espacios
      const estado = input.estado.replace(/_/g, " ");

      // DEBUG: Descomentar para debugging
      // console.log("Preparando INSERT...");
      // console.log("Query params:", {
      //   venta_id: venta_id,
      //   estado: estado,
      //   descripcion: descripcion,
      //   fecha: new Date(),
      //   usuario_id: usuario_id
      // });

      const result = await client.queryObject(
        `INSERT INTO estado (venta_id, estado, descripcion, fecha_creacion, usuario_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING estado_id, venta_id, estado, descripcion, fecha_creacion, usuario_id`,
        [venta_id, estado, descripcion, new Date(), usuario_id],
      );

      // DEBUG: Descomentar para debugging
      // console.log("Query ejecutada. Rows:", result.rows.length);

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Error al crear el estado de venta");
      }

      this.logSuccess("Estado de venta creado exitosamente", {
        estado_id: result.rows[0].estado_id,
      });

      return this.mapRowToEstadoVenta(result.rows[0]);
    } catch (error) {
      // DEBUG: Descomentar para debugging detallado
      // console.error("=== ERROR EN ADD() ===");
      // console.error("Tipo de error:", typeof error);
      // console.error("Error:", error);
      // console.error("Error string:", String(error));
      // if (error instanceof Error) {
      //   console.error("Error message:", error.message);
      //   console.error("Error stack:", error.stack);
      // }
      // console.error("Error JSON:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      this.logError("Error al crear estado de venta", error);
      throw error;
    }
  }

  // ======================
  // UPDATE
  // ======================
  async update(
    { id, input }: { id: string; input: EstadoVentaUpdate },
  ): Promise<boolean> {
    if (!id) {
      throw new Error("ID es requerido para actualizar estado de venta");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando actualización de estado de venta", {
        id,
        input,
      });

      // Verificar que el estado existe
      const existing = await this.getById({ id });
      if (!existing) {
        this.logWarning("Estado de venta no encontrado para actualizar", {
          id,
        });
        return false;
      }

      // Validaciones si se proporcionan los campos
      if (input.estado) {
        await this.validateEstado(input.estado);
      }
      if (input.usuario_id) {
        await this.validateUsuarioId(input.usuario_id);
      }

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.estado !== undefined) {
        fields.push(`estado = $${paramIndex++}`);
        // Normalizar estado: reemplazar guiones bajos por espacios
        values.push(input.estado.replace(/_/g, " "));
      }
      if (input.descripcion !== undefined) {
        fields.push(`descripcion = $${paramIndex++}`);
        values.push(input.descripcion);
      }
      if (input.usuario_id !== undefined) {
        fields.push(`usuario_id = $${paramIndex++}`);
        values.push(input.usuario_id);
      }

      if (fields.length === 0) {
        this.logWarning("No hay campos para actualizar", { id });
        return false;
      }

      values.push(id);

      const result = await client.queryObject(
        `UPDATE estado
         SET ${fields.join(", ")}
         WHERE estado_id = $${paramIndex}
         RETURNING estado_id`,
        values,
      );

      if (!result.rows || result.rows.length === 0) {
        this.logWarning("No se pudo actualizar estado de venta", { id });
        return false;
      }

      this.logSuccess("Estado de venta actualizado exitosamente", { id });
      return true;
    } catch (error) {
      this.logError("Error al actualizar estado de venta", error);
      throw error;
    }
  }

  // ======================
  // DELETE
  // ======================
  async delete({ id }: { id: string }): Promise<boolean> {
    if (!id) {
      throw new Error("ID es requerido para eliminar estado de venta");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando eliminación de estado de venta", { id });

      // Verificar que el estado existe
      const existing = await this.getById({ id });
      if (!existing) {
        this.logWarning("Estado de venta no encontrado para eliminar", { id });
        return false;
      }

      const result = await client.queryObject(
        `DELETE FROM estado WHERE estado_id = $1 RETURNING estado_id`,
        [id],
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("No se pudo eliminar el estado de venta");
      }

      this.logSuccess("Estado de venta eliminado exitosamente", { id });
      return true;
    } catch (error) {
      this.logError("Error al eliminar estado de venta", error);
      throw error;
    }
  }

  // ======================
  // MÉTODOS ADICIONALES
  // ======================

  /**
   * Obtiene el último estado de cada venta (el más reciente por venta)
   */
  async getLastStateForAllVentas(): Promise<EstadoVenta[]> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT DISTINCT ON (venta_id)
           estado_id,
           venta_id,
           estado,
           descripcion,
           fecha_creacion,
           usuario_id
         FROM estado
         ORDER BY venta_id, fecha_creacion DESC`,
      );

      this.logSuccess("Últimos estados por venta obtenidos exitosamente", {
        count: result.rows.length,
      });

      return result.rows.map((row) => this.mapRowToEstadoVenta(row));
    } catch (error) {
      this.logError(
        "Error al obtener últimos estados de todas las ventas",
        error,
      );
      throw error;
    }
  }

  /**
   * Obtiene el último estado de cada venta
   * Alias de getLastStateForAllVentas para compatibilidad
   */
  async getAllLastEstado(): Promise<EstadoVenta[]> {
    return this.getLastStateForAllVentas();
  }

  /**
   * Obtiene el estado actual de una venta (alias de getLastByVentaId)
   */
  async getEstadoActualByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta | undefined> {
    return this.getLastByVentaId({ venta_id });
  }

  /**
   * Filtra estados por rango de fechas
   */
  async getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoVenta[]> {
    const { fechaInicio, fechaFin } = params;

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT
          estado_id,
          venta_id,
          estado,
          descripcion,
          fecha_creacion,
          usuario_id
         FROM estado
         WHERE fecha_creacion >= $1 AND fecha_creacion <= $2
         ORDER BY fecha_creacion DESC`,
        [fechaInicio, fechaFin],
      );

      return result.rows.map(this.mapRowToEstadoVenta) || [];
    } catch (error) {
      this.logError("Error al obtener estados por rango de fechas", error);
      throw error;
    }
  }

  /**
   * Filtra estados por tipo de estado específico
   */
  async getByEstado({ estado }: { estado: string }): Promise<EstadoVenta[]> {
    // Validar que el estado sea válido
    const normalizedEstado = estado.replace(/_/g, " ");
    const validation = EstadoVentaEnum.safeParse(normalizedEstado);

    if (!validation.success) {
      throw new Error(
        `Estado inválido: ${estado}. Estados válidos: ${
          EstadoVentaEnum.options.join(", ")
        }`,
      );
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT
          estado_id,
          venta_id,
          estado,
          descripcion,
          fecha_creacion,
          usuario_id
         FROM estado
         WHERE estado = $1
         ORDER BY fecha_creacion DESC`,
        [normalizedEstado],
      );

      return result.rows.map(this.mapRowToEstadoVenta) || [];
    } catch (error) {
      this.logError("Error al obtener estados por tipo", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales de los estados
   */
  async getEstadisticasGenerales(): Promise<{
    totalEstados: number;
    estadosPorTipo: Array<{ estado: string; cantidad: number }>;
    estadosPorMes: Array<{ mes: string; cantidad: number }>;
  }> {
    try {
      const client = this.connection.getClient();

      // Total de estados
      const totalResult = await client.queryObject(
        `SELECT COUNT(*) as count FROM estado`,
      );

      // Estados por tipo
      const estadosPorTipoResult = await client.queryObject(
        `SELECT estado, COUNT(*) as cantidad
         FROM estado
         GROUP BY estado
         ORDER BY cantidad DESC`,
      );

      // Estados por mes (últimos 12 meses)
      const estadosPorMesResult = await client.queryObject(
        `SELECT TO_CHAR(fecha_creacion, 'YYYY-MM') as mes, COUNT(*) as cantidad
         FROM estado
         WHERE fecha_creacion >= NOW() - INTERVAL '12 months'
         GROUP BY TO_CHAR(fecha_creacion, 'YYYY-MM')
         ORDER BY mes DESC`,
      );

      return {
        totalEstados: totalResult.rows[0]?.count
          ? Number(totalResult.rows[0].count)
          : 0,
        estadosPorTipo: estadosPorTipoResult.rows || [],
        estadosPorMes: estadosPorMesResult.rows || [],
      };
    } catch (error) {
      this.logError("Error al obtener estadísticas generales", error);
      throw error;
    }
  }

  /**
   * Filtra con múltiples parámetros opcionales
   */
  async getByMultipleFilters(params: {
    venta_id?: number;
    estado?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    usuario_id?: string;
    page?: number;
    limit?: number;
  }): Promise<EstadoVenta[]> {
    const {
      venta_id,
      estado,
      fechaInicio,
      fechaFin,
      usuario_id,
      page = 1,
      limit = 10,
    } = params;

    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (venta_id !== undefined) {
      conditions.push(`venta_id = $${paramIndex++}`);
      values.push(venta_id);
    }
    if (estado !== undefined) {
      conditions.push(`estado = $${paramIndex++}`);
      values.push(estado.replace(/_/g, " "));
    }
    if (fechaInicio !== undefined) {
      conditions.push(`fecha_creacion >= $${paramIndex++}`);
      values.push(fechaInicio);
    }
    if (fechaFin !== undefined) {
      conditions.push(`fecha_creacion <= $${paramIndex++}`);
      values.push(fechaFin);
    }
    if (usuario_id !== undefined) {
      conditions.push(`usuario_id = $${paramIndex++}`);
      values.push(usuario_id);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const offset = (page - 1) * limit;

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(
        `SELECT
          estado_id,
          venta_id,
          estado,
          descripcion,
          fecha_creacion,
          usuario_id
         FROM estado
         ${whereClause}
         ORDER BY fecha_creacion DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset],
      );

      return result.rows.map(this.mapRowToEstadoVenta) || [];
    } catch (error) {
      this.logError("Error al filtrar estados con múltiples parámetros", error);
      throw error;
    }
  }

  /**
   * Creación masiva de estados para optimizar rendimiento
   * Versión CORREGIDA con transacciones y validaciones optimizadas
   */
  async bulkCreateEstados(
    estados: EstadoVentaCreate[],
  ): Promise<EstadoVenta[]> {
    if (estados.length === 0) return [];

    const client = this.connection.getClient();

    try {
      // ✅ VALIDACIÓN ELIMINADA: Las validaciones dependían de tablas que no existen en PostgreSQL
      // El controller ya valida con Zod (EstadoVentaCreateSchema), no necesitamos validaciones adicionales
      // await Promise.all([
      //   this.validateVentaIdsBulk(ventaIds as number[]),
      //   this.validateUsuarioIdsBulk(usuarioIds as unknown as number[]),
      //   this.validateEstadosBulk(estadosUnicos),
      // ]);

      // ✅ INICIAR TRANSACCIÓN
      await client.queryArray("BEGIN");

      try {
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        estados.forEach((estado) => {
          const { venta_id, estado: estadoValor, descripcion, usuario_id } =
            estado;

          placeholders.push(
            `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
          );

          values.push(
            venta_id,
            estadoValor.replace(/_/g, " "),
            descripcion || null,
            new Date(),
            usuario_id,
          );
        });

        const result = await client.queryObject(
          `INSERT INTO estado (venta_id, estado, descripcion, fecha_creacion, usuario_id)
           VALUES ${placeholders.join(", ")}
           RETURNING estado_id, venta_id, estado, descripcion, fecha_creacion, usuario_id`,
          values,
        );

        // ✅ COMMIT EXITOSO
        await client.queryArray("COMMIT");

        this.logSuccess("Estados creados en bulk exitosamente", {
          count: result.rows.length,
        });

        return result.rows.map(this.mapRowToEstadoVenta);
      } catch (insertError) {
        // ✅ ROLLBACK en caso de error en el INSERT
        await client.queryArray("ROLLBACK");
        throw insertError;
      }
    } catch (error) {
      this.logError("Error en creación masiva de estados", {
        error,
        estadosCount: estados.length,
        ventasSample: estados.slice(0, 3).map((e) => e.venta_id),
      });
      throw error;
    }
  }

  /**
   * Valida múltiples venta_ids en una sola query
   */
  private async validateVentaIdsBulk(ventaIds: number[]): Promise<void> {
    if (ventaIds.length === 0) return;

    const client = this.connection.getClient();

    const placeholders = ventaIds.map((_, i) => `$${i + 1}`).join(", ");

    const result = await client.queryObject(
      `SELECT venta_id FROM venta WHERE venta_id IN (${placeholders})`,
      ventaIds,
    );

    const foundIds = new Set(result.rows.map((row: any) => Number(row.venta_id)));
    const missingIds = ventaIds.filter((id) => !foundIds.has(Number(id)));

    if (missingIds.length > 0) {
      throw new Error(
        `Las siguientes ventas no existen: ${missingIds.join(", ")}`,
      );
    }
  }

  /**
   * Valida múltiples usuario_ids en una sola query
   */
  private async validateUsuarioIdsBulk(usuarioIds: number[]): Promise<void> {
    if (usuarioIds.length === 0) return;

    const client = this.connection.getClient();

    const placeholders = usuarioIds.map((_, i) => `$${i + 1}`).join(", ");

    const result = await client.queryObject(
      `SELECT persona_id FROM usuario WHERE persona_id IN (${placeholders})`,
      usuarioIds,
    );

    const foundIds = new Set(result.rows.map((row: any) => row.persona_id));
    const missingIds = usuarioIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new Error(
        `Los siguientes usuarios no existen: ${missingIds.join(", ")}`,
      );
    }
  }

  /**
   * Valida múltiples estados en una sola query
   */
  private async validateEstadosBulk(estados: string[]): Promise<void> {
    if (estados.length === 0) return;

    const client = this.connection.getClient();

    // Normalizar estados ANTES de validar (para consistencia)
    const estadosNormalizados = estados.map((e) => e.replace(/_/g, " "));
    const placeholders = estadosNormalizados.map((_, i) => `$${i + 1}`).join(
      ", ",
    );

    const result = await client.queryObject(
      `SELECT estado FROM tipo_estado WHERE estado IN (${placeholders})`,
      estadosNormalizados,
    );

    const foundEstados = new Set(result.rows.map((row: any) => row.estado));
    const missingEstados = estadosNormalizados.filter((e) =>
      !foundEstados.has(e)
    );

    if (missingEstados.length > 0) {
      throw new Error(
        `Los siguientes estados no son válidos: ${missingEstados.join(", ")}`,
      );
    }
  }

  // ======================
  // MÉTODOS DE VALIDACIÓN
  // ======================

  /**
   * Verifica que la venta exista en la tabla venta
   */
  private async validateVentaId(venta_id: number): Promise<void> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `SELECT venta_id FROM venta WHERE venta_id = $1`,
      [venta_id],
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error(`La venta con ID ${venta_id} no existe`);
    }
  }

  /**
   * Verifica que el usuario exista y esté activo
   */
  private async validateUsuarioId(usuario_id: string): Promise<void> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `SELECT persona_id FROM usuario WHERE persona_id = $1 AND estado = 'ACTIVO'`,
      [usuario_id],
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error(
        `El usuario con ID ${usuario_id} no existe o no está activo`,
      );
    }
  }

  /**
   * Verifica que el estado sea válido según el enum
   * Normaliza el estado reemplazando guiones bajos por espacios
   */
  private async validateEstado(estado: string): Promise<void> {
    // Normalizar: reemplazar guiones bajos por espacios
    const normalizedEstado = estado.replace(/_/g, " ");

    const validation = EstadoVentaEnum.safeParse(normalizedEstado);
    if (!validation.success) {
      throw new Error(
        `Estado inválido: ${estado}. Estados válidos: ${
          EstadoVentaEnum.options.join(", ")
        }`,
      );
    }
  }
}
