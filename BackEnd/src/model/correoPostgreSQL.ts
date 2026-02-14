// ============================================
// BackEnd/src/model/correoPostgreSQL.ts
// VERSIÓN MEJORADA con queryObject
// ============================================
import { CorreoModelDB } from "../interface/correo.ts";
import {
  Correo,
  CorreoCreate,
  CorreoUpdate,
} from "../schemas/correo/Correo.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

/**
 * Modelo de Correo para PostgreSQL con manejo resiliente
 * Gestiona todas las operaciones CRUD para correos/envíos
 */
export class CorreoPostgreSQL implements CorreoModelDB {
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
  // QUERY BASE
  // ======================
  private readonly baseSelect = `
    SELECT
      sap_id,
      telefono_contacto,
      telefono_alternativo,
      destinatario,
      persona_autorizada,
      direccion,
      numero_casa,
      entre_calles,
      barrio,
      localidad,
      departamento,
      codigo_postal,
      fecha_creacion,
      fecha_limite,
      piso,
      departamento_numero,
      geolocalizacion,
      comentario_cartero
    FROM correo
  `;

  // ======================================================
  // OBTENER TODOS LOS CORREOS CON PAGINACIÓN
  // ======================================================
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Correo[] | undefined> {
    const { page = 1, limit = 10 } = params;

    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const offset = (page - 1) * limit;

    try {
      let query = this.baseSelect + " WHERE 1=1";
      const queryParams: (string | number)[] = [];

      // Filtro por nombre de destinatario
      if (params.name) {
        query += ` AND destinatario ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${params.name}%`);
      }

      // Ordenar por fecha de creación descendente
      query += ` ORDER BY fecha_creacion DESC`;

      // Paginación
      query += ` LIMIT $${queryParams.length + 1} OFFSET $${
        queryParams.length + 2
      }`;
      queryParams.push(limit, offset);

      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(query, queryParams);

      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }

      this.logSuccess("Correos obtenidos exitosamente", {
        count: result.rows.length,
      });

