// ============================================
// BackEnd/src/middleware/resilientController.ts
// ============================================
import { ServiceDegradedError } from "../types/errors.ts";
import { logger } from "../Utils/logger.ts";

/**
 * Base para controladores con manejo resiliente de errores
 * Proporciona métodos estáticos para manejar errores de servicio degradado
 */
export abstract class ResilientController {
  /**
   * Wrapper para métodos de controladores que maneja errores de servicio degradado
   * @param methodName Nombre del método para logging
   * @param handler Función del controlador a ejecutar
   * @returns Resultado del handler o lanza error apropiado
   */
  public static async withResilientHandling<T>(
    methodName: string,
    handler: () => Promise<T>
  ): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      // Si ya es un error de servicio degradado, re-lanzar
      if (error instanceof ServiceDegradedError) {
        logger.warn(`Service degraded in ${methodName}: ${error.message}`);
        throw error;
      }

      // Para errores de conexión, convertir a ServiceDegradedError
      if (
        error instanceof Error && 
        (error.message.includes("ECONNREFUSED") ||
         error.message.includes("timeout") ||
         error.message.includes("connection") ||
         error.message.includes("database") ||
         error.message.includes("ENOTFOUND"))
      ) {
        const degradedError = new ServiceDegradedError(
          `Base de datos no disponible en ${methodName}: ${error.message}`
        );
        logger.error(`Connection error in ${methodName}`, error);
        throw degradedError;
      }

      // Para otros errores, loggear y re-lanzar
      logger.error(`Unexpected error in ${methodName}`, error);
      throw error;
    }
  }

  /**
   * Verifica si el sistema está en modo degradado
   * @returns true si hay problemas de conexión
   */
  public static isSystemDegraded(error: any): boolean {
    return error instanceof ServiceDegradedError ||
           (error instanceof Error && 
            (error.message.includes("connection") ||
             error.message.includes("timeout") ||
             error.message.includes("database")));
  }

  /**
   * Crea una respuesta degradada estándar
   * @param operation Operación que falló
   * @param details Detalles adicionales
   * @returns Objeto de respuesta degradada
   */
  public static createDegradedResponse(
    operation: string,
    details?: string
  ) {
    return {
      success: false,
      message: `Servicio temporalmente no disponible para ${operation}`,
      error: "SERVICE_DEGRADED",
      details: details || "El sistema está funcionando en modo limitado sin conexión a base de datos",
      timestamp: new Date().toISOString(),
      retryAfter: 30,
      data: null
    };
  }

  /**
   * Wrapper para métodos GET que pueden retornar datos vacíos en modo degradado
   */
  public static async getWithFallback<T>(
    operation: string,
    handler: () => Promise<T>,
    fallbackValue: T
  ): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      if (this.isSystemDegraded(error)) {
        logger.warn(`Returning fallback value for ${operation} due to degraded service`);
        return fallbackValue;
      }
      throw error;
    }
  }
}

/**
 * Helper para decorar métodos de controladores con manejo resiliente
 */
export function resilient(methodName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = methodName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return ResilientController.withResilientHandling(name, () => 
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}