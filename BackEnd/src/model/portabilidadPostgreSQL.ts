// BackEnd/src/model/portabilidadPostgreSQL.ts
// ============================================
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import {
  Portabilidad,
  PortabilidadCreate,
} from "../schemas/venta/Portabilidad.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class PortabilidadPostgreSQL implements PortabilidadModelDB {
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
      logger.error("PortabilidadPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Portabilidad[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<Portabilidad[]>(
      `SELECT * FROM portabilidad LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result || [];
  }

  async getById({ id }: { id: number }): Promise<Portabilidad | undefined> {
    const result = await this.safeQuery<Portabilidad[]>(
      `SELECT * FROM portabilidad WHERE venta = $1`,
      [id],
    );

    return result && result.length > 0
      ? result[0]
      : undefined;
  }

  async add({ input }: { input: PortabilidadCreate }): Promise<Portabilidad> {
    await this.safeQuery(
      `INSERT INTO portabilidad (venta_id, spn, empresa_origen, mercado_origen, numero_portar, pin, fecha_portacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.venta,
        input.spn,
        input.empresa_origen,
        input.mercado_origen,
        input.numero_porta,
        input.pin?.toString() || null,
        input.fecha_portacion || null,
      ],
    );

    return input;
  }

  async update(
    { id, input }: { id: number; input: Partial<Portabilidad> },
  ): Promise<Portabilidad | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.spn !== undefined) {
      fields.push(`spn = $${paramIndex++}`);
      values.push(input.spn);
    }
    if (input.empresa_origen !== undefined) {
      fields.push(`empresa_origen = $${paramIndex++}`);
      values.push(input.empresa_origen);
    }
    if (input.mercado_origen !== undefined) {
      fields.push(`mercado_origen = $${paramIndex++}`);
      values.push(input.mercado_origen);
    }
    if (input.numero_porta !== undefined) {
      fields.push(`numero_porta = $${paramIndex++}`);
      values.push(input.numero_porta);
    }
    if (input.pin !== undefined) {
      fields.push(`pin = $${paramIndex++}`);
      values.push(input.pin);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    await this.safeQuery(
      `UPDATE portabilidad SET ${fields.join(", ")} WHERE venta = $${paramIndex}`,
      values,
    );

    return this.getById({ id });
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    await this.safeQuery(
      `DELETE FROM portabilidad WHERE venta = $1`,
      [id],
    );

    return true;
  }

  async getByVenta(
    { venta }: { venta: number },
  ): Promise<Portabilidad | undefined> {
    const result = await this.safeQuery<Portabilidad[]>(
      `SELECT * FROM portabilidad WHERE venta_id = $1`,
      [venta],
    );

    return result && result.length > 0
      ? result[0]
      : undefined;
  }

  async getStatistics(): Promise<{
    total: number;
    byEmpresaOrigen: Array<{ empresa_origen: string; cantidad: number }>;
    byMercadoOrigen: Array<{ mercado_origen: string; cantidad: number }>;
  }> {
    // Total portabilidades
    const totalResult = await this.safeQuery<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM portabilidad`,
    );
    const total = totalResult && totalResult.length > 0
      ? totalResult[0].total
      : 0;

    // By empresa_origen
    const empresaResult = await this.safeQuery<{ empresa_origen: string; cantidad: number }[]>(
      `SELECT empresa_origen, COUNT(*) as cantidad
       FROM portabilidad
       GROUP BY empresa_origen`
    );
    const byEmpresaOrigen = empresaResult || [];

    // By mercado_origen
    const mercadoResult = await this.safeQuery<{ mercado_origen: string; cantidad: number }[]>(
      `SELECT mercado_origen, COUNT(*) as cantidad
       FROM portabilidad
       GROUP BY mercado_origen`
    );
    const byMercadoOrigen = mercadoResult || [];

    return {
      total,
      byEmpresaOrigen,
      byMercadoOrigen,
    };
  }

  async getByEstado({ estado }: { estado: string }): Promise<Portabilidad[]> {
    const result = await this.safeQuery<Portabilidad[]>(
      `SELECT * FROM portabilidad WHERE estado = $1`,
      [estado],
    );

    return result || [];
  }
}