// ============================================
// BackEnd/src/model/estadoCorreoMySQL.ts
// ============================================
import { EstadoCorreoModelDB } from "../../interface/estadoCorreo.ts";
import {
  EstadoCorreo,
  EstadoCorreoCreate,
  EstadoCorreoUpdate,
} from "../../schemas/correo/EstadoCorreo.ts";
import { Client } from "mysql";
import { logger } from "../../Utils/logger.ts";

/**
 * Modelo de Estado de Correo para MySQL
 * Gestiona el tracking y seguimiento de correos
 */
export class EstadoCorreoMySQL implements EstadoCorreoModelDB {
  connection: Client;

  constructor(connection: Client) {
    this.connection = connection;
  }

  // ======================================================
  // OBTENER TODOS LOS ESTADOS CON PAGINACIÓN
  // ✅ Solo muestra el ÚLTIMO estado de cada correo (sin duplicados)
  // ======================================================
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<EstadoCorreo[] | undefined> {
    try {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      // Query con ROW_NUMBER() para obtener solo el último estado de cada SAP
      const query = `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM (
          SELECT ec.*,
                 ROW_NUMBER() OVER (
                     PARTITION BY sap_id
                     ORDER BY ultimo_evento_fecha DESC, estado_correo_id DESC
                 ) AS rn
          FROM estado_correo ec
        ) t
        WHERE rn = 1
        ORDER BY ultimo_evento_fecha DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams: (string | number)[] = [limit, offset];

      logger.debug(
        "getAll estados correo (último por SAP) - Query:",
        query,
      );

      const result = await this.connection.execute(query, queryParams);

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getAll:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER ESTADO POR ID
  // ======================================================
  async getById({ id }: { id: string }): Promise<EstadoCorreo | undefined> {
    try {
      logger.debug(`getById estado correo: ${id}`);
      const idConsulta = parseInt(id);

      const result = await this.connection.execute(
        `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM estado_correo
        WHERE estado_correo_id = ?
        ORDER BY ultimo_evento_fecha DESC
        LIMIT 1
        `,
        [idConsulta],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0] as EstadoCorreo;
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getById:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER ESTADO POR SAP
  // ======================================================
  async getBySAP(
    { sap }: { sap: string },
  ): Promise<EstadoCorreo[] | undefined> {
    try {
      logger.debug(`getBySAP estado correo: ${sap}`);

      const result = await this.connection.execute(
        `
        SELECT
          ec.estado_correo_id,
          ec.sap_id,
          ec.entregado_ok,
          ec.estado_guia,
          ec.ultimo_evento_fecha,
          ec.ubicacion_actual,
          ec.primera_visita,
          ec.fecha_primer_visita
        FROM estado_correo ec
        INNER JOIN correo c ON ec.sap_id = c.sap_id
        WHERE c.sap_id = ?
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
        [sap],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return (result.rows ?? []) as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getBySAP:", error);
      throw error;
    }
  }

  async getLastBySAP(
    { sap }: { sap: string },
  ): Promise<EstadoCorreo | undefined> {
    try {
      logger.debug("getLastBySAP");

      const result = await this.connection.execute(
        `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM estado_correo
        WHERE sap_id = ?
        ORDER BY ultimo_evento_fecha DESC
        LIMIT 1
        `,
        [sap],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0] as EstadoCorreo;
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getLastBySAP:", error);
      throw error;
    }
  }

