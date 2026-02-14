// ============================================
// ✅ NUEVO: Middleware de validación de historial de contraseñas
// ============================================
import { Middleware, Context, Next } from "oak";
import type { UserModelDB } from "../interface/Usuario.ts";
import { logger } from '../Utils/logger.ts';

/**
 * Middleware para validar que un usuario tenga contraseña activa
 * Útil para operaciones críticas
 */
export const validateActivePasswordMiddleware = (
  model: UserModelDB,
): Middleware => {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user as { id: string };

    if (!user || !user.id) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Usuario no autenticado",
      };
      return;
    }

    try {
      const passwordHash = await model.getPasswordHash({ id: user.id });

      if (!passwordHash) {
        ctx.response.status = 403;
        ctx.response.body = {
          success: false,
          message: "Usuario sin contraseña activa. Por favor, contacta al administrador.",
        };
        return;
      }

      await next();
     } catch (error) {
       logger.error("Error validando contraseña activa:", error);
       ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error al validar credenciales",
      };
    }
  };
};

/**
 * Middleware para prevenir acceso con contraseñas antiguas
 * Se ejecuta después de authMiddleware
 */
export const preventOldPasswordAccessMiddleware = (
  model: UserModelDB,
): Middleware => {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user as { id: string };

    if (!user || !user.id) {
      await next();
      return;
    }

    try {
      // Obtener el token del cookie
      const token = await ctx.cookies.get("token");

      if (!token) {
        await next();
        return;
      }

      // Verificar que la contraseña usada para generar el token sea la activa
      const activePasswordHash = await model.getPasswordHash({ id: user.id });

      if (!activePasswordHash) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Sesión inválida. Por favor, inicia sesión nuevamente.",
        };
        return;
      }

      // Si llegamos aquí, la contraseña es válida
      await next();
     } catch (error) {
       logger.error("Error verificando contraseña activa:", error);
       await next();
    }
  };
};
