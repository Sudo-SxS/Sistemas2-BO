// model/celulaPostgreSQL.ts

import { CelulaModelDB, Celula, CelulaCreate } from "../interface/Celula.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class CelulaPostgreSQL implements CelulaModelDB {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  private async safeQuery<T>(query: string, params: any[] = []): Promise<T> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryObject(query, params);
      return result.rows as T;
    } catch (error) {
      logger.error("CelulaPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<Celula[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<Celula[]>(
      `SELECT * FROM celula ORDER BY id_celula LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result || [];
  }

  async getById({ id }: { id: number }): Promise<Celula | undefined> {
    const result = await this.safeQuery<Celula[]>(
      `SELECT * FROM celula WHERE id_celula = $1`,
      [id]
    );

    return result?.[0];
  }

  async getByEmpresa({ empresa }: { empresa: number }): Promise<Celula[]> {
    const result = await this.safeQuery<Celula[]>(
      `SELECT * FROM celula WHERE empresa = $1 ORDER BY id_celula`,
      [empresa]
    );

    return result || [];
  }

  async getAsesoresByCelula({ id_celula }: { id_celula: number }): Promise<any[]> {
    const client = this.connection.getClient();
    
    const query = `
      SELECT 
        u.persona_id,
        p.nombre,
        p.apellido,
        p.email,
        p.telefono,
        u.legajo,
        u.exa,
        u.rol,
        u.estado
      FROM usuario u
      INNER JOIN persona p ON u.persona_id = p.persona_id
      WHERE u.celula = $1 
      AND u.rol IN ('VENDEDOR', 'SUPERVISOR')
      AND u.estado = 'ACTIVO'
      ORDER BY p.apellido, p.nombre
    `;

    try {
      const result = await client.queryObject(query, [id_celula]);
      return result.rows || [];
    } catch (error) {
      logger.error("CelulaPostgreSQL.getAsesoresByCelula:", error);
      throw error;
    }
  }

  async checkExists({ id }: { id: number }): Promise<boolean> {
    const result = await this.safeQuery<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM celula WHERE id_celula = $1`,
      [id]
    );

    return (result?.[0]?.count || 0) > 0;
  }

  async add({ input }: { input: CelulaCreate }): Promise<Celula> {
    const client = this.connection.getClient();
    
    // Verificar si ya existe
    const exists = await this.checkExists({ id: input.id_celula });
    if (exists) {
      throw new Error(`Ya existe una célula con ID ${input.id_celula}`);
    }

    try {
      const result = await client.queryObject<Celula>(
        `INSERT INTO celula (id_celula, empresa, nombre, tipo_cuenta) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [input.id_celula, input.empresa, input.nombre, input.tipo_cuenta]
      );

      logger.info(`Célula ${input.id_celula} creada exitosamente`);
      return result.rows[0];
    } catch (error) {
      logger.error("CelulaPostgreSQL.add:", error);
      throw error;
    }
  }

  async update({ id, input }: { id: number; input: Partial<Celula> }): Promise<Celula | undefined> {
    const client = this.connection.getClient();
    
    // Verificar que existe
    const exists = await this.checkExists({ id });
    if (!exists) {
      throw new Error(`No existe una célula con ID ${id}`);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.empresa !== undefined) {
      updates.push(`empresa = $${paramIndex++}`);
      values.push(input.empresa);
    }
    if (input.nombre !== undefined) {
      updates.push(`nombre = $${paramIndex++}`);
      values.push(input.nombre);
    }
    if (input.tipo_cuenta !== undefined) {
      updates.push(`tipo_cuenta = $${paramIndex++}`);
      values.push(input.tipo_cuenta);
    }

    if (updates.length === 0) {
      throw new Error("No hay campos para actualizar");
    }

    values.push(id);

    try {
      const result = await client.queryObject<Celula>(
        `UPDATE celula SET ${updates.join(", ")} WHERE id_celula = $${paramIndex} RETURNING *`,
        values
      );

      logger.info(`Célula ${id} actualizada exitosamente`);
      return result.rows[0];
    } catch (error) {
      logger.error("CelulaPostgreSQL.update:", error);
      throw error;
    }
  }

  async delete({ id }: { id: number }): Promise<boolean> {
    const client = this.connection.getClient();
    
    // Verificar que existe
    const exists = await this.checkExists({ id });
    if (!exists) {
      throw new Error(`No existe una célula con ID ${id}`);
    }

    try {
      // Primero verificar si hay usuarios asignados a esta célula
      const usuariosResult = await client.queryObject(
        `SELECT COUNT(*) as count FROM usuario WHERE celula = $1`,
        [id]
      );
      
      const usuariosCount = (usuariosResult.rows[0] as { count: number }).count;
      
      if (usuariosCount > 0) {
        throw new Error(`No se puede eliminar la célula ${id} porque tiene ${usuariosCount} usuario(s) asignado(s)`);
      }

      await client.queryObject(
        `DELETE FROM celula WHERE id_celula = $1`,
        [id]
      );

      logger.info(`Célula ${id} eliminada exitosamente`);
      return true;
    } catch (error) {
      logger.error("CelulaPostgreSQL.delete:", error);
      throw error;
    }
  }
}