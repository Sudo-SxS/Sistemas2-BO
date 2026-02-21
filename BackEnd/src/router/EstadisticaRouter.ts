// ============================================
// BackEnd/src/router/EstadisticaRouter.ts
// Router para endpoint de estadísticas
// ============================================

import { Router } from "oak";
import { EstadisticaController } from "../controller/EstadisticaController.ts";
import { EstadisticaService } from "../services/EstadisticaService.ts";
import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";

export function estadisticaRouter(pgClient: PostgresClient) {
  const router = new Router();

  const estadisticaModel = new EstadisticaPostgreSQL(pgClient);
  const estadisticaService = new EstadisticaService(estadisticaModel);
  const estadisticaController = new EstadisticaController(estadisticaService);

  const authenticatedRouter = new Router();
  authenticatedRouter.use(authMiddleware(pgClient as any));

  authenticatedRouter.get("/estadisticas", (ctx) =>
    estadisticaController.getEstadisticas(ctx)
  );
  authenticatedRouter.get("/estadisticas/recargas", (ctx) =>
    estadisticaController.getRecargas(ctx)
  );

  router.use(authenticatedRouter.routes());
  router.use(authenticatedRouter.allowedMethods());

  return router;
}
