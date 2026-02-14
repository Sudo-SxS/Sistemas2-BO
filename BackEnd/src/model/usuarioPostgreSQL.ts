// ============================================
// model/usuarioPostgreSQL.ts
// VERSIÓN CORREGIDA - Todos los errores de sintaxis arreglados
// ============================================
import { PostgresClient } from "../database/PostgreSQL.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
} from "../schemas/persona/User.ts";
import { RowPermisos } from "../types/userAuth.ts";
import { logger } from "../Utils/logger.ts";

export class UsuarioPostgreSQL implements UserModelDB {
  public connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  // ======================
  // BASE QUERY
  // ======================
  private baseSelect = `
    SELECT
      u.persona_id,
      u.legajo,
      u.rol,
      u.exa,
      u.celula,
      u.estado,
      p.nombre,
      p.apellido,
      p.email,
      p.documento,
      p.tipo_documento,
      p.telefono,
      p.fecha_nacimiento,
      p.nacionalidad,
      p.genero,
      STRING_AGG(pe.nombre, ', ' ORDER BY pe.nombre) AS permisos
    FROM usuario u
    INNER JOIN persona p ON p.persona_id = u.persona_id
    LEFT JOIN permisos_has_usuario phu ON phu.persona_id = u.persona_id
    LEFT JOIN permisos pe ON pe.permisos_id = phu.permisos_id
  `;

  // ======================
  // MAPPER - MEJORADO CON queryObject
  // ======================
  private mapPermisos(row: any): Usuario {
    return {
      persona_id: row.persona_id,
      legajo: row.legajo,
      rol: row.rol,
      exa: row.exa,
      celula: row.celula,
      estado: row.estado,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      documento: row.documento,
      tipo_documento: row.tipo_documento,
      telefono: row.telefono,
      fecha_nacimiento: row.fecha_nacimiento,
      nacionalidad: row.nacionalidad,
      genero: row.genero,
      permisos: row.permisos ? row.permisos.split(", ") : [],
    } as Usuario;
  }

