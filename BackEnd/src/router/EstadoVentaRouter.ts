// ============================================
// BackEnd/src/router/EstadoVentaRouter.ts
// VERSIÓN CORREGIDA Y MEJORADA
// ============================================
import { Context, Router } from "oak";
import { EstadoVentaController } from "../Controller/EstadoVentaController.ts";
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Estado Venta
 * Rutas organizadas por funcionalidad
 */
export function estadoVentaRouter(
  estadoVentaModel: EstadoVentaModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();

  // Instancias
  const estadoVentaService = new EstadoVentaService(estadoVentaModel);
  const estadoVentaController = new EstadoVentaController(estadoVentaService);

  // ====================================
  // RUTAS DE CONSULTA (GET)
  // ====================================

  /**
   * GET /estados
   * Obtener todos los estados con paginación
   * Query params: page, limit
   */
  router.get(
    "/estados",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getAll(ctx);
    },
  );

  /**
   * GET /estados/ultimos
   * Obtener el último estado de cada venta
   * IMPORTANTE: Esta ruta debe estar ANTES de /estados/:id
   */
  router.get(
    "/estados/ultimos",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getAllLastEstado(ctx);
    },
  );

  /**
   * GET /estados/buscar
   * Búsqueda avanzada con múltiples filtros
   * Query params: venta_id, estado, usuario_id, fechaInicio, fechaFin, page, limit
   */
  router.get(
    "/estados/buscar",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getByMultipleFilters(ctx);
    },
  );

  /**
   * GET /estados/por-fecha
   * Filtrar estados por rango de fechas
   * Query params: fechaInicio, fechaFin
   */
  router.get(
    "/estados/por-fecha",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getByFechaRango(ctx);
    },
  );

  /**
   * GET /estados/tipo/:estado
   * Filtrar por tipo de estado específico
   */
  router.get(
    "/estados/tipo/:estado",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getByEstado(ctx);
    },
  );

  /**
   * GET /estados/venta/:venta_id
   * Obtener todos los estados de una venta
   */
  router.get(
    "/estados/venta/:venta_id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getByVentaId(ctx);
    },
  );

  /**
   * GET /estados/venta/:venta_id/ultimo
   * Obtener el último estado de una venta específica
   */
  router.get(
    "/estados/venta/:venta_id/ultimo",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getLastByVentaId(ctx);
    },
  );

  /**
   * GET /estados/:id
   * Obtener un estado por ID
   * IMPORTANTE: Esta ruta debe estar al FINAL de las rutas GET
   */
  router.get(
    "/estados/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getById(ctx);
    },
  );

  // ====================================
  // RUTAS DE MODIFICACIÓN (POST, PUT, DELETE)
  // ====================================

  /**
   * POST /estados
   * Crear un nuevo estado
   * Body: EstadoVentaCreate (usuario_id se inyecta del JWT)
   */
  router.post(
    "/estados",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();

        // Inyectar usuario_id del JWT en el body
        if (ctx.state.user && (ctx.state.user as any).id) {
          body.usuario_id = (ctx.state.user as { id: string }).id;
        }

        // Crear nuevo contexto con el body modificado
        const modifiedCtx = {
          ...ctx,
          request: {
            ...ctx.request,
            body: {
              json: async () => body,
            },
          },
        } as ContextWithParams;

        await estadoVentaController.create(modifiedCtx);
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error al procesar la solicitud",
        };
      }
    },
  );

  /**
   * PUT /estados/:id
   * Actualizar un estado existente
   * Body: EstadoVentaUpdate
   */
  router.put(
    "/estados/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.update(ctx);
    },
  );

  /**
   * DELETE /estados/:id
   * Eliminar un estado
   * Solo para SUPER_ADMIN y ADMIN
   */
  router.delete(
    "/estados/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN"),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.delete(ctx);
    },
  );

  /**
   * POST /estados/bulk
   * Crear múltiples estados (bulk)
   * Body: { estados: EstadoVentaCreate[] }
   */
  router.post(
    "/estados/bulk",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN", "BACK_OFFICE"),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.bulkCreate(ctx);
    },
  );

  return router;
}
