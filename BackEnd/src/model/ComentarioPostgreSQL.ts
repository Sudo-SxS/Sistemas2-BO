// ============================================
// BackEnd/src/model/ComentarioPostgreSQL.ts
// Modelo PostgreSQL para Comentarios
// ============================================

import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";
import { ComentarioModelDB } from "../interface/Comentario.ts";
import {
  Comentario,
  ComentarioCreate,
  ComentarioUpdate,
  ComentarioConUsuario,
} from "../schemas/venta/Comentario.ts";

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

export class ComentarioPostgreSQL implements ComentarioModelDB {
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

  private logError(message: string, error?: unknown) {
    if (Deno.env.get("MODO") === "development") {
      logger.error(`${message} ${error ? JSON.stringify(error) : ""}`);
    } else {
      logger.error(message);
    }
  }

  // ======================
  // MAPPER
  // ======================
  private mapRowToComentario(row: any): Comentario {
    const converted = convertBigIntToNumber(row);
    return {
      comentario_id: converted.comentario_id,
      titulo: converted.titulo,
      comentario: converted.comentario,
      fecha_creacion: converted.fecha_creacion,
      venta_id: converted.venta_id,
      usuarios_id: converted.usuarios_id,
      tipo_comentario: converted.tipo_comentario,
    };
  }

  private mapRowToComentarioConUsuario(row: any): ComentarioConUsuario {
    const converted = convertBigIntToNumber(row);
    return {
      comentario_id: converted.comentario_id,
      titulo: converted.titulo,
      comentario: converted.comentario,
      fecha_creacion: converted.fecha_creacion,
      venta_id: converted.venta_id,
      usuarios_id: converted.usuarios_id,
      tipo_comentario: converted.tipo_comentario,
      usuario_nombre: converted.usuario_nombre,
      usuario_apellido: converted.usuario_apellido,
      usuario_legajo: converted.usuario_legajo,
      usuario_rol: converted.usuario_rol,
    };
  }

  // ======================
  // CRUD BÁSICO
  // ======================

  async add({ input }: { input: ComentarioCreate }): Promise<Comentario> {
    const client = this.connection.getClient();

    try {
      this.logInfo("Creando comentario", {
        venta_id: input.venta_id,
        tipo: input.tipo_comentario,
      });

      const result = await client.queryObject(
        `INSERT INTO comentario (
          titulo, comentario, fecha_creacion, venta_id, usuarios_id, tipo_comentario
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          input.titulo,
          input.comentario,
          input.fecha_creacion || new Date(),
          input.venta_id,
          input.usuarios_id,
          input.tipo_comentario,
        ],
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Error al crear el comentario");
      }

      const createdRow = result.rows[0] as any;
      
      // Convertir BigInt explícitamente antes de cualquier operación
      createdRow.comentario_id = Number(createdRow.comentario_id);
      createdRow.venta_id = Number(createdRow.venta_id);
      
      this.logInfo("Comentario creado exitosamente", {
        comentario_id: createdRow.comentario_id,
      });

      return this.mapRowToComentario(createdRow);
    } catch (error) {
      this.logError("Error al crear comentario", error);
      throw error;
    }
  }

  async getById({
    comentario_id,
  }: {
    comentario_id: number;
  }): Promise<Comentario | undefined> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject(
        `SELECT * FROM comentario WHERE comentario_id = $1`,
        [comentario_id],
      );

      return result.rows.length > 0
        ? this.mapRowToComentario(result.rows[0])
        : undefined;
    } catch (error) {
      this.logError("Error al obtener comentario por ID", error);
      throw error;
    }
  }

  async update({
    comentario_id,
    input,
  }: {
    comentario_id: number;
    input: ComentarioUpdate;
  }): Promise<Comentario | undefined> {
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

      if (input.tipo_comentario !== undefined) {
        fields.push(`tipo_comentario = $${paramIndex++}`);
        values.push(input.tipo_comentario);
      }

      if (fields.length === 0) {
        this.logInfo("No hay campos para actualizar", { comentario_id });
        return this.getById({ comentario_id });
      }

      values.push(comentario_id);

      const result = await client.queryObject(
        `UPDATE comentario SET ${fields.join(", ")}
         WHERE comentario_id = $${paramIndex}
         RETURNING *`,
        values,
      );

      return result.rows.length > 0
        ? this.mapRowToComentario(result.rows[0])
        : undefined;
    } catch (error) {
      this.logError("Error al actualizar comentario", error);
      throw error;
    }
  }

  async delete({ comentario_id }: { comentario_id: number }): Promise<boolean> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{ comentario_id: number }>(
        `DELETE FROM comentario WHERE comentario_id = $1 RETURNING comentario_id`,
        [comentario_id],
      );

      this.logInfo("Comentario eliminado exitosamente", { comentario_id });
      return result.rows.length > 0;
    } catch (error) {
      this.logError("Error al eliminar comentario", error);
      throw error;
    }
  }

  // ======================
  // MÉTODOS ESPECÍFICOS
  // ======================

  async getAll({
    page = 1,
    limit = 20,
    venta_id,
    usuario_id,
    tipo_comentario,
    fecha_desde,
    fecha_hasta,
  }: {
    page?: number;
    limit?: number;
    venta_id?: number;
    usuario_id?: string;
    tipo_comentario?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
  }): Promise<Comentario[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      let whereClause = "WHERE 1=1";
      const values: any[] = [];
      let paramIndex = 1;

      if (venta_id !== undefined) {
        whereClause += ` AND venta_id = $${paramIndex++}`;
        values.push(venta_id);
      }

      if (usuario_id !== undefined) {
        whereClause += ` AND usuarios_id = $${paramIndex++}`;
        values.push(usuario_id);
      }

      if (tipo_comentario !== undefined) {
        whereClause += ` AND tipo_comentario = $${paramIndex++}`;
        values.push(tipo_comentario);
      }

      if (fecha_desde !== undefined) {
        whereClause += ` AND fecha_creacion >= $${paramIndex++}`;
        values.push(fecha_desde);
      }

      if (fecha_hasta !== undefined) {
        whereClause += ` AND fecha_creacion <= $${paramIndex++}`;
        values.push(fecha_hasta);
      }

      values.push(limit, offset);

      const result = await client.queryObject(
        `SELECT * FROM comentario ${whereClause}
         ORDER BY fecha_creacion DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        values,
      );

      return result.rows.map(this.mapRowToComentario);
    } catch (error) {
      this.logError("Error al obtener comentarios", error);
      throw error;
    }
  }

