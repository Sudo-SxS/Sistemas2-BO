// BackEnd/src/model/ventaMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { logger } from "../../Utils/logger.ts";
import { VentaModelDB } from "../../interface/venta.ts";
import { Venta, VentaCreate } from "../../schemas/venta/Venta.ts";

interface VentaRow {
  venta_id: number;
  sds: string;
  chip: string;
  stl: string;
  tipo_venta: string;
  sap: string;
  cliente_id: string;
  vendedor_id: string;
  multiple: number;
  plan_id: number;
  promocion_id: number | null;
  empresa_origen_id: number;
  fecha_creacion: Date;
}

export class VentaMySQL implements VentaModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  private mapRowToVenta(row: VentaRow): Venta {
    return {
      venta_id: row.venta_id,
      sds: row.sds,
      chip: row.chip as "SIM" | "ESIM",
      stl: row.stl,
      tipo_venta: row.tipo_venta as "PORTABILIDAD" | "LINEA_NUEVA",
      sap: row.sap,
      cliente_id: row.cliente_id,
      vendedor_id: row.vendedor_id,
      multiple: row.multiple,
      plan_id: row.plan_id,
      promocion_id: row.promocion_id as number,
      empresa_origen_id: row.empresa_origen_id,
      fecha_creacion: row.fecha_creacion,
    };
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Venta[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM venta LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    logger.debug("Venta rows:", result.rows || []);

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getById({ id }: { id: string }): Promise<Venta | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE venta_id = ?`,
      [id],
    );

    if (!result.rows || result.rows.length === 0) return undefined;

    return this.mapRowToVenta(result.rows[0]);
  }

  async getBySDS({ sds }: { sds: string }): Promise<Venta | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE sds = ?`,
      [sds],
    );

    if (!result.rows || result.rows.length === 0) return undefined;

