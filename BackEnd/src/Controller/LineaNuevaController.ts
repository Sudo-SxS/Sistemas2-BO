// BackEnd/src/Controller/LineaNuevaController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { LineaNuevaService } from "../services/LineaNuevaService.ts";
import { LineaNueva, LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { VentaService } from "../services/VentaService.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { PortabilidadService } from "../services/PortabilidadService.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";

export class LineaNuevaController {
  service: LineaNuevaService;
  ventaService: VentaService;
  portabilidadService: PortabilidadService;

  constructor(
    model: LineaNuevaModelDB,
    ventaModel: VentaModelDB,
    portabilidadModel: PortabilidadModelDB,
  ) {
    this.service = new LineaNuevaService(model);
    this.ventaService = new VentaService(ventaModel);
    this.portabilidadService = new PortabilidadService(portabilidadModel);
  }

  // deno-lint-ignore require-await
  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<LineaNueva[]> {
    return this.service.getAll(params);
  }

  // deno-lint-ignore require-await
  async getById({ id }: { id: number }): Promise<LineaNueva | undefined> {
    return this.service.getById({ id });
  }

  async create({ lineaNueva }: { lineaNueva: LineaNuevaCreate }): Promise<LineaNueva> {
    // Verificar que la venta existe y es LINEA_NUEVA
    const venta = await this.ventaService.getById(lineaNueva.venta.toString());
    if (!venta) {
      throw new Error("Venta no existe");
    }
    if (venta.tipo_venta !== "LINEA_NUEVA") {
      throw new Error("La venta no es de tipo LINEA_NUEVA");
    }
    // Verificar que no tenga portabilidad
    const portabilidad = await this.portabilidadService.getByVenta({ venta: lineaNueva.venta });
    if (portabilidad) {
      throw new Error("La venta ya tiene portabilidad asociada");
    }
    return this.service.create({ lineaNueva });
  }

  // deno-lint-ignore require-await
  async update({ id, lineaNueva }: { id: number; lineaNueva: Partial<LineaNueva> }): Promise<LineaNueva | undefined> {
    return this.service.update({ id, lineaNueva });
  }

  // deno-lint-ignore require-await
  async delete({ id }: { id: number }): Promise<boolean> {
    return this.service.delete({ id });
  }

  // deno-lint-ignore require-await
  async getByVenta({ venta }: { venta: number }): Promise<LineaNueva | undefined> {
    return this.service.getByVenta({ venta });
  }

  async getStatistics() {
    try {
      const stats = await this.service.getStatistics();
      return stats;
    } catch (error) {
      logger.error("LineaNuevaController.getStatistics:", error);
      throw error;
    }
  }

  // deno-lint-ignore require-await
  async getByEstado({ estado }: { estado: string }): Promise<LineaNueva[]> {
    return this.service.getByEstado({ estado });
  }
}