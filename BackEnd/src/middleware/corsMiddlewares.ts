// middleware/corsMiddlewares.ts
import { Context, Middleware, Next } from "oak";
import { logger } from "../Utils/logger.ts";

/**
 * Middleware de CORS personalizado
 *
 * Maneja Cross-Origin Resource Sharing sin depender de librerías externas
 * que pueden causar problemas con next().
 */
export const corsMiddleware: Middleware = async (ctx: Context, next: Next) => {
  // Obtener el origen de la request
  const requestOrigin = ctx.request.headers.get("Origin");

  // Configurar headers de CORS
  const isDevelopment = Deno.env.get("MODO") === "development" || Deno.env.get("MODO") === "dev";

  if (isDevelopment) {
    // En desarrollo, permitir cualquier origen
    ctx.response.headers.set(
      "Access-Control-Allow-Origin",
      requestOrigin || "*",
    );
  } else {
    // En producción, leer orígenes permitidos desde variable de entorno
    const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");
    const allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(",").map((origin) => origin.trim())
      : [
        "https://tu-dominio.com",
        "https://www.tu-dominio.com",
      ];

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      ctx.response.headers.set("Access-Control-Allow-Origin", requestOrigin);
    }
  }

  // Permitir credenciales (cookies)
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");

  // Headers permitidos
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie",
  );

  // Métodos permitidos
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  // Duración de la cache de preflight
  ctx.response.headers.set("Access-Control-Max-Age", "86400");

  // Headers expuestos al cliente
  ctx.response.headers.set(
    "Access-Control-Expose-Headers",
    "Content-Length, Content-Type",
  );

  // Manejar preflight requests (OPTIONS)
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
    ctx.response.body = null;
    return; // ✅ IMPORTANTE: No llamar next() para OPTIONS
  }

  // ✅ Para otros métodos HTTP, continuar con el siguiente middleware
  await next();
};

/**
 * Middleware de timing
 *
 * Mide el tiempo de respuesta de cada request y lo registra en consola.
 * También agrega el header X-Response-Time a la respuesta.
 */
export const timingMiddleware: Middleware = async (
  ctx: Context,
  next: Next,
) => {
  const start = Date.now();

  // ✅ Ejecutar el siguiente middleware/handler
  await next();

  // Calcular tiempo transcurrido
  const ms = Date.now() - start;

  // Agregar header de timing
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);

  // Log en consola (solo en desarrollo o para todas las requests)
  const isDevelopment = Deno.env.get("MODO") === "development";
  if (isDevelopment) {
    const method = ctx.request.method;
    const path = ctx.request.url.pathname;
    const status = ctx.response.status;

    // Color según el status
    let statusColor = "";
    if (status >= 200 && status < 300) statusColor = "✅"; // Success
    else if (status >= 300 && status < 400) statusColor = "↪️"; // Redirect
    else if (status >= 400 && status < 500) statusColor = "⚠️"; // Client Error
    else if (status >= 500) statusColor = "❌"; // Server Error

    logger.info(`${method} ${path} - ${statusColor} - ${ms}ms`);
  }
};

/**
 * Middleware de manejo de errores global
 *
 * Captura errores no manejados y envía una respuesta apropiada.
 * IMPORTANTE: Debe ser uno de los primeros middlewares registrados.
 */
export const errorMiddleware: Middleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    logger.error("Error no manejado:", error);

    const isDevelopment = Deno.env.get("MODO") === "development";

    // Determinar el código de estado
    let status = 500;
    let message = "Error interno del servidor";

    if (error instanceof Error) {
      // Intentar extraer el status del error si existe
      if ("status" in error && typeof error.status === "number") {
        status = error.status;
      }

      // En desarrollo, mostrar el mensaje real del error
      if (isDevelopment) {
        message = error.message;
      }
    }

    // Enviar respuesta de error
    ctx.response.status = status;
    ctx.response.body = {
      success: false,
      message: message,
      ...(isDevelopment && error instanceof Error && {
        stack: error.stack,
        error: error.toString(),
      }),
    };
  }
};

/**
 * Middleware para logging de requests
 *
 * Registra información básica de cada request entrante.
 */
export const loggerMiddleware: Middleware = async (
  ctx: Context,
  next: Next,
) => {
  const isDevelopment = Deno.env.get("MODO") === "development";

  if (isDevelopment) {
    const method = ctx.request.method;
    const path = ctx.request.url.pathname;
    const timestamp = new Date().toISOString();

    logger.info(`${method} ${path}`);
  }

  await next();
};