  // ======================
  // MÉTODOS DE LOGGING
  // ======================
  private logSuccess(message: string, details?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.info(`${message} ${details ? JSON.stringify(details) : ""}`);
    } else {
      logger.info(message);
    }
  }

  private logWarning(message: string, details?: any): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.warn(`${message} ${details ? JSON.stringify(details) : ""}`);
    } else {
      logger.warn(message);
    }
  }

  private logError(message: string, error?: any, throwInDev = false): void {
    const isDev = Deno.env.get("MODO") === "development";
    if (isDev) {
      logger.error(`${message} ${error ? JSON.stringify(error) : ""}`);
    } else {
      logger.error(message);
    }
    if (throwInDev) {
      throw new Error(message);
    }
  }

  private esPermisoValido(permiso: string): boolean {
    const PERMISOS_VALIDOS = [
      "SUPERADMIN",
      "ADMIN",
      "SUPERVISOR",
      "BACK_OFFICE",
      "VENDEDOR",
    ];
    return PERMISOS_VALIDOS.includes(permiso.trim().toUpperCase());
  }

  // ======================
  // GET ALL
  // ======================
  async getAll({
    page = 1,
    limit = 10,
    name,
    email,
  }: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Usuario[]> {
    if (page < 1 || limit < 1) {
      throw new Error("page y limit deben ser mayores a 0");
    }

    const offset = (page - 1) * limit;
    const params: any[] = [];
    let query = this.baseSelect + " WHERE 1=1";

    if (name) {
      query += ` AND (p.nombre ILIKE $${params.length + 1}
                    OR p.apellido ILIKE $${params.length + 2})`;
      params.push(`%${name}%`, `%${name}%`);
    }

    if (email) {
      query += ` AND p.email ILIKE $${params.length + 1}`;
      params.push(`%${email}%`);
    }

    query += `
      GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento,
                p.tipo_documento, p.telefono, p.fecha_nacimiento,
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa,
                u.celula, u.estado
      LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}
     `;

    params.push(limit, offset);

    const client = this.connection.getClient();
    const result = await client.queryObject(query, params);

    return result.rows.map(this.mapPermisos);
  }

  // ======================
  // GET BY ID
  // ======================
  async getById({ id }: { id: string }): Promise<Usuario | undefined> {
    if (!id) {
      throw new Error("ID requerido");
    }

    const client = this.connection.getClient();
    const result = await client.queryObject(
      `${this.baseSelect}
       WHERE u.persona_id = $1
        GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento,
                 p.tipo_documento, p.telefono, p.fecha_nacimiento,
                 p.nacionalidad, p.genero, u.legajo, u.rol, u.exa,
                 u.celula, u.estado
       `,
      [id],
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapPermisos(result.rows[0]);
  }

  // ======================
  // GET BY EMAIL
  // ======================
  async getByEmail({ email }: { email: string }): Promise<Usuario | undefined> {
    if (!email) {
      throw new Error("Email requerido");
    }

    const client = this.connection.getClient();
    const result = await client.queryObject(
      `${this.baseSelect}
       WHERE p.email = $1
       GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento,
                p.tipo_documento, p.telefono, p.fecha_nacimiento,
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa,
                u.celula, u.estado
       `,
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) return undefined;

    return this.mapPermisos(result.rows[0]);
  }

  // ======================
  // GET BY LEGAJO
  // ======================
  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<Usuario | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `${this.baseSelect}
       WHERE u.legajo = $1
        GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento,
                 p.tipo_documento, p.telefono, p.fecha_nacimiento,
                 p.nacionalidad, p.genero, u.legajo, u.rol, u.exa,
                 u.celula, u.estado
       `,
      [legajo],
    );

    if (!result.rows || result.rows.length === 0) return undefined;

    return this.mapPermisos(result.rows[0]);
  }

  // ======================
  // GET BY EXA
  // ======================
  async getByExa({ exa }: { exa: string }): Promise<Usuario | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `${this.baseSelect}
       WHERE u.exa = $1
        GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento,
                 p.tipo_documento, p.telefono, p.fecha_nacimiento,
                 p.nacionalidad, p.genero, u.legajo, u.rol, u.exa,
                 u.celula, u.estado
       `,
      [exa],
    );

    if (!result.rows || result.rows.length === 0) return undefined;

    return this.mapPermisos(result.rows[0]);
  }

  // ======================
  // UPDATE PASSWORD
  // ======================
  async updatePassword(params: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean> {
    const { id, newPasswordHash } = params;

    if (!id || !newPasswordHash) {
      throw new Error("ID y nuevo hash requeridos");
    }

    const client = this.connection.getClient();

    const result = await client.queryObject(
      `UPDATE password
       SET password_hash = $2, fecha_creacion = $3
       WHERE usuario_persona_id = $1 AND activa = true
       RETURNING password_id`,
      [id, newPasswordHash, new Date()],
    );

    if (!result.rows || result.rows.length === 0) {
      this.logError("Error al actualizar contraseña", { id });
      return false;
    }

    this.logSuccess("Contraseña actualizada exitosamente", { id });
    return true;
  }

  // ======================
  // GET PASSWORD HASH
  // ======================
  async getPasswordHash({ id }: { id: string }): Promise<string | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `SELECT password_hash
       FROM password p
       INNER JOIN usuario u ON p.usuario_persona_id = u.persona_id
       WHERE u.persona_id = $1 AND p.activa = true
       ORDER BY p.fecha_creacion DESC
       LIMIT 1`,
      [id],
    );

    if (!result.rows || result.rows.length === 0) {
      return undefined;
    }

    const row: any = result.rows[0];
    return row.password_hash as string;
  }

  // ======================
  // GET PASSWORD HISTORY
  // ======================
  async getPasswordHistory(
    { id, limit = 10 }: { id: string; limit?: number },
  ): Promise<Array<{ password_hash: string; fecha_creacion: Date }>> {
    const client = this.connection.getClient();
    const limitValue = limit || 10;

    const result = await client.queryObject(
      `SELECT password_hash, fecha_creacion
       FROM password
       WHERE usuario_persona_id = $1
       ORDER BY fecha_creacion DESC
       LIMIT $2`,
      [id, limitValue],
    );

    return (result.rows || []).map((row: any) => ({
      password_hash: row.password_hash,
      fecha_creacion: row.fecha_creacion,
    }));
  }

  // ======================
  // IS PASSWORD USED BEFORE
  // ======================
  async isPasswordUsedBefore(
    { id, passwordHash }: { id: string; passwordHash: string },
  ): Promise<boolean> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `SELECT 1
       FROM password
       WHERE usuario_persona_id = $1 AND password_hash = $2`,
      [id, passwordHash],
    );

    return result.rows.length > 0;
  }

  // ======================
  // GET FAILED ATTEMPTS
  // ======================
  async getFailedAttemptsDB({ id }: { id: string }): Promise<number> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `SELECT p.intentos_fallidos
      FROM password p
      INNER JOIN usuario u ON p.usuario_persona_id = u.persona_id
      WHERE p.usuario_persona_id = $1
      ORDER BY p.fecha_creacion DESC
      LIMIT 1;`,
      [id],
    );

    if (!result.rows || result.rows.length === 0) {
      return 0;
    }

    const row: any = result.rows[0];
    return (row.intentos_fallidos as number) || 0;
  }

  // ======================
  // INCREMENT FAILED ATTEMPTS
  // ======================
  async incrementFailedAttemptsDB({ id }: { id: string }): Promise<void> {
    const currentAttempts = await this.getFailedAttemptsDB({ id });
    const newAttempts = currentAttempts + 1;

    const client = this.connection.getClient();
    await client.queryObject(
      `UPDATE password
             SET intentos_fallidos = $1
             WHERE usuario_persona_id = $2`,
      [newAttempts, id],
    );
  }

  // ======================
  // RESET FAILED ATTEMPTS
  // ======================
  async resetFailedAttemptsDB({ id }: { id: string }): Promise<void> {
    const client = this.connection.getClient();
    await client.queryObject(
      `UPDATE password
             SET intentos_fallidos = 0
             WHERE usuario_persona_id = $1`,
      [id],
    );
  }

  // ======================
  // ADD METHOD
  // ======================
  async add({ input }: { input: UsuarioCreate }): Promise<Usuario> {
    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando creación de usuario", {
        email: input.email,
        legajo: input.legajo,
      });

      await client.queryObject("BEGIN");

      try {
        const personaId = crypto.randomUUID();
        const now = new Date();

        // 1. Insertar persona
        await client.queryObject(
          `INSERT INTO persona (
            persona_id, nombre, apellido, fecha_nacimiento,
            documento, email, creado_en, telefono,
            tipo_documento, nacionalidad, genero
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            personaId,
            input.nombre,
            input.apellido,
            input.fecha_nacimiento,
            input.documento,
            input.email.toLowerCase(),
            now,
            input.telefono ?? null,
            input.tipo_documento,
            input.nacionalidad,
            input.genero ?? "OTRO",
          ],
        );

        this.logSuccess("Persona creada exitosamente", { personaId });

        // 2. Insertar usuario (SIN password_hash)
        await client.queryObject(
          `INSERT INTO usuario (
            persona_id, legajo, rol, exa,
            celula, estado
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            personaId,
            input.legajo,
            input.rol,
            input.exa,
            input.celula,
            input.estado ?? "ACTIVO",
          ],
        );

        this.logSuccess("Usuario creado exitosamente", {
          personaId,
          legajo: input.legajo,
        });

        // 3. Insertar contraseña en tabla password (activa = true)
        await client.queryObject(
          `INSERT INTO password (
            password_hash, usuario_persona_id, fecha_creacion, activa
          ) VALUES ($1, $2, $3, $4)`,
          [input.password_hash, personaId, now, true],
        );

        this.logSuccess("Contraseña creada exitosamente", { personaId });

        // 4. Insertar permisos
        if (input.permisos && input.permisos.length > 0) {
          const permisosIds = await this.consultarPermisos(input.permisos);

          if (permisosIds.length === 0) {
            this.logWarning("No se encontraron permisos válidos", {
              permisos: input.permisos,
            });
          }

          for (const permisoId of permisosIds) {
            await client.queryObject(
              `INSERT INTO permisos_has_usuario (permisos_id, persona_id)
               VALUES ($1, $2)`,
              [permisoId, personaId],
            );
          }

          this.logSuccess("Permisos asignados exitosamente", {
            personaId,
            permisosCount: permisosIds.length,
            permisos: input.permisos,
          });
        } else {
          this.logWarning("No se proporcionaron permisos", { personaId });
        }

        // 5. Insertar en tabla específica del rol
        if (input.rol === "VENDEDOR") {
          await client.queryObject(
            `INSERT INTO vendedor (usuario_id) VALUES ($1)`,
            [personaId],
          );
        } else if (input.rol === "SUPERVISOR") {
          await client.queryObject(
            `INSERT INTO supervisor (usuario_id) VALUES ($1)`,
            [personaId],
          );
        } else if (input.rol === "BACK_OFFICE") {
          await client.queryObject(
            `INSERT INTO back_office (usuario) VALUES ($1)`,
            [personaId],
          );
        }

        this.logSuccess("Rol específico creado exitosamente", {
          personaId,
          rol: input.rol,
        });

        await client.queryObject("COMMIT");

        const usuario = await this.getById({ id: personaId });
        if (!usuario) {
          throw new Error("Usuario no recuperado después de la creación");
        }

        this.logSuccess("Usuario creado exitosamente", {
          personaId,
          email: input.email,
        });
        return usuario;
      } catch (error) {
        await client.queryObject("ROLLBACK");
        this.logError(
          "Error durante transacción de creación, haciendo rollback",
          error,
        );
        throw error;
      }
    } catch (error) {
      this.logError("Error al crear usuario", error);
      throw error;
    }
  }

  // ======================
  // CONSULTAR PERMISOS
  // ======================
  private async consultarPermisos(permisos: string[]): Promise<number[]> {
    const client = this.connection.getClient();

    const placeholders = permisos.map((_, index) => `$${index + 1}`).join(",");

    const result = await client.queryObject(
      `SELECT permisos_id
       FROM permisos
       WHERE nombre IN (${placeholders})`,
      permisos,
    );

    if (!result.rows || result.rows.length === 0) {
      this.logWarning("No se encontraron permisos en la BD", { permisos });
      return [];
    }

    return result.rows.map((row: any) => row.permisos_id as number);
  }

  // ======================
  // UPDATE METHOD
  // ======================
  async update(params: {
    id: string;
    input: Partial<Usuario>;
  }): Promise<Usuario | undefined> {
    const { id, input } = params;

    if (!id) {
      throw new Error("ID requerido para actualizar usuario");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando actualización de usuario", { id, input });

      // Verificar que el usuario existe
      const existingUser = await this.getById({ id });
      if (!existingUser) {
        this.logWarning("Usuario no encontrado para actualizar", { id });
        return undefined;
      }

      // Separar campos de persona y usuario
      const personaUpdates: string[] = [];
      const usuarioUpdates: string[] = [];
      const queryParams: any[] = [id];
      let paramCount = 1;

      // Campos de persona
      if (input.nombre !== undefined) {
        paramCount++;
        personaUpdates.push(`nombre = $${paramCount}`);
        queryParams.push(input.nombre);
      }
      if (input.apellido !== undefined) {
        paramCount++;
        personaUpdates.push(`apellido = $${paramCount}`);
        queryParams.push(input.apellido);
      }
      if (input.email !== undefined) {
        paramCount++;
        personaUpdates.push(`email = $${paramCount}`);
        queryParams.push(input.email);
      }
      if (input.documento !== undefined) {
        paramCount++;
        personaUpdates.push(`documento = $${paramCount}`);
        queryParams.push(input.documento);
      }
      if (input.tipo_documento !== undefined) {
        paramCount++;
        personaUpdates.push(`tipo_documento = $${paramCount}`);
        queryParams.push(input.tipo_documento);
      }
      if (input.telefono !== undefined) {
        paramCount++;
        personaUpdates.push(`telefono = $${paramCount}`);
        queryParams.push(input.telefono);
      }
      if (input.fecha_nacimiento !== undefined) {
        paramCount++;
        personaUpdates.push(`fecha_nacimiento = $${paramCount}`);
        queryParams.push(input.fecha_nacimiento);
      }
      if (input.nacionalidad !== undefined) {
        paramCount++;
        personaUpdates.push(`nacionalidad = $${paramCount}`);
        queryParams.push(input.nacionalidad);
      }
      if (input.genero !== undefined) {
        paramCount++;
        personaUpdates.push(`genero = $${paramCount}`);
        queryParams.push(input.genero);
      }

      // Campos de usuario
      if (input.legajo !== undefined) {
        paramCount++;
        usuarioUpdates.push(`legajo = $${paramCount}`);
        queryParams.push(input.legajo);
      }
      if (input.rol !== undefined) {
        paramCount++;
        usuarioUpdates.push(`rol = $${paramCount}`);
        queryParams.push(input.rol);
      }
      if (input.exa !== undefined) {
        paramCount++;
        usuarioUpdates.push(`exa = $${paramCount}`);
        queryParams.push(input.exa);
      }
      if (input.celula !== undefined) {
        paramCount++;
        usuarioUpdates.push(`celula = $${paramCount}`);
        queryParams.push(input.celula);
      }
      if (input.estado !== undefined) {
        paramCount++;
        usuarioUpdates.push(`estado = $${paramCount}`);
        queryParams.push(input.estado);
      }

      // Ejecutar actualizaciones
      if (personaUpdates.length > 0) {
        const personaQuery = `
          UPDATE persona
          SET ${personaUpdates.join(", ")}
          WHERE persona_id = $1
        `;
        await client.queryObject(personaQuery, queryParams);
        this.logSuccess("Datos de persona actualizados", { id });
      }

      if (usuarioUpdates.length > 0) {
        const usuarioQuery = `
          UPDATE usuario
          SET ${usuarioUpdates.join(", ")}
          WHERE persona_id = $1
        `;
        await client.queryObject(usuarioQuery, queryParams);
        this.logSuccess("Datos de usuario actualizados", { id });
      }

      // Retornar el usuario actualizado
      const updatedUser = await this.getById({ id });
      this.logSuccess("Usuario actualizado exitosamente", { id });
      return updatedUser;
    } catch (error) {
      this.logError("Error al actualizar usuario", error);
      throw error;
    }
  }

  // ======================
  // DELETE METHOD
  // ======================
  async delete(params: { id: string }): Promise<boolean> {
    const { id } = params;

    if (!id) {
      throw new Error("ID requerido para eliminar usuario");
    }

    const client = this.connection.getClient();

    try {
      this.logSuccess("Iniciando eliminación de usuario", { id });

      // Verificar que el usuario existe
      const existingUser = await this.getById({ id });
      if (!existingUser) {
        this.logWarning("Usuario no encontrado para eliminar", { id });
        return false;
      }

      // Usar transacción para eliminar todos los datos relacionados
      await client.queryObject("BEGIN");

      try {
        // 1. Eliminar permisos del usuario
        await client.queryObject(
          `DELETE FROM permisos_has_usuario WHERE persona_id = $1`,
          [id],
        );

        // 2. Eliminar historial de contraseñas
        await client.queryObject(
          `DELETE FROM password WHERE usuario_persona_id = $1`,
          [id],
        );

        // 3. Eliminar el registro de usuario
        const usuarioResult = await client.queryObject(
          `DELETE FROM usuario WHERE persona_id = $1 RETURNING persona_id`,
          [id],
        );

        // 4. Eliminar el registro de persona
        if (usuarioResult.rows.length > 0) {
          await client.queryObject(
            `DELETE FROM persona WHERE persona_id = $1`,
            [id],
          );
        }

        await client.queryObject("COMMIT");

        this.logSuccess("Usuario eliminado exitosamente", { id });
        return true;
      } catch (error) {
        await client.queryObject("ROLLBACK");
        this.logError(
          "Error durante transacción de eliminación, haciendo rollback",
          error,
        );
        throw error;
      }
    } catch (error) {
      this.logError("Error al eliminar usuario", error);
      throw error;
    }
  }
}
