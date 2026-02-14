// BackEnd/src/model/portabilidadMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { PortabilidadModelDB } from "../../interface/Portabilidad.ts";
import {
  Portabilidad,
  PortabilidadCreate,
} from "../../schemas/venta/Portabilidad.ts";

export class PortabilidadMySQL implements PortabilidadModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Portabilidad[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM portabilidad LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return result.rows ? (result.rows as Portabilidad[]) : [];
  }

  async getById({ id }: { id: number }): Promise<Portabilidad | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM portabilidad WHERE venta = ?`,
      [id],
    );

    return result.rows && result.rows.length > 0
      ? (result.rows[0] as Portabilidad)
      : undefined;
  }

  async add({ input }: { input: PortabilidadCreate }): Promise<Portabilidad> {
    await this.connection.execute(
      `INSERT INTO portabilidad (venta_id, spn, empresa_origen, mercado_origen, numero_portar, pin, fecha_portacion) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    const fields = [];
    const values = [];

    if (input.spn !== undefined) {
      fields.push("spn = ?");
      values.push(input.spn);
    }
    if (input.empresa_origen !== undefined) {
      fields.push("empresa_origen = ?");
      values.push(input.empresa_origen);
    }
    if (input.mercado_origen !== undefined) {
      fields.push("mercado_origen = ?");
      values.push(input.mercado_origen);
    }
    if (input.numero_porta !== undefined) {
      fields.push("numero_porta = ?");
      values.push(input.numero_porta);
    }
    if (input.pin !== undefined) {
      fields.push("pin = ?");
      values.push(input.pin);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.connection.execute(
      `UPDATE portabilidad SET ${fields.join(", ")} WHERE venta = ?`,
      values,
    );

    if (result.affectedRows !== undefined && result.affectedRows > 0) {
      return this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM portabilidad WHERE venta = ?`,
      [id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }

  async getByVenta(
    { venta }: { venta: number },
  ): Promise<Portabilidad | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM portabilidad WHERE venta_id = ?`,
      [venta],
    );

    return result.rows && result.rows.length > 0
      ? (result.rows[0] as Portabilidad)
      : undefined;
  }

  async getStatistics(): Promise<{
    total: number;
    byEmpresaOrigen: Array<{ empresa_origen: string; cantidad: number }>;
    byMercadoOrigen: Array<{ mercado_origen: string; cantidad: number }>;
  }> {
    // Total portabilidades
    const totalResult = await this.connection.execute(
      `SELECT COUNT(*) as total FROM portabilidad`,
    );
    const total = totalResult.rows && totalResult.rows.length > 0
      ? (totalResult.rows[0] as { total: number }).total
      : 0;

    // By empresa_origen
    const empresaResult = await this.connection.execute(`
      SELECT empresa_origen, COUNT(*) as cantidad
      FROM portabilidad
      GROUP BY empresa_origen
    `);
    const byEmpresaOrigen = (empresaResult.rows || []).map((
      row: { empresa_origen: string; cantidad: number },
    ) => ({
      empresa_origen: row.empresa_origen,
      cantidad: row.cantidad,
    }));

    // By mercado_origen
    const mercadoResult = await this.connection.execute(`
      SELECT mercado_origen, COUNT(*) as cantidad
      FROM portabilidad
      GROUP BY mercado_origen
    `);
    const byMercadoOrigen = (mercadoResult.rows || []).map((
      row: { mercado_origen: string; cantidad: number },
    ) => ({
      mercado_origen: row.mercado_origen,
      cantidad: row.cantidad,
    }));

    return {
      total,
      byEmpresaOrigen,
      byMercadoOrigen,
    };
  }

  async getByEstado({ estado }: { estado: string }): Promise<Portabilidad[]> {
    const result = await this.connection.execute(
      `SELECT * FROM portabilidad WHERE estado = ?`,
      [estado],
    );

    return result.rows ? (result.rows as Portabilidad[]) : [];
  }
}
