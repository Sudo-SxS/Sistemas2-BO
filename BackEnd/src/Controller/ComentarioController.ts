// ============================================
// BackEnd/src/Controller/ComentarioController.ts
// Controller para Comentarios
// ============================================
import { ComentarioService } from "../services/ComentarioService.ts";
import {
  Comentario,
  ComentarioCreate,
  ComentarioUpdate,
  ComentarioConUsuario,
} from "../schemas/venta/Comentario.ts";

export class ComentarioController {
  private service: ComentarioService;

  constructor(service: ComentarioService) {
    this.service = service;
  }

  // ======================
  // CRUD BÁSICO
  // ======================

  /**
   * Crea un nuevo comentario
   */
  async create(params: {
    input: ComentarioCreate;
    usuario_id: string;
    usuario_rol: string;
  }): Promise<Comentario> {
    return this.service.create(params);
  }

  /**
   * Obtiene comentario por ID
   */
  async getById({ comentario_id }: { comentario_id: number }): Promise<
    Comentario | undefined
  > {
    return this.service.getById({ comentario_id });
  }

  /**
   * Actualiza un comentario
   */
  async update(params: {
    comentario_id: number;
    input: ComentarioUpdate;
    usuario_id: string;
    usuario_rol: string;
  }): Promise<Comentario | undefined> {
    return this.service.update(params);
  }

  /**
   * Elimina un comentario
   */
  async delete(params: {
    comentario_id: number;
    usuario_id: string;
    usuario_rol: string;
  }): Promise<boolean> {
    return this.service.delete(params);
  }

  // ======================
  // MÉTODOS DE CONSULTA
  // ======================

  /**
   * Obtiene todos los comentarios con filtros
   */
  async getAll(params: {
    page?: number;
    limit?: number;
    venta_id?: number;
    usuario_id?: string;
    tipo_comentario?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
  }): Promise<Comentario[]> {
    return this.service.getAll(params);
  }

  /**
   * Obtiene comentarios por venta_id
   */
  async getByVentaId(params: {
    venta_id: number;
    page?: number;
    limit?: number;
  }): Promise<ComentarioConUsuario[]> {
    return this.service.getByVentaId(params);
  }

  /**
   * Obtiene el último comentario de una venta
   */
  async getUltimoByVentaId({
    venta_id,
  }: {
    venta_id: number;
  }): Promise<ComentarioConUsuario | undefined> {
    return this.service.getUltimoByVentaId({ venta_id });
  }

  /**
   * Obtiene comentarios por usuario_id
   */
  async getByUsuarioId(params: {
    usuario_id: string;
    page?: number;
    limit?: number;
  }): Promise<Comentario[]> {
    return this.service.getByUsuarioId(params);
  }
}
