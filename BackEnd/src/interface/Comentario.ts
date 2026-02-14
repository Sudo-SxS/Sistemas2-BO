// ============================================
// BackEnd/src/interface/Comentario.ts
// Interface para el modelo de Comentarios
// ============================================
import {
  Comentario,
  ComentarioCreate,
  ComentarioUpdate,
  ComentarioConUsuario,
} from "../schemas/venta/Comentario.ts";

export interface ComentarioModelDB {
  connection: unknown;

  // ======================
  // MÉTODOS CRUD BÁSICOS
  // ======================
  add(params: { input: ComentarioCreate }): Promise<Comentario>;
  getById(params: { comentario_id: number }): Promise<Comentario | undefined>;
  update(params: {
    comentario_id: number;
    input: ComentarioUpdate;
  }): Promise<Comentario | undefined>;
  delete(params: { comentario_id: number }): Promise<boolean>;

  // ======================
  // MÉTODOS ESPECÍFICOS
  // ======================
  /**
   * Obtiene todos los comentarios con filtros y paginación
   */
  getAll(params: {
    page?: number;
    limit?: number;
    venta_id?: number;
    usuario_id?: string;
    tipo_comentario?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
  }): Promise<Comentario[]>;

  /**
   * Obtiene comentarios por venta_id
   */
  getByVentaId(params: {
    venta_id: number;
    page?: number;
    limit?: number;
  }): Promise<ComentarioConUsuario[]>;

  /**
   * Obtiene el último comentario de una venta
   */
  getUltimoByVentaId(params: { venta_id: number }): Promise<ComentarioConUsuario | undefined>;

  /**
   * Obtiene comentarios por usuario_id
   */
  getByUsuarioId(params: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<Comentario[]>;

  /**
   * Verifica si una venta pertenece a un vendedor
   */
  esVentaDelVendedor(params: {
    venta_id: number;
    vendedor_id: string;
  }): Promise<boolean>;

  /**
   * Obtiene el creador de un comentario
   */
  getCreadorId(params: { comentario_id: number }): Promise<string | undefined>;
}
