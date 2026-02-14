// ============================================
// BackEnd/src/services/MensajeService.ts
// VERSIÓN CORREGIDA
// ============================================

import { MensajeModelDB } from "../interface/Mensaje.ts";
import {
  Mensaje,
  MensajeCreate,
  MensajeCreateSchema,
  TipoMensajeEnum,
} from "../schemas/mensaje/Mensaje.ts";
import { MensajeConEstado } from "../schemas/mensaje/MensajeDestinatario.ts";
import { logger } from "../Utils/logger.ts";

/**
 * Servicio de Mensajes
 * Gestiona la lógica de negocio para alertas y notificaciones
 */
export class MensajeService {
  private model: MensajeModelDB;

  constructor(model: MensajeModelDB) {
    this.model = model;
  }

  // ======================
  // CRUD BÁSICO
  // ======================

  /**
   * Crea un nuevo mensaje con resolución automática de destinatarios
   * Valida permisos según el tipo de mensaje
   */
  async create(params: {
    input: MensajeCreate;
    usuario_creador_rol: string;
  }): Promise<Mensaje> {
    try {
      const { input, usuario_creador_rol } = params;

      // Validar permisos según tipo de mensaje
      if (input.tipo === "NOTIFICACION") {
        // Solo ADMIN y BACK_OFFICE pueden crear notificaciones
        if (
          !["ADMIN", "BACK_OFFICE", "SUPERADMIN"].includes(usuario_creador_rol)
        ) {
          throw new Error("No tiene permisos para crear notificaciones");
        }
      }

      // Validar con Zod
      const validated = MensajeCreateSchema.parse(input);

      // Crear el mensaje
      const mensaje = await this.model.add({ input: validated });

      // Resolver destinatarios si se proporcionó configuración
      if (validated.destinatarios) {
        const destinatarios = await this.resolverDestinatarios({
          tipo: validated.destinatarios.tipo,
          valor: validated.destinatarios.valor,
          referencia_id: validated.referencia_id ?? undefined,
        });

        // Agregar destinatarios
        if (destinatarios.length > 0) {
          const count = await this.model.addDestinatarios({
            mensaje_id: mensaje.mensaje_id,
            usuarios_ids: destinatarios,
          });
          logger.info(
            `${count} destinatarios agregados al mensaje ${mensaje.mensaje_id}`,
          );
        }
      }

      return mensaje;
    } catch (error) {
      logger.error("Error en MensajeService.create:", error);
      throw error;
    }
  }

  /**
   * Obtiene mensaje por ID
   */
  async getById({ mensaje_id }: { mensaje_id: number }): Promise<
    Mensaje | undefined
  > {
    try {
      return this.model.getById({ mensaje_id });
    } catch (error) {
      logger.error("Error en MensajeService.getById:", error);
      throw error;
    }
  }

  /**
   * Obtiene inbox de un usuario (mensajes que le pertenecen)
   */
  async getInbox(params: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<MensajeConEstado[]> {
    try {
      const { usuario_id, page = 1, limit = 20 } = params;

      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      if (limit > 100) {
        throw new Error("El límite máximo es 100 mensajes por página");
      }

      const result = await this.model.getInbox({ usuario_id, page, limit });

      return result;
    } catch (error) {
      logger.error("Error en MensajeService.getInbox:", error);
      throw error;
    }
  }

  /**
   * Cuenta mensajes no leídos de un usuario
   */
  async countNoLeidos({ usuario_id }: { usuario_id: string }): Promise<number> {
    try {
      return this.model.countNoLeidos({ usuario_id });
    } catch (error) {
      logger.error("Error en MensajeService.countNoLeidos:", error);
      throw error;
    }
  }

  /**
   * Marca un mensaje como leído
   * Valida que el usuario sea el destinatario
   */
  async marcarComoLeido(params: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<boolean> {
    try {
      const { mensaje_id, usuario_id } = params;

      // Validar que el mensaje exista
      const mensaje = await this.model.getById({ mensaje_id });
      if (!mensaje) {
        throw new Error("Mensaje no encontrado");
      }

      // Marcar como leído
      return this.model.marcarComoLeido({ mensaje_id, usuario_id });
    } catch (error) {
      logger.error("Error en MensajeService.marcarComoLeido:", error);
      throw error;
    }
  }

  // ======================
  // ALERTAS
  // ======================

  /**
   * Resuelve una alerta
   * Solo SUPERVISOR o ADMIN pueden resolver alertas
   */
  async resolverAlerta(params: {
    mensaje_id: number;
  }): Promise<Mensaje | undefined> {
    try {
      const { mensaje_id } = params;

      // Validar que sea una alerta
      const mensaje = await this.model.getById({ mensaje_id });
      if (!mensaje) {
        throw new Error("Mensaje no encontrado");
      }

      if (mensaje.tipo !== "ALERTA") {
        throw new Error("El mensaje no es una alerta");
      }

      if (mensaje.resuelto) {
        throw new Error("La alerta ya está resuelta");
      }

      return this.model.resolverAlerta({ mensaje_id });
    } catch (error) {
      logger.error("Error en MensajeService.resolverAlerta:", error);
      throw error;
    }
  }

  /**
   * Obtiene alertas pendientes de resolución
   */
  async getAlertasPendientes(params: {
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    try {
      const { page = 1, limit = 20 } = params;

      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      return this.model.getAlertasPendientes({ page, limit });
    } catch (error) {
      logger.error("Error en MensajeService.getAlertasPendientes:", error);
      throw error;
    }
  }

  /**
   * Obtiene alertas por referencia (ej: venta_id)
   */
  async getAlertasByReferencia(params: {
    referencia_id: number;
  }): Promise<Mensaje[]> {
    try {
      return this.model.getAlertasByReferencia(params);
    } catch (error) {
      logger.error("Error en MensajeService.getAlertasByReferencia:", error);
      throw error;
    }
  }

  // ======================
  // BÚSQUEDA
  // ======================

  /**
   * Obtiene mensajes por tipo
   */
  async getByTipo(params: {
    tipo: "ALERTA" | "NOTIFICACION";
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    try {
      const { tipo, page = 1, limit = 20 } = params;

      // Validar tipo
      TipoMensajeEnum.parse(tipo);

      return this.model.getByTipo({ tipo, page, limit });
    } catch (error) {
      logger.error("Error en MensajeService.getByTipo:", error);
      throw error;
    }
  }

  // ======================
  // RESOLUCIÓN DE DESTINATARIOS
  // ======================

  /**
   * Resuelve los destinatarios según el tipo
   * Retorna array de persona_ids (UUIDs)
   */
  async resolverDestinatarios(params: {
    tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
    valor?: string;
    referencia_id?: number;
  }): Promise<string[]> {
    try {
      return this.model.resolverDestinatarios(params);
    } catch (error) {
      logger.error("Error en MensajeService.resolverDestinatarios:", error);
      throw error;
    }
  }
}
