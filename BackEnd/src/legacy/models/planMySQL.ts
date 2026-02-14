// BackEnd/src/model/planMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { PlanModelDB } from "../../interface/Plan.ts";
import { Plan, PlanCreate } from "../../schemas/venta/Plan.ts";

export class PlanMySQL implements PlanModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Plan[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM plan LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return result.rows as Plan[];
  }

  async getById({ id }: { id: string }): Promise<Plan | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM plan WHERE plan_id = ?`,
      [id],
    );

    return result.rows?.[0] as Plan | undefined;
  }

  async getByNombre({ nombre }: { nombre: string }): Promise<Plan | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM plan WHERE nombre = ?`,
      [nombre],
    );

    return result.rows?.[0] as Plan | undefined;
  }

  async add({ input }: { input: PlanCreate }): Promise<Plan> {
    const { nombre, precio, gigabyte, llamadas, mensajes, beneficios, whatsapp, roaming, empresa_origen_id } = input;

    const result = await this.connection.execute(
      `INSERT INTO plan SET nombre = ?, precio = ?, gigabyte = ?, llamadas = ?, mensajes = ?, beneficios = ?, whatsapp = ?, roaming = ?, fecha_creacion = ?, empresa_origen_id = ?`,
      [
        nombre,
        precio,
        gigabyte,
        llamadas,
        mensajes,
        beneficios || null,
        whatsapp || "",
        roaming || "",
        new Date(),
        empresa_origen_id,
      ],
    );

    const newId = result.lastInsertId;

    return {
      plan_id: newId as number,
      nombre,
      precio,
      gigabyte,
      llamadas,
      mensajes,
      beneficios: beneficios || null,
      whatsapp: whatsapp || "",
      roaming: roaming || "",
      fecha_creacion: new Date(),
      empresa_origen_id,
    };
  }

  async update(
    { id, input }: { id: string; input: Partial<Plan> },
  ): Promise<Plan | undefined> {
    const fields = [];
    const values = [];

    if (input.nombre !== undefined) {
      fields.push("nombre = ?");
      values.push(input.nombre);
    }
    if (input.precio !== undefined) {
      fields.push("precio = ?");
      values.push(input.precio);
    }
    if (input.gigabyte !== undefined) {
      fields.push("gigabyte = ?");
      values.push(input.gigabyte);
    }
    if (input.llamadas !== undefined) {
      fields.push("llamadas = ?");
      values.push(input.llamadas);
    }
    if (input.mensajes !== undefined) {
      fields.push("mensajes = ?");
      values.push(input.mensajes);
    }
    if (input.beneficios !== undefined) {
      fields.push("beneficios = ?");
      values.push(input.beneficios);
    }
    if (input.whatsapp !== undefined) {
      fields.push("whatsapp = ?");
      values.push(input.whatsapp);
    }
    if (input.roaming !== undefined) {
      fields.push("roaming = ?");
      values.push(input.roaming);
    }
    if (input.empresa_origen_id !== undefined) {
      fields.push("empresa_origen_id = ?");
      values.push(input.empresa_origen_id);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.connection.execute(
      `UPDATE plan SET ${fields.join(", ")} WHERE plan_id = ?`,
      values,
    );

    if (result.affectedRows !== undefined && result.affectedRows > 0) {
      return this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM plan WHERE plan_id = ?`,
      [id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }
}
