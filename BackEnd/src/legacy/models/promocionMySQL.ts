// BackEnd/src/model/promocionMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { PromocionModelDB } from "../../interface/Promocion.ts";
import { Promocion, PromocionCreate } from "../../schemas/venta/Promocion.ts";

export class PromocionMySQL implements PromocionModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Promocion[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM promocion LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return result.rows as Promocion[];
  }

  async getById({ id }: { id: string }): Promise<Promocion | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM promocion WHERE promocion_id = ?`,
      [id],
    );

    return result.rows?.[0] as Promocion | undefined;
  }

  async getByNombre(
    { nombre }: { nombre: string },
  ): Promise<Promocion | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM promocion WHERE nombre = ?`,
      [nombre],
    );

    return result.rows?.[0] as Promocion | undefined;
  }

  async getByEmpresa({ empresa }: { empresa: string }): Promise<Promocion[]> {
    const result = await this.connection.execute(
      `SELECT * FROM promocion WHERE empresa_origen_id = ?`,
      [empresa],
    );

    return result.rows as Promocion[];
  }

  async add({ input }: { input: PromocionCreate }): Promise<Promocion> {
    const { nombre, descuento, beneficios, empresa_origen_id } = input;

    const result = await this.connection.execute(
      `INSERT INTO promocion (nombre, descuento, beneficios, fecha_creacion, empresa_origen_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre,
        descuento || null,
        beneficios || null,
        new Date(),
        empresa_origen_id,
      ],
    );

    const newId = result.lastInsertId;

    return {
      promocion_id: newId as number,
      nombre,
      descuento: descuento || undefined,
      beneficios: beneficios || undefined,
      empresa_origen_id,
      fecha_creacion: new Date(),
    };
  }

  async update(
    { id, input }: { id: string; input: Partial<Promocion> },
  ): Promise<Promocion | undefined> {
    const fields = [];
    const values = [];

    if (input.nombre !== undefined) {
      fields.push("nombre = ?");
      values.push(input.nombre);
    }
    if (input.descuento !== undefined) {
      fields.push("descuento = ?");
      values.push(input.descuento);
    }
    if (input.beneficios !== undefined) {
      fields.push("beneficios = ?");
      values.push(input.beneficios);
    }
    if (input.empresa_origen_id !== undefined) {
      fields.push("empresa_origen_id = ?");
      values.push(input.empresa_origen_id);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.connection.execute(
      `UPDATE promocion SET ${fields.join(", ")} WHERE promocion_id = ?`,
      values,
    );

    if (result.affectedRows !== undefined && result.affectedRows > 0) {
      return this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM promocion WHERE promocion_id = ?`,
      [id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }
}