      return result.rows;
    } catch (error) {
      this.logError("Error al obtener correos", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREO POR ID (SAP)
  // ======================================================
  async getById({ id }: { id: string }): Promise<Correo | undefined> {
    if (!id) {
      throw new Error("ID (SAP) es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect + " WHERE sap_id = $1",
        [id],
      );

      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      this.logError("Error al obtener correo por ID", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREO POR SAP
  // ======================================================
  async getBySAP({ sap }: { sap: string }): Promise<Correo | undefined> {
    if (!sap) {
      throw new Error("SAP es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect + " WHERE sap_id = $1",
        [sap],
      );

      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      this.logError("Error al obtener correo por SAP", error);
      throw error;
    }
  }

  // ======================================================
  // CREAR NUEVO CORREO
  // ======================================================
  async add(params: { input: CorreoCreate }): Promise<Correo> {
    const { input } = params;
    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando creación de correo", {
        sap_id: input.sap_id,
      });

      await client.queryObject("BEGIN");

      try {
        const fecha_limite = new Date();
        fecha_limite.setDate(fecha_limite.getDate() + 7);

        // Insertar correo
        await client.queryObject(
          `INSERT INTO correo (
            sap_id,
            telefono_contacto,
            telefono_alternativo,
            destinatario,
            persona_autorizada,
            direccion,
            numero_casa,
            entre_calles,
            barrio,
            localidad,
            departamento,
            codigo_postal,
            fecha_creacion,
            fecha_limite,
            piso,
            departamento_numero,
            geolocalizacion,
            comentario_cartero
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [
            input.sap_id,
            input.telefono_contacto,
            input.telefono_alternativo || null,
            input.destinatario,
            input.persona_autorizada || null,
            input.direccion,
            input.numero_casa,
            input.entre_calles || null,
            input.barrio || null,
            input.localidad,
            input.departamento,
            input.codigo_postal,
            new Date(),
            fecha_limite,
            input.piso || null,
            input.departamento_numero || null,
            input.geolocalizacion || null,
            input.comentario_cartero || null,
          ],
        );

        this.logSuccess("Correo creado exitosamente", { sap_id: input.sap_id });

        // Insertar estado inicial
        await client.queryObject(
          `INSERT INTO estado_correo (
            sap_id,
            estado,
            descripcion,
            fecha_creacion,
            usuario_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            input.sap_id,
            "INICIAL",
            "Correo creado - pendiente de procesamiento",
            new Date(),
            input.usuario_id || null, // Asumiendo que viene en el input
          ],
        );

        this.logSuccess("Estado inicial creado exitosamente", {
          sap_id: input.sap_id,
        });

        await client.queryObject("COMMIT");

        const correo = await this.getById({ id: input.sap_id });

        if (!correo) {
          throw new Error("Error al recuperar el correo creado");
        }

        this.logSuccess("Correo y estado creados correctamente", {
          sap_id: input.sap_id,
        });

        return correo;
      } catch (error) {
        await client.queryObject("ROLLBACK");
        this.logError(
          "Error durante transacción de creación, haciendo rollback",
          error,
        );
        throw error;
      }
    } catch (error) {
      this.logError("Error al crear correo", error);
      throw error;
    }
  }

  // ======================================================
  // ACTUALIZAR CORREO
  // ======================================================
  async update(params: {
    id: string;
    input: Partial<CorreoUpdate>;
  }): Promise<Correo | undefined> {
    const { id, input } = params;

    if (!id) {
      throw new Error("ID es requerido para actualizar correo");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando actualización de correo", { id, input });

      // Verificar que el correo existe
      const existingCorreo = await this.getById({ id });
      if (!existingCorreo) {
        this.logWarning("Correo no encontrado para actualizar", { id });
        return undefined;
      }

      // Construir query dinámica
      const fields: string[] = [];
      const values: (string | number | Date | null)[] = [];
      let paramIndex = 1;

      if (input.telefono_contacto !== undefined) {
        fields.push(`telefono_contacto = $${paramIndex++}`);
        values.push(input.telefono_contacto);
      }

      if (input.telefono_alternativo !== undefined) {
        fields.push(`telefono_alternativo = $${paramIndex++}`);
        values.push(input.telefono_alternativo);
      }

      if (input.destinatario !== undefined) {
        fields.push(`destinatario = $${paramIndex++}`);
        values.push(input.destinatario);
      }

      if (input.persona_autorizada !== undefined) {
        fields.push(`persona_autorizada = $${paramIndex++}`);
        values.push(input.persona_autorizada);
      }

      if (input.direccion !== undefined) {
        fields.push(`direccion = $${paramIndex++}`);
        values.push(input.direccion);
      }

      if (input.numero_casa !== undefined) {
        fields.push(`numero_casa = $${paramIndex++}`);
        values.push(input.numero_casa);
      }

      if (input.entre_calles !== undefined) {
        fields.push(`entre_calles = $${paramIndex++}`);
        values.push(input.entre_calles);
      }

      if (input.barrio !== undefined) {
        fields.push(`barrio = $${paramIndex++}`);
        values.push(input.barrio);
      }

      if (input.localidad !== undefined) {
        fields.push(`localidad = $${paramIndex++}`);
        values.push(input.localidad);
      }

      if (input.departamento !== undefined) {
        fields.push(`departamento = $${paramIndex++}`);
        values.push(input.departamento);
      }

      if (input.codigo_postal !== undefined) {
        fields.push(`codigo_postal = $${paramIndex++}`);
        values.push(input.codigo_postal);
      }

      if (input.fecha_limite !== undefined) {
        fields.push(`fecha_limite = $${paramIndex++}`);
        values.push(input.fecha_limite);
      }

      if (input.piso !== undefined) {
        fields.push(`piso = $${paramIndex++}`);
        values.push(input.piso);
      }

      if (input.departamento_numero !== undefined) {
        fields.push(`departamento_numero = $${paramIndex++}`);
        values.push(input.departamento_numero);
      }

      if (input.geolocalizacion !== undefined) {
        fields.push(`geolocalizacion = $${paramIndex++}`);
        values.push(input.geolocalizacion);
      }

      if (input.comentario_cartero !== undefined) {
        fields.push(`comentario_cartero = $${paramIndex++}`);
        values.push(input.comentario_cartero);
      }

      if (fields.length === 0) {
        this.logWarning("No hay campos para actualizar", { id });
        return existingCorreo;
      }

      // Agregar ID al final
      values.push(id);

      // Ejecutar actualización
      await client.queryObject(
        `UPDATE correo SET ${fields.join(", ")} WHERE sap_id = $${paramIndex}`,
        values,
      );

      this.logSuccess("Correo actualizado exitosamente", { id });

      // Retornar correo actualizado
      return await this.getById({ id });
    } catch (error) {
      this.logError("Error al actualizar correo", error);
      throw error;
    }
  }

  // ======================================================
  // ELIMINAR CORREO
  // ======================================================
  async delete(params: { id: string }): Promise<boolean> {
    const { id } = params;

    if (!id) {
      throw new Error("ID es requerido para eliminar correo");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando eliminación de correo", { id });

      // Verificar que existe
      const correo = await this.getById({ id });
      if (!correo) {
        this.logWarning("Correo no encontrado para eliminar", { id });
        return false;
      }

      // Usar transacción para eliminar
      await client.queryObject("BEGIN");

      try {
        // 1. Eliminar estados del correo
        await client.queryObject(
          `DELETE FROM estado_correo WHERE sap_id = $1`,
          [id],
        );

        this.logSuccess("Estados del correo eliminados", { id });

        // 2. Eliminar el correo
        const correoResult = await client.queryObject(
          `DELETE FROM correo WHERE sap_id = $1 RETURNING sap_id`,
          [id],
        );

        if (correoResult.rows.length === 0) {
          throw new Error("No se pudo eliminar el correo");
        }

        await client.queryObject("COMMIT");

        this.logSuccess("Correo eliminado exitosamente", { id });
        return true;
      } catch (error) {
        await client.queryObject("ROLLBACK");
        this.logError(
          "Error durante transacción de eliminación, haciendo rollback",
          error,
        );
        throw error;
      }
    } catch (error) {
      this.logError("Error al eliminar correo", error);
      throw error;
    }
  }

  // ======================================================
  // MÉTODOS ADICIONALES ÚTILES
  // ======================================================

  /**
   * Obtiene correos por localidad
   */
  async getByLocalidad(
    { localidad }: { localidad: string },
  ): Promise<Correo[]> {
    if (!localidad) {
      throw new Error("Localidad es requerida");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect +
          ` WHERE localidad ILIKE $1 ORDER BY fecha_creacion DESC`,
        [`%${localidad}%`],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener correos por localidad", error);
      throw error;
    }
  }

  /**
   * Obtiene correos por departamento
   */
  async getByDepartamento(
    { departamento }: { departamento: string },
  ): Promise<Correo[]> {
    if (!departamento) {
      throw new Error("Departamento es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect +
          ` WHERE departamento ILIKE $1 ORDER BY fecha_creacion DESC`,
        [`%${departamento}%`],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener correos por departamento", error);
      throw error;
    }
  }

  /**
   * Obtiene correos próximos a vencer (fecha límite cercana)
   */
  async getProximosAVencer({ dias = 3 }: { dias?: number }): Promise<Correo[]> {
    if (dias < 1) {
      throw new Error("Días debe ser mayor a 0");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect +
          ` WHERE fecha_limite BETWEEN CURRENT_DATE AND CURRENT_DATE + $1 * INTERVAL '1 day'
           ORDER BY fecha_limite ASC`,
        [dias],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener correos próximos a vencer", error);
      throw error;
    }
  }

  /**
   * Obtiene correos vencidos
   */
  async getVencidos(): Promise<Correo[]> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect +
          ` WHERE fecha_limite < CURRENT_DATE ORDER BY fecha_limite ASC`,
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener correos vencidos", error);
      throw error;
    }
  }

  /**
   * Obtiene correos por código postal
   */
  async getByCodigoPostal(
    { codigoPostal }: { codigoPostal: number },
  ): Promise<Correo[]> {
    if (!codigoPostal) {
      throw new Error("Código postal es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<Correo>(
        this.baseSelect +
          ` WHERE codigo_postal = $1 ORDER BY fecha_creacion DESC`,
        [codigoPostal],
      );

      return result.rows || [];
    } catch (error) {
      this.logError("Error al obtener correos por código postal", error);
      throw error;
    }
  }

  /**
   * Cuenta total de correos
   */
  async count(): Promise<number> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<{ count: number }>(
        `SELECT COUNT(*) as count FROM correo`,
      );

      return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
    } catch (error) {
      this.logError("Error al contar correos", error);
      throw error;
    }
  }

  /**
   * Cuenta correos por estado (requiere join con estado_correo)
   */
  async countByEstado({ estado }: { estado: string }): Promise<number> {
    if (!estado) {
      throw new Error("Estado es requerido");
    }

    try {
      const client = this.connection.getClient();
      const result = await client.queryObject<{ count: number }>(
        `SELECT COUNT(DISTINCT c.sap_id) as count
         FROM correo c
         INNER JOIN estado_correo ec ON c.sap_id = ec.sap_id
         WHERE ec.estado = $1`,
        [estado],
      );

      return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
    } catch (error) {
      this.logError("Error al contar correos por estado", error);
      throw error;
    }
  }
}
