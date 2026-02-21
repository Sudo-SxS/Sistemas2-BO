// ============================================
// BackEnd/src/Controller/EstadisticaController.ts
// Controlador de estadísticas
// ============================================

import { Context } from "oak";
import { EstadisticaService } from "../services/EstadisticaService.ts";
import { EstadisticaFilters, Periodo } from "../interface/Estadistica.ts";
import { logger } from "../Utils/logger.ts";

function convertBigIntToString(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (obj !== null && typeof obj === "object") {
    if (typeof obj.toISOString === "function") {
      return obj.toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }
  return obj;
}

export class EstadisticaController {
  private service: EstadisticaService;

  constructor(service: EstadisticaService) {
    this.service = service;
  }

  async getEstadisticas(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Usuario no autenticado",
        };
        return;
      }

      const url = new URL(ctx.request.url);
      const periodo = (url.searchParams.get("periodo") || "MES") as Periodo;
      const cellaId = url.searchParams.get("cellaId") || undefined;
      const asesorId = url.searchParams.get("asesorId") || undefined;
      const fechaPortacionDesde = url.searchParams.get("fechaPortacionDesde") || undefined;
      const fechaPortacionHasta = url.searchParams.get("fechaPortacionHasta") || undefined;

      const filters: EstadisticaFilters = {
        periodo,
        cellaId,
        asesorId,
        userId: user.persona_id,
        userRol: user.rol,
        fechaPortacionDesde,
        fechaPortacionHasta,
      };

      logger.info("Consultando estadísticas para usuario:", {
        userId: user.persona_id,
        rol: user.rol,
        periodo,
        fechaPortacionDesde,
        fechaPortacionHasta,
      });

      const estadisticas = await this.service.getEstadisticas(filters);

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: convertBigIntToString(estadisticas),
      };
    } catch (error) {
      logger.error("Error en EstadisticaController.getEstadisticas:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error al obtener estadísticas",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getRecargas(ctx: Context) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Usuario no autenticado",
        };
        return;
      }

      const url = new URL(ctx.request.url);
      const periodo = (url.searchParams.get("periodo") || "MES") as Periodo;
      const cellaId = url.searchParams.get("cellaId") || undefined;
      const fechaPortacionDesde = url.searchParams.get("fechaPortacionDesde") || undefined;
      const fechaPortacionHasta = url.searchParams.get("fechaPortacionHasta") || undefined;

      const filters: EstadisticaFilters = {
        periodo,
        cellaId,
        userId: user.persona_id,
        userRol: user.rol,
        fechaPortacionDesde,
        fechaPortacionHasta,
      };

      const recargas = await this.service.getRecargas(filters);

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: convertBigIntToString(recargas),
      };
    } catch (error) {
      logger.error("Error en EstadisticaController.getRecargas:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error al obtener recargas",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
