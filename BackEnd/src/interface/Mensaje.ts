// ============================================
// BackEnd/src/interface/Mensaje.ts
// VERSIÓN corregida según schema real de DB
// ============================================
import {
  Mensaje,
  MensajeCreate,
  MensajeUpdate,
  TipoDestinatario,
} from "../schemas/mensaje/Mensaje.ts";
import {
  MensajeConEstado,
  MensajeDestinatario,
} from "../schemas/mensaje/MensajeDestinatario.ts";

export interface MensajeModelDB {
  connection: unknown;

  // ======================
  // MÉTODOS CRUD BÁSICOS
  // ======================
  add(params: { input: MensajeCreate }): Promise<Mensaje>;
  getById(params: { mensaje_id: number }): Promise<Mensaje | undefined>;
  update(params: {
    mensaje_id: number;
    input: MensajeUpdate;
  }): Promise<Mensaje | undefined>;
  delete(params: { mensaje_id: number }): Promise<boolean>;

  // ======================
  // MÉTODOS DE DESTINATARIOS
  // ======================
  /**
   * Agrega un destinatario a un mensaje
   */
  addDestinatario(params: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<MensajeDestinatario>;

  /**
   * Agrega múltiples destinatarios a un mensaje
   */
  addDestinatarios(params: {
    mensaje_id: number;
    usuarios_ids: string[];
  }): Promise<number>;

  /**
   * Marca un mensaje como leído por un usuario
   */
  marcarComoLeido(params: {
    mensaje_id: number;
    usuario_id: string;
  }): Promise<boolean>;

  /**
   * Obtiene mensajes del inbox de un usuario (con estado de lectura)
   */
  getInbox(params: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<MensajeConEstado[]>;

  /**
   * Obtiene solo mensajes no leídos de un usuario
   */
  getNoLeidos(params: { usuario_id: string }): Promise<MensajeConEstado[]>;

  /**
   * Cuenta mensajes no leídos de un usuario
   */
  countNoLeidos(params: { usuario_id: string }): Promise<number>;

  // ======================
  // MÉTODOS DE ALERTAS
  // ======================
  /**
   * Resuelve una alerta
   */
  resolverAlerta(params: {
    mensaje_id: number;
  }): Promise<Mensaje | undefined>;

  /**
   * Obtiene alertas pendientes de resolución
   */
  getAlertasPendientes(params: {
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]>;

  /**
   * Obtiene alertas por referencia (ej: venta_id)
   */
  getAlertasByReferencia(params: {
    referencia_id: number;
  }): Promise<Mensaje[]>;

  // ======================
  // MÉTODOS DE BÚSQUEDA
  // ======================
  /**
   * Obtiene mensajes por tipo (ALERTA/NOTIFICACION)
   */
  getByTipo(params: {
    tipo: "ALERTA" | "NOTIFICACION";
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]>;

  /**
   * Obtiene mensajes por usuario creador
   */
  getByUsuarioCreador(params: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]>;

  /**
   * Obtiene mensajes por rango de fechas
   */
  getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
    page?: number;
    limit?: number;
  }): Promise<Mensaje[]>;

  // ======================
  // MÉTODOS DE RESOLUCIÓN DE DESTINATARIOS
  // ======================
  /**
   * Obtiene usuarios por tipo de destinatario
   * Esta es la lógica clave para resolver destinatarios
   */
  resolverDestinatarios(params: {
    tipo: TipoDestinatario;
    valor?: string;
    referencia_id?: number;
  }): Promise<string[]>;
}
