// ============================================
type ContextWithParams = Context & { params: Record<string, string> };
// BackEnd/src/router/CorreoRouter.ts
// ============================================
import { Context, Router } from "oak";
import { load } from "dotenv";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ALL, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { logger } from "../Utils/logger.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { CorreoController } from "../Controller/CorreoController.ts";

await load({ export: true });

/**
 * Router de Correo
 * Gestiona todas las rutas relacionadas con correos/envíos
 */
export function correoRouter(
  correoModel: CorreoModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();
  const correoController = new CorreoController(correoModel);

  /**
   * GET /correos
   * Obtiene todos los correos con paginación
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;
        const name = url.searchParams.get("name") || undefined;

        logger.info(`GET /correos - Página: ${page}, Límite: ${limit}`);

        const correos = await correoController.getAll({
          page,
          limit,
          name,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correos,
          pagination: {
            page,
            limit,
            total: correos.length,
          },
        };
      } catch (error) {
        logger.error("GET /correos:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos",
        };
      }
    },
  );

  /**
   * GET /correos/stats
   * Obtiene estadísticas de correos
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/stats",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /correos/stats");

        const stats = await correoController.getStats();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: stats,
        };
      } catch (error) {
        logger.error("GET /correos/stats:", error);
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
   * GET /correos/proximos-vencer
   * Obtiene correos próximos a vencer
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/proximos-vencer",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const dias = Number(url.searchParams.get("dias")) || 3;

        logger.info("GET /correos/proximos-vencer");

        const correos = await correoController.getProximosAVencer({ dias });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correos,
          dias,
        };
      } catch (error) {
        logger.error("GET /correos/proximos-vencer:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos próximos a vencer",
        };
      }
    },
  );

  /**
   * GET /correos/vencidos
   * Obtiene correos vencidos
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/vencidos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /correos/vencidos");

        const correos = await correoController.getVencidos();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correos,
        };
      } catch (error) {
        logger.error("GET /correos/vencidos:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos vencidos",
        };
      }
    },
  );

  /**
   * GET /correos/search/sap
   * Busca un correo por código SAP
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/search/sap",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const sap = url.searchParams.get("sap");

        if (!sap) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Código SAP requerido en query params",
          };
          return;
        }

        logger.info(`GET /correos/search/sap - SAP: ${sap}`);

        const correo = await correoController.getBySAP({ sap });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correo,
        };
      } catch (error) {
        logger.error("GET /correos/search/sap:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Correo no encontrado",
        };
      }
    },
  );

  /**
   * GET /correos/search/localidad
   * Busca correos por localidad
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/search/localidad",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const localidad = url.searchParams.get("localidad");

        if (!localidad) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Localidad requerida en query params",
          };
          return;
        }

        logger.info(
          `GET /correos/search/localidad - Localidad: ${localidad}`,
        );

        const correos = await correoController.getByLocalidad({ localidad });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correos,
        };
      } catch (error) {
        logger.error("GET /correos/search/localidad:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar correos por localidad",
        };
      }
    },
  );

  /**
   * GET /correos/search/departamento
   * Busca correos por departamento
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/search/departamento",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const departamento = url.searchParams.get("departamento");

        if (!departamento) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Departamento requerido en query params",
          };
          return;
        }

        logger.info(
          `GET /correos/search/departamento - Departamento: ${departamento}`,
        );

        const correos = await correoController.getByDepartamento({
          departamento,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correos,
        };
      } catch (error) {
        logger.error("GET /correos/search/departamento:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar correos por departamento",
        };
      }
    },
  );

  /**
   * GET /correos/:id
   * Obtiene un correo por SAP ID
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/correos/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "SAP ID requerido",
          };
          return;
        }

        logger.info(`GET /correos/${id}`);

        const correo = await correoController.getById({ id });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: correo,
        };
      } catch (error) {
        logger.error("GET /correos/:id:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Correo no encontrado",
        };
      }
    },
  );

  /**
   * POST /correos
   * Crea un nuevo correo
   * Acceso: BACK_OFFICE
   */
  router.post(
    "/correos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ALL),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();

        const usuario_id = ctx.state.user.id; // ✔ persona_id real

        if (!usuario_id) {
          ctx.response.status = 401;
          ctx.response.body = {
            success: false,
            message: "Usuario no autenticado",
          };
          return;
        }

        const correo = await correoController.create({
          ...body,
          usuario_id: ctx.state.user.id,
        });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Correo creado exitosamente",
          data: correo,
        };
      } catch (error) {
        logger.error("POST /correos:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear correo",
        };
      }
    },
  );

  /**
   * PUT /correos/:id
   * Actualiza un correo
   * Acceso: BACK_OFFICE
   */
  router.put(
    "/correos/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "SAP ID requerido",
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

        logger.info(`PUT /correos/${id}`);

        const correoActualizado = await correoController.update({
          id,
          input: updateData,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Correo actualizado exitosamente",
          data: correoActualizado,
        };
      } catch (error) {
        logger.error("PUT /correos/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar correo",
        };
      }
    },
  );

  /**
   * DELETE /correos/:id
   * Elimina un correo permanentemente
   * Acceso: BACK_OFFICE (SUPERADMIN)
   */
  router.delete(
    "/correos/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "SAP ID requerido",
          };
          return;
        }

        logger.info(`DELETE /correos/${id}`);

        await correoController.delete({ id });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Correo eliminado exitosamente",
        };
      } catch (error) {
        logger.error("DELETE /correos/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar correo",
        };
      }
    },
  );

  return router;
}
