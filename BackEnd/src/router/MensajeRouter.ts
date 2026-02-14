// ============================================
// BackEnd/src/router/MensajeRouter.ts
// VERSIÓN CORREGIDA
// ============================================
import { Context, Router } from "oak";
import { MensajeController } from "../Controller/MensajeController.ts";
import { MensajeService } from "../services/MensajeService.ts";
import { MensajeModelDB } from "../interface/Mensaje.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { logger } from "../Utils/logger.ts";

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Mensajes
 * Gestiona alertas y notificaciones
 */
export function mensajeRouter(
  mensajeModel: MensajeModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();

  // Instancias
  const mensajeService = new MensajeService(mensajeModel);
  const mensajeController = new MensajeController(mensajeService);

  // ====================================
  // RUTAS DE CONSULTA (GET)
  // ====================================

  /**
   * GET /mensajes/inbox
   * Obtiene el inbox del usuario autenticado
   * Query params: page, limit
   */
  router.get(
    "/mensajes/inbox",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const usuario_id = (ctx.state.user as { id: string }).id;
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 20;

        const mensajes = await mensajeController.getInbox({
          usuario_id,
          page,
          limit,
        });

        ctx.response.body = {
          success: true,
          data: mensajes,
          pagination: { page, limit, total: mensajes.length },
        };
      } catch (error) {
        logger.error("Error en GET /mensajes/inbox:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener inbox",
        };
      }
    },
  );

  /**
   * GET /mensajes/no-leidos
   * Cuenta mensajes no leídos del usuario autenticado
   */
  router.get(
    "/mensajes/no-leidos",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const usuario_id = (ctx.state.user as { id: string }).id;
        const count = await mensajeController.countNoLeidos({ usuario_id });

        ctx.response.body = {
          success: true,
          count,
        };
      } catch (error) {
        logger.error("Error en GET /mensajes/no-leidos:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al contar mensajes",
        };
      }
    },
  );

  /**
   * GET /mensajes/alertas-pendientes
   * Obtiene alertas pendientes de resolución
   * Solo SUPERVISOR, ADMIN, SUPERADMIN
   */
  router.get(
    "/mensajes/alertas-pendientes",
    authMiddleware(userModel),
    rolMiddleware("SUPERVISOR", "ADMIN", "SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 20;

        const alertas = await mensajeController.getAlertasPendientes({
          page,
          limit,
        });

        ctx.response.body = {
          success: true,
          data: alertas,
          pagination: { page, limit, total: alertas.length },
        };
      } catch (error) {
        logger.error("Error en GET /mensajes/alertas-pendientes:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener alertas",
        };
      }
    },
  );

  /**
   * GET /mensajes/tipo/:tipo
   * Filtra mensajes por tipo (ALERTA o NOTIFICACION)
   */
  router.get(
    "/mensajes/tipo/:tipo",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { tipo } = ctx.params;
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 20;

        if (tipo !== "ALERTA" && tipo !== "NOTIFICACION") {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Tipo inválido. Debe ser ALERTA o NOTIFICACION",
          };
          return;
        }

        const mensajes = await mensajeController.getByTipo({
          tipo: tipo as "ALERTA" | "NOTIFICACION",
          page,
          limit,
        });

        ctx.response.body = {
          success: true,
          data: mensajes,
          pagination: { page, limit, total: mensajes.length },
        };
      } catch (error) {
        logger.error("Error en GET /mensajes/tipo/:tipo:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener mensajes",
        };
      }
    },
  );

  /**
   * GET /mensajes/referencia/:id
   * Obtiene alertas por referencia (ej: venta_id)
   */
  router.get(
    "/mensajes/referencia/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const referencia_id = Number(id);

        if (isNaN(referencia_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de referencia inválido",
          };
          return;
        }

        const alertas = await mensajeController.getAlertasByReferencia({
          referencia_id,
        });

        ctx.response.body = {
          success: true,
          data: alertas,
        };
      } catch (error) {
        logger.error("Error en GET /mensajes/referencia/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener alertas",
        };
      }
    },
  );

  /**
   * GET /mensajes/:id
   * Obtiene un mensaje por ID
   */
  router.get(
    "/mensajes/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const mensaje_id = Number(id);

        if (isNaN(mensaje_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID inválido",
          };
          return;
        }

        const mensaje = await mensajeController.getById({ mensaje_id });

        if (!mensaje) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Mensaje no encontrado",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          data: mensaje,
        };
      } catch (error) {
        logger.error("Error en GET /mensajes/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener mensaje",
        };
      }
    },
  );

  // ====================================
  // RUTAS DE MODIFICACIÓN (POST, PATCH)
  // ====================================

  /**
   * POST /mensajes
   * Crea un nuevo mensaje (ALERTA o NOTIFICACION)
   * Body: MensajeCreate
   * Permisos: ADMIN, BACK_OFFICE, SUPERADMIN (para NOTIFICACIONES)
   *           Sistema automático o Supervisor (para ALERTAS)
   */
  router.post(
    "/mensajes",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        const usuario_id = (ctx.state.user as { id: string }).id;
        const usuario_rol = (ctx.state.user as { rol: string }).rol;

        // Preparar input
        const input = {
          ...body,
          usuario_creador_id: usuario_id,
        };

        const mensaje = await mensajeController.create({
          input,
          usuario_creador_rol: usuario_rol,
        });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Mensaje creado exitosamente",
          data: mensaje,
        };
      } catch (error) {
        logger.error("Error en POST /mensajes:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear mensaje",
        };
      }
    },
  );

  /**
   * PATCH /mensajes/:id/leido
   * Marca un mensaje como leído
   */
  router.patch(
    "/mensajes/:id/leido",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const mensaje_id = Number(id);
        const usuario_id = (ctx.state.user as { id: string }).id;

        if (isNaN(mensaje_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID inválido",
          };
          return;
        }

        const result = await mensajeController.marcarComoLeido({
          mensaje_id,
          usuario_id,
        });

        if (!result) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Mensaje no encontrado o no pertenece al usuario",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          message: "Mensaje marcado como leído",
        };
      } catch (error) {
        logger.error("Error en PATCH /mensajes/:id/leido:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al marcar como leído",
        };
      }
    },
  );

  /**
   * PATCH /mensajes/:id/resolver
   * Resuelve una alerta
   * Solo SUPERVISOR, ADMIN, SUPERADMIN
   */
  router.patch(
    "/mensajes/:id/resolver",
    authMiddleware(userModel),
    rolMiddleware("SUPERVISOR", "ADMIN", "SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const mensaje_id = Number(id);

        if (isNaN(mensaje_id)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID inválido",
          };
          return;
        }

        const mensaje = await mensajeController.resolverAlerta({
          mensaje_id,
        });

        if (!mensaje) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Alerta no encontrada o ya resuelta",
          };
          return;
        }

        ctx.response.body = {
          success: true,
          message: "Alerta resuelta exitosamente",
          data: mensaje,
        };
      } catch (error) {
        logger.error("Error en PATCH /mensajes/:id/resolver:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al resolver alerta",
        };
      }
    },
  );

  return router;
}
