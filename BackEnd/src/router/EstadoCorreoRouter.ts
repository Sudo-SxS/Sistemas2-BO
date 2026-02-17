// ============================================
type ContextWithParams = Context & { params: Record<string, string> };
// BackEnd/src/router/EstadoCorreoRouter.ts
// ============================================
import { Router, Context } from "oak";
import { load } from "dotenv";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_MANAGEMENT, ROLES_ADMIN } from "../constants/roles.ts";
import { logger } from "../Utils/logger.ts";
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { EstadoCorreoController } from "../Controller/EstadoCorreoController.ts";
import { EstadoCorreoCreateSchema, EstadoCorreoCreate, EstadoCorreoUpdate, EstadoCorreoUpdateSchema } from "../schemas/correo/EstadoCorreo.ts";
import { ZodError, ZodIssue } from "zod";

await load({ export: true });

/**
 * Router de Estado de Correo
 * Gestiona todas las rutas de tracking y seguimiento
 */
export function estadoCorreoRouter(
  estadoCorreoModel: EstadoCorreoModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();
  const estadoCorreoController = new EstadoCorreoController(estadoCorreoModel);

  /**
   * GET /estados-correo
   * Obtiene todos los estados con paginación
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;

        logger.info(
          `GET /estados-correo - Página: ${page}, Límite: ${limit}`,
        );

        const estados = await estadoCorreoController.getAll({ page, limit });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
          pagination: {
            page,
            limit,
            total: estados.length,
          },
        };
      } catch (error) {
        logger.error("GET /estados-correo:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener estados",
        };
      }
    },
  );

  /**
   * GET /estados-correo/stats
   * Obtiene estadísticas de estados
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/stats",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /estados-correo/stats");

        const stats = await estadoCorreoController.getStats();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: stats,
        };
      } catch (error) {
        logger.error("GET /estados-correo/stats:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener estadísticas",
        };
      }
    },
  );

  /**
   * GET /estados-correo/entregados
   * Obtiene correos entregados (estado = 'ENTREGADO')
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/entregados",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /estados-correo/entregados");

        const estados = await estadoCorreoController.getEntregados();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/entregados:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos entregados",
        };
      }
    },
  );

  /**
   * GET /estados-correo/no-entregados
   * Obtiene correos no entregados (estado = 'NO ENTREGADO')
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/no-entregados",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /estados-correo/no-entregados");

        const estados = await estadoCorreoController.getNoEntregados();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/no-entregados:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos no entregados",
        };
      }
    },
  );

  /**
   * GET /estados-correo/devueltos
   * Obtiene correos devueltos (estado = 'DEVUELTO AL CLIENTE')
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/devueltos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /estados-correo/devueltos");

        const estados = await estadoCorreoController.getDevueltos();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/devueltos:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos devueltos",
        };
      }
    },
  );

  /**
   * GET /estados-correo/en-transito
   * Obtiene correos en tránsito (estado = 'EN TRANSITO')
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/en-transito",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /estados-correo/en-transito");

        const estados = await estadoCorreoController.getEnTransito();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/en-transito:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos en tránsito",
        };
      }
    },
  );

  /**
   * GET /estados-correo/asignados
   * Obtiene correos asignados (estado = 'ASIGNADO')
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/asignados",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        logger.info("GET /estados-correo/asignados");

        const estados = await estadoCorreoController.getAsignados();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/asignados:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos asignados",
        };
      }
    },
  );

  /**
   * GET /estados-correo/por-estado/:estado
   * Obtiene correos por estado específico
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/por-estado/:estado",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { estado } = ctx.params;

        if (!estado) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Estado requerido en la URL",
          };
          return;
        }

        logger.info(`GET /estados-correo/por-estado/${estado}`);

        const estados = await estadoCorreoController.getByEstado({ estado });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/por-estado/:estado:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos por estado",
        };
      }
    },
  );

  /**
   * GET /estados-correo/search/sap
   * Busca HISTORIAL COMPLETO por código SAP (devuelve array con todos los estados)
   * Acceso: SUPERVISOR, BACK_OFFICE, VENDEDOR
   */
  router.get(
    "/estados-correo/search/sap",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT, "VENDEDOR"),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const sap = url.searchParams.get("sap");

        if (!sap) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Código SAP requerido en query params",
          };
          return;
        }

        logger.info(`GET /estados-correo/search/sap - SAP: ${sap}`);

        const estados = await estadoCorreoController.getBySAP({ sap });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
          total: estados.length,
          message: estados.length === 0
            ? "No se encontraron estados para este SAP"
            : `${estados.length} estados encontrados`,
        };
      } catch (error) {
        logger.error("GET /estados-correo/search/sap:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar historial",
        };
      }
    },
  );

  /**
   * GET /estados-correo/search/sap/ultimo
   * Busca ÚLTIMO ESTADO por código SAP (devuelve solo el más reciente)
   * Acceso: SUPERVISOR, BACK_OFFICE, VENDEDOR
   */
  router.get(
    "/estados-correo/search/sap/ultimo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT, "VENDEDOR"),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const sap = url.searchParams.get("sap");

        if (!sap) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Código SAP requerido en query params",
          };
          return;
        }

        logger.info(
          `GET /estados-correo/search/sap/ultimo - SAP: ${sap}`,
        );

        const estado = await estadoCorreoController.getLastBySAP({ sap });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estado,
        };
      } catch (error) {
        logger.error("GET /estados-correo/search/sap/ultimo:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Estado no encontrado",
        };
      }
    },
  );

  /**
   * GET /estados-correo/search/ubicacion
   * Busca estados por ubicación
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/search/ubicacion",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const ubicacion = url.searchParams.get("ubicacion");

        if (!ubicacion) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Ubicación requerida en query params",
          };
          return;
        }

        logger.info(
          `GET /estados-correo/search/ubicacion - Ubicación: ${ubicacion}`,
        );

        const estados = await estadoCorreoController.getByUbicacion({
          ubicacion,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error("GET /estados-correo/search/ubicacion:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar por ubicación",
        };
      }
    },
  );

  /**
   * GET /estados-correo/search/fecha-rango
   * Busca estados por rango de fechas
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/search/fecha-rango",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const url = ctx.request.url;
        const fechaInicio = url.searchParams.get("fechaInicio");
        const fechaFin = url.searchParams.get("fechaFin");

        if (!fechaInicio || !fechaFin) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Fechas de inicio y fin requeridas en query params",
          };
          return;
        }

        logger.info(
          `GET /estados-correo/search/fecha-rango - ${fechaInicio} a ${fechaFin}`,
        );

        const estados = await estadoCorreoController.getByFechaRango({
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estados,
        };
      } catch (error) {
        logger.error(
          "GET /estados-correo/search/fecha-rango:",
          error,
        );
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar por rango de fechas",
        };
      }
    },
  );

  /**
   * GET /estados-correo/:id
   * Obtiene un estado por ID
   * Acceso: SUPERVISOR, BACK_OFFICE
   */
  router.get(
    "/estados-correo/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado requerido",
          };
          return;
        }

        const idNumber = Number(id);
        if (isNaN(idNumber) || idNumber <= 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado inválido",
          };
          return;
        }

        logger.info(`GET /estados-correo/${id}`);

        const estado = await estadoCorreoController.getById({ id: idNumber });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: estado,
        };
      } catch (error) {
        logger.error("GET /estados-correo/:id:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Estado no encontrado",
        };
      }
    },
  );

  /**
   * POST /estados-correo
   * Crea un nuevo estado
   * Acceso: BACK_OFFICE
   */
  router.post(
    "/estados-correo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();

        if (!body || Object.keys(body).length === 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de estado requeridos",
          };
          return;
        }

        logger.info("POST /estados-correo");

        // Extraer usuario_id del token JWT (ctx.state.user)
        const usuario_id = (ctx.state.user as { id: string }).id;
        
        if (!usuario_id) {
          ctx.response.status = 401;
          ctx.response.body = {
            success: false,
            message: "Usuario no autenticado",
          };
          return;
        }

        const newEstado = {
          sap_id: body.sap_id,
          estado: body.estado || "INICIAL",
          descripcion: body.descripcion || null,
          usuario_id: usuario_id,
          ubicacion_actual: body.ubicacion_actual || null,
        };

        // Validar con Zod
        const parsed: EstadoCorreoCreate = EstadoCorreoCreateSchema.parse(
          newEstado,
        );

        const estado = await estadoCorreoController.create(parsed);
        if (!estado) {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error al crear estado",
          };
          return;
        }
        logger.info("Estado creado:", estado);

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Estado creado exitosamente",
          data: estado,
        };
      } catch (error) {
        logger.error("POST /estados-correo:", error);

        // 1️⃣ Primero verificar si es ZodError
        if (error instanceof ZodError) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Error de validación",
            errors: error.issues.map((issue: ZodIssue) => ({ // ✅ Ahora TypeScript sabe que error es ZodError
              field: issue.path.join("."),
              message: issue.message,
            })),
          };
          return;
        }

        // Luego verificar si es Error estándar
        if (error instanceof Error) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: error.message, // ✅ Ahora TypeScript sabe que error es Error
          };
          return;
        }

        // Fallback para otros tipos
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Error desconocido al crear estado",
        };
      }
    },
  );

  /**
   * PUT /estados-correo/:id
   * Actualiza un estado
   * Acceso: BACK_OFFICE
   */
  router.put(
    "/estados-correo/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado requerido",
          };
          return;
        }

        const idNumber = Number(id);
        if (isNaN(idNumber) || idNumber <= 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado inválido",
          };
          return;
        }

        const body = await ctx.request.body.json();
        const updateData = await body;

        if (!updateData || Object.keys(updateData).length === 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "No hay datos para actualizar",
          };
          return;
        }

        const updateEstado: EstadoCorreoUpdate = {};
        
        if (body.estado !== undefined) {
          updateEstado.estado = body.estado.toUpperCase();
        }
        if (body.descripcion !== undefined) {
          updateEstado.descripcion = body.descripcion;
        }
        if (body.ubicacion_actual !== undefined) {
          updateEstado.ubicacion_actual = body.ubicacion_actual;
        }

        logger.info(`PUT /estados-correo/${id}`);

        const estadoActualizado = await estadoCorreoController.update({
          id: idNumber,
          input: updateEstado,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Estado actualizado exitosamente",
          data: estadoActualizado,
        };
      } catch (error) {
        logger.error("PUT /estados-correo/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar estado",
        };
      }
    },
  );

  /**
   * PATCH /estados-correo/:id/marcar-entregado
   * Marca un correo como entregado
   * Acceso: BACK_OFFICE
   */
  router.patch(
    "/estados-correo/:id/marcar-entregado",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado requerido",
          };
          return;
        }

        const idNumber = Number(id);
        if (isNaN(idNumber) || idNumber <= 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado inválido",
          };
          return;
        }

        logger.info(`PATCH /estados-correo/${id}/marcar-entregado`);

        const estado = await estadoCorreoController.marcarComoEntregado({ id: idNumber });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Correo marcado como entregado exitosamente",
          data: estado,
        };
      } catch (error) {
        logger.error(
          "PATCH /estados-correo/:id/marcar-entregado:",
          error,
        );
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al marcar como entregado",
        };
      }
    },
  );

  /**
   * PATCH /estados-correo/:id/actualizar-ubicacion
   * Actualiza la ubicación de un correo
   * Acceso: BACK_OFFICE
   */
  router.patch(
    "/estados-correo/:id/actualizar-ubicacion",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado requerido",
          };
          return;
        }

        const idNumber = Number(id);
        if (isNaN(idNumber) || idNumber <= 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado inválido",
          };
          return;
        }

        const body = await ctx.request.body.json();
        const { ubicacion } = await body;

        if (!ubicacion) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Ubicación requerida en el body",
          };
          return;
        }

        logger.info(
          `PATCH /estados-correo/${id}/actualizar-ubicacion`,
        );

        const estado = await estadoCorreoController.actualizarUbicacion({
          id: idNumber,
          ubicacion,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Ubicación actualizada exitosamente",
          data: estado,
        };
      } catch (error) {
        logger.error(
          "PATCH /estados-correo/:id/actualizar-ubicacion:",
          error,
        );
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar ubicación",
        };
      }
    },
  );

  /**
   * DELETE /estados-correo/:id
   * Elimina un estado permanentemente
   * Acceso: SUPERADMIN
   */
  router.delete(
    "/estados-correo/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado requerido",
          };
          return;
        }

        const idNumber = Number(id);
        if (isNaN(idNumber) || idNumber <= 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de estado inválido",
          };
          return;
        }

        logger.info(`DELETE /estados-correo/${id}`);

        await estadoCorreoController.delete({ id: idNumber });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Estado eliminado exitosamente",
        };
      } catch (error) {
        logger.error("DELETE /estados-correo/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar estado",
        };
      }
    },
  );

  /**
   * POST /estados-correo/bulk
   * Crear múltiples estados de correo (bulk)
   * Body: { estados: EstadoCorreoCreate[] }
   */
  router.post(
    "/estados-correo/bulk",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        await estadoCorreoController.bulkCreate(ctx);

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Estados de correo creados exitosamente",
        };
      } catch (error) {
        logger.error("POST /estados-correo/bulk:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear estados masivamente",
        };
      }
    },
  );

  return router;
}
