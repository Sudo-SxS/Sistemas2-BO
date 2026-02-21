// ============================================
// BackEnd/src/router/EstadisticaRouter.ts
// Router para endpoint de estadísticas
// ============================================

import { Context, Router } from "oak";
import { load } from "dotenv";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_MANAGEMENT } from "../constants/roles.ts";
import { EstadisticaController } from "../Controller/EstadisticaController.ts";
import { EstadisticaService } from "../services/EstadisticaService.ts";
import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

await load({ export: true });

type ContextWithParams = Context & { params: Record<string, string> };

export function estadisticaRouter(estadisticaModel: EstadisticaPostgreSQL, usuarioModel: UserModelDB) {
  const router = new Router();

  const estadisticaService = new EstadisticaService(estadisticaModel);
  const estadisticaController = new EstadisticaController(estadisticaService);

  router.get(
    "/estadisticas",
    authMiddleware(usuarioModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const periodo = url.searchParams.get("periodo") || "MES";
        const cellaId = url.searchParams.get("cellaId") || undefined;
        const asesorId = url.searchParams.get("asesorId") || undefined;
        const fechaPortacionDesde = url.searchParams.get("fechaPortacionDesde") || undefined;
        const fechaPortacionHasta = url.searchParams.get("fechaPortacionHasta") || undefined;

        logger.info(`GET /estadisticas - periodo: ${periodo}, cellaId: ${cellaId}, asesorId: ${asesorId}`);

        const user = ctx.state.user;
        const filters = {
          periodo: periodo as any,
          cellaId,
          asesorId,
          userId: user?.persona_id,
          userRol: user?.rol,
          fechaPortacionDesde,
          fechaPortacionHasta,
        };

        const estadisticas = await estadisticaController.getEstadisticas(filters);

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estadisticas,
        };
      } catch (error) {
        logger.error("GET /estadisticas:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error ? error.message : "Error al obtener estadísticas",
        };
      }
    }
  );

  router.get(
    "/estadisticas/recargas",
    authMiddleware(usuarioModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const periodo = url.searchParams.get("periodo") || "MES";
        const cellaId = url.searchParams.get("cellaId") || undefined;
        const fechaPortacionDesde = url.searchParams.get("fechaPortacionDesde") || undefined;
        const fechaPortacionHasta = url.searchParams.get("fechaPortacionHasta") || undefined;

        logger.info(`GET /estadisticas/recargas - periodo: ${periodo}, cellaId: ${cellaId}`);

        const user = ctx.state.user;
        const filters = {
          periodo: periodo as any,
          cellaId,
          userId: user?.persona_id,
          userRol: user?.rol,
          fechaPortacionDesde,
          fechaPortacionHasta,
        };

        const recargas = await estadisticaController.getRecargas(filters);

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: recargas,
        };
      } catch (error) {
        logger.error("GET /estadisticas/recargas:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error ? error.message : "Error al obtener recargas",
        };
      }
    }
  );

  return router;
}
