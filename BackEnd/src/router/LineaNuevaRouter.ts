// BackEnd/src/router/LineaNuevaRouter.ts
type ContextWithParams = Context & { params: Record<string, string> };
// ============================================
import { Router, Context } from "oak";
import { LineaNuevaController } from "../Controller/LineaNuevaController.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { LineaNuevaCreateSchema } from "../schemas/venta/LineaNueva.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN } from "../constants/roles.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";

export function lineaNuevaRouter(
  lineaNuevaModel: LineaNuevaModelDB,
  ventaModel: VentaModelDB,
  portabilidadModel: PortabilidadModelDB,
  userModel: UserModelDB
) {
  const router = new Router();
  const lineaNuevaController = new LineaNuevaController(lineaNuevaModel, ventaModel, portabilidadModel);

  // GET /linea-nueva - Obtener todas las líneas nuevas
  router.get("/linea-nueva", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const lineaNuevas = await lineaNuevaController.getAll({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: lineaNuevas,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /linea-nueva/:venta_id - Obtener línea nueva por venta
  router.get("/linea-nueva/:venta_id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const venta_id = Number((ctx.params).venta_id);

      const lineaNueva = await lineaNuevaController.getByVenta({ venta: venta_id });

      if (!lineaNueva) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Línea nueva no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: lineaNueva,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // POST /linea-nueva - Crear línea nueva
  router.post(
    "/linea-nueva",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        const result = LineaNuevaCreateSchema.safeParse(body.lineaNueva);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const newLineaNueva = await lineaNuevaController.create({ lineaNueva: result.data });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: newLineaNueva,
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

  // PUT /linea-nueva/:venta_id - Actualizar línea nueva
  router.put(
    "/linea-nueva/:venta_id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const venta_id = Number((ctx.params).venta_id);
        const body = await ctx.request.body.json();
        const result = LineaNuevaCreateSchema.partial().safeParse(body.lineaNueva);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const updatedLineaNueva = await lineaNuevaController.update({ id: venta_id, lineaNueva: result.data });

        if (!updatedLineaNueva) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Línea nueva no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedLineaNueva,
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

  // DELETE /linea-nueva/:venta_id - Eliminar línea nueva
  router.delete(
    "/linea-nueva/:venta_id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const venta_id = Number((ctx.params).venta_id);

        const deleted = await lineaNuevaController.delete({ id: venta_id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Línea nueva no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Línea nueva eliminada correctamente",
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

  // GET /linea-nueva/estadisticas - Obtener estadísticas de líneas nuevas
  router.get("/linea-nueva/estadisticas", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const stats = await lineaNuevaController.getStatistics();

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: stats,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  }  );

  // GET /linea-nueva/estado/:estado - Obtener líneas nuevas por estado
  router.get("/linea-nueva/estado/:estado", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { estado } = ctx.params;

      const lineaNuevas = await lineaNuevaController.getByEstado({ estado });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: lineaNuevas,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  return router;
}