// ============================================
// BackEnd/src/model/planPostgreSQL.ts
// ============================================
import { PlanModelDB } from "../interface/Plan.ts";
import { Plan, PlanCreate } from "../schemas/venta/Plan.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class PlanPostgreSQL implements PlanModelDB {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  private async safeQuery<T>(
    query: string, 
    params: any[] = []
  ): Promise<T> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(query, params);
      return result.rows as T;
    } catch (error) {
      logger.error("PlanPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Plan[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<Plan[]>(
      `SELECT * FROM plan LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result || [];
  }

  async getById({ id }: { id: string }): Promise<Plan | undefined> {
    const result = await this.safeQuery<Plan[]>(
      `SELECT * FROM plan WHERE plan_id = $1`,
      [id],
    );

    return result?.[0];
  }

  async getByNombre({ nombre }: { nombre: string }): Promise<Plan | undefined> {
    const result = await this.safeQuery<Plan[]>(
      `SELECT * FROM plan WHERE nombre = $1`,
      [nombre],
    );

    return result?.[0];
  }

  async add({ input }: { input: PlanCreate }): Promise<Plan> {
    const { nombre, precio, gigabyte, llamadas, mensajes, beneficios, whatsapp, roaming, empresa_origen_id } = input;

    const result = await this.safeQuery<Plan[]>(
      `INSERT INTO plan (nombre, precio, gigabyte, llamadas, mensajes, beneficios, whatsapp, roaming, fecha_creacion, empresa_origen_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        nombre,
        precio,
        gigabyte,
        llamadas,
        mensajes,
        beneficios || null,
        whatsapp || "",
        roaming || "",
        new Date(),
        empresa_origen_id,
      ],
    );

    if (!result || result.length === 0) {
      throw new Error("Error al crear el plan");
    }

    return result[0];
  }

  async update(
    { id, input }: { id: string; input: Partial<Plan> },
  ): Promise<Plan | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.nombre !== undefined) {
      fields.push(`nombre = $${paramIndex++}`);
      values.push(input.nombre);
    }
    if (input.precio !== undefined) {
      fields.push(`precio = $${paramIndex++}`);
      values.push(input.precio);
    }
    if (input.gigabyte !== undefined) {
      fields.push(`gigabyte = $${paramIndex++}`);
      values.push(input.gigabyte);
    }
    if (input.llamadas !== undefined) {
      fields.push(`llamadas = $${paramIndex++}`);
      values.push(input.llamadas);
    }
    if (input.mensajes !== undefined) {
      fields.push(`mensajes = $${paramIndex++}`);
      values.push(input.mensajes);
    }
    if (input.beneficios !== undefined) {
      fields.push(`beneficios = $${paramIndex++}`);
      values.push(input.beneficios);
    }
    if (input.whatsapp !== undefined) {
      fields.push(`whatsapp = $${paramIndex++}`);
      values.push(input.whatsapp);
    }
    if (input.roaming !== undefined) {
      fields.push(`roaming = $${paramIndex++}`);
      values.push(input.roaming);
    }
    if (input.empresa_origen_id !== undefined) {
      fields.push(`empresa_origen_id = $${paramIndex++}`);
      values.push(input.empresa_origen_id);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.safeQuery<Plan[]>(
      `UPDATE plan SET ${fields.join(", ")} WHERE plan_id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result && result.length > 0) {
      return result[0];
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.safeQuery(
      `DELETE FROM plan WHERE plan_id = $1`,
      [id],
    );

    // For DELETE operations, we can't easily determine affected rows in PostgreSQL
    // We'll assume success if no error is thrown
    return true;
  }

  async getByEmpresa({ empresa }: { empresa: number }): Promise<Plan[]> {
    const result = await this.safeQuery<Plan[]>(
      `SELECT * FROM plan WHERE empresa_origen_id = $1 ORDER BY precio ASC`,
      [empresa],
    );

    return result || [];
  }
}