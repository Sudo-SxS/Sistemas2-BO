// router/CelulaRouter.ts

import { Context, Router } from "oak";
import { load } from "dotenv";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { CelulaController } from "../Controller/CelulaController.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { CelulaCreateSchema, CelulaUpdateSchema } from "../schemas/venta/Celula.ts";
import { logger } from "../Utils/logger.ts";

await load({ export: true });

type ContextWithParams = Context & { params: Record<string, string> };

export function celulaRouter(celulaController: CelulaController, userModel: UserModelDB) {
  const router = new Router();

  /**
   * GET /celulas
   * Obtiene todas las células con paginación
   */
  router.get(
    "/celulas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;

        logger.info(`GET /celulas - Página: ${page}, Límite: ${limit}`);

        const celulas = await celulaController.getAll({ page, limit });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: celulas,
          pagination: {
            page,
            limit,
            total: celulas.length,
          },
        };
      } catch (error) {
        logger.error("GET /celulas:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener células",
        };
      }
    }
  );

  /**
   * GET /celulas/:id
   * Obtiene una célula por ID
   */
  router.get(
    "/celulas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de célula requerido",
          };
          return;
        }

        logger.info(`GET /celulas/${id}`);

        const celula = await celulaController.getById({ id: Number(id) });

        if (!celula) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Célula no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: celula,
        };
      } catch (error) {
        logger.error("GET /celulas/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener célula",
        };
      }
    }
  );

  /**
   * GET /celulas/:id/asesores
   * Obtiene todos los asesores de una célula
   */
  router.get(
    "/celulas/:id/asesores",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de célula requerido",
          };
          return;
        }

        logger.info(`GET /celulas/${id}/asesores`);

        // Verificar que la célula existe
        const celula = await celulaController.getById({ id: Number(id) });
        if (!celula) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Célula no encontrada",
          };
          return;
        }

        const asesores = await celulaController.getAsesoresByCelula({ id_celula: Number(id) });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: asesores,
          count: asesores.length,
        };
      } catch (error) {
        logger.error("GET /celulas/:id/asesores:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener asesores",
        };
      }
    }
  );

  /**
   * GET /celulas/empresa/:empresa
   * Obtiene células por empresa
   */
  router.get(
    "/celulas/empresa/:empresa",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { empresa } = ctx.params;

        if (!empresa) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de empresa requerido",
          };
          return;
        }

        logger.info(`GET /celulas/empresa/${empresa}`);

        const celulas = await celulaController.getByEmpresa({ empresa: Number(empresa) });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: celulas,
          count: celulas.length,
        };
      } catch (error) {
        logger.error("GET /celulas/empresa/:empresa:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener células",
        };
      }
    }
  );

  /**
   * POST /celulas
   * Crea una nueva célula
   */
  router.post(
    "/celulas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        
        logger.info("POST /celulas - Creando nueva célula");

        // Validar con Zod
        const result = CelulaCreateSchema.safeParse(body);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors,
          };
          return;
        }

        const celula = await celulaController.create({ celula: result.data });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Célula creada exitosamente",
          data: celula,
        };
      } catch (error) {
        logger.error("POST /celulas:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear célula",
        };
      }
    }
  );

  /**
   * PUT /celulas/:id
   * Actualiza una célula
   */
  router.put(
    "/celulas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de célula requerido",
          };
          return;
        }

        const body = await ctx.request.body.json();
        
        logger.info(`PUT /celulas/${id}`);

        // Validar con Zod
        const result = CelulaUpdateSchema.safeParse(body);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors,
          };
          return;
        }

        const celula = await celulaController.update({
          id: Number(id),
          celula: result.data,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Célula actualizada exitosamente",
          data: celula,
        };
      } catch (error) {
        logger.error("PUT /celulas/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar célula",
        };
      }
    }
  );

  /**
   * DELETE /celulas/:id
   * Elimina una célula
   */
  router.delete(
    "/celulas/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de célula requerido",
          };
          return;
        }

        logger.info(`DELETE /celulas/${id}`);

        await celulaController.delete({ id: Number(id) });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Célula eliminada exitosamente",
        };
      } catch (error) {
        logger.error("DELETE /celulas/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar célula",
        };
      }
    }
  );

  return router;
}