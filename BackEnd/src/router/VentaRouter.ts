// ============================================
// BackEnd/src/router/VentaRouter.ts
// ============================================
import { Context, Router } from "oak";
import { logger } from "../Utils/logger.ts";

type ContextWithParams = Context & { params: Record<string, string> };
import { VentaController } from "../Controller/VentaController.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import {
  VentaCreate,
  VentaCreateSchema,
  VentaUpdateSchema,
} from "../schemas/venta/Venta.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { CorreoCreateSchema } from "../schemas/correo/Correo.ts";
import { CorreoController } from "../Controller/CorreoController.ts";
import { LineaNuevaController } from "../Controller/LineaNuevaController.ts";
import { PortabilidadController } from "../Controller/PortabilidadController.ts";
import { EstadoVentaController } from "../Controller/EstadoVentaController.ts";
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
// Eliminadas referencias a MySQL - usando solo PostgreSQL
import { PlanService } from "../services/PlanService.ts";
import { PromocionService } from "../services/PromocionService.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { mapDatabaseError } from "../Utils/databaseErrorMapper.ts";
import { VentaRequest } from "../types/ventaTypes.ts";
import { load } from "dotenv";

await load({ export: true });

// Función helper para convertir BigInt a string en respuestas JSON
function convertBigIntToString(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  // PostgreSQL/Deno puede devolver objetos Date con estructura específica
  if (obj !== null && typeof obj === 'object') {
    // Verificar si tiene método toISOString (obj Date de Deno/PostgreSQL)
    if (typeof obj.toISOString === 'function') {
      return obj.toISOString();
    }
    // Verificar si es un objeto con epoch (timestamp de PostgreSQL)
    if (obj.epoch && typeof obj.epoch === 'number') {
      return new Date(obj.epoch * 1000).toISOString();
    }
    // Si es un array (tiene propiedad length y no es un objeto Date)
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    // Es un objeto regular, convertir sus propiedades
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  return obj;
}

export function ventaRouter(
  ventaModel: VentaModelDB,
  userModel: UserModelDB,
  correoModel: CorreoModelDB,
  lineaNuevaModel: LineaNuevaModelDB,
  portabilidadModel: PortabilidadModelDB,
  clienteModel: ClienteModelDB,
  planModel: PlanModelDB,
  promocionModel: PromocionModelDB,
  estadoVentaModel: EstadoVentaModelDB,
) {
  const router = new Router();
  const ventaController = new VentaController(
    ventaModel,
    clienteModel,
    correoModel,
    lineaNuevaModel,
    portabilidadModel,
    planModel,
    promocionModel,
    estadoVentaModel,
  );
  const planService = new PlanService(planModel);
  const promocionService = new PromocionService(promocionModel);
  // const estadoVentaModel = new EstadoVentaMySQL(client); // Eliminado - usando solo PostgreSQL
// const estadoVentaService = new EstadoVentaService(estadoVentaModel); // Desactivado - no hay modelo PostgreSQL equivalente
// const estadoVentaController = new EstadoVentaController(estadoVentaService); // Desactivado temporalmente
  const correoController = new CorreoController(correoModel);
  const lineaNuevaController = new LineaNuevaController(
    lineaNuevaModel,
    ventaModel,
    portabilidadModel,
  );
  const portabilidadController = new PortabilidadController(
    portabilidadModel,
    ventaModel,
    lineaNuevaModel,
  );

  // ============================================
  // GET /ventas - Obtener todas las ventas
  // ============================================
  router.get(
    "/ventas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;

        logger.debug(`GET /ventas - Página: ${page}, Límite: ${limit}`);

        const ventas = (await ventaController.getAll({ page, limit })) || [];

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: convertBigIntToString(ventas),
          pagination: {
            page,
            limit,
            total: ventas.length,
          },
        };
      } catch (error) {
        logger.error("GET /ventas:", error);
        const isDev = Deno.env.get("MODO") === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          ctx.response.status = mapped.statusCode;
          ctx.response.body = { success: false, message: mapped.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: isDev
              ? (error as Error).message
              : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack }),
          };
        }
      }
    },
  );

  // ============================================
  // GET /ventas/estadisticas - Obtener estadísticas de ventas
  // ============================================
  router.get(
    "/ventas/estadisticas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        logger.debug("GET /ventas/estadisticas");

        const stats = await ventaController.getStatistics();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: stats,
        };
      } catch (error) {
        logger.error("GET /ventas/estadisticas:", error);
        const isDev = Deno.env.get("MODO") === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          ctx.response.status = mapped.statusCode;
          ctx.response.body = { success: false, message: mapped.message };
        } else {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: isDev
              ? (error as Error).message
              : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack }),
          };
        }
      }
    },
  );

  // ============================================
  // GET /ventas/fechas - Obtener ventas por rango de fechas
  // ============================================
  router.get(
    "/ventas/fechas",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const url = ctx.request.url;
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");

        if (!start || !end) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Parámetros 'start' y 'end' son requeridos",
          };
          return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Fechas inválidas",
          };
          return;
        }

        logger.debug(`GET /ventas/fechas - ${start} a ${end}`);

        const ventas = await ventaController.getByDateRange({
          start: startDate,
          end: endDate,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        logger.error("GET /ventas/fechas:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error al buscar ventas por fecha",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/sds/:sds - Obtener venta por SDS
  // ============================================
  router.get(
    "/ventas/sds/:sds",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { sds } = (ctx as ContextWithParams).params;

        logger.debug(`GET /ventas/sds/${sds}`);

        const venta = await ventaController.getBySDS({ sds });

        if (!venta) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: venta,
        };
      } catch (error) {
        logger.error("GET /ventas/sds:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error al buscar venta por SDS",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/sap/:sap - Obtener venta por SAP
  // ============================================
  router.get(
    "/ventas/sap/:sap",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { sap } = (ctx as ContextWithParams).params;

        logger.debug(`GET /ventas/sap/${sap}`);

        const venta = await ventaController.getBySAP({ sap });

        if (!venta) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: venta,
        };
      } catch (error) {
        logger.error("GET /ventas/sap:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error al buscar venta por SAP",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/vendedor/:vendedor - Obtener ventas por vendedor
  // ============================================
  router.get(
    "/ventas/vendedor/:vendedor",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { vendedor } = (ctx as ContextWithParams).params;

        logger.debug(`GET /ventas/vendedor/${vendedor}`);

        const ventas = await ventaController.getByVendedor({ vendedor });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        logger.error("GET /ventas/vendedor:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error al buscar ventas por vendedor",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/cliente/:cliente - Obtener ventas por cliente
  // ============================================
  router.get(
    "/ventas/cliente/:cliente",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { cliente } = (ctx as ContextWithParams).params;

        logger.debug(`GET /ventas/cliente/${cliente}`);

        const ventas = await ventaController.getByCliente({ cliente });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        logger.error("GET /ventas/cliente:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error al buscar ventas por cliente",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/plan/:plan - Obtener ventas por plan
  // ============================================
  router.get(
    "/ventas/plan/:plan",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const plan = Number((ctx as ContextWithParams).params.plan);

        if (isNaN(plan)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de plan inválido",
          };
          return;
        }

        logger.debug(`GET /ventas/plan/${plan}`);

        const ventas = await ventaController.getByPlan({ plan });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        logger.error("GET /ventas/plan:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error al buscar ventas por plan",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/:id/detalle - Obtener detalle completo de una venta
  // Devuelve todos los datos relacionados en una sola respuesta
  // ============================================
  router.get(
    "/ventas/:id/detalle",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { id } = (ctx as ContextWithParams).params;
        const ventaId = Number(id);

        if (isNaN(ventaId)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de venta inválido",
          };
          return;
        }

        logger.debug(`GET /ventas/${id}/detalle`);

        await ventaController.getVentaDetalleCompleto(ctx);
      } catch (error) {
        logger.error("GET /ventas/:id/detalle:", error);
        const isDev = Deno.env.get("MODO") === "development";
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: isDev
            ? (error as Error).message
            : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack }),
        };
      }
    },
  );

  // ============================================
  // GET /ventas/ui - Obtener ventas optimizadas para UI
  // Con JOINs completos, paginación, filtros y lógica de permisos
  // Router → Controller → Service → Model
  // ============================================
  router.get(
    "/ventas/ui",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        await ventaController.getVentasUI(ctx);
      } catch (error) {
        logger.error("GET /ventas/ui:", error);
        const isDev = Deno.env.get("MODO") === "development";
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: isDev
            ? (error as Error).message
            : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack }),
        };
      }
    },
  );

  // ============================================
  // GET /ventas/:id - Obtener una venta por ID
  // DEBE IR DESPUÉS DE /ventas/ui y /ventas/:id/detalle
  // ============================================
  router.get("/ventas/:id", authMiddleware(userModel), async (ctx: Context) => {
    try {
      const { id } = (ctx as ContextWithParams).params;

      logger.debug(`GET /ventas/${id}`);

      const venta = await ventaController.getById({ id });

      if (!venta) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Venta no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: venta,
      };
    } catch (error) {
      logger.error("GET /ventas/:id:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message:
          error instanceof Error ? error.message : "Error al obtener venta",
      };
    }
  });

  // ============================================
  // POST /ventas - Crear una nueva venta
  // ============================================
  router.post("/ventas", authMiddleware(userModel), async (ctx: Context) => {
    try {
      const body: VentaRequest = await ctx.request.body.json();

      const result = await ventaController.createFullVenta(
        body,
        ctx.state.user.id,
      );
      ctx.response.status = result.success ? 201 : result.errors ? 400 : 500;
      ctx.response.body = result;
    } catch (error) {
      logger.error("POST /ventas:", error);

      const isDev = Deno.env.get("MODO") === "development";
      const mapped = mapDatabaseError(error, isDev);
      if (mapped) {
        ctx.response.status = mapped.statusCode;
        ctx.response.body = { success: false, message: mapped.message };
      } else {
        ctx.response.status = 500;
        const body: Record<string, unknown> = {
          success: false,
          message: isDev
            ? (error as Error).message
            : "Error interno del servidor",
        };
        if (isDev) {
          body.stack = (error as Error).stack;
        }
        ctx.response.body = body;
      }
    }
  });

  // ============================================
  // PUT /ventas/:id - Actualizar una venta
  // ============================================
  router.put(
    "/ventas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const body = await ctx.request.body.json();

        logger.debug(`PUT /ventas/${id}`);

        const result = VentaUpdateSchema.safeParse(body);

        if (!result.success) {
          logger.error(
            "PUT /ventas/:id validation error:",
            result.error.errors,
          );

          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Validación fallida",
            errors: result.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
            ...(Deno.env.get("MODO") === "development" && {
              stack: result.error.stack,
              details: result.error,
            }),
          };
          return;
        }

        const updatedVenta = await ventaController.update({
          id,
          venta: result.data,
        });

        logger.info("PUT /ventas/:id - Success");
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedVenta,
        };
      } catch (error) {
        logger.error("PUT /ventas/:id:", error);

        const isDev = Deno.env.get("MODO") === "development";
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error interno del servidor",
          ...(isDev && {
            stack: (error as Error).stack,
            details: error,
          }),
        };
      }
    },
  );

  // ============================================
  // DELETE /ventas/:id - Eliminar una venta
  // ============================================
  router.delete(
    "/ventas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        logger.debug(`DELETE /ventas/${id}`);

        const deleted = await ventaController.delete({ id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        logger.info("DELETE /ventas/:id - Success");
        ctx.response.status = 204;
      } catch (error) {
        logger.error("DELETE /ventas/:id:", error);

        const isDev = Deno.env.get("MODO") === "development";
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error interno del servidor",
          ...(isDev && {
            stack: (error as Error).stack,
            details: error,
          }),
        };
      }
    },
  );

  return router;
}
