// ============================================
type ContextWithParams = Context & { params: Record<string, string> };
// BackEnd/src/router/UsuarioRouter.ts
// ============================================
import { Context, Router } from "oak";
import { load } from "dotenv";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";

import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";

import { UserModelDB } from "../interface/Usuario.ts";
import { UsuarioController } from "../Controller/UsuarioController.ts";
import { logger } from "../Utils/logger.ts";
import { UsuarioUpdateSchema } from "../schemas/persona/User.ts";

await load({ export: true });

/**
 * Router de Usuario
 * ✅ ACTUALIZADO: Adaptado para trabajar con el nuevo sistema de contraseñas
 *
 * NOTA: El cambio de contraseña NO está aquí, está en AuthRouter
 */
export function usuarioRouter(userModel: UserModelDB) {
  const router = new Router();
  const usuarioController = new UsuarioController(userModel);

  /**
   * GET /usuarios
   * Obtiene todos los usuarios con paginación
   */
  router.get(
    "/usuarios",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;
        const name = url.searchParams.get("name") || undefined;
        const email = url.searchParams.get("email") || undefined;

        logger.info(`GET /usuarios - Página: ${page}, Límite: ${limit}`);

        const usuarios = await usuarioController.getAll({
          page,
          limit,
          name,
          email,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuarios,
          pagination: {
            page,
            limit,
            total: usuarios.length,
          },
        };
      } catch (error) {
        //logger.error("GET /usuarios:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener usuarios",
        };
      }
    },
  );

  /**
   * GET /usuarios/stats
   * Obtiene estadísticas de usuarios
   */
  router.get(
    "/usuarios/stats",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /usuarios/stats");

        const stats = await usuarioController.getStats();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: stats,
        };
      } catch (error) {
        logger.error("GET /usuarios/stats:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener estadísticas",
        };
      }
    },
  );

  /**
   * GET /usuarios/search/email
   * Busca un usuario por email
   */
  router.get(
    "/usuarios/search/email",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const email = url.searchParams.get("email");

        if (!email) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Email requerido en query params",
          };
          return;
        }

        logger.info(`GET /usuarios/search/email - Email: ${email}`);

        const usuario = await usuarioController.getByEmail({ email });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        logger.error("GET /usuarios/search/email:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * GET /usuarios/search/legajo
   * Busca un usuario por legajo
   */
  router.get(
    "/usuarios/search/legajo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const legajo = url.searchParams.get("legajo");

        if (!legajo) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Legajo requerido en query params",
          };
          return;
        }

        logger.info(`GET /usuarios/search/legajo - Legajo: ${legajo}`);

        const usuario = await usuarioController.getByLegajo({ legajo });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        logger.error("GET /usuarios/search/legajo:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * GET /usuarios/search/exa
   * Busca un usuario por código EXA
   */
  router.get(
    "/usuarios/search/exa",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const exa = url.searchParams.get("exa");

        if (!exa) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Código EXA requerido en query params",
          };
          return;
        }

        logger.info(`GET /usuarios/search/exa - EXA: ${exa}`);

        const usuario = await usuarioController.getByExa({ exa });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        logger.error("GET /usuarios/search/exa:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * GET /usuarios/:id
   * Obtiene un usuario por ID
   */
  router.get(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        logger.info(`GET /usuarios/${id}`);

        const usuario = await usuarioController.getById({ id });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        logger.error("GET /usuarios/:id:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * PUT /usuarios/:id
   * Actualiza un usuario
   * ✅ NOTA: NO actualiza contraseñas - usar PATCH /usuarios/:id/password
   */
  router.put(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        const body = await ctx.request.body.json();
        const updateData = await body;

        if (!updateData || Object.keys(updateData).length === 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "No hay datos para actualizar",
          };
          return;
        }

        logger.info(`PUT /usuarios/${id}`);

        // Validar con Zod
        const result = UsuarioUpdateSchema.partial().safeParse(updateData);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors,
          };
          return;
        }

        const usuarioActualizado = await usuarioController.update({
          id,
          input: result.data,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Usuario actualizado exitosamente",
          data: usuarioActualizado,
        };
      } catch (error) {
        logger.error("PUT /usuarios/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar usuario",
        };
      }
    },
  );

  /**
   * PATCH /usuarios/:id/status
   * Cambia el estado de un usuario
   */
  router.patch(
    "/usuarios/:id/status",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        const body = await ctx.request.body.json();
        const { estado } = await body;

        if (!estado) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Estado requerido en el body",
          };
          return;
        }

        logger.info(`PATCH /usuarios/${id}/status - Estado: ${estado}`);

        const usuarioActualizado = await usuarioController.changeStatus({
          id,
          estado,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: `Estado cambiado a ${estado} exitosamente`,
          data: usuarioActualizado,
        };
      } catch (error) {
        logger.error("PATCH /usuarios/:id/status:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al cambiar estado",
        };
      }
    },
  );

  /**
   * DELETE /usuarios/:id
   * Elimina un usuario permanentemente
   * ✅ NOTA: También elimina todo el historial de contraseñas (CASCADE)
   */
  router.delete(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        logger.info(`DELETE /usuarios/${id}`);

        await usuarioController.delete({ id });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message:
            "Usuario eliminado exitosamente (incluyendo historial de contraseñas)",
        };
      } catch (error) {
        logger.error("DELETE /usuarios/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar usuario",
        };
      }
    },
  );

  return router;
}
