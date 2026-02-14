// BackEnd/src/router/PlanRouter.ts
type ContextWithParams = Context & { params: Record<string, string> };
// ============================================
import { Router, Context } from "oak";
import { PlanController } from "../Controller/PlanController.ts";
import { PlanService } from "../services/PlanService.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { PlanCreateSchema, PlanUpdateSchema } from "../schemas/venta/Plan.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN } from "../constants/roles.ts";
import { mapDatabaseError } from "../Utils/databaseErrorMapper.ts";
import { logger } from "../Utils/logger.ts";

export function planRouter(planModel: PlanModelDB, userModel: UserModelDB) {
  const router = new Router();
  const planService = new PlanService(planModel);
  const planController = new PlanController(planService);

  // GET /planes - Obtener todos los planes
  router.get("/planes", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const planes = await planController.getAll({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: planes,
      };
    } catch (error) {
      const isDev = Deno.env.get("MODO") === "development";
      const mapped = mapDatabaseError(error, isDev);
      if (mapped) {
        ctx.response.status = mapped.statusCode;
        ctx.response.body = { success: false, message: mapped.message };
      } else {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: isDev ? (error as Error).message : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack })
        };
      }
    }
  });

  // GET /planes/:id - Obtener un plan por ID
  router.get("/planes/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;

      const plan = await planController.getById({ id });

      if (!plan) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Plan no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: plan,
      };
    } catch (error) {
      const isDev = Deno.env.get("MODO") === "development";
      const mapped = mapDatabaseError(error, isDev);
      if (mapped) {
        ctx.response.status = mapped.statusCode;
        ctx.response.body = { success: false, message: mapped.message };
      } else {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: isDev ? (error as Error).message : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack })
        };
      }
    }
  });

  // GET /planes/empresa/:id - Obtener planes por empresa
  router.get("/planes/empresa/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;

      const plans = await planController.getByEmpresa({ empresa: id });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: plans,
      };
    } catch (error) {
      const isDev = Deno.env.get("MODO") === "development";
      const mapped = mapDatabaseError(error, isDev);
      if (mapped) {
        ctx.response.status = mapped.statusCode;
        ctx.response.body = { success: false, message: mapped.message };
      } else {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: isDev ? (error as Error).message : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack })
        };
      }
    }
  });

  // POST /planes - Crear un nuevo plan
  router.post(
    "/planes",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        logger.debug('POST /planes');

        const body = await ctx.request.body.json();
        const result = PlanCreateSchema.safeParse(body);

        if (!result.success) {
          logger.error('POST /planes validation error:', result.error.errors);

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

        const newPlan = await planController.create({ plan: result.data });

        logger.info('POST /planes success:', newPlan.plan_id);
        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: newPlan,
        };
      } catch (error) {
        logger.error('POST /planes:', error);

        const isDev = Deno.env.get("MODO") === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          ctx.response.status = mapped.statusCode;
          ctx.response.body = { success: false, message: mapped.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: isDev ? (error as Error).message : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack })
          };
        }
      }
    }
  );

  // PUT /planes/:id - Actualizar un plan
  router.put(
    "/planes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        logger.debug('PUT /planes/:id');

        const { id } = ctx.params;
        const body = await ctx.request.body.json();
        const result = PlanUpdateSchema.safeParse(body);

        if (!result.success) {
          logger.error('PUT /planes/:id validation error:', result.error.errors);

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

        const updatedPlan = await planController.update({ id, plan: result.data });

        if (!updatedPlan) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Plan no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedPlan,
        };
      } catch (error) {
        logger.error('PUT /planes/:id:', error);
        const isDev = Deno.env.get("MODO") === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          ctx.response.status = mapped.statusCode;
          ctx.response.body = { success: false, message: mapped.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: isDev ? (error as Error).message : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack })
          };
        }
      }
    }
  );

  // DELETE /planes/:id - Eliminar un plan
  router.delete(
    "/planes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        const deleted = await planController.delete({ id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Plan no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Plan eliminado correctamente",
        };
      } catch (error) {
        const isDev = Deno.env.get("MODO") === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          ctx.response.status = mapped.statusCode;
          ctx.response.body = { success: false, message: mapped.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: isDev ? (error as Error).message : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack })
          };
        }
      }
    }
  );

  return router;
}