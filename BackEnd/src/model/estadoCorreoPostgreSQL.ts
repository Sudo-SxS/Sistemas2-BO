// ============================================
// BackEnd/src/model/estadoCorreoPostgreSQL.ts
// MODELO COMPLETO – siguiendo CorreoPostgreSQL
// ============================================

import {
  EstadoCorreo,
  EstadoCorreoCreate,
  EstadoCorreoUpdate,
} from "../schemas/correo/EstadoCorreo.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";

export class EstadoCorreoPostgreSQL implements EstadoCorreoModelDB {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  // ======================
  // LOGGING
  // ======================
  private logInfo(message: string, data?: unknown) {
    if (Deno.env.get("MODO") === "development") {
      logger.info(`${message} ${data ? JSON.stringify(data) : ""}`);
    } else {
      logger.info(message);
    }
  }

  private logWarn(message: string, data?: unknown) {
    if (Deno.env.get("MODO") === "development") {
      logger.warn(`${message} ${data ? JSON.stringify(data) : ""}`);
    } else {
      logger.warn(message);
    }
  }

  private logError(message: string, error?: unknown) {
    if (Deno.env.get("MODO") === "development") {
      logger.error(`${message} ${error ? JSON.stringify(error) : ""}`);
    } else {
      logger.error(message);
    }
  }

  // ======================
  // BASE SELECT
  // ======================
  private readonly baseSelect = `
    SELECT
      estado_correo_id,
      sap_id,
      estado,
      descripcion,
      fecha_creacion,
      usuario_id,
      ubicacion_actual
    FROM estado_correo
  `;

