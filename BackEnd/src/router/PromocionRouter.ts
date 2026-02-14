// BackEnd/src/router/PromocionRouter.ts
type ContextWithParams = Context & { params: Record<string, string> };
// ============================================
import { Router, Context } from "oak";
import { PromocionController } from "../Controller/PromocionController.ts";
import { PromocionService } from "../services/PromocionService.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { PromocionCreateSchema, PromocionUpdateSchema } from "../schemas/venta/Promocion.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN } from "../constants/roles.ts";
import { logger } from "../Utils/logger.ts";

export function promocionRouter(promocionModel: PromocionModelDB, userModel: UserModelDB) {
  const router = new Router();
  const promocionService = new PromocionService(promocionModel);
  const promocionController = new PromocionController(promocionService);

  // GET /promociones - Obtener todas las promociones
  router.get("/promociones", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const promociones = await promocionController.getAll({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: promociones,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /promociones/empresa/:empresa - Obtener promociones por empresa
  router.get("/promociones/empresa/:empresa", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { empresa } = ctx.params;

      const promociones = await promocionController.getByEmpresa({ empresa });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: promociones,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /promociones/:id - Obtener una promocion por ID
  router.get("/promociones/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;

      const promocion = await promocionController.getById({ id });

      if (!promocion) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Promoción no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: promocion,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // POST /promociones - Crear una nueva promocion
  router.post(
    "/promociones",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        logger.debug('POST /promociones');

        const body = await ctx.request.body.json();
        const result = PromocionCreateSchema.safeParse(body);

        if (!result.success) {
          logger.error('POST /promociones validation error:', result.error.errors);

          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Validación fallida",
            errors: result.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            })),
            ...(Deno.env.get("MODO") === "development" && {
              stack: result.error.stack,
              details: result.error
            })
          };
          return;
        }

        const newPromocion = await promocionController.create({ promocion: result.data });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: newPromocion,
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    }
  );

  // PUT /promociones/:id - Actualizar una promocion
  router.put(
    "/promociones/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const body = await ctx.request.body.json();
        const result = PromocionUpdateSchema.safeParse(body.promocion);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const updatedPromocion = await promocionController.update({ id, promocion: result.data });

        if (!updatedPromocion) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Promoción no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedPromocion,
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    }
  );

  // DELETE /promociones/:id - Eliminar una promocion
  router.delete(
    "/promociones/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        const deleted = await promocionController.delete({ id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Promoción no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Promoción eliminada correctamente",
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    }
  );

  return router;
}