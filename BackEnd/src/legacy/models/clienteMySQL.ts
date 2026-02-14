// BackEnd/src/model/clienteMySQL.ts
// ============================================
import client from "../../database/MySQL.ts";
import { ClienteUpdate } from "../../schemas/persona/Cliente.ts";
import { ClienteModelDB } from "../../interface/Cliente.ts";
import {
  Cliente,
  ClienteCreate,
  ClienteResponse,
} from "../../schemas/persona/Cliente.ts";

export class ClienteMySQL implements ClienteModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Cliente[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT * FROM cliente LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return result.rows as Cliente[];
  }

  async getById({ id }: { id: string }): Promise<Cliente | undefined> {
    return await this.getByPersonaId({ personaId: id });
  }

  async getByPersonaId(
    { personaId }: { personaId: string },
  ): Promise<Cliente | undefined> {
    const result = await this.connection.execute(
      `SELECT * FROM cliente WHERE persona_id = ?`,
      [personaId],
    );

    return result.rows?.[0] as Cliente | undefined;
  }

  async getWithPersonaData(
    { personaId }: { personaId: string },
  ): Promise<ClienteResponse | undefined> {
    const result = await this.connection.execute(
      `SELECT c.persona_id, p.nombre, p.apellido, p.email, p.documento, p.telefono, p.fecha_nacimiento
       FROM cliente c
       INNER JOIN persona p ON c.persona_id = p.persona_id
       WHERE c.persona_id = ?`,
      [personaId],
    );

    return result.rows?.[0] as ClienteResponse | undefined;
  }

  async getAllWithPersonaData(
    params: { page?: number; limit?: number } = {},
  ): Promise<ClienteResponse[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.connection.execute(
      `SELECT c.persona_id, p.nombre, p.apellido, p.email, p.documento, p.telefono, p.fecha_nacimiento
       FROM cliente c
       INNER JOIN persona p ON c.persona_id = p.persona_id
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return result.rows as ClienteResponse[];
  }

  async add({ input }: { input: ClienteCreate }): Promise<Cliente> {
    // Generar UUID para persona_id
    const persona_id = crypto.randomUUID();

    // Primero crear la persona
    const personaData = {
      nombre: input.nombre,
      apellido: input.apellido,
      fecha_nacimiento: input.fecha_nacimiento,
      documento: input.documento,
      email: input.email,
      telefono: input.telefono,
      tipo_documento: input.tipo_documento,
      nacionalidad: input.nacionalidad,
      genero: input.genero,
    };

    await this.connection.execute(
      `INSERT INTO persona (persona_id, nombre, apellido, fecha_nacimiento, documento, email, telefono, tipo_documento, nacionalidad, genero, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        persona_id,
        personaData.nombre,
        personaData.apellido,
        personaData.fecha_nacimiento,
        personaData.documento,
        personaData.email,
        personaData.telefono || null,
        personaData.tipo_documento,
        personaData.nacionalidad,
        personaData.genero,
        new Date(),
      ],
    );

    // Ahora crear el cliente
    const _result = await this.connection.execute(
      `INSERT INTO cliente (persona_id) VALUES (?)`,
      [persona_id]
    );

    return {
      persona_id,
    };
  }

  async update(
    { id, input }: { id: string; input: ClienteUpdate },
  ): Promise<Cliente | undefined> {

    // Si hay datos de persona para actualizar
    const personaFields = ['nombre', 'apellido', 'fecha_nacimiento', 'documento', 'email', 'telefono', 'tipo_documento', 'nacionalidad', 'genero'];
    const hasPersonaUpdates = personaFields.some(field => input[field as keyof ClienteUpdate] !== undefined);

    if (hasPersonaUpdates) {
      const updateFields: string[] = [];
      const values: (string | number | Date | null)[] = [];

      if (input.nombre !== undefined) {
        updateFields.push('nombre = ?');
        values.push(input.nombre);
      }
      if (input.apellido !== undefined) {
        updateFields.push('apellido = ?');
        values.push(input.apellido);
      }
      if (input.fecha_nacimiento !== undefined) {
        updateFields.push('fecha_nacimiento = ?');
        values.push(input.fecha_nacimiento);
      }
      if (input.documento !== undefined) {
        updateFields.push('documento = ?');
        values.push(input.documento);
      }
      if (input.email !== undefined) {
        updateFields.push('email = ?');
        values.push(input.email);
      }
      if (input.telefono !== undefined) {
        updateFields.push('telefono = ?');
        values.push(input.telefono);
      }
      if (input.tipo_documento !== undefined) {
        updateFields.push('tipo_documento = ?');
        values.push(input.tipo_documento);
      }
      if (input.nacionalidad !== undefined) {
        updateFields.push('nacionalidad = ?');
        values.push(input.nacionalidad);
      }
      if (input.genero !== undefined) {
        updateFields.push('genero = ?');
        values.push(input.genero);
      }

      if (updateFields.length > 0) {
        values.push(id);
        await this.connection.execute(
          `UPDATE persona SET ${updateFields.join(', ')} WHERE persona_id = ?`,
          values
        );
      }
    }

    // Devolver el cliente actualizado
    return this.getById({ id });
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM cliente WHERE persona_id = ?`,
      [id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }
}
