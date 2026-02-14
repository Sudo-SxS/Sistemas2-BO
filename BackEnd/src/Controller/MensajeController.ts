// ============================================
// BackEnd/src/Controller/MensajeController.ts
// VERSIÓN CORREGIDA
// ============================================
import { MensajeService } from "../services/MensajeService.ts";
import { Mensaje, MensajeCreate } from "../schemas/mensaje/Mensaje.ts";
import { MensajeConEstado } from "../schemas/mensaje/MensajeDestinatario.ts";

export class MensajeController {
  private service: MensajeService;

  constructor(service: MensajeService) {
    this.service = service;
  }

  // ======================
  // CRUD BÁSICO
  // ======================

  /**
   * Crea un nuevo mensaje (ALERTA o NOTIFICACION)
   * Con resolución automática de destinatarios
   */
  async create(params: {
    input: MensajeCreate;
    usuario_creador_rol: string;
  }): Promise<Mensaje> {
    return this.service.create(params);
  }

  /**
   * Obtiene mensaje por ID
   */
  async getById({ mensaje_id }: { mensaje_id: number }): Promise<
    Mensaje | undefined
  > {
    return this.service.getById({ mensaje_id });
  }

  // ======================
  // INBOX Y NOTIFICACIONES
  // ======================

  /**
   * Obtiene inbox de un usuario (mensajes que le pertenecen)
   */
  async getInbox(params: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<MensajeConEstado[]> {
    return this.service.getInbox(params);
  }

  /**
   * Cuenta mensajes no leídos de un usuario
   */
  async countNoLeidos({ usuario_id }: { usuario_id: string }): Promise<number> {
    return this.service.countNoLeidos({ usuario_id });
  }

  /**
   * Marca un mensaje como leído
   */
  async marcarComoLeido(params: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<boolean> {
    return this.service.marcarComoLeido(params);
  }

  // ======================
  // ALERTAS
  // ======================

  /**
   * Resuelve una alerta
   * Solo SUPERVISOR o ADMIN pueden resolver
   */
  async resolverAlerta(params: {
    mensaje_id: number;
  }): Promise<Mensaje | undefined> {
    return this.service.resolverAlerta(params);
  }

  /**
   * Obtiene alertas pendientes de resolución
   */
  async getAlertasPendientes(params: {
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]> {
    return this.service.getAlertasPendientes(params);
  }

  /**
   * Obtiene alertas por referencia (ej: venta_id)
   */
  async getAlertasByReferencia(params: {
    referencia_id: number;
  }): Promise<Mensaje[]> {
    return this.service.getAlertasByReferencia(params);
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
    return this.service.getByTipo(params);
  }
}
