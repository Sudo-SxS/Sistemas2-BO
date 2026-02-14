// BackEnd/src/router/PortabilidadRouter.ts
type ContextWithParams = Context & { params: Record<string, string> };
// ============================================
import { Router, Context } from "oak";
import { PortabilidadController } from "../Controller/PortabilidadController.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { PortabilidadCreateSchema, PortabilidadUpdateSchema } from "../schemas/venta/Portabilidad.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN } from "../constants/roles.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";

export function portabilidadRouter(
  portabilidadModel: PortabilidadModelDB,
  ventaModel: VentaModelDB,
  lineaNuevaModel: LineaNuevaModelDB,
  userModel: UserModelDB
) {
  const router = new Router();
  const portabilidadController = new PortabilidadController(portabilidadModel, ventaModel, lineaNuevaModel);

  // GET /portabilidad - Obtener todas las portabilidades
  router.get("/portabilidad", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const portabilidades = await portabilidadController.getAll({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: portabilidades,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /portabilidad/:venta_id - Obtener portabilidad por venta
  router.get("/portabilidad/:venta_id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const venta_id = Number((ctx.params).venta_id);

      const portabilidad = await portabilidadController.getByVenta({ venta: venta_id });

      if (!portabilidad) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Portabilidad no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: portabilidad,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // POST /portabilidad - Crear portabilidad
  router.post(
    "/portabilidad",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        const result = PortabilidadCreateSchema.safeParse(body.portabilidad);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const newPortabilidad = await portabilidadController.create({ portabilidad: result.data });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: newPortabilidad,
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

  // PUT /portabilidad/:venta_id - Actualizar portabilidad
  router.put(
    "/portabilidad/:venta_id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const venta_id = Number((ctx.params).venta_id);
        const body = await ctx.request.body.json();
        const result = PortabilidadUpdateSchema.safeParse(body.portabilidad);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const updatedPortabilidad = await portabilidadController.update({ id: venta_id, portabilidad: result.data });

        if (!updatedPortabilidad) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Portabilidad no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedPortabilidad,
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

  // DELETE /portabilidad/:venta_id - Eliminar portabilidad
  router.delete(
    "/portabilidad/:venta_id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const venta_id = Number((ctx.params).venta_id);

        const deleted = await portabilidadController.delete({ id: venta_id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Portabilidad no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Portabilidad eliminada correctamente",
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

  // GET /portabilidad/estadisticas - Obtener estadísticas de portabilidades
  router.get("/portabilidad/estadisticas", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const stats = await portabilidadController.getStatistics();

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

  // GET /portabilidad/estado/:estado - Obtener portabilidades por estado
  router.get("/portabilidad/estado/:estado", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { estado } = ctx.params;

      const portabilidades = await portabilidadController.getByEstado({ estado });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: portabilidades,
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