  // ======================================================
  // OBTENER TODOS LOS ESTADOS
  // ======================================================
  async getAll(): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect + " ORDER BY fecha_creacion DESC",
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADO POR ID
  // ======================================================
  async getById(
    { id }: { id: number },
  ): Promise<EstadoCorreo | undefined> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect + " WHERE estado_correo_id = $1",
      [id],
    );

    return result.rows.length > 0 ? result.rows[0] : undefined;
  }

  // ======================================================
  // OBTENER ESTADOS POR SAP
  // ======================================================
  async getBySAP(
    { sap }: { sap: string },
  ): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE sap_id = $1 ORDER BY fecha_creacion DESC",
      [sap.toUpperCase()],
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ÚLTIMO ESTADO DE UN CORREO
  // ======================================================
  async getLastBySAP(
    { sap }: { sap: string },
  ): Promise<EstadoCorreo | undefined> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE sap_id = $1 ORDER BY fecha_creacion DESC LIMIT 1",
      [sap.toUpperCase()],
    );

    return result.rows.length > 0 ? result.rows[0] : undefined;
  }

  // ======================================================
  // OBTENER ESTADOS ENTREGADOS (estado = 'ENTREGADO')
  // ======================================================
  async getEntregados(): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(estado) = 'ENTREGADO' ORDER BY fecha_creacion DESC",
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS NO ENTREGADOS (estado = 'NO ENTREGADO')
  // ======================================================
  async getNoEntregados(): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(estado) = 'NO ENTREGADO' ORDER BY fecha_creacion DESC",
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS DEVUELTOS (estado = 'DEVUELTO AL CLIENTE')
  // ======================================================
  async getDevueltos(): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(estado) = 'DEVUELTO AL CLIENTE' ORDER BY fecha_creacion DESC",
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS EN TRANSITO (estado = 'EN TRANSITO')
  // ======================================================
  async getEnTransito(): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(estado) = 'EN TRANSITO' ORDER BY fecha_creacion DESC",
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS ASIGNADOS (estado = 'ASIGNADO')
  // ======================================================
  async getAsignados(): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(estado) = 'ASIGNADO' ORDER BY fecha_creacion DESC",
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS POR ESTADO ESPECÍFICO
  // ======================================================
  async getByEstado(
    { estado }: { estado: string },
  ): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(estado) = $1 ORDER BY fecha_creacion DESC",
      [estado.toUpperCase()],
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS POR RANGO DE FECHAS
  // ======================================================
  async getByFechaRango(
    { fechaInicio, fechaFin }: { fechaInicio: Date; fechaFin: Date },
  ): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE fecha_creacion BETWEEN $1 AND $2 ORDER BY fecha_creacion DESC",
      [fechaInicio, fechaFin],
    );

    return result.rows ?? [];
  }

  // ======================================================
  // OBTENER ESTADOS POR UBICACIÓN
  // ======================================================
  async getByUbicacion(
    { ubicacion }: { ubicacion: string },
  ): Promise<EstadoCorreo[]> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      this.baseSelect +
        " WHERE UPPER(ubicacion_actual) LIKE $1 ORDER BY fecha_creacion DESC",
      [`%${ubicacion.toUpperCase()}%`],
    );

    return result.rows ?? [];
  }

  // ======================================================
  // CREAR NUEVO ESTADO
  // ======================================================
  async add(
    { input }: { input: EstadoCorreoCreate },
  ): Promise<EstadoCorreo> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      `
      INSERT INTO estado_correo (
        sap_id,
        estado,
        descripcion,
        fecha_creacion,
        usuario_id,
        ubicacion_actual
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        input.sap_id.toUpperCase(),
        input.estado.toUpperCase(),
        input.descripcion ?? null,
        new Date(),
        input.usuario_id ?? null,
        input.ubicacion_actual ?? null,
      ],
    );

    this.logInfo("Estado de correo creado", result.rows[0]);

    return result.rows[0];
  }

  // ======================================================
  // ACTUALIZAR ESTADO / DESCRIPCIÓN / UBICACIÓN
  // ======================================================
  async update(
    { id, input }: { id: number; input: EstadoCorreoUpdate },
  ): Promise<EstadoCorreo | undefined> {
    const client = this.connection.getClient();

    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (input.estado !== undefined) {
      fields.push(`estado = $${index++}`);
      values.push(input.estado.toUpperCase());
    }

    if (input.descripcion !== undefined) {
      fields.push(`descripcion = $${index++}`);
      values.push(input.descripcion);
    }

    if (input.ubicacion_actual !== undefined) {
      fields.push(`ubicacion_actual = $${index++}`);
      values.push(input.ubicacion_actual);
    }

    if (fields.length === 0) {
      this.logWarn("Update de estado sin campos", { id });
      return undefined;
    }

    values.push(id);

    const result = await client.queryObject<EstadoCorreo>(
      `
      UPDATE estado_correo
      SET ${fields.join(", ")}
      WHERE estado_correo_id = $${index}
      RETURNING *
      `,
      values,
    );

    this.logInfo("Estado de correo actualizado", result.rows[0]);

    return result.rows.length > 0 ? result.rows[0] : undefined;
  }

  // ======================================================
  // ELIMINAR ESTADO
  // ======================================================
  async delete(
    { id }: { id: number },
  ): Promise<boolean> {
    const client = this.connection.getClient();

    const result = await client.queryObject<{ estado_correo_id: number }>(
      `
      DELETE FROM estado_correo
      WHERE estado_correo_id = $1
      RETURNING estado_correo_id
      `,
      [id],
    );

    const success = result.rows.length > 0;

    if (success) {
      this.logInfo("Estado correo eliminado", { id });
    } else {
      this.logWarn("Estado correo no encontrado para eliminar", { id });
    }

    return success;
  }

  // ======================================================
  // MARCAR COMO ENTREGADO (crea nuevo registro)
  // ======================================================
  async marcarComoEntregado(
    { id }: { id: number },
  ): Promise<EstadoCorreo | undefined> {
    const client = this.connection.getClient();

    // Obtener el estado actual para copiar sap_id y usuario_id
    const estadoActual = await this.getById({ id });

    if (!estadoActual) {
      this.logWarn("Estado no encontrado para marcar como entregado", { id });
      return undefined;
    }

    // Crear nuevo registro con estado ENTREGADO
    const result = await client.queryObject<EstadoCorreo>(
      `
      INSERT INTO estado_correo (
        sap_id,
        estado,
        descripcion,
        fecha_creacion,
        usuario_id,
        ubicacion_actual
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        estadoActual.sap_id,
        "ENTREGADO",
        "Correo marcado como entregado",
        new Date(),
        estadoActual.usuario_id,
        estadoActual.ubicacion_actual,
      ],
    );

    this.logInfo("Correo marcado como entregado", result.rows[0]);

    return result.rows[0];
  }

  // ======================================================
  // ACTUALIZAR UBICACIÓN
  // ======================================================
  async actualizarUbicacion(
    { id, ubicacion }: { id: number; ubicacion: string },
  ): Promise<EstadoCorreo | undefined> {
    const client = this.connection.getClient();

    const result = await client.queryObject<EstadoCorreo>(
      `
      UPDATE estado_correo
      SET ubicacion_actual = $1
      WHERE estado_correo_id = $2
      RETURNING *
      `,
      [ubicacion.toUpperCase(), id],
    );

    if (result.rows.length > 0) {
      this.logInfo("Ubicación actualizada", result.rows[0]);
    } else {
      this.logWarn("Estado no encontrado para actualizar ubicación", { id });
    }

    return result.rows.length > 0 ? result.rows[0] : undefined;
  }

  // ======================================================
  // CONTAR ESTADOS POR TIPO
  // ======================================================
  async countByEstado(
    { estado }: { estado: string },
  ): Promise<number> {
    const client = this.connection.getClient();

    const result = await client.queryObject<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM estado_correo
      WHERE UPPER(estado) = $1
      `,
      [estado.toUpperCase()],
    );

    return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
  }

  // ======================================================
  // CONTAR HISTORIAL DE UN CORREO
  // ======================================================
  async countBySAP(
    { sap_id }: { sap_id: string },
  ): Promise<number> {
    const client = this.connection.getClient();

    const result = await client.queryObject<{ count: number }>(
      `
      SELECT COUNT(*) as count
      FROM estado_correo
      WHERE sap_id = $1
      `,
      [sap_id.toUpperCase()],
    );

    return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
  }
}
