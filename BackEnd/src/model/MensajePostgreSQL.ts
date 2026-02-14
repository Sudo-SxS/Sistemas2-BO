// ============================================
// BackEnd/src/model/MensajePostgreSQL.ts
// VERSIÓN con fix completo de BigInt
// ============================================

import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";
import { MensajeModelDB } from "../interface/Mensaje.ts";
import {
  Mensaje,
  MensajeCreate,
  MensajeUpdate,
} from "../schemas/mensaje/Mensaje.ts";
import {
  MensajeConEstado,
  MensajeDestinatario,
} from "../schemas/mensaje/MensajeDestinatario.ts";

// Función helper para convertir BigInt a Number recursivamente
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigIntToNumber(obj[key]);
      }
    }
    return converted;
  }
  
  return obj;
}

export class MensajePostgreSQL implements MensajeModelDB {
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
  // MAPPER con conversión BigInt -> Number
  // ======================
  private mapRowToMensaje(row: any): Mensaje {
    const converted = convertBigIntToNumber(row);
    
    return {
      mensaje_id: converted.mensaje_id,
      tipo: converted.tipo,
      titulo: converted.titulo,
      comentario: converted.comentario,
      fecha_creacion: converted.fecha_creacion,
      resuelto: converted.resuelto,
      fecha_resolucion: converted.fecha_resolucion,
      usuario_creador_id: converted.usuario_creador_id,
      referencia_id: converted.referencia_id,
    };
  }

  private mapRowToMensajeConEstado(row: any): MensajeConEstado {
    const converted = convertBigIntToNumber(row);
    
    return {
      mensaje_id: converted.mensaje_id,
      tipo: converted.tipo,
      titulo: converted.titulo,
      comentario: converted.comentario,
      fecha_creacion: converted.fecha_creacion,
      resuelto: converted.resuelto,
      fecha_resolucion: converted.fecha_resolucion,
      usuario_creador_id: converted.usuario_creador_id,
      referencia_id: converted.referencia_id,
      // Campos del destinatario
      leida: converted.leida,
      fecha_lectura: converted.fecha_lectura,
    };
  }

  private mapRowToDestinatario(row: any): MensajeDestinatario {
    const converted = convertBigIntToNumber(row);
    
    return {
      mensaje_id: converted.mensaje_id,
      usuario_id: converted.usuario_id,
      leida: converted.leida,
      fecha_lectura: converted.fecha_lectura,
    };
  }

  // ======================
  // CRUD BÁSICO
  // ======================

  async add({ input }: { input: MensajeCreate }): Promise<Mensaje> {
    const client = this.connection.getClient();

    try {
      this.logInfo("Creando mensaje", {
        tipo: input.tipo,
        titulo: input.titulo,
      });

      const result = await client.queryObject(
        `INSERT INTO mensaje (
          tipo, titulo, comentario, usuario_creador_id,
          referencia_id, resuelto, fecha_creacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          input.tipo,
          input.titulo,
          input.comentario,
          input.usuario_creador_id,
          input.referencia_id || null,
          input.tipo === "ALERTA" ? false : null,
          new Date(),
        ],
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Error al crear el mensaje");
      }

      const mapped = this.mapRowToMensaje(result.rows[0]);
      
      this.logInfo("Mensaje creado exitosamente", {
        mensaje_id: mapped.mensaje_id,
      });

      return mapped;
    } catch (error) {
      this.logError("Error al crear mensaje", error);
      throw error;
    }
  }

  async getById({
    mensaje_id,
  }: {
    mensaje_id: number;
  }): Promise<Mensaje | undefined> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje WHERE mensaje_id = $1`,
        [mensaje_id],
      );

      if (result.rows.length > 0) {
        return this.mapRowToMensaje(result.rows[0]);
      }
      return undefined;
    } catch (error) {
      this.logError("Error al obtener mensaje por ID", error);
      throw error;
    }
  }

  async update({
    mensaje_id,
    input,
  }: {
    mensaje_id: number;
    input: MensajeUpdate;
  }): Promise<Mensaje | undefined> {
    const client = this.connection.getClient();

    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.titulo !== undefined) {
        fields.push(`titulo = $${paramIndex++}`);
        values.push(input.titulo);
      }

      if (input.comentario !== undefined) {
        fields.push(`comentario = $${paramIndex++}`);
        values.push(input.comentario);
      }

      if (input.resuelto !== undefined) {
        fields.push(`resuelto = $${paramIndex++}`);
        values.push(input.resuelto);

        if (input.resuelto) {
          fields.push(`fecha_resolucion = $${paramIndex++}`);
          values.push(new Date());
        }
      }

