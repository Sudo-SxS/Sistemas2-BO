// ============================================
// BackEnd/src/model/estadoVentaMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { EstadoVentaModelDB } from "../../interface/EstadoVenta.ts";
import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../../schemas/venta/EstadoVenta.ts";

interface EstadoVentaRow {
  estado_id: number;
  venta_id: number;
  estado: string;
  descripcion: string;
  fecha_creacion: Date;
  usuario_id: string;
}

export class EstadoVentaMySQL implements EstadoVentaModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  private mapRowToEstadoVenta(row: EstadoVentaRow): EstadoVenta {
    return {
      estado_id: row.estado_id,
      venta_id: row.venta_id,
      estado: row.estado as EstadoVenta['estado'], // Will be validated by Zod
      descripcion: row.descripcion,
      fecha_creacion: row.fecha_creacion,
      usuario_id: row.usuario_id,
    };
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<EstadoVenta[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      "SELECT * FROM estado ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );

    return (result.rows || []).map((row: EstadoVentaRow) => this.mapRowToEstadoVenta(row));
  }

  async getById({ id }: { id: string }): Promise<EstadoVenta | undefined> {
    const result = await this.connection.execute(
      "SELECT * FROM estado WHERE estado_id = ?",
      [Number(id)],
    );

    if (!result.rows || result.rows.length === 0) return undefined;

    return this.mapRowToEstadoVenta(result.rows[0] as EstadoVentaRow);
  }

  async getByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta[]> {
    const result = await this.connection.execute(
      "SELECT * FROM estado WHERE venta_id = ? ORDER BY fecha_creacion DESC",
      [venta_id],
    );

    return (result.rows || []).map((row: EstadoVentaRow) => this.mapRowToEstadoVenta(row));
  }

  async add({ input }: { input: EstadoVentaCreate }): Promise<EstadoVenta> {
    const result = await this.connection.execute(
      "INSERT INTO estado (venta_id, estado, descripcion, fecha_creacion, usuario_id) VALUES (?, ?, ?, ?, ?)",
      [input.venta_id, input.estado, input.descripcion, input.fecha_creacion, input.usuario_id],
    );

    const estado_id = result.lastInsertId;

    return {
      estado_id: estado_id as number,
      ...input,
    };
  }

  async update({ id, input }: { id: string; input: EstadoVentaUpdate }): Promise<boolean> {
    const fields = Object.keys(input);
    const values = Object.values(input);

    if (fields.length === 0) return true;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    const result = await this.connection.execute(
      `UPDATE estado SET ${setClause} WHERE estado_id = ?`,
      [...values, Number(id)],
    );

    return (result.affectedRows ?? 0) > 0;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      "DELETE FROM estado WHERE estado_id = ?",
      [Number(id)],
    );

    return (result.affectedRows ?? 0) > 0;
  }
}