  async getEntregados(): Promise<EstadoCorreo[]> {
    try {
      logger.debug("getEntregados");

      const result = await this.connection.execute(
        `
        SELECT *
        FROM (
          SELECT
            ec.*,
            ROW_NUMBER() OVER(
              PARTITION BY sap_id
              ORDER BY ultimo_evento_fecha DESC, estado_correo_id DESC
            ) AS rn
          FROM estado_correo ec
        ) t
        WHERE rn = 1
        AND entregado_ok = 1
        AND estado_guia NOT IN ('DEVUELTO', 'CANCELADO')
        ORDER BY ultimo_evento_fecha DESC;
        `,
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      logger.debug(result.rows);

      return result.rows as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getEntregados:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREOS NO ENTREGADOS
  // ======================================================
  async getNoEntregados(): Promise<EstadoCorreo[]> {
    try {
      logger.debug("getNoEntregados");

      const result = await this.connection.execute(
        `
        SELECT ec.*
        FROM estado_correo ec
        INNER JOIN (
          SELECT sap_id,
                 MAX(estado_correo_id) AS ultimo_id,
                 MAX(ultimo_evento_fecha) AS ultima_fecha
          FROM estado_correo
          GROUP BY sap_id
        ) ult
          ON ec.sap_id = ult.sap_id
          AND ec.estado_correo_id = ult.ultimo_id
          AND ec.ultimo_evento_fecha = ult.ultima_fecha
        WHERE ec.entregado_ok = 0
        AND ec.estado_guia NOT IN ('DEVUELTO', 'CANCELADO')
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getNoEntregados:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREOS DEVUELTOS
  // ======================================================
  async getDevueltos(): Promise<EstadoCorreo[]> {
    try {
      logger.debug("getDevueltos");

      const result = await this.connection.execute(
        `
        SELECT ec.*
        FROM estado_correo ec
        INNER JOIN (
          SELECT
            sap_id,
            MAX(estado_correo_id) AS ultimo_id,
            MAX(ultimo_evento_fecha) AS ultima_fecha
          FROM estado_correo
          GROUP BY sap_id
        ) ult
          ON ec.sap_id = ult.sap_id
          AND ec.estado_correo_id = ult.ultimo_id
          AND ec.ultimo_evento_fecha = ult.ultima_fecha
        WHERE
          ec.estado_guia = 'DEVUELTO'
          OR ec.ubicacion_actual LIKE '%DEVUEL%'
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getDevueltos:", error);
      throw error;
    }
  }

  // ======================================================
  // CREAR NUEVO ESTADO
  // ======================================================
  async add(params: { input: EstadoCorreoCreate }): Promise<EstadoCorreo> {
    try {
      const { input } = params;

      logger.info(`Creando estado correo para SAP: ${input.sap_id}`);

      // Insertar estado
      const result = await this.connection.execute(
        `
        INSERT INTO estado_correo (
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          input.sap_id,
          input.entregado_ok || 0,
          input.estado_guia || "INICIAL",
          input.ultimo_evento_fecha,
          input.ubicacion_actual || "PENDIENTE",
          input.primera_visita || null,
          input.fecha_primer_visita || null,
        ],
      );

      const insertId = result.lastInsertId;
      if (!insertId) {
        throw new Error("No se pudo obtener el ID del estado creado");
      }
      const id_estado = insertId.toString();

      logger.info(`Estado correo creado exitosamente: ${insertId}`);

      // Obtener el estado creado

      const estado = await this.getById({ id: id_estado });
      if (!estado) {
        throw new Error(`Estado correo no encontrado para SAP ID: ${input.sap_id}`);
      }

      if (!estado) {
        throw new Error("Error al recuperar el estado creado");
      }

      return estado;
    } catch (error) {
      logger.error("EstadoCorreoMySQL.add:", error);
      throw error;
    }
  }

  // ======================================================
  // ACTUALIZAR ESTADO
  // ======================================================
  async update(params: {
    id: string;
    input: Partial<EstadoCorreoUpdate>;
  }): Promise<EstadoCorreo | undefined> {
    try {
      const { id, input } = params;

      logger.info(`Actualizando estado correo: ${id}`);

      // Construir query dinámica
      const fields: string[] = [];
      const values: (string | number | Date | null)[] = [];

      if (input.entregado_ok !== undefined) {
        fields.push("entregado_ok = ?");
        values.push(input.entregado_ok);
      }

      if (input.estado_guia !== undefined) {
        fields.push("estado_guia = ?");
        values.push(input.estado_guia);
      }

      if (input.ultimo_evento_fecha !== undefined) {
        fields.push("ultimo_evento_fecha = ?");
        values.push(input.ultimo_evento_fecha);
      }

      if (input.ubicacion_actual !== undefined) {
        fields.push("ubicacion_actual = ?");
        values.push(input.ubicacion_actual);
      }

      if (input.primera_visita !== undefined) {
        fields.push("primera_visita = ?");
        values.push(input.primera_visita);
      }

      if (input.fecha_primer_visita !== undefined) {
        fields.push("fecha_primer_visita = ?");
        values.push(input.fecha_primer_visita);
      }

      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      // Agregar ID al final
      values.push(id);

      // Ejecutar actualización
      const result = await this.connection.execute(
        `UPDATE estado_correo SET ${
          fields.join(", ")
        } WHERE estado_correo_id = ?`,
        values,
      );

      logger.info(
        `Estado correo actualizado - Affected rows: ${
          result.affectedRows || 0
        }`,
      );

      // Retornar estado actualizado
      return await this.getById({ id });
    } catch (error) {
      logger.error("EstadoCorreoMySQL.update:", error);
      throw error;
    }
  }

  // ======================================================
  // ELIMINAR ESTADO
  // ======================================================
  async delete(params: { id: string }): Promise<boolean> {
    try {
      const { id } = params;

      logger.info(`Eliminando estado correo: ${id}`);

      // Verificar que existe
      const estado = await this.getById({ id });
      if (!estado) {
        logger.warn(`Estado correo ${id} no encontrado`);
        return false;
      }

      // Eliminar estado
      const result = await this.connection.execute(
        `DELETE FROM estado_correo WHERE estado_correo_id = ?`,
        [id],
      );

      const success = result.affectedRows !== undefined &&
        result.affectedRows > 0;

      if (success) {
        logger.info(`Estado correo eliminado exitosamente: ${id}`);
      }

      return success;
    } catch (error) {
      logger.error("EstadoCorreoMySQL.delete:", error);
      throw error;
    }
  }

  // ======================================================
  // MÉTODOS ADICIONALES
  // ======================================================

  /**
   * Obtiene estados por rango de fechas
   */
  async getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoCorreo[]> {
    try {
      logger.debug(
        `getByFechaRango: ${params.fechaInicio} - ${params.fechaFin}`,
      );

      const result = await this.connection.execute(
        `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM estado_correo
        WHERE ultimo_evento_fecha BETWEEN ? AND ?
        ORDER BY ultimo_evento_fecha DESC
        `,
        [params.fechaInicio, params.fechaFin],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getByFechaRango:", error);
      throw error;
    }
  }

  /**
   * Obtiene estados por ubicación
   */
  async getByUbicacion(
    { ubicacion }: { ubicacion: string },
  ): Promise<EstadoCorreo[]> {
    try {
      logger.debug(`getByUbicacion: ${ubicacion}`);

      const result = await this.connection.execute(
        `
        SELECT ec.*
        FROM estado_correo ec
        INNER JOIN (
          SELECT
            sap_id,
            MAX(estado_correo_id) AS ultimo_id,
            MAX(ultimo_evento_fecha) AS ultima_fecha
          FROM estado_correo
          GROUP BY sap_id
        ) ult
          ON ec.sap_id = ult.sap_id
          AND ec.estado_correo_id = ult.ultimo_id
          AND ec.ultimo_evento_fecha = ult.ultima_fecha
        WHERE ec.ubicacion_actual LIKE ?
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
        [`%${ubicacion}%`],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as EstadoCorreo[];
    } catch (error) {
      logger.error("EstadoCorreoMySQL.getByUbicacion:", error);
      throw error;
    }
  }

  /**
   * Marca un correo como entregado
   */
  async marcarComoEntregado(
    { id }: { id: string },
  ): Promise<EstadoCorreo | undefined> {
    try {
      logger.info(`Marcando como entregado: ${id}`);

      return await this.update({
        id,
        input: {
          entregado_ok: 1,
          estado_guia: "ENTREGADO",
          ultimo_evento_fecha: new Date(),
        },
      });
    } catch (error) {
      logger.error("EstadoCorreoMySQL.marcarComoEntregado:", error);
      throw error;
    }
  }

  /**
   * Actualiza ubicación actual
   */
  async actualizarUbicacion(params: {
    id: string;
    ubicacion: string;
  }): Promise<EstadoCorreo | undefined> {
    try {
      logger.info(
        `Actualizando ubicación: ${params.id} -> ${params.ubicacion}`,
      );

      return await this.update({
        id: params.id,
        input: {
          ubicacion_actual: params.ubicacion,
          ultimo_evento_fecha: new Date(),
        },
      });
    } catch (error) {
      logger.error("EstadoCorreoMySQL.actualizarUbicacion:", error);
      throw error;
    }
  }
}
