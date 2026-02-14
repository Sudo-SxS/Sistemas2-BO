// ============================================
// BackEnd/src/model/usuarioMySQL.ts (ACTUALIZADO CON HISTORIAL DE CONTRASEÑAS)
// ============================================
import client from "../../database/MySQL.ts";
import { UserModelDB } from "../../interface/Usuario.ts";
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
} from "../../schemas/persona/User.ts";
import { PermisoRow, RowPermisos } from "../../types/userAuth.ts";
import { logger } from "../../Utils/logger.ts";

export class UsuarioMySQL implements UserModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  // ======================================================
  // BASE QUERY CON PERMISOS
  // ======================================================
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
      GROUP_CONCAT(pe.nombre ORDER BY pe.nombre SEPARATOR ', ') AS permisos
    FROM usuario u
    INNER JOIN persona p ON p.persona_id = u.persona_id
    LEFT JOIN permisos_has_usuario phu ON phu.persona_id = u.persona_id
    LEFT JOIN permisos pe ON pe.permisos_id = phu.permisos_id
  `;

  // ======================================================
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Usuario[] | undefined> {
    const { page = 1, limit = 10, name, email } = params;
    const offset = (page - 1) * limit;

    let query = this.baseSelect + ` WHERE 1=1`;
    const values: (string | number)[] = [];

    if (name) {
      query += ` AND (p.nombre LIKE ? OR p.apellido LIKE ?)`;
      values.push(`%${name}%`, `%${name}%`);
    }

    if (email) {
      query += ` AND p.email LIKE ?`;
      values.push(`%${email}%`);
    }

    query += `
      GROUP BY u.persona_id
      LIMIT ? OFFSET ?
    `;
    values.push(limit, offset);

    const result = await this.connection.execute(query, values);
    if (!result.rows?.length) return undefined;

    return result.rows.map(this.mapPermisos) as Usuario[];
  }

  // ======================================================
  async getById({ id }: { id: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE u.persona_id = ?
      GROUP BY u.persona_id
      `,
      [id],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  async getByEmail({ email }: { email: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE p.email = ?
      GROUP BY u.persona_id
      `,
      [email],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE u.legajo = ?
      GROUP BY u.persona_id
      `,
      [legajo],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  async getByExa({ exa }: { exa: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE u.exa = ?
      GROUP BY u.persona_id
      `,
      [exa],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  // MAPEO permisos string → array
  // ======================================================
  private mapPermisos(row: RowPermisos) {
    return {
      ...row,
      permisos: row.permisos ? row.permisos.split(", ") : [],
    };
  }

  // ======================================================
  // OBTENER IDS DE PERMISOS POR NOMBRE
  // ======================================================
  async consultarPermisos(permisos: string[]): Promise<string[]> {
    if (permisos.length === 0) return [];

    const placeholders = permisos.map(() => "?").join(",");

    const result = await this.connection.execute(
      `
      SELECT permisos_id
      FROM permisos
      WHERE nombre IN (${placeholders})
      `,
      permisos,
    );

    return (result.rows ?? []).map((r: PermisoRow) => r.permisos_id);
  }

  // ======================================================
  // ✅ NUEVO: CREAR USUARIO CON HISTORIAL DE CONTRASEÑAS
  // ======================================================
  async add({ input }: { input: UsuarioCreate }): Promise<Usuario> {
    await this.connection.execute("START TRANSACTION");

    try {
      const personaId = crypto.randomUUID();
      const now = new Date();

      // 1. Insertar persona
      await this.connection.execute(
        `
        INSERT INTO persona (
          persona_id, nombre, apellido, fecha_nacimiento,
          documento, email, creado_en, telefono,
          tipo_documento, nacionalidad, genero
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
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

      // 2. Insertar usuario (SIN password_hash)
      await this.connection.execute(
        `
        INSERT INTO usuario (
          persona_id, legajo, rol, exa,
          celula, estado
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          personaId,
          input.legajo,
          input.rol,
          input.exa,
          input.celula,
          input.estado ?? "ACTIVO",
        ],
      );

      // 3. ✅ NUEVO: Insertar contraseña en tabla password (activa = 1)
      await this.connection.execute(
        `
        INSERT INTO password (
          password_hash, usuario_persona_id, fecha_creacion, activa
        ) VALUES (?, ?, ?, 1)
        `,
        [input.password_hash, personaId, now],
      );

      // 4. Insertar permisos
      const permisosIds = await this.consultarPermisos(input.permisos);
      for (const permisoId of permisosIds) {
        await this.connection.execute(
          `
          INSERT INTO permisos_has_usuario (permisos_id, persona_id)
          VALUES (?, ?)
          `,
          [permisoId, personaId],
        );
      }

      // 5. Insertar en tabla específica del rol
      if (input.rol === "VENDEDOR") {
        await this.connection.execute(
          `INSERT INTO vendedor (usuario_id) VALUES (?)`,
          [personaId],
        );
      } else if (input.rol === "SUPERVISOR") {
        await this.connection.execute(
          `INSERT INTO supervisor (usuario_id) VALUES (?)`,
          [personaId],
        );
      } else if (input.rol === "BACK_OFFICE") {
        await this.connection.execute(
          `INSERT INTO back_office (usuario) VALUES (?)`,
          [personaId],
        );
      }

      await this.connection.execute("COMMIT");

      const usuario = await this.getById({ id: personaId });
      if (!usuario) throw new Error("Usuario no recuperado");

      return usuario;
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  // ======================================================
  async update({
    id,
    input,
  }: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<Usuario | undefined> {
    await this.connection.execute("START TRANSACTION");

    try {
      if (Object.keys(input).length === 0) {
        await this.connection.execute("COMMIT");
        return this.getById({ id });
      }

      // Actualizar permisos si se proporcionan
      if (input.permisos) {
        await this.connection.execute(
          `DELETE FROM permisos_has_usuario WHERE persona_id = ?`,
          [id],
        );

        const permisosIds = await this.consultarPermisos(input.permisos);
        for (const permisoId of permisosIds) {
          await this.connection.execute(
            `
            INSERT INTO permisos_has_usuario (permisos_id, persona_id)
            VALUES (?, ?)
            `,
            [permisoId, id],
          );
        }
      }

      await this.connection.execute("COMMIT");
      return this.getById({ id });
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  // ======================================================
  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM persona WHERE persona_id = ?`,
      [id],
    );
    return !!result.affectedRows;
  }

  // ======================================================
  // ✅ NUEVO: Obtener contraseña activa del usuario
  // ======================================================
  async getPasswordHash({ id }: { id: string }): Promise<string | undefined> {
    const result = await this.connection.execute(
      `
      SELECT pw.password_hash
      FROM password pw
      INNER JOIN usuario u ON pw.usuario_persona_id = u.persona_id
      WHERE pw.usuario_persona_id = ?
        AND pw.activa = 1
      ORDER BY pw.fecha_creacion DESC
      LIMIT 1;
      `,
      [id],
    );
    return result.rows?.[0]?.password_hash;
  }

  // ======================================================
  // ✅ NUEVO: Actualizar contraseña con historial
  // ======================================================
  async updatePassword({
    id,
    newPasswordHash,
  }: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean> {
    await this.connection.execute("START TRANSACTION");

    try {
      const now = new Date();

      // 1. Desactivar todas las contraseñas anteriores
      await this.connection.execute(
        `
        UPDATE password
        SET activa = 0
        WHERE usuario_persona_id = ?
        `,
        [id],
      );

      // 2. Insertar la nueva contraseña como activa
      await this.connection.execute(
        `
        INSERT INTO password (
          password_hash, usuario_persona_id, fecha_creacion, activa
        ) VALUES (?, ?, ?, 1)
        `,
        [newPasswordHash, id, now],
      );

      await this.connection.execute("COMMIT");
      return true;
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      logger.error("updatePassword:", error);
      return false;
    }
  }

  // ======================================================
  // ✅ NUEVO: Verificar si una contraseña ya fue usada
  // ======================================================
  async isPasswordUsedBefore({
    id,
    passwordHash,
  }: {
    id: string;
    passwordHash: string;
  }): Promise<boolean> {
    const result = await this.connection.execute(
      `
      SELECT COUNT(*) as count
      FROM password
      WHERE usuario_persona_id = ? AND password_hash = ?
      `,
      [id, passwordHash],
    );

    const count = result.rows?.[0]?.count || 0;
    return count > 0;
  }

  // ======================================================
  // ✅ NUEVO: Obtener intentos fallidos de DB
  // ======================================================
  async getFailedAttemptsDB({ id }: { id: string }): Promise<number> {
    const result = await this.connection.execute(
      `
      SELECT intentos_fallidos
      FROM password
      WHERE usuario_persona_id = ? AND activa = 1
      `,
      [id],
    );

    return (result.rows?.[0]?.intentos_fallidos as number) || 0;
  }

  // ======================================================
  // ✅ NUEVO: Incrementar intentos fallidos en DB
  // ======================================================
  async incrementFailedAttemptsDB({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `
      UPDATE password
      SET intentos_fallidos = intentos_fallidos + 1
      WHERE usuario_persona_id = ? AND activa = 1
      `,
      [id],
    );

    return !!result.affectedRows;
  }

  // ======================================================
  // ✅ NUEVO: Resetear intentos fallidos en DB
  // ======================================================
  async resetFailedAttemptsDB({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `
      UPDATE password
      SET intentos_fallidos = 0
      WHERE usuario_persona_id = ? AND activa = 1
      `,
      [id],
    );

    return !!result.affectedRows;
  }

  // ======================================================
  // ✅ NUEVO: Obtener historial de contraseñas (últimas N)
  // ======================================================
  async getPasswordHistory({
    id,
    limit = 5,
  }: {
    id: string;
    limit?: number;
  }): Promise<Array<{ password_hash: string; fecha_creacion: Date }>> {
    const result = await this.connection.execute(
      `
      SELECT password_hash, fecha_creacion
      FROM password
      WHERE usuario_persona_id = ?
      ORDER BY fecha_creacion DESC
      LIMIT ?
      `,
      [id, limit],
    );

    return (result.rows || []) as Array<{
      password_hash: string;
      fecha_creacion: Date;
    }>;
  }
}
