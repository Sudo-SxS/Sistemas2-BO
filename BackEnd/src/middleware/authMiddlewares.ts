// ============================================
// BackEnd/src/middleware/authMiddlewares.ts
// ============================================
import { Middleware, Context, Next } from "oak";
import { verify } from "djwt";
import { load } from "dotenv";
import { logger } from "../Utils/logger.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { Usuario } from "../schemas/persona/User.ts";
import { AuthController } from "../Controller/AuthController.ts";

const initEnv = await load({ export: true });

/**
 * Middleware de autenticación JWT
 * ✅ Sin cambios - funciona correctamente con el nuevo sistema
 */
export const authMiddleware = (model: UserModelDB): Middleware => {
  return async (ctx: Context, next: Next) => {
    const authController = new AuthController(model);

    try {
      // Buscar token en cookies primero, luego en header Authorization
      let token = await ctx.cookies.get("token");

      if (!token) {
        const authHeader = ctx.request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7); // Remove "Bearer " prefix
        }
      }

      if (!token) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "No autorizado: token no presente",
        };
        return;
      }

      const secret = Deno.env.get("JWT_SECRET");

       if (!secret) {
         logger.error("JWT_SECRET no definido en las variables de entorno");
         ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error de configuración del servidor",
        };
        return;
      }

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );

       const decodedPayload = await verify(token, key);

       if (!decodedPayload) {
         ctx.response.status = 401;
         ctx.response.body = {
           success: false,
           message: "Token inválido",
         };
         return;
       }

       const payload = await authController.verifyToken(token);

       if (!payload) {
         ctx.response.status = 401;
         ctx.response.body = {
           success: false,
           message: "Usuario no válido o no encontrado",
         };
         return;
       }

       // Buscar el usuario completo en la base de datos
       const user = await model.getById({ id: payload.id as string });

       if (!user) {
         ctx.response.status = 401;
         ctx.response.body = {
           success: false,
           message: "Usuario no encontrado en la base de datos",
         };
         return;
       }

        // Asignar el usuario completo con id para compatibilidad
        ctx.state.user = { ...(user as Usuario), id: user.persona_id };

       if (Deno.env.get("MODO") === "development") {
         logger.info("Usuario autenticado:", {
           id: user.persona_id,
           email: user.email,
           rol: user.rol,
           legajo: user.legajo,
           exa: user.exa,
         });
       }

      await next();
     } catch (error) {
       logger.error("Error en authMiddleware:", error);

      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Token inválido o expirado",
      };

      return;
    }
  };
};
