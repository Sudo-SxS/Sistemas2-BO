// BackEnd/src/router/EmpresaOrigenRouter.ts
// ============================================
import { Context, Router } from "oak";
import { EmpresaOrigenController } from "../Controller/EmpresaOrigenController.ts";
import { EmpresaOrigenService } from "../services/EmpresaOrigenService.ts";
import { EmpresaOrigenModelDB } from "../interface/EmpresaOrigen.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { logger } from "../Utils/logger.ts";

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Empresa Origen
 * Solo accesible para SUPERADMIN y ADMIN
 */
export function empresaOrigenRouter(
  empresaOrigenModel: EmpresaOrigenModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();

  // Usar el modelo ya instanciado desde main.ts
  const empresaOrigenService = new EmpresaOrigenService(empresaOrigenModel);
  const empresaOrigenController = new EmpresaOrigenController(
    empresaOrigenService,
  );

  /**
   * GET /empresa-origen
   * Obtiene todas las empresas origen con paginación (PÚBLICO)
   */
  router.get(
    "/empresa-origen",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;
        const search = url.searchParams.get("search") || undefined;

        logger.info(
          `GET /empresa-origen - Página: ${page}, Límite: ${limit}`,
        );

        const empresas = await empresaOrigenController.getAll({
          page,
          limit,
          search,
        });
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: empresas
        };
      } catch (error) {
        logger.error("GET /empresa-origen:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Error interno del servidor" };
      }
    },
  );

  /**
   * GET /empresa-origen/:id
   * Obtiene una empresa origen por ID (PÚBLICO)
   */
  router.get(
    "/empresa-origen/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = { error: "ID requerido" };
          return;
        }

        logger.info(`GET /empresa-origen/${id}`);

        const empresa = await empresaOrigenController.getById(id);
        if (!empresa) {
          ctx.response.status = 404;
          ctx.response.body = { success: false, error: "Empresa origen no encontrada" };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: empresa
        };
      } catch (error) {
        logger.error("GET /empresa-origen/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Error interno del servidor" };
      }
    },
  );

  /**
   * POST /empresa-origen
   * Crea una nueva empresa origen
   */
  router.post(
    "/empresa-origen",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        logger.info("POST /empresa-origen - Body:", body);

        const empresa = await empresaOrigenController.create(body);
        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: empresa
        };
      } catch (error) {
        logger.error("POST /empresa-origen:", error);
        if (error instanceof Error && error.message.includes("validation")) {
          ctx.response.status = 400;
          ctx.response.body = { error: error.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = { error: "Error interno del servidor" };
        }
      }
    },
  );

  /**
   * PUT /empresa-origen/:id
   * Actualiza una empresa origen
   */
  router.put(
    "/empresa-origen/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = { error: "ID requerido" };
          return;
        }

        const body = await ctx.request.body.json();
        logger.info(`PUT /empresa-origen/${id} - Body:`, body);

        const empresa = await empresaOrigenController.update(id, body);
        if (!empresa) {
          ctx.response.status = 404;
          ctx.response.body = { success: false, error: "Empresa origen no encontrada" };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: empresa
        };
      } catch (error) {
        logger.error("PUT /empresa-origen/:id:", error);
        if (error instanceof Error && error.message.includes("validation")) {
          ctx.response.status = 400;
          ctx.response.body = { error: error.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = { error: "Error interno del servidor" };
        }
      }
    },
  );

  /**
   * DELETE /empresa-origen/:id
   * Elimina una empresa origen
   */
  router.delete(
    "/empresa-origen/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = { error: "ID requerido" };
          return;
        }

        logger.info(`DELETE /empresa-origen/${id}`);

        const success = await empresaOrigenController.delete(id);
        if (!success) {
          ctx.response.status = 404;
          ctx.response.body = { error: "Empresa origen no encontrada" };
          return;
        }

        ctx.response.status = 204;
      } catch (error) {
        logger.error("DELETE /empresa-origen/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Error interno del servidor" };
      }
    },
  );

  return router;
}
