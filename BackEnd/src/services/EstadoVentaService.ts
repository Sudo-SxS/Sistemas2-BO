// ============================================
// BackEnd/src/services/EstadoVentaService.ts
// ============================================
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../schemas/venta/EstadoVenta.ts";

export class EstadoVentaService {
  private model: EstadoVentaModelDB;

  constructor(model: EstadoVentaModelDB) {
    this.model = model;
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<EstadoVenta[]> {
    return this.model.getAll(params);
  }

  async getById({ id }: { id: string }): Promise<EstadoVenta | undefined> {
    return this.model.getById({ id });
  }

  async getByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta[]> {
    return this.model.getByVentaId({ venta_id });
  }

  async getLastByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta | undefined> {
    return this.model.getLastByVentaId({ venta_id });
  }

  async getEstadoActualByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta | undefined> {
    return this.model.getEstadoActualByVentaId({ venta_id });
  }

  async getByFechaRango(params: { fechaInicio: Date; fechaFin: Date }): Promise<EstadoVenta[]> {
    return this.model.getByFechaRango(params);
  }

  async getByEstado({ estado }: { estado: string }): Promise<EstadoVenta[]> {
    return this.model.getByEstado({ estado });
  }

  async getByMultipleFilters(params: {
    venta_id?: number;
    estado?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    usuario_id?: string;
    page?: number;
    limit?: number;
  }): Promise<EstadoVenta[]> {
    return this.model.getByMultipleFilters(params);
  }

  async create(input: EstadoVentaCreate): Promise<EstadoVenta> {
    return this.model.add({ input });
  }

  async update({ id, input }: { id: string; input: EstadoVentaUpdate }): Promise<boolean> {
    return this.model.update({ id, input });
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    return this.model.delete({ id });
  }

  async getAllLastEstado(): Promise<EstadoVenta[]> {
    return this.model.getAllLastEstado();
  }

  async bulkCreate(estados: EstadoVentaCreate[]): Promise<EstadoVenta[]> {
    return this.model.bulkCreateEstados(estados);
  }
}