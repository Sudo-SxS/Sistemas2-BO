// ============================================
// BackEnd/src/Controller/AuthController.ts (ACTUALIZADO)
// ============================================
import { logger } from "../Utils/logger.ts";
import {
  CambioPassword,
  CambioPasswordAdmin,
  CambioPasswordAdminSchema,
  CambioPasswordSchema,
  UsuarioCreate,
  UsuarioCreateSchema,
  UsuarioLogin,
  UsuarioLoginSchema,
} from "../schemas/persona/User.ts";
import type { AuthenticatedUser, PasswordDataRaw } from "../types/userAuth.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { AuthService } from "../services/AuthService.ts";
import { manejoDeError } from "../Utils/errores.ts";
import { load } from "dotenv";

const initEnv = await load({ export: true });

export class AuthController {
  private modeUser: UserModelDB;
  private authService: AuthService;

  constructor(modeUser: UserModelDB, authService?: AuthService) {
    this.modeUser = modeUser;
    this.authService = authService || new AuthService(modeUser);
  }

  async login(input: { user: UsuarioLogin }) {
    try {
      const email = input.user.email;
      const userOriginal = await this.modeUser.getByEmail({
        email: email.toLowerCase(),
      });

      if (!userOriginal) {
        throw new Error("Correo no encontrado");
      }

      if (!input.user.password) {
        throw new Error("Falta contraseña");
      }

      if (!input.user.email) {
        throw new Error("Falta email");
      }

      const validatedUser = UsuarioLoginSchema.parse(input.user);
      const userLogin = await this.authService.login({ user: validatedUser });

      return userLogin;
    } catch (error) {
      manejoDeError("Error en el login Controller", error);
      throw error;
    }
  }

  async register(input: { user: UsuarioCreate }) {
    try {
      if (!input || !input.user) {
        throw new Error("Datos de usuario no proporcionados");
      }

      const user = input.user;
      const validated = UsuarioCreateSchema.parse(user);

      const userCreate = await this.authService.register({ user: validated });

      if (!userCreate) {
        throw new Error("Error al crear el usuario");
      }

      return userCreate;
    } catch (error) {
      manejoDeError("Error en el registro Controller", error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      if (!token) {
        throw new Error("Token no proporcionado");
      }

      const payload = await this.authService.verifyToken(token);
      return payload;
    } catch (error) {
      manejoDeError("Error en la verificación del token", error);
      throw new Error("Token inválido");
    }
  }

  async refreshToken(oldToken: string) {
    try {
      if (!oldToken) {
        throw new Error("Token no proporcionado");
      }

      const newToken = await this.authService.refreshToken(oldToken);
      return newToken;
    } catch (error) {
      manejoDeError("Error al refrescar token", error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * ✅ ACTUALIZADO: Ahora valida que no se reutilicen contraseñas anteriores
   */
  async changePassword(params: {
    targetUserId: string;
    authenticatedUser: AuthenticatedUser;
    passwordData: PasswordDataRaw;
  }): Promise<void> {
    try {
      const { targetUserId, authenticatedUser, passwordData } = params;

      if (!targetUserId || targetUserId.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      logger.info("Cambio de contraseña solicitado");
      logger.info(
        `Usuario autenticado: ${authenticatedUser.email} (${authenticatedUser.rol})`,
      );
      logger.info(`Usuario objetivo: ${targetUserId}`);

      const isSelfChange = authenticatedUser.id === targetUserId;
      const isAdmin = authenticatedUser.rol === "BACK_OFFICE";

      let validatedData: CambioPassword | CambioPasswordAdmin;

      if (isSelfChange) {
        const result = CambioPasswordSchema.safeParse(passwordData);

        if (!result.success) {
          throw new Error(
            `Validación fallida: ${
              result.error.errors.map((error: { message: string }) => error.message).join(", ")
            }`,
          );
        }

        validatedData = result.data;
      } else if (isAdmin) {
        const result = CambioPasswordAdminSchema.safeParse(passwordData);

        if (!result.success) {
          throw new Error(
            `Validación fallida: ${
              result.error.errors.map((error: { message: string }) => error.message).join(", ")
            }`,
          );
        }

        validatedData = result.data;
      } else {
        throw new Error("No tienes permisos para cambiar esta contraseña");
      }

      await this.authService.changePassword({
        targetUserId,
        authenticatedUserId: authenticatedUser.id,
        authenticatedUserRole: authenticatedUser.rol,
        passwordData: validatedData,
      });

      logger.info("Contraseña cambiada exitosamente");
    } catch (error) {
      logger.error("AuthController.changePassword:", error);
      throw error;
    }
  }

  /**
   * ✅ NUEVO: Obtiene el historial de contraseñas de un usuario
   * Solo para BACK_OFFICE
   */
  async getPasswordHistory(params: {
    userId: string;
    requestingUserId: string;
    requestingUserRole: string;
    limit?: number;
  }): Promise<Array<{ password_hash: string; fecha_creacion: Date; }>> {
    try {
      if (params.requestingUserRole !== "BACK_OFFICE") {
        throw new Error("No tienes permisos para acceder al historial de contraseñas");
      }

      const history = await this.authService.getPasswordHistory(params.userId);
      return history;
    } catch (error) {
      logger.error("AuthController.getPasswordHistory:", error);
      throw error;
      }
   }

  /**
   * Desbloquea una cuenta de usuario (solo admins)
   */
  async unlockAccount(params: {
    targetUserId: string;
    authenticatedUser: AuthenticatedUser;
  }): Promise<void> {
    try {
      const { targetUserId, authenticatedUser } = params;

      if (!targetUserId || targetUserId.trim() === "") {
        throw new Error("ID de usuario requerido");
}

      if (authenticatedUser.rol !== "BACK_OFFICE") {
        throw new Error("Solo administradores pueden desbloquear cuentas");
      }

      await this.modeUser.resetFailedAttemptsDB({ id: targetUserId });

      logger.info(`Cuenta desbloqueada para usuario: ${targetUserId}`);
    } catch (error) {
      manejoDeError("Error al desbloquear cuenta", error);
      throw error;
    }
  }

  /**
   * Obtener todos los intentos fallidos (debug)
   */
  getAllFailedAttempts() {
    // Since using DB, this would need to query all users
    // For now, return empty or implement if needed
    return [];
  }

  /**
   * Obtiene el servicio de autenticación para acceso externo
   */
  public getAuthService(): AuthService {
    return this.authService;
  }
}
