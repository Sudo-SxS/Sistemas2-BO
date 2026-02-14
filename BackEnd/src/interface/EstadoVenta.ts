import {
  EstadoVenta,
  EstadoVentaCreate,
  EstadoVentaUpdate,
} from "../schemas/venta/EstadoVenta.ts";
import { ModelDB } from "./model.ts";

export interface EstadoVentaModelDB
  extends Omit<ModelDB<EstadoVenta>, "add" | "getById" | "update" | "delete"> {
  // Métodos básicos requeridos
  add(params: { input: EstadoVentaCreate }): Promise<EstadoVenta>;

  getAll(params?: { page?: number; limit?: number }): Promise<EstadoVenta[]>;

  getById({ id }: { id: string }): Promise<EstadoVenta | undefined>;

  update(
    { id, input }: { id: string; input: EstadoVentaUpdate },
  ): Promise<boolean>;

  delete({ id }: { id: string }): Promise<boolean>;

  getByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta[]>;

  // ======================
  // MÉTODOS ADICIONALES
  // ======================

  /**
   * Obtiene el último estado de una venta (el más reciente)
   */
  getLastByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta | undefined>;

  /**
   * Obtiene el estado actual de una venta (alias de getLastByVentaId para claridad semántica)
   */
  getEstadoActualByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta | undefined>;

  /**
   * Filtra estados por rango de fechas
   */
  getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoVenta[]>;

  /**
   * Filtra estados por tipo de estado específico
   */
  getByEstado({ estado }: { estado: string }): Promise<EstadoVenta[]>;

  /**
   * Obtiene estadísticas generales de los estados
   */
  getEstadisticasGenerales(): Promise<{
    totalEstados: number;
    estadosPorTipo: Array<{ estado: string; cantidad: number }>;
    estadosPorMes: Array<{ mes: string; cantidad: number }>;
  }>;

  /**
   * Filtra con múltiples parámetros opcionales
   */
  getByMultipleFilters(params: {
    venta_id?: number;
    estado?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    usuario_id?: string;
    page?: number;
    limit?: number;
  }): Promise<EstadoVenta[]>;

  /**
   * Creación masiva de estados para optimizar rendimiento
   */
  bulkCreateEstados(estados: EstadoVentaCreate[]): Promise<EstadoVenta[]>;

  /**
   * Obtiene el último estado de cada venta
   * Devuelve solo el estado más reciente por venta_id
   */
  getAllLastEstado(): Promise<EstadoVenta[]>;
}