      if (fields.length === 0) {
        this.logWarn("No hay campos para actualizar", { mensaje_id });
        return this.getById({ mensaje_id });
      }

      values.push(mensaje_id);

      const result = await client.queryObject<Mensaje>(
        `UPDATE mensaje SET ${fields.join(", ")}
         WHERE mensaje_id = $${paramIndex}
         RETURNING *`,
        values,
      );

      return result.rows.length > 0
        ? this.mapRowToMensaje(result.rows[0])
        : undefined;
    } catch (error) {
      this.logError("Error al actualizar mensaje", error);
      throw error;
    }
  }

  async delete({ mensaje_id }: { mensaje_id: number }): Promise<boolean> {
    const client = this.connection.getClient();

    try {
      await client.queryObject(
        `DELETE FROM mensaje_destinatario WHERE mensaje_id = $1`,
        [mensaje_id],
      );

      const result = await client.queryObject<{ mensaje_id: bigint }>(
        `DELETE FROM mensaje WHERE mensaje_id = $1 RETURNING mensaje_id`,
        [mensaje_id],
      );

      this.logInfo("Mensaje eliminado exitosamente", { mensaje_id });
      return result.rows.length > 0;
    } catch (error) {
      this.logError("Error al eliminar mensaje", error);
      throw error;
    }
  }

  // ======================
  // DESTINATARIOS
  // ======================

  async addDestinatario({
    mensaje_id,
    usuario_id,
  }: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<MensajeDestinatario> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<MensajeDestinatario>(
        `INSERT INTO mensaje_destinatario (mensaje_id, usuario_id, leida)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [mensaje_id, usuario_id, false],
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Error al agregar destinatario");
      }

      return this.mapRowToDestinatario(result.rows[0]);
    } catch (error) {
      this.logError("Error al agregar destinatario", error);
      throw error;
    }
  }

  async addDestinatarios({
    mensaje_id,
    usuarios_ids,
  }: {
    mensaje_id: number;
    usuarios_ids: string[];
  }): Promise<number> {
    if (usuarios_ids.length === 0) return 0;

    const client = this.connection.getClient();

    try {
      const values: any[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      usuarios_ids.forEach((usuario_id) => {
        placeholders.push(
          `($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
        );
        values.push(mensaje_id, usuario_id, false);
      });

      const result = await client.queryObject(
        `INSERT INTO mensaje_destinatario (mensaje_id, usuario_id, leida)
         VALUES ${placeholders.join(", ")}
         ON CONFLICT (mensaje_id, usuario_id) DO NOTHING
         RETURNING mensaje_id`,
        values,
      );

      this.logInfo("Destinatarios agregados", {
        mensaje_id,
        count: result.rows.length,
      });

      return result.rows.length;
    } catch (error) {
      this.logError("Error al agregar destinatarios", error);
      throw error;
    }
  }

  async marcarComoLeido({
    mensaje_id,
    usuario_id,
  }: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<boolean> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{ mensaje_id: number }>(
        `UPDATE mensaje_destinatario
         SET leida = true, fecha_lectura = $1
         WHERE mensaje_id = $2 AND usuario_id = $3
         RETURNING mensaje_id`,
        [new Date(), mensaje_id, usuario_id],
      );

      return result.rows.length > 0;
    } catch (error) {
      this.logError("Error al marcar como leído", error);
      throw error;
    }
  }

  async marcarComoNoLeido({
    mensaje_id,
    usuario_id,
  }: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<boolean> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{ mensaje_id: number }>(
        `UPDATE mensaje_destinatario
         SET leida = false, fecha_lectura = NULL
         WHERE mensaje_id = $1 AND usuario_id = $2
         RETURNING mensaje_id`,
        [mensaje_id, usuario_id],
      );

      return result.rows.length > 0;
    } catch (error) {
      this.logError("Error al marcar como no leído", error);
      throw error;
    }
  }

  // ======================
  // INBOX Y NOTIFICACIONES
  // ======================

  async getInbox({
    usuario_id,
    page = 1,
    limit = 20,
  }: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<MensajeConEstado[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject<MensajeConEstado>(
        `SELECT
          m.*,
          md.leida,
          md.fecha_lectura
        FROM mensaje m
        INNER JOIN mensaje_destinatario md ON md.mensaje_id = m.mensaje_id
        WHERE md.usuario_id = $1
        ORDER BY m.fecha_creacion DESC
        LIMIT $2 OFFSET $3`,
        [usuario_id, limit, offset],
      );

      return result.rows.map(this.mapRowToMensajeConEstado);
    } catch (error) {
      this.logError("Error al obtener inbox", error);
      throw error;
    }
  }

  async getNoLeidos({
    usuario_id,
  }: {
    usuario_id: string;
  }): Promise<MensajeConEstado[]> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<MensajeConEstado>(
        `SELECT
          m.*,
          md.leida,
          md.fecha_lectura
        FROM mensaje m
        INNER JOIN mensaje_destinatario md ON md.mensaje_id = m.mensaje_id
        WHERE md.usuario_id = $1 AND md.leida = false
        ORDER BY m.fecha_creacion DESC`,
        [usuario_id],
      );

      return result.rows.map(this.mapRowToMensajeConEstado);
    } catch (error) {
      this.logError("Error al obtener mensajes no leídos", error);
      throw error;
    }
  }

  async countNoLeidos({ usuario_id }: { usuario_id: string }): Promise<number> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{ count: string }>(
        `SELECT COUNT(*) as count
        FROM mensaje_destinatario
        WHERE usuario_id = $1 AND leida = false`,
        [usuario_id],
      );

      return Number(result.rows[0]?.count || 0);
    } catch (error) {
      this.logError("Error al contar mensajes no leídos", error);
      throw error;
    }
  }

  // ======================
  // ALERTAS
  // ======================

  async resolverAlerta({
    mensaje_id,
  }: {
    mensaje_id: number;
  }): Promise<Mensaje | undefined> {
    const client = this.connection.getClient();

    try {
      const mensaje = await this.getById({ mensaje_id });
      if (!mensaje || mensaje.tipo !== "ALERTA") {
        throw new Error("El mensaje no es una alerta o no existe");
      }

      if (mensaje.resuelto) {
        throw new Error("La alerta ya está resuelta");
      }

      const result = await client.queryObject<Mensaje>(
        `UPDATE mensaje
         SET resuelto = true, fecha_resolucion = $1
         WHERE mensaje_id = $2 AND tipo = 'ALERTA'
         RETURNING *`,
        [new Date(), mensaje_id],
      );

      return result.rows.length > 0
        ? this.mapRowToMensaje(result.rows[0])
        : undefined;
    } catch (error) {
      this.logError("Error al resolver alerta", error);
      throw error;
    }
  }

  async getAlertasPendientes({
    page = 1,
    limit = 20,
  }: {
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje
        WHERE tipo = 'ALERTA' AND (resuelto = false OR resuelto IS NULL)
        ORDER BY fecha_creacion DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      return result.rows.map(this.mapRowToMensaje);
    } catch (error) {
      this.logError("Error al obtener alertas pendientes", error);
      throw error;
    }
  }

  async getAlertasResueltas({
    page = 1,
    limit = 20,
  }: {
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje
        WHERE tipo = 'ALERTA' AND resuelto = true
        ORDER BY fecha_resolucion DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      return result.rows.map(this.mapRowToMensaje);
    } catch (error) {
      this.logError("Error al obtener alertas resueltas", error);
      throw error;
    }
  }

  async getAlertasByReferencia({
    referencia_id,
  }: {
    referencia_id: number;
  }): Promise<Mensaje[]> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje
        WHERE tipo = 'ALERTA' AND referencia_id = $1
        ORDER BY fecha_creacion DESC`,
        [referencia_id],
      );

      return result.rows.map(this.mapRowToMensaje);
    } catch (error) {
      this.logError("Error al obtener alertas por referencia", error);
      throw error;
    }
  }

  // ======================
  // BÚSQUEDA
  // ======================

  async getByTipo({
    tipo,
    page = 1,
    limit = 20,
  }: {
    tipo: "ALERTA" | "NOTIFICACION";
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje
        WHERE tipo = $1
        ORDER BY fecha_creacion DESC
        LIMIT $2 OFFSET $3`,
        [tipo, limit, offset],
      );

      return result.rows.map(this.mapRowToMensaje);
    } catch (error) {
      this.logError("Error al obtener mensajes por tipo", error);
      throw error;
    }
  }

  async getByUsuarioCreador({
    usuario_id,
    page = 1,
    limit = 20,
  }: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje
        WHERE usuario_creador_id = $1
        ORDER BY fecha_creacion DESC
        LIMIT $2 OFFSET $3`,
        [usuario_id, limit, offset],
      );

      return result.rows.map(this.mapRowToMensaje);
    } catch (error) {
      this.logError("Error al obtener mensajes por usuario creador", error);
      throw error;
    }
  }

  async getByFechaRango({
    fechaInicio,
    fechaFin,
    page = 1,
    limit = 20,
  }: {
    fechaInicio: Date;
    fechaFin: Date;
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject<Mensaje>(
        `SELECT * FROM mensaje
        WHERE fecha_creacion >= $1 AND fecha_creacion <= $2
        ORDER BY fecha_creacion DESC
        LIMIT $3 OFFSET $4`,
        [fechaInicio, fechaFin, limit, offset],
      );

      return result.rows.map(this.mapRowToMensaje);
    } catch (error) {
      this.logError("Error al obtener mensajes por rango de fechas", error);
      throw error;
    }
  }

  // ======================
  // ESTADÍSTICAS
  // ======================

  async getEstadisticas(): Promise<{
    totalMensajes: number;
    totalAlertas: number;
    totalNotificaciones: number;
    alertasPendientes: number;
    alertasResueltas: number;
  }> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{
        total_mensajes: string;
        total_alertas: string;
        total_notificaciones: string;
        alertas_pendientes: string;
        alertas_resueltas: string;
      }>(
        `SELECT
          COUNT(*) as total_mensajes,
          COUNT(*) FILTER (WHERE tipo = 'ALERTA') as total_alertas,
          COUNT(*) FILTER (WHERE tipo = 'NOTIFICACION') as total_notificaciones,
          COUNT(*) FILTER (WHERE tipo = 'ALERTA' AND (resuelto = false OR resuelto IS NULL)) as alertas_pendientes,
          COUNT(*) FILTER (WHERE tipo = 'ALERTA' AND resuelto = true) as alertas_resueltas
        FROM mensaje`,
      );

      const row = result.rows[0];

      return {
        totalMensajes: Number(row?.total_mensajes || 0),
        totalAlertas: Number(row?.total_alertas || 0),
        totalNotificaciones: Number(row?.total_notificaciones || 0),
        alertasPendientes: Number(row?.alertas_pendientes || 0),
        alertasResueltas: Number(row?.alertas_resueltas || 0),
      };
    } catch (error) {
      this.logError("Error al obtener estadísticas", error);
      throw error;
    }
  }

  // ======================
  // RESOLUCIÓN DE DESTINATARIOS
  // ======================

  async resolverDestinatarios({
    tipo,
    valor,
    referencia_id,
  }: {
    tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
    valor?: string;
    referencia_id?: number;
  }): Promise<string[]> {
    const client = this.connection.getClient();
    const usuarios: string[] = [];

    try {
      switch (tipo) {
        case "USUARIO": {
          if (valor) {
            usuarios.push(valor);
          }
          break;
        }

        case "ROL": {
          if (valor) {
            const result = await client.queryObject<{ persona_id: string }>(
              `SELECT persona_id FROM usuario WHERE rol = $1 AND estado = 'ACTIVO'`,
              [valor],
            );
            result.rows.forEach((row) => usuarios.push(row.persona_id));
          }
          break;
        }

        case "CELULA": {
          if (valor) {
            const celulaId = parseInt(valor);
            const result = await client.queryObject<{ persona_id: string }>(
              `SELECT persona_id FROM usuario WHERE celula = $1 AND estado = 'ACTIVO'`,
              [celulaId],
            );
            result.rows.forEach((row) => usuarios.push(row.persona_id));
          }
          break;
        }

        case "VENTA_RELACIONADA": {
          if (referencia_id) {
            const ventaResult = await client.queryObject<{
              vendedor_id: string;
              celula: number;
            }>(
              `SELECT v.vendedor_id, u.celula
               FROM venta v
               INNER JOIN usuario u ON u.persona_id = v.vendedor_id
               WHERE v.venta_id = $1`,
              [referencia_id],
            );

            if (ventaResult.rows.length > 0) {
              const { vendedor_id, celula } = ventaResult.rows[0];
              usuarios.push(vendedor_id);

              const supervisorResult = await client.queryObject<{
                persona_id: string;
              }>(
                `SELECT s.usuario_id as persona_id
                 FROM supervisor s
                 INNER JOIN usuario u ON u.persona_id = s.usuario_id
                 WHERE u.celula = $1 AND u.estado = 'ACTIVO'
                 LIMIT 1`,
                [celula],
              );

              if (supervisorResult.rows.length > 0) {
                usuarios.push(supervisorResult.rows[0].persona_id);
              }
            }
          }
          break;
        }

        case "GLOBAL": {
          const result = await client.queryObject<{ persona_id: string }>(
            `SELECT persona_id FROM usuario WHERE estado = 'ACTIVO'`,
          );
          result.rows.forEach((row) => usuarios.push(row.persona_id));
          break;
        }

        default: {
          this.logWarn(`Tipo de destinatario no reconocido: ${tipo}`);
          break;
        }
      }

      return [...new Set(usuarios)];
    } catch (error) {
      this.logError("Error al resolver destinatarios", error);
      throw error;
    }
  }
}
