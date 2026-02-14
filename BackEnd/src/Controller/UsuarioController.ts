import {
  UsuarioSecurity,
  UsuarioUpdate,
  UsuarioUpdateSchema,
} from "../schemas/persona/User.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { UsuarioService } from "../services/UsuarioService.ts";
import { manejoDeError } from "../Utils/errores.ts";
import { load } from "dotenv";

const initEnv = await load({ export: true });

/**
 * Controlador de Usuario
 *
 * Gestiona las operaciones CRUD de usuarios y actúa como intermediario
 * entre las rutas (router) y la capa de servicio.
 *
 * Responsabilidades:
 * - Validar datos de entrada con Zod
 * - Coordinar llamadas al servicio
 * - Manejar errores de forma consistente
 * - Formatear respuestas
 *
 * @class UsuarioController
 */
export class UsuarioController {
  private modeUser: UserModelDB;
  private service: UsuarioService;

  /**
   * Constructor del controlador
   * @param {UserModelDB} modeUser - Modelo de base de datos para operaciones de usuario
   */
  constructor(modeUser: UserModelDB) {
    this.modeUser = modeUser;
    this.service = new UsuarioService(modeUser);
  }

  /**
   * Obtiene todos los usuarios con paginación y filtros
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} [params.page=1] - Número de página
   * @param {number} [params.limit=10] - Cantidad de resultados por página
   * @param {string} [params.name] - Filtro por nombre/apellido
   * @param {string} [params.email] - Filtro por email
   * @returns {Promise<UsuarioSecurity[]>} Array de usuarios sin datos sensibles
   * @throws {Error} Si ocurre un error en la operación
   *
   * @example
   * const usuarios = await controller.getAll({ page: 1, limit: 20 });
   */
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<UsuarioSecurity[]> {
    try {
      // Establecer valores por defecto para paginación
      const page = params.page || 1;
      const limit = params.limit || 10;

      // Validar que los valores de paginación sean positivos
      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      // Validar límite máximo para prevenir sobrecarga
      if (limit > 100) {
        throw new Error("El límite máximo es 100 usuarios por página");
      }

      console.log(
        `[INFO] Obteniendo usuarios - Página: ${page}, Límite: ${limit}`,
      );

      // Obtener usuarios del servicio
      const usuarios = await this.service.getAll({
        page,
        limit,
        name: params.name,
        email: params.email,
      });

      // Si no hay usuarios, retornar array vacío
      if (!usuarios) {
        return [];
      }

      console.log(`[INFO] ${usuarios.length} usuarios encontrados`);

      return usuarios;
    } catch (error) {
      manejoDeError("Error al obtener todos los usuarios", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario específico por su ID
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.id - UUID del usuario
   * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
   * @throws {Error} Si el usuario no existe o hay un error
   *
   * @example
   * const usuario = await controller.getById({ id: "uuid-here" });
   */
  async getById({ id }: { id: string }): Promise<UsuarioSecurity> {
    try {
      // Validar que el ID no esté vacío
      if (!id || id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      console.log(`[INFO] Buscando usuario por ID: ${id}`);

      // Buscar usuario en el servicio
      const usuario = await this.service.getById({ id });

      // Validar que el usuario existe
      if (!usuario) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      console.log(`[INFO] Usuario encontrado: ${usuario.email}`);

      return usuario;
    } catch (error) {
      manejoDeError("Error al obtener usuario por ID", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su email
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.email - Email del usuario
   * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
   * @throws {Error} Si el usuario no existe o hay un error
   *
   * @example
   * const usuario = await controller.getByEmail({ email: "user@example.com" });
   */
  async getByEmail({ email }: { email: string }): Promise<UsuarioSecurity> {
    try {
      // Validar que el email no esté vacío
      if (!email || email.trim() === "") {
        throw new Error("Email requerido");
      }

      // Validar formato básico de email
      if (!email.includes("@")) {
        throw new Error("Formato de email inválido");
      }

      console.log(`[INFO] Buscando usuario por email: ${email}`);

      // Buscar usuario en el servicio
      const usuario = await this.service.getByEmail({
        email: email.toLowerCase(),
      });

      // Validar que el usuario existe
      if (!usuario) {
        throw new Error(`Usuario con email ${email} no encontrado`);
      }

      return usuario;
    } catch (error) {
      manejoDeError("Error al obtener usuario por email", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su legajo
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.legajo - Legajo del usuario (5 caracteres)
   * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
   * @throws {Error} Si el usuario no existe o hay un error
   *
   * @example
   * const usuario = await controller.getByLegajo({ legajo: "00001" });
   */
  async getByLegajo({ legajo }: { legajo: string }): Promise<UsuarioSecurity> {
    try {
      // Validar que el legajo no esté vacío
      if (!legajo || legajo.trim() === "") {
        throw new Error("Legajo requerido");
      }

      // Validar formato de legajo
      if (legajo.length !== 5) {
        throw new Error("El legajo debe tener exactamente 5 caracteres");
      }

      console.log(`[INFO] Buscando usuario por legajo: ${legajo}`);

      // Buscar usuario en el servicio
      const usuario = await this.service.getByLegajo({ legajo });

      // Validar que el usuario existe
      if (!usuario) {
        throw new Error(`Usuario con legajo ${legajo} no encontrado`);
      }

      return usuario;
    } catch (error) {
      manejoDeError("Error al obtener usuario por legajo", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su código EXA
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.exa - Código EXA del usuario (8 caracteres)
   * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
   * @throws {Error} Si el usuario no existe o hay un error
   *
   * @example
   * const usuario = await controller.getByExa({ exa: "AB123456" });
   */
  async getByExa({ exa }: { exa: string }): Promise<UsuarioSecurity> {
    try {
      // Validar que el EXA no esté vacío
      if (!exa || exa.trim() === "") {
        throw new Error("Código EXA requerido");
      }

      // Validar formato de EXA
      if (exa.length !== 8) {
        throw new Error("El código EXA debe tener exactamente 8 caracteres");
      }

      console.log(`[INFO] Buscando usuario por EXA: ${exa}`);

      // Buscar usuario en el servicio
      const usuario = await this.service.getByExa({
        exa: exa.toUpperCase(),
      });

      // Validar que el usuario existe
      if (!usuario) {
        throw new Error(`Usuario con EXA ${exa} no encontrado`);
      }

      return usuario;
    } catch (error) {
      manejoDeError("Error al obtener usuario por EXA", error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario existente
   *
   * Realiza una actualización parcial, solo modificando los campos proporcionados.
   * No permite actualizar password_hash ni legajo.
   *
   * @param {Object} params - Parámetros de actualización
   * @param {string} params.id - UUID del usuario a actualizar
   * @param {Partial<UsuarioUpdate>} params.input - Datos a actualizar
   * @returns {Promise<UsuarioSecurity>} Usuario actualizado sin datos sensibles
   * @throws {Error} Si el usuario no existe, los datos son inválidos o hay un error
   *
   * @example
   * const usuarioActualizado = await controller.update({
   *   id: "uuid-here",
   *   input: { telefono: "1234567890", estado: "INACTIVO" }
   * });
   */
  async update(params: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<UsuarioSecurity> {
    try {
      // Validar que el ID no esté vacío
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      // Validar que haya datos para actualizar
      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      console.log(`[INFO] Actualizando usuario: ${params.id}`);

      // Validar datos de entrada con Zod
      const validatedInput = UsuarioUpdateSchema.partial().parse(params.input);

      // Normalizar datos (si es necesario)
      if (validatedInput.email) {
        validatedInput.email = validatedInput.email.toLowerCase();
      }
      if (validatedInput.nombre) {
        validatedInput.nombre = validatedInput.nombre.toUpperCase();
      }
      if (validatedInput.apellido) {
        validatedInput.apellido = validatedInput.apellido.toUpperCase();
      }
      if (validatedInput.exa) {
        validatedInput.exa = validatedInput.exa.toUpperCase();
      }
      if (validatedInput.tipo_documento) {
        validatedInput.tipo_documento = validatedInput.tipo_documento
          .toUpperCase();
      }
      if (validatedInput.nacionalidad) {
        validatedInput.nacionalidad = validatedInput.nacionalidad.toUpperCase();
      }

      // Actualizar usuario en el servicio
      const usuarioActualizado = await this.service.update({
        id: params.id,
        input: validatedInput,
      });

      // Validar que la actualización fue exitosa
      if (!usuarioActualizado) {
        throw new Error("Error al actualizar usuario");
      }

      console.log(
        `[INFO] Usuario actualizado exitosamente: ${usuarioActualizado.email}`,
      );

      return usuarioActualizado;
    } catch (error) {
      manejoDeError("Error al actualizar usuario", error);
      throw error;
    }
  }

  /**
   * Elimina un usuario de forma permanente
   *
   * ⚠️ ADVERTENCIA: Esta operación es irreversible
   *
   * @param {Object} params - Parámetros de eliminación
   * @param {string} params.id - UUID del usuario a eliminar
   * @returns {Promise<void>}
   * @throws {Error} Si el usuario no existe o hay un error
   *
   * @example
   * await controller.delete({ id: "uuid-here" });
   */
  async delete({ id }: { id: string }): Promise<void> {
    try {
      // Validar que el ID no esté vacío
      if (!id || id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      console.log(`[INFO] Eliminando usuario: ${id}`);

      // Verificar que el usuario existe antes de eliminar
      const usuario = await this.service.getById({ id });
      if (!usuario) {
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }

      // Eliminar usuario en el servicio
      await this.service.delete({ id });

      console.log(`[INFO] Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      manejoDeError("Error al eliminar usuario", error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario existe por email, legajo o EXA
   *
   * Útil para validaciones de unicidad antes de crear usuarios.
   *
   * @param {Object} params - Parámetros de verificación
   * @param {string} [params.email] - Email a verificar
   * @param {string} [params.legajo] - Legajo a verificar
   * @param {string} [params.exa] - Código EXA a verificar
   * @returns {Promise<{exists: boolean, field?: string}>} Resultado de la verificación
   *
   * @example
   * const resultado = await controller.exists({ email: "user@example.com" });
   * if (resultado.exists) {
   *   console.log(`Usuario ya existe por: ${resultado.field}`);
   * }
   */
  async exists(params: {
    email?: string;
    legajo?: string;
    exa?: string;
  }): Promise<{ exists: boolean; field?: string }> {
    try {
      // Validar que al menos un parámetro esté presente
      if (!params.email && !params.legajo && !params.exa) {
        throw new Error("Debe proporcionar al menos un campo para verificar");
      }

      console.log("[INFO] Verificando existencia de usuario");

      // Verificar existencia en el servicio
      const resultado = await this.service.exists({
        email: params.email?.toLowerCase(),
        legajo: params.legajo,
        exa: params.exa?.toUpperCase(),
      });

      if (resultado.exists) {
        console.log(
          `[INFO] Usuario existente encontrado por: ${resultado.field}`,
        );
      } else {
        console.log("[INFO] Usuario no existe");
      }

      return resultado;
    } catch (error) {
      manejoDeError("Error al verificar existencia de usuario", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de usuarios por rol
   *
   * @returns {Promise<{total: number, porRol: Record<string, number>}>} Estadísticas
   *
   * @example
   * const stats = await controller.getStats();
   * console.log(`Total: ${stats.total}, Supervisores: ${stats.porRol.SUPERVISOR}`);
   */
  async getStats(): Promise<{
    total: number;
    porRol: Record<string, number>;
    porEstado: Record<string, number>;
  }> {
    try {
      console.log("[INFO] Obteniendo estadísticas de usuarios");

      // Obtener todos los usuarios
      const usuarios = await this.service.getAll({ page: 1, limit: 10000 });

      if (!usuarios || usuarios.length === 0) {
        return {
          total: 0,
          porRol: {},
          porEstado: {},
        };
      }

      // Calcular estadísticas
      const porRol: Record<string, number> = {};
      const porEstado: Record<string, number> = {};

      usuarios.forEach((usuario) => {
        // Contar por rol
        porRol[usuario.rol] = (porRol[usuario.rol] || 0) + 1;

        // Contar por estado
        porEstado[usuario.estado] = (porEstado[usuario.estado] || 0) + 1;
      });

      const stats = {
        total: usuarios.length,
        porRol,
        porEstado,
      };

      console.log(`[INFO] Estadísticas calculadas: ${stats.total} usuarios`);

      return stats;
    } catch (error) {
      manejoDeError("Error al obtener estadísticas", error);
      throw error;
    }
  }

  /**
   * Cambia el estado de un usuario (ACTIVO, INACTIVO, SUSPENDIDO)
   *
   * @param {Object} params - Parámetros de cambio de estado
   * @param {string} params.id - UUID del usuario
   * @param {string} params.estado - Nuevo estado (ACTIVO, INACTIVO, SUSPENDIDO)
   * @returns {Promise<UsuarioSecurity>} Usuario actualizado
   * @throws {Error} Si el usuario no existe o el estado es inválido
   *
   * @example
   * await controller.changeStatus({ id: "uuid-here", estado: "SUSPENDIDO" });
   */
  async changeStatus(params: {
    id: string;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
  }): Promise<UsuarioSecurity> {
    try {
      // Validar parámetros
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      const estadosValidos = ["ACTIVO", "INACTIVO", "SUSPENDIDO"];
      if (!estadosValidos.includes(params.estado)) {
        throw new Error(
          `Estado inválido. Debe ser uno de: ${estadosValidos.join(", ")}`,
        );
      }

      console.log(
        `[INFO] Cambiando estado de usuario ${params.id} a ${params.estado}`,
      );

      // Actualizar solo el estado
      const usuarioActualizado = await this.service.update({
        id: params.id,
        input: { estado: params.estado },
      });

      if (!usuarioActualizado) {
        throw new Error("Error al cambiar estado de usuario");
      }

      console.log(`[INFO] Estado actualizado exitosamente`);

      return usuarioActualizado;
    } catch (error) {
      manejoDeError("Error al cambiar estado de usuario", error);
      throw error;
    }
  }
}
