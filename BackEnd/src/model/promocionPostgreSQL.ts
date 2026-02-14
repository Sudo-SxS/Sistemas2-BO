// BackEnd/src/model/promocionPostgreSQL.ts
// ============================================
import { PromocionModelDB } from "../interface/Promocion.ts";
import { Promocion, PromocionCreate } from "../schemas/venta/Promocion.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class PromocionPostgreSQL implements PromocionModelDB {
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
      logger.error("PromocionPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Promocion[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<Promocion[]>(
      `SELECT * FROM promocion LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result || [];
  }

  async getById({ id }: { id: string }): Promise<Promocion | undefined> {
    const result = await this.safeQuery<Promocion[]>(
      `SELECT * FROM promocion WHERE promocion_id = $1`,
      [id],
    );

    return result?.[0];
  }

  async getByNombre(
    { nombre }: { nombre: string },
  ): Promise<Promocion | undefined> {
    const result = await this.safeQuery<Promocion[]>(
      `SELECT * FROM promocion WHERE nombre = $1`,
      [nombre],
    );

    return result?.[0];
  }

  async getByEmpresa({ empresa }: { empresa: string }): Promise<Promocion[]> {
    const result = await this.safeQuery<Promocion[]>(
      `SELECT * FROM promocion WHERE empresa_origen_id = $1`,
      [empresa],
    );

    return result || [];
  }

  async add({ input }: { input: PromocionCreate }): Promise<Promocion> {
    const { nombre, beneficios, empresa_origen_id, descuento } = input;

    const result = await this.safeQuery<Promocion[]>(
      `INSERT INTO promocion (nombre, beneficios, fecha_creacion, empresa_origen_id, descuento)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        nombre,
        beneficios || null,
        new Date(),
        empresa_origen_id,
        descuento ?? 0,
      ],
    );

    if (!result || result.length === 0) {
      throw new Error("Error al crear la promoción");
    }

    return result[0];
  }

  async update(
    { id, input }: { id: string; input: Partial<Promocion> },
  ): Promise<Promocion | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.nombre !== undefined) {
      fields.push(`nombre = $${paramIndex++}`);
      values.push(input.nombre);
    }
    if (input.descuento !== undefined) {
      fields.push(`descuento = $${paramIndex++}`);
      values.push(input.descuento);
    }
    if (input.beneficios !== undefined) {
      fields.push(`beneficios = $${paramIndex++}`);
      values.push(input.beneficios);
    }
    if (input.empresa_origen_id !== undefined) {
      fields.push(`empresa_origen_id = $${paramIndex++}`);
      values.push(input.empresa_origen_id);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.safeQuery<Promocion[]>(
      `UPDATE promocion SET ${fields.join(", ")} WHERE promocion_id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result && result.length > 0) {
      return result[0];
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    await this.safeQuery(
      `DELETE FROM promocion WHERE promocion_id = $1`,
      [id],
    );

    return true;
  }
}