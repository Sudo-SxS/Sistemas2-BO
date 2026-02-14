// ============================================
// BackEnd/src/router/ComentarioRouter.ts
// Router para Comentarios
// ============================================
import { Context, Router } from "oak";
import { ComentarioController } from "../Controller/ComentarioController.ts";
import { ComentarioService } from "../services/ComentarioService.ts";
import { ComentarioModelDB } from "../interface/Comentario.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { logger } from "../Utils/logger.ts";

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Comentarios
 * Gestiona comentarios de ventas
 */
export function comentarioRouter(
  comentarioModel: ComentarioModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();

  // Instancias
  const comentarioService = new ComentarioService(comentarioModel);
  const comentarioController = new ComentarioController(comentarioService);

  // ====================================
  // RUTAS DE CONSULTA (GET)
  // ====================================

  /**
   * GET /comentarios
   * Obtiene todos los comentarios con filtros y paginación
   * Query params: page, limit, venta_id, usuario_id, tipo_comentario, desde, hasta
   */
  router.get(
    "/comentarios",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 20;
        const venta_id = url.searchParams.get("venta_id")
          ? Number(url.searchParams.get("venta_id"))
          : undefined;
        const usuario_id = url.searchParams.get("usuario_id") || undefined;
        const tipo_comentario = url.searchParams.get("tipo_comentario") ||
          undefined;
        const fecha_desde = url.searchParams.get("desde")
          ? new Date(url.searchParams.get("desde")!)
          : undefined;
        const fecha_hasta = url.searchParams.get("hasta")
          ? new Date(url.searchParams.get("hasta")!)
          : undefined;

        const comentarios = await comentarioController.getAll({
          page,
          limit,
          venta_id,
          usuario_id,
          tipo_comentario,
          fecha_desde,
          fecha_hasta,
        });

        ctx.response.body = {
          success: true,
          data: comentarios,
          pagination: { page, limit, total: comentarios.length },
        };
      } catch (error) {
        logger.error("Error en GET /comentarios:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentarios",
        };
      }
    },
  );

  /**
   * GET /comentarios/venta/:venta_id
   * Obtiene todos los comentarios de una venta específica
   * Query params: page, limit
   */
  router.get(
    "/comentarios/venta/:venta_id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { venta_id: ventaIdStr } = ctx.params;
        const venta_id = Number(ventaIdStr);
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 20;

        if (isNaN(venta_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de venta inválido",
          };
          return;
        }

        const comentarios = await comentarioController.getByVentaId({
          venta_id,
          page,
          limit,
        });

        ctx.response.body = {
          success: true,
          data: comentarios,
          pagination: { page, limit, total: comentarios.length },
        };
      } catch (error) {
        logger.error("Error en GET /comentarios/venta/:venta_id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentarios de la venta",
        };
      }
    },
  );

  /**
   * GET /comentarios/venta/:venta_id/ultimo
   * Obtiene el último comentario de una venta
   */
  router.get(
    "/comentarios/venta/:venta_id/ultimo",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { venta_id: ventaIdStr } = ctx.params;
        const venta_id = Number(ventaIdStr);

        if (isNaN(venta_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de venta inválido",
          };
          return;
        }

        const comentario = await comentarioController.getUltimoByVentaId({
          venta_id,
        });

        if (!comentario) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "No hay comentarios para esta venta",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          data: comentario,
        };
      } catch (error) {
        logger.error("Error en GET /comentarios/venta/:venta_id/ultimo:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener el último comentario",
        };
      }
    },
  );

  /**
   * GET /comentarios/usuario/:usuario_id
   * Obtiene comentarios de un usuario específico
   * Query params: page, limit
   */
  router.get(
    "/comentarios/usuario/:usuario_id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { usuario_id } = ctx.params;
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 20;

        const comentarios = await comentarioController.getByUsuarioId({
          usuario_id,
          page,
          limit,
        });

        ctx.response.body = {
          success: true,
          data: comentarios,
          pagination: { page, limit, total: comentarios.length },
        };
      } catch (error) {
        logger.error("Error en GET /comentarios/usuario/:usuario_id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentarios del usuario",
        };
      }
    },
  );

  /**
   * GET /comentarios/:id
   * Obtiene un comentario por ID
   */
  router.get(
    "/comentarios/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const comentario_id = Number(id);

        if (isNaN(comentario_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID inválido",
          };
          return;
        }

        const comentario = await comentarioController.getById({ comentario_id });

        if (!comentario) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Comentario no encontrado",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          data: comentario,
        };
      } catch (error) {
        logger.error("Error en GET /comentarios/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentario",
        };
      }
    },
  );

  // ====================================
  // RUTAS DE MODIFICACIÓN (POST, PATCH, DELETE)
  // ====================================

  /**
   * POST /comentarios
   * Crea un nuevo comentario
   * Body: { titulo, comentario, venta_id, tipo_comentario }
   * Permisos:
   * - VENDEDOR: Solo en sus propias ventas
   * - Otros roles: En cualquier venta
   */
  router.post(
    "/comentarios",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        const usuario_id = (ctx.state.user as { id: string }).id;
        const usuario_rol = (ctx.state.user as { rol: string }).rol;

        // Preparar input
        const input = {
          ...body,
          usuarios_id: usuario_id,
        };

        const comentario = await comentarioController.create({
          input,
          usuario_id,
          usuario_rol,
        });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Comentario creado exitosamente",
          data: comentario,
        };
      } catch (error) {
        logger.error("Error en POST /comentarios:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear comentario",
        };
      }
    },
  );

  /**
   * PATCH /comentarios/:id
   * Actualiza un comentario
   * Body: { titulo?, comentario?, tipo_comentario? }
   * Permisos: Creador del comentario o SUPERADMIN
   */
  router.patch(
    "/comentarios/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const comentario_id = Number(id);
        const body = await ctx.request.body.json();
        const usuario_id = (ctx.state.user as { id: string }).id;
        const usuario_rol = (ctx.state.user as { rol: string }).rol;

        if (isNaN(comentario_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID inválido",
          };
          return;
        }

        const comentario = await comentarioController.update({
          comentario_id,
          input: body,
          usuario_id,
          usuario_rol,
        });

        if (!comentario) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Comentario no encontrado",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          message: "Comentario actualizado exitosamente",
          data: comentario,
        };
      } catch (error) {
        logger.error("Error en PATCH /comentarios/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar comentario",
        };
      }
    },
  );

  /**
   * DELETE /comentarios/:id
   * Elimina un comentario
   * Permisos: Creador del comentario o SUPERADMIN
   */
  router.delete(
    "/comentarios/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const comentario_id = Number(id);
        const usuario_id = (ctx.state.user as { id: string }).id;
        const usuario_rol = (ctx.state.user as { rol: string }).rol;

        if (isNaN(comentario_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID inválido",
          };
          return;
        }

        const result = await comentarioController.delete({
          comentario_id,
          usuario_id,
          usuario_rol,
        });

        if (!result) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Comentario no encontrado",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          message: "Comentario eliminado exitosamente",
        };
      } catch (error) {
        logger.error("Error en DELETE /comentarios/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar comentario",
        };
      }
    },
  );

  return router;
}
