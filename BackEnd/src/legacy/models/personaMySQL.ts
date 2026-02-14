import { PersonaModelDB } from "../../interface/Persona.ts";
import { Persona } from "../../schemas/persona/Persona.ts";
import clients from "../../database/MySQL.ts";

export class PersonaModelMySQL implements PersonaModelDB {
  connection: typeof clients;

  constructor() {
    this.connection = clients;
  }

  async getAll(params: {
    page?: number;
    limit?: number;
    email?: string;
  }): Promise<Persona[] | undefined> {
    const { page = 1, limit = 10, email } = params;

    let query = "SELECT * FROM personas";
    const filters: string[] = [];

    if (email) filters.push(`email = '${email}'`);

    if (filters.length > 0) query += " WHERE " + filters.join(" AND ");
    query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

    const result = await this.connection.query(query);
    return result as Persona[];
  }

  async getById({ id }: { id: string }): Promise<Persona | undefined> {
    const result = await this.connection.query(
      "SELECT * FROM personas WHERE id_persona = ?",
      [id],
    );
    return result[0] as Persona | undefined;
  }

  async add({ input }: { input: Persona }): Promise<Persona> {
    await this.connection.query(
      `INSERT INTO personas (id_persona, nombre, apellido, fecha_nacimiento, documento, email, telefono, tipo_documento, nacionalidad, genero, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id_persona,
        input.nombre,
        input.apellido,
        input.fecha_nacimiento,
        input.documento,
        input.email,
        input.telefono,
        input.tipo_documento,
        input.nacionalidad,
        input.genero,
        input.creado_en,
      ],
    );
    return input;
  }

  async update({
    id,
    input,
  }: {
    id: string;
    input: Partial<Persona>;
  }): Promise<Persona | undefined> {
    const fields = Object.keys(input)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(input);

    await this.connection.query(
      `UPDATE personas SET ${fields} WHERE id_persona = ?`,
      [...values, id],
    );

    return this.getById({ id });
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.query(
      "DELETE FROM personas WHERE id_persona = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  async getByEmail({ email }: { email: string }): Promise<Persona | undefined> {
    const result = await this.connection.query(
      "SELECT * FROM personas WHERE email = ?",
      [email],
    );
    return result[0] as Persona | undefined;
  }

  async getBydocumento(
    { documento }: { documento: string },
  ): Promise<Persona | undefined> {
    const result = await this.connection.query(
      "SELECT * FROM personas WHERE documento = ?",
      [documento],
    );
    return result[0] as Persona | undefined;
  }
}
