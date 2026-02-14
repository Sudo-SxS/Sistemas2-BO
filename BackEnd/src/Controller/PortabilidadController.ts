// BackEnd/src/Controller/PortabilidadController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { PortabilidadService } from "../services/PortabilidadService.ts";
import {
  Portabilidad,
  PortabilidadCreate,
} from "../schemas/venta/Portabilidad.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { VentaService } from "../services/VentaService.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { LineaNuevaService } from "../services/LineaNuevaService.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";

export class PortabilidadController {
  service: PortabilidadService;
  ventaService: VentaService;
  lineaNuevaService: LineaNuevaService;

  constructor(
    model: PortabilidadModelDB,
    ventaModel: VentaModelDB,
    lineaNuevaModel: LineaNuevaModelDB,
  ) {
    this.service = new PortabilidadService(model);
    this.ventaService = new VentaService(ventaModel);
    this.lineaNuevaService = new LineaNuevaService(lineaNuevaModel);
  }

  // deno-lint-ignore require-await
  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Portabilidad[]> {
    return this.service.getAll(params);
  }

  // deno-lint-ignore require-await
  async getById({ id }: { id: number }): Promise<Portabilidad | undefined> {
    return this.service.getById({ id });
  }

  async create(
    { portabilidad }: { portabilidad: PortabilidadCreate },
  ): Promise<Portabilidad> {
    logger.debug(portabilidad);
    // Verificar que la venta existe y es PORTABILIDAD
    const id_venta = portabilidad.venta.toString();

    const venta = await this.ventaService.getById(id_venta);
    if (!venta) {
      throw new Error("Venta no existe");
    }
    if (venta.tipo_venta !== "PORTABILIDAD") {
      throw new Error("La venta no es de tipo PORTABILIDAD");
    }
    // Verificar que no tenga linea_nueva
    const lineaNueva = await this.lineaNuevaService.getByVenta({
      venta: portabilidad.venta,
    });
    if (lineaNueva) {
      throw new Error("La venta ya tiene linea nueva asociada");
    }
    return this.service.create({ portabilidad });
  }

  // deno-lint-ignore require-await
  async update(
    { id, portabilidad }: { id: number; portabilidad: Partial<Portabilidad> },
  ): Promise<Portabilidad | undefined> {
    return this.service.update({ id, portabilidad });
  }

  // deno-lint-ignore require-await
  async delete({ id }: { id: number }): Promise<boolean> {
    return this.service.delete({ id });
  }

  // deno-lint-ignore require-await
  async getByVenta(
    { venta }: { venta: number },
  ): Promise<Portabilidad | undefined> {
    return this.service.getByVenta({ venta });
  }

  async getStatistics() {
    try {
      const stats = await this.service.getStatistics();
      return stats;
    } catch (error) {
      logger.error("PortabilidadController.getStatistics:", error);
      throw error;
    }
  }

  // deno-lint-ignore require-await
  async getByEstado({ estado }: { estado: string }): Promise<Portabilidad[]> {
    return this.service.getByEstado({ estado });
  }
}
