// BackEnd/src/model/lineaNuevaPostgreSQL.ts
// ============================================
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { LineaNueva, LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class LineaNuevaPostgreSQL implements LineaNuevaModelDB {
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
      logger.error("LineaNuevaPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<LineaNueva[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<LineaNueva[]>(
      `SELECT * FROM linea_nueva LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result || [];
  }

  async getById({ id }: { id: number }): Promise<LineaNueva | undefined> {
    const result = await this.safeQuery<LineaNueva[]>(
      `SELECT * FROM linea_nueva WHERE venta_id = $1`,
      [id],
    );

    return result && result.length > 0
      ? result[0]
      : undefined;
  }

  async add({ input }: { input: LineaNuevaCreate }): Promise<LineaNueva> {
    const { venta } = input;

    await this.safeQuery(
      `INSERT INTO linea_nueva (venta_id) VALUES ($1)`,
      [venta],
    );

    return {
      ...input,
    };
  }

  async update(
    { id, input }: { id: number; input: Partial<LineaNueva> },
  ): Promise<LineaNueva | undefined> {
    // Linea nueva table only has venta_id, no other fields to update
    // Always return existing record
    return this.getById({ id });
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    await this.safeQuery(
      `DELETE FROM linea_nueva WHERE venta_id = $1`,
      [id],
    );

    return true;
  }

  async getByVenta(
    { venta }: { venta: number },
  ): Promise<LineaNueva | undefined> {
    const result = await this.safeQuery<LineaNueva[]>(
      `SELECT * FROM linea_nueva WHERE venta_id = $1`,
      [venta],
    );

    return result && result.length > 0
      ? result[0]
      : undefined;
  }

  async getStatistics(): Promise<{
    total: number;
  }> {
    // Total linea nuevas
    const totalResult = await this.safeQuery<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM linea_nueva`,
    );
    const total = totalResult && totalResult.length > 0
      ? totalResult[0].total
      : 0;

    return {
      total,
    };
  }

  // Note: linea_nueva table doesn't have estado column
  // This method is not applicable to current table structure
  async getByEstado({ estado }: { estado: string }): Promise<LineaNueva[]> {
    // Return empty array since there's no estado to filter by
    return [];
  }
}