// BackEnd/src/model/lineaNuevaMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { LineaNuevaModelDB } from "../../interface/LineaNueva.ts";
import { LineaNueva, LineaNuevaCreate } from "../../schemas/venta/LineaNueva.ts";

export class LineaNuevaMySQL implements LineaNuevaModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<LineaNueva[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM linea_nueva LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return result.rows ? (result.rows as LineaNueva[]) : [];
  }

  async getById({ id }: { id: number }): Promise<LineaNueva | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM linea_nueva WHERE venta_id = ?`,
      [id],
    );

    return result.rows && result.rows.length > 0
      ? (result.rows[0] as LineaNueva)
      : undefined;
  }

  async add({ input }: { input: LineaNuevaCreate }): Promise<LineaNueva> {
    const { venta } = input;

    await this.connection.execute(
      `INSERT INTO linea_nueva (venta_id) VALUES (?)`,
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
    // Always return the existing record
    return this.getById({ id });
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM linea_nueva WHERE venta_id = ?`,
      [id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }

  async getByVenta(
    { venta }: { venta: number },
  ): Promise<LineaNueva | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM linea_nueva WHERE venta_id = ?`,
      [venta],
    );

    return result.rows && result.rows.length > 0
      ? (result.rows[0] as LineaNueva)
      : undefined;
  }

  async getStatistics(): Promise<{
    total: number;
  }> {
    // Total linea nuevas
    const totalResult = await this.connection.execute(
      `SELECT COUNT(*) as total FROM linea_nueva`,
    );
    const total = totalResult.rows && totalResult.rows.length > 0
      ? (totalResult.rows[0] as { total: number }).total
      : 0;

    return {
      total,
    };
  }

  // Note: linea_nueva table doesn't have estado column
  // This method is not applicable to the current table structure
  async getByEstado({ estado }: { estado: string }): Promise<LineaNueva[]> {
    // Return empty array since there's no estado to filter by
    return [];
  }
}