    return this.mapRowToVenta(result.rows[0]);
  }

  async getBySPN({ spn }: { spn: string }): Promise<Venta | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE sap = ?`,
      [spn],
    );

    return result.rows?.[0] as Venta | undefined;
  }

  async getBySAP({ sap }: { sap: string }): Promise<Venta | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE sap = ?`,
      [sap],
    );

    if (!result.rows || result.rows.length === 0) return undefined;

    return this.mapRowToVenta(result.rows[0]);
  }

  async add({ input }: { input: VentaCreate }): Promise<Venta> {
    const {
      sds,
      chip,
      stl,
      tipo_venta,
      sap,
      cliente_id,
      vendedor_id,
      multiple,
      plan_id,
      promocion_id,
      empresa_origen_id,
    } = input;

    const result = await this.connection.execute(
      `INSERT INTO venta (sds, chip, stl, tipo_venta, sap, cliente_id, vendedor_id, multiple, plan_id, promocion_id, empresa_origen_id, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sds,
        chip,
        stl,
        tipo_venta,
        sap,
        cliente_id,
        vendedor_id,
        multiple,
        plan_id,
        promocion_id,
        empresa_origen_id,
        new Date(),
      ],
    );

    const newId = result.lastInsertId;

    return {
      venta_id: newId as number,
      sds,
      chip,
      stl: stl || null,
      tipo_venta,
      sap: sap || null,
      cliente_id,
      vendedor_id,
      multiple,
      plan_id,
      promocion_id: promocion_id as number,
      empresa_origen_id,
      fecha_creacion: new Date(),
    };
  }

  async update(
    { id, input }: { id: string; input: Partial<Venta> },
  ): Promise<Venta | undefined> {
    const fields = [];
    const values = [];

    if (input.sds !== undefined) {
      fields.push("sds = ?");
      values.push(input.sds);
    }
    if (input.stl !== undefined) {
      fields.push("stl = ?");
      values.push(input.stl);
    }
    if (input.cliente_id !== undefined) {
      fields.push("cliente_id = ?");
      values.push(input.cliente_id);
    }
    if (input.vendedor_id !== undefined) {
      fields.push("vendedor_id = ?");
      values.push(input.vendedor_id);
    }
    if (input.sap !== undefined) {
      fields.push("sap = ?");
      values.push(input.sap);
    }
    if (input.chip !== undefined) {
      fields.push("chip = ?");
      values.push(input.chip);
    }

    if (input.plan_id !== undefined) {
      fields.push("plan_id = ?");
      values.push(input.plan_id);
    }
    if (input.promocion_id !== undefined) {
      fields.push("promocion_id = ?");
      values.push(input.promocion_id);
    }
    if (input.multiple !== undefined) {
      fields.push("multiple = ?");
      values.push(input.multiple);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.connection.execute(
      `UPDATE venta SET ${fields.join(", ")} WHERE venta_id = ?`,
      values,
    );

    if (result.affectedRows !== undefined && result.affectedRows > 0) {
      return this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM venta WHERE venta_id = ?`,
      [id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }

  async getByVendedor({ vendedor }: { vendedor: string }): Promise<Venta[]> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE vendedor_id = ?`,
      [vendedor],
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByCliente({ cliente }: { cliente: string }): Promise<Venta[]> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE cliente_id = ?`,
      [cliente],
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByPlan({ plan }: { plan: number }): Promise<Venta[]> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE plan_id = ?`,
      [plan],
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByDateRange(
    { start, end }: { start: Date; end: Date },
  ): Promise<Venta[]> {
    const result = await this.connection.execute(
      `SELECT * FROM venta WHERE fecha_creacion BETWEEN ? AND ?`,
      [start, end],
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getStatistics(): Promise<{
    totalVentas: number;
    ventasPorPlan: Array<
      { plan_id: number; plan_nombre: string; cantidad: number }
    >;
    ventasPorVendedor: Array<
      { vendedor_id: string; vendedor_nombre: string; cantidad: number }
    >;
    ventasPorMes: Array<{ mes: string; cantidad: number }>;
  }> {
    // Total ventas
    const totalResult = await this.connection.execute(
      `SELECT COUNT(*) as total FROM venta`,
    );
    const totalVentas = totalResult.rows && totalResult.rows.length > 0
      ? (totalResult.rows[0] as { total: number }).total
      : 0;

    // Ventas por plan
    const planResult = await this.connection.execute(`
      SELECT p.plan_id, p.nombre, COUNT(*) as cantidad
      FROM plan p
      LEFT JOIN venta v ON p.plan_id = v.plan_id
      GROUP BY p.plan_id, p.nombre
    `);
    const ventasPorPlan = (planResult.rows || []).map((
      row: { plan_id: number; nombre: string; cantidad: number },
    ) => ({
      plan_id: row.plan_id,
      plan_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por vendedor
    const vendedorResult = await this.connection.execute(`
      SELECT v.vendedor_id, CONCAT(pe.nombre, ' ', pe.apellido) as nombre, COUNT(*) as cantidad
      FROM venta v
      INNER JOIN usuario u ON u.persona_id = v.vendedor_id
      INNER JOIN persona pe ON pe.persona_id = u.persona_id
      GROUP BY v.vendedor_id, pe.nombre, pe.apellido
    `);
    const ventasPorVendedor = (vendedorResult.rows || []).map((
      row: { vendedor_id: string; nombre: string; cantidad: number },
    ) => ({
      vendedor_id: row.vendedor_id,
      vendedor_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por mes
    const mesResult = await this.connection.execute(`
      SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, COUNT(*) as cantidad
      FROM venta
      GROUP BY mes
      ORDER BY mes
    `);
    const ventasPorMes = mesResult.rows as Array<
      { mes: string; cantidad: number }
    >;

    return {
      totalVentas,
      ventasPorPlan,
      ventasPorVendedor,
      ventasPorMes,
    };
  }
}
