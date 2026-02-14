// BackEnd/src/model/empresaOrigenMySQL.ts
import client from "../../database/MySQL.ts";
import { EmpresaOrigenModelDB, EmpresaOrigen, EmpresaOrigenCreate } from "../../interface/EmpresaOrigen.ts";

export class EmpresaOrigenMySQL implements EmpresaOrigenModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<EmpresaOrigen[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM empresa_origen LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return result.rows as EmpresaOrigen[];
  }

  async getById({ id }: { id: string }): Promise<EmpresaOrigen | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM empresa_origen WHERE empresa_origen_id = ?`,
      [id]
    );

    return result.rows?.[0] as EmpresaOrigen | undefined;
  }

  async add({ input }: { input: EmpresaOrigenCreate }): Promise<EmpresaOrigen> {
    const { nombre_empresa, pais } = input;

    const result = await this.connection.execute(
      `INSERT INTO empresa_origen SET nombre_empresa = ?, pais = ?`,
      [nombre_empresa, pais]
    );

    const newId = result.lastInsertId;

    return {
      empresa_origen_id: newId as number,
      nombre_empresa,
      pais,
    };
  }

  async update({ id, input }: { id: string; input: Partial<EmpresaOrigen> }): Promise<EmpresaOrigen | undefined> {
    const fields = [];
    const values = [];

    if (input.nombre_empresa !== undefined) {
      fields.push("nombre_empresa = ?");
      values.push(input.nombre_empresa);
    }
    if (input.pais !== undefined) {
      fields.push("pais = ?");
      values.push(input.pais);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.connection.execute(
      `UPDATE empresa_origen SET ${fields.join(", ")} WHERE empresa_origen_id = ?`,
      values
    );

    if (result.affectedRows !== undefined && result.affectedRows > 0) {
      return this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM empresa_origen WHERE empresa_origen_id = ?`,
      [id]
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }
}