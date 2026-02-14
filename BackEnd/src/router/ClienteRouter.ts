// BackEnd/src/router/ClienteRouter.ts
type ContextWithParams = Context & { params: Record<string, string> };
// ============================================
import { Router, Context } from "oak";
import { ClienteController } from "../Controller/ClienteController.ts";
import { ClienteService } from "../services/ClienteService.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { ClienteCreateSchema, ClienteUpdateSchema } from "../schemas/persona/Cliente.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_CAN_CREATE_CLIENTE, ROLES_ADMIN } from "../constants/roles.ts";
import { mapDatabaseError } from "../Utils/databaseErrorMapper.ts";

export function clienteRouter(clienteModel: ClienteModelDB, userModel: UserModelDB) {
  const router = new Router();
  const clienteService = new ClienteService(clienteModel);
  const clienteController = new ClienteController(clienteService);

  // GET /clientes - Obtener todos los clientes
  router.get("/clientes", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const clientes = await clienteController.getAllWithPersonaData({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: clientes,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /clientes/persona/:personaId - Obtener cliente con datos de persona
  router.get(
    "/clientes/persona/:personaId",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      try {
        const { personaId } = ctx.params;

        const cliente = await clienteController.getWithPersonaData({
          personaId,
        });

        if (!cliente) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Cliente no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: cliente,
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
    },
  );

  // GET /clientes/completo - Obtener todos los clientes con datos de persona
  router.get("/clientes/completo", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const clientes = await clienteController.getAllWithPersonaData({
        page,
        limit,
      });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: clientes,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /clientes/buscar - Buscar cliente por tipo y número de documento
  router.get("/clientes/buscar", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const tipo_documento = url.searchParams.get("tipo_documento");
      const documento = url.searchParams.get("documento");

      if (!tipo_documento || !documento) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "tipo_documento y documento son requeridos",
        };
        return;
      }

      const cliente = await clienteController.getByDocumento({
        tipo_documento,
        documento,
      });

      if (!cliente) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Cliente no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cliente,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /clientes/:id - Obtener un cliente por ID
  router.get("/clientes/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;

      const cliente = await clienteController.getById({ id });

      if (!cliente) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Cliente no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: cliente,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // POST /clientes - Crear un nuevo cliente
  router.post(
    "/clientes",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_CAN_CREATE_CLIENTE),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        const result = ClienteCreateSchema.safeParse(body.cliente);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${
              result.error.errors.map((error: { message: string }) =>
                error.message
              ).join(", ")
            }`,
          };
          return;
        }

        const newCliente = await clienteController.create({
          cliente: result.data,
        });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: newCliente,
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    },
  );

  // PUT /clientes/:id - Actualizar un cliente
  router.put(
    "/clientes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const body = await ctx.request.body.json();
        // Validar con Zod
        const result = ClienteUpdateSchema.safeParse(body.cliente);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const updatedCliente = await clienteController.update({
          id,
          cliente: result.data,
        });

        if (!updatedCliente) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Cliente no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedCliente,
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    },
  );

  // DELETE /clientes/:id - Eliminar un cliente
  router.delete(
    "/clientes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        const deleted = await clienteController.delete({ id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Cliente no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Cliente eliminado correctamente",
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    },
  );

  return router;
}
