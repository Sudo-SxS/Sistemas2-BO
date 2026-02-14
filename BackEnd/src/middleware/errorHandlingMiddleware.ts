// ============================================
// BackEnd/src/middleware/errorHandlingMiddleware.ts
// ============================================
import { Context } from "oak";
import { ServiceDegradedError } from "../types/errors.ts";
import { logger } from "../Utils/logger.ts";

/**
 * Middleware para manejar errores de servicio degradado
 * Proporciona respuestas HTTP apropiadas cuando el sistema está en modo degradado
 */
export function handleServiceDegradedError(error: Error, ctx: Context): boolean {
  if (error instanceof ServiceDegradedError) {
    ctx.response.status = 503;
    ctx.response.body = {
      success: false,
      message: "Servicio temporalmente no disponible",
      error: "SERVICE_DEGRADED",
      details: error.message,
      timestamp: new Date().toISOString(),
      retryAfter: 30, // Sugerir reintento en 30 segundos
    };
    
    logger.warn(`Service degraded response: ${error.message}`);
    return true;
  }
  
  return false;
}

/**
 * Middleware para manejar errores de conexión
 */
export function handleConnectionError(error: Error, ctx: Context): boolean {
  if (error.name === "ConnectionUnavailableError" || 
      error.name === "ConnectionTimeoutError") {
    ctx.response.status = 503;
    ctx.response.body = {
      success: false,
      message: "Base de datos no disponible",
      error: "DATABASE_UNAVAILABLE",
      details: error.message,
      timestamp: new Date().toISOString(),
      retryAfter: 60,
    };
    
    logger.error(`Database connection error: ${error.message}`);
    return true;
  }
  
  return false;
}

/**
 * Middleware principal de manejo de errores resiliente
 */
export async function errorHandlerMiddleware(ctx: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    if (error instanceof Error) {
      // Primero intentar manejar errores específicos
      if (handleServiceDegradedError(error, ctx)) return;
      if (handleConnectionError(error, ctx)) return;
      
      // Manejo general de errores
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
        details: error.message,
        timestamp: new Date().toISOString(),
      };
      
      logger.error(`Unhandled error: ${error.message}`, { stack: error.stack });
    } else {
      // Error no estándar
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
        error: "UNKNOWN_ERROR",
        timestamp: new Date().toISOString(),
      };
      
      logger.error(`Unknown error: ${error}`);
    }
  }
}

/**
 * Helper para crear wrappers de controladores con manejo de errores resiliente
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Re-lanzar para que el middleware lo maneje
      throw error;
    }
  };
}