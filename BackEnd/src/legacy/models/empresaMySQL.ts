// BackEnd/src/model/empresaMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { EmpresaModelDB, Empresa, EmpresaCreate } from "../../interface/Empresa.ts";

export class EmpresaMySQL implements EmpresaModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<Empresa[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM empresa LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return result.rows as Empresa[];
  }

  async getById({ id }: { id: string }): Promise<Empresa | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM empresa WHERE id_empresa = ?`,
      [id]
    );

    return result.rows?.[0] as Empresa | undefined;
  }

  async add({ input }: { input: EmpresaCreate }): Promise<Empresa> {
    const { nombre, cuit, entidad } = input;

    const result = await this.connection.execute(
      `INSERT INTO empresa SET nombre = ?, cuit = ?, entidad = ?`,
      [nombre, cuit, entidad]
    );

    const newId = result.lastInsertId;

    return {
      id_empresa: newId as number,
      nombre,
      cuit,
      entidad,
    };
  }

  async update({ id, input }: { id: string; input: Partial<Empresa> }): Promise<Empresa | undefined> {
    const fields = [];
    const values = [];

    if (input.nombre !== undefined) {
      fields.push("nombre = ?");
      values.push(input.nombre);
    }
    if (input.cuit !== undefined) {
      fields.push("cuit = ?");
      values.push(input.cuit);
    }
    if (input.entidad !== undefined) {
      fields.push("entidad = ?");
      values.push(input.entidad);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.connection.execute(
      `UPDATE empresa SET ${fields.join(", ")} WHERE id_empresa = ?`,
      values
    );

    if (result.affectedRows !== undefined && result.affectedRows > 0) {
      return this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM empresa WHERE id_empresa = ?`,
      [id]
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }
}