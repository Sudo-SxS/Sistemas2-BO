// ============================================
type ContextWithParams = Context & { params: Record<string, string> };
// BackEnd/src/router/AuthRouter.ts
// ============================================
import { Context, Router } from "oak";
import { load } from "dotenv";
import { ZodIssue } from "zod";

import { AuthController } from "../Controller/AuthController.ts";
import { logger } from "../Utils/logger.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import {
  CambioPassword,
  CambioPasswordAdmin,
  CambioPasswordSchema,
  UsuarioCreate,
  UsuarioCreateSchema,
  UsuarioLogin,
  UsuarioLoginSchema,
} from "../schemas/persona/User.ts";
import type { AuthenticatedUser, PasswordDataRaw } from "../types/userAuth.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { manejoDeError } from "../Utils/errores.ts";

await load({ export: true });

export function authRouter(userModel: UserModelDB) {
  const router = new Router();
  const authController = new AuthController(userModel);
  // const authService = authController.getAuthService(); // Opcional: obtener el servicio si se necesita

  // POST /usuario/login
  router.post(
    "/usuario/login",
    async (ctx: ContextWithParams) => {
      try {
        const body = ctx.request.body.json();
        const input = await body;

        if (!input || !input.user) {
          throw new Error(
            "Estructura de datos inválida. Se espera { user: {...} }",
          );
        }

        const email = input.user.email?.toLowerCase().trim();
        const password = input.user.password;

        if (!email || !password) {
          throw new Error("Email y contraseña son campos requeridos");
        }

        if (!email.includes("@")) {
          throw new Error("Formato de email inválido");
        }

        const user: UsuarioLogin = { email, password };

        const newToken = await authController.login({ user });

        const isProduction = Deno.env.get("MODO") === "production";
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict" as const,
          maxAge: 60 * 60 * 24,
        };

        await ctx.cookies.set("token", newToken.token, cookieOptions);

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: newToken,
          message: "Autenticación exitosa"
        };
      } catch (error) {
        logger.error("POST /usuario/login:", error);
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error de autenticación",
        };
      }
    },
  );

  // POST /usuario/register
  // ✅ ACTUALIZADO: Solo BACK_OFFICE puede registrar usuarios
  router.post(
    "/usuario/register",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const body = ctx.request.body.json();
        const input = await body;

        if (!input || !input.user) {
          throw new Error(
            "Datos de usuario inválidos. Se espera { user: {...} }",
          );
        }

        const userData = input.user;

        const result = UsuarioCreateSchema.safeParse({
          nombre: userData.nombre?.toUpperCase().trim(),
          apellido: userData.apellido?.toUpperCase().trim(),
          documento: userData.documento?.toUpperCase().trim(),
          tipo_documento: userData.tipo_documento?.toUpperCase().trim(),
          nacionalidad: userData.nacionalidad?.toUpperCase().trim(),
          email: userData.email?.toLowerCase().trim(),
          fecha_nacimiento: userData.fecha_nacimiento,
          telefono: userData.telefono?.trim() ?? null,
          genero: userData.genero?.toUpperCase().trim() ?? "OTRO",
          legajo: userData.legajo?.trim(),
          rol: userData.rol.toUpperCase(),
          permisos: userData.permisos?.map((permiso: string) =>
            permiso.toUpperCase()
          ) || [],
          exa: userData.exa?.toUpperCase().trim(),
          password_hash: userData.password,
          celula: Number(userData.celula),
          estado: userData.estado ?? "ACTIVO",
        });
        //console.log(result);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors.map((error: ZodIssue) => ({
              field: error.path.join("."),
              message: error.message,
            })),
          };
          return;
        }

        const newToken = await authController.register({ user: result.data });

        const isProduction = Deno.env.get("MODO") === "production";

        ctx.response.status = 201;
        ctx.response.body = isProduction
          ? { success: true, message: "Usuario creado exitosamente" }
          : {
            success: true,
            token: newToken,
            message: "Usuario creado exitosamente",
          };
      } catch (error) {
        logger.error("POST /usuario/register:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al registrar usuario",
        };
      }
    },
  );

  // GET /usuario/verify
  router.get(
    "/usuario/verify",
    async (ctx: ContextWithParams) => {
      try {
        // ✅ NUEVO: Buscar token en cookies PRIMERO
        let token = await ctx.cookies.get("token");
        
        // Si no está en cookies, buscar en header (backward compatibility)
        if (!token) {
          const authHeader = ctx.request.headers.get("Authorization");
          token = authHeader?.replace("Bearer ", "").trim();
        }

        if (!token) {
          ctx.response.status = 401;
          ctx.response.body = {
            success: false,
            message: "Token no proporcionado",
          };
          return;
        }

        // Verificar token
        const payload = await authController.verifyToken(token);

        // ✅ NUEVO: Obtener datos completos del usuario desde la BD
        const user = await userModel.getById({ id: payload.id as string });

        if (!user) {
          ctx.response.status = 401;
          ctx.response.body = {
            success: false,
            message: "Usuario no encontrado",
          };
          return;
        }

        // ✅ NUEVO: Devolver datos esenciales del usuario
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          payload: {
            id: user.persona_id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.rol,
            permisos: user.permisos,
            legajo: user.legajo,
            exa: user.exa,
            celula: user.celula,
            estado: user.estado,
          },
          message: "Token válido",
        };
      } catch (error) {
        logger.error("GET /usuario/verify:", error);
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: error instanceof Error ? error.message : "Token inválido",
        };
      }
    },
  );

  // POST /usuario/refresh
  router.post("/usuario/refresh", async (ctx: ContextWithParams) => {
    try {
      // Leer token de cookies o header Authorization
      let token = await ctx.cookies.get("token");

      if (!token) {
        const authHeader = ctx.request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
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

      const newToken = await authController.refreshToken(token);

      const isProduction = Deno.env.get("MODO") === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 24 * 1000,
      };

      await ctx.cookies.set("token", newToken, cookieOptions);

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        token: newToken,
        message: "Token refrescado exitosamente",
      };
    } catch (error) {
      logger.error("POST /usuario/refresh:", error);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Error al refrescar token",
      };
    }
  });

  // PATCH /usuarios/:id/password
  router.patch(
    "/usuarios/:id/password",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id || id.trim() === "") {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido en el path",
          };
          return;
        }

        const authenticatedUser: AuthenticatedUser = ctx.state.user;

        if (!authenticatedUser) {
          ctx.response.status = 401;
          ctx.response.body = {
            success: false,
            message: "Usuario no autenticado",
          };
          return;
        }

        const body = await ctx.request.body.json();
        const passwordData = (await body) as PasswordDataRaw;

        if (!passwordData || Object.keys(passwordData).length === 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de contraseña requeridos en el body",
          };
          return;
        }

        await authController.changePassword({
          targetUserId: id,
          authenticatedUser,
          passwordData,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Contraseña actualizada exitosamente",
        };
      } catch (error) {
        logger.error("PATCH /usuarios/:id/password:", error);

        let statusCode = 400;
        if (error instanceof Error) {
          if (error.message.includes("no autenticado")) statusCode = 401;
          if (error.message.includes("permisos")) statusCode = 403;
          if (error.message.includes("no encontrado")) statusCode = 404;
        }

        ctx.response.status = statusCode;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al cambiar contraseña",
        };
      }
    },
  );

  // POST /usuario/logout
  router.post("/usuario/logout", async (ctx: ContextWithParams) => {
    try {
      await ctx.cookies.delete("token");

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Sesión cerrada exitosamente",
      };
    } catch (error) {
      logger.error("POST /usuario/logout:", error);
      await ctx.cookies.delete("token");

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Sesión cerrada",
      };
    }
  });
  return router;
}