  async getByVentaId({
    venta_id,
    page = 1,
    limit = 20,
  }: {
    venta_id: number;
    page?: number;
    limit?: number;
  }): Promise<ComentarioConUsuario[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject(
        `SELECT 
          c.comentario_id,
          c.titulo,
          c.comentario,
          TO_CHAR(c.fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_creacion,
          c.venta_id,
          c.usuarios_id,
          c.tipo_comentario,
          p.nombre as usuario_nombre,
          p.apellido as usuario_apellido,
          u.legajo as usuario_legajo,
          u.rol as usuario_rol
         FROM comentario c
         INNER JOIN usuario u ON u.persona_id = c.usuarios_id
         INNER JOIN persona p ON p.persona_id = u.persona_id
         WHERE c.venta_id = $1
         ORDER BY c.fecha_creacion DESC
         LIMIT $2 OFFSET $3`,
        [venta_id, limit, offset],
      );

      return result.rows.map(this.mapRowToComentarioConUsuario);
    } catch (error) {
      this.logError("Error al obtener comentarios por venta", error);
      throw error;
    }
  }

  async getUltimoByVentaId({
    venta_id,
  }: {
    venta_id: number;
  }): Promise<ComentarioConUsuario | undefined> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject(
        `SELECT 
          c.comentario_id,
          c.titulo,
          c.comentario,
          TO_CHAR(c.fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_creacion,
          c.venta_id,
          c.usuarios_id,
          c.tipo_comentario,
          p.nombre as usuario_nombre,
          p.apellido as usuario_apellido,
          u.legajo as usuario_legajo,
          u.rol as usuario_rol
         FROM comentario c
         INNER JOIN usuario u ON u.persona_id = c.usuarios_id
         INNER JOIN persona p ON p.persona_id = u.persona_id
         WHERE c.venta_id = $1
         ORDER BY c.fecha_creacion DESC
         LIMIT 1`,
        [venta_id],
      );

      return result.rows.length > 0
        ? this.mapRowToComentarioConUsuario(result.rows[0])
        : undefined;
    } catch (error) {
      this.logError("Error al obtener último comentario", error);
      throw error;
    }
  }

  async getByUsuarioId({
    usuario_id,
    page = 1,
    limit = 20,
  }: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<Comentario[]> {
    const client = this.connection.getClient();
    const offset = (page - 1) * limit;

    try {
      const result = await client.queryObject(
        `SELECT * FROM comentario
         WHERE usuarios_id = $1
         ORDER BY fecha_creacion DESC
         LIMIT $2 OFFSET $3`,
        [usuario_id, limit, offset],
      );

      return result.rows.map(this.mapRowToComentario);
    } catch (error) {
      this.logError("Error al obtener comentarios por usuario", error);
      throw error;
    }
  }

  async esVentaDelVendedor({
    venta_id,
    vendedor_id,
  }: {
    venta_id: number;
    vendedor_id: string;
  }): Promise<boolean> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{ count: number }>(
        `SELECT COUNT(*) as count FROM venta
         WHERE venta_id = $1 AND vendedor_id = $2`,
        [venta_id, vendedor_id],
      );

      return Number(result.rows[0]?.count || 0) > 0;
    } catch (error) {
      this.logError("Error al verificar propiedad de venta", error);
      throw error;
    }
  }

  async getCreadorId({
    comentario_id,
  }: {
    comentario_id: number;
  }): Promise<string | undefined> {
    const client = this.connection.getClient();

    try {
      const result = await client.queryObject<{ usuarios_id: string }>(
        `SELECT usuarios_id FROM comentario WHERE comentario_id = $1`,
        [comentario_id],
      );

      return result.rows.length > 0
        ? result.rows[0].usuarios_id
        : undefined;
    } catch (error) {
      this.logError("Error al obtener creador del comentario", error);
      throw error;
    }
  }
}
