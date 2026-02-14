/**
 * Servicio de negocio para gestión de ventas
 *
 * Maneja lógica de negocio compleja:
 * - Validación de compatibilidad entre planes y promociones
 * - Asignación automática de SAP
 * - Transformaciones de datos
 * - Integración con servicios relacionados
 *
 * @author Equipo de Desarrollo System-Back-Office
 */

// BackEnd/src/services/VentaService.ts
// ============================================
import { VentaModelDB } from "../interface/venta.ts";
import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { DateRangeQuery, ValidationResult } from "../types/ventaTypes.ts";
import { PlanService } from "./PlanService.ts";
import { PromocionService } from "./PromocionService.ts";
import { CorreoCreate } from "../schemas/correo/Correo.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { logger } from "../Utils/logger.ts";

export class VentaService {
  private modelVenta: VentaModelDB;
  private modelEstadoVenta?: EstadoVentaModelDB;

  constructor(modelVenta: VentaModelDB, modelEstadoVenta?: EstadoVentaModelDB) {
    this.modelVenta = modelVenta;
    this.modelEstadoVenta = modelEstadoVenta;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const ventas = await this.modelVenta.getAll(params);
      return ventas;
    } catch (error) {
      logger.error("VentaService.getAll:", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const venta = await this.modelVenta.getById({ id });
      return venta;
    } catch (error) {
      logger.error("VentaService.getById:", error);
      throw error;
    }
  }

  async getBySDS(sds: string) {
    try {
      const venta = await this.modelVenta.getBySDS({ sds });
      return venta;
    } catch (error) {
      logger.error("VentaService.getBySDS:", error);
      throw error;
    }
  }

  async getBySAP(sap: string) {
    try {
      const venta = await this.modelVenta.getBySAP({ sap });
      return venta;
    } catch (error) {
      logger.error("VentaService.getBySAP:", error);
      throw error;
    }
  }

  async create(input: VentaCreate, usuarioId: string) {
    try {
      const newVenta = await this.modelVenta.add({ input });
      
      // Crear estado automático según SDS y STL (solo si hay modelo de estado)
      const estadoVentaModel = this.modelEstadoVenta;
      if (estadoVentaModel) {
        const estadoInicial = (input.sds && input.stl)
          ? "CREADO_SIN_DOCU"
          : "PENDIENTE_DE_CARGA";

        await estadoVentaModel.add({
          input: {
            venta_id: newVenta.venta_id,
            estado: estadoInicial as
              | "PENDIENTE DE CARGA"
              | "CREADO SIN DOCU"
              | "CREADO DOCU OK"
              | "EN TRANSPORTE"
              | "ENTREGADO"
              | "REPACTAR"
              | "ACTIVADO NRO CLARO"
              | "ACTIVADO NRO PORTADO"
              | "AGENDADO"
              | "APROBADO ABD"
              | "CANCELADO"
              | "CREADO"
              | "EVALUANDO DONANTE"
              | "PENDIENTE CARGA PIN"
              | "PIN INGRESADO"
              | "RECHAZADO ABD"
              | "RECHAZADO DONANTE"
              | "SPN CANCELADA",
            descripcion: estadoInicial === "CREADO_SIN_DOCU"
              ? "Venta creada con STL y SDS"
              : "Venta pendiente de cargar STL y/o SDS",
            fecha_creacion: new Date(),
            usuario_id: usuarioId,
          },
        });

        logger.info(
          `Estado inicial '${estadoInicial}' creado para venta ${newVenta.venta_id}`,
        );
      }

      return newVenta;
    } catch (error) {
      logger.error("VentaService.create:", error);
      throw error;
    }
  }

  async update(id: string, input: VentaUpdate) {
    try {
      const updatedVenta = await this.modelVenta.update({ id, input });
      return updatedVenta;
    } catch (error) {
      logger.error("VentaService.update:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.modelVenta.delete({ id });
      return deleted;
    } catch (error) {
      logger.error("VentaService.delete:", error);
      throw error;
    }
  }

  async getByVendedor(vendedor: string) {
    try {
      const ventas = await this.modelVenta.getByVendedor({ vendedor });
      return ventas;
    } catch (error) {
      logger.error("VentaService.getByVendedor:", error);
      throw error;
    }
  }

  async getByCliente(cliente: string) {
    try {
      const ventas = await this.modelVenta.getByCliente({ cliente });
      return ventas;
    } catch (error) {
      logger.error("VentaService.getByCliente:", error);
      throw error;
    }
  }

  async getByPlan(plan: number) {
    try {
      const ventas = await this.modelVenta.getByPlan({ plan });
      return ventas;
    } catch (error) {
      logger.error("VentaService.getByPlan:", error);
      throw error;
    }
  }

  async getByDateRange(start: Date, end: Date) {
    try {
      const ventas = await this.modelVenta.getByDateRange({ start, end });
      return ventas;
    } catch (error) {
      logger.error("VentaService.getByDateRange:", error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const stats = await this.modelVenta.getStatistics();
      return stats;
    } catch (error) {
      logger.error("VentaService.getStatistics:", error);
      throw error;
    }
  }

  validateDates(start: string, end: string): ValidationResult {
    const errors: string[] = [];
    if (!start || !end) {
      errors.push("Parámetros 'start' y 'end' son requeridos");
      return { isValid: false, errors };
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push("Fechas inválidas");
      return { isValid: false, errors };
    }
    return { isValid: true };
  }

  /**
   * Valida que el plan existe y pertenece a la empresa origen
   *
   * Verifica:
   * - Existencia del plan
   * - Compatibilidad con empresa origen
   *
   * @param planId ID del plan a validar
   * @param empresaOrigenId ID de la empresa origen
   * @param planService Servicio de planes para consultas
   * @returns Resultado de validación con errores si aplica
   */
  async validatePlan(
    planId: number,
    empresaOrigenId: number,
    planService: PlanService,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    console.log("Validando plan", "Plan:", planId, "Empresa:", empresaOrigenId);
    const plan = await planService.getById(planId.toString());
    console.log("Plan encontrado:", plan);
    console.log("Empresa origen plan:", plan?.empresa_origen_id);
    if (!plan) {
      errors.push(`El plan ${planId} no existe`);
      return { isValid: false, errors };
    }
    if (plan.empresa_origen_id !== empresaOrigenId) {
      errors.push("El plan no corresponde a la empresa origen especificada");
      return { isValid: false, errors };
    }
    return { isValid: true };
  }

  /**
   * Valida que la promoción existe y pertenece a la empresa origen
   *
   * Verifica:
   * - Existencia de la promoción
   * - Compatibilidad con empresa origen
   *
   * @param promocionId ID de la promoción a validar
   * @param empresaOrigenId ID de la empresa origen
   * @param promocionService Servicio de promociones para consultas
   * @returns Resultado de validación con errores si aplica
   */
  async validatePromocion(
    promocionId: number,
    empresaOrigenId: number,
    promocionService: PromocionService,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const promocion = await promocionService.getById(promocionId.toString());
    if (!promocion) {
      errors.push(`La promoción ${promocionId} no existe`);
      return { isValid: false, errors };
    }
    if (promocion.empresa_origen_id !== empresaOrigenId) {
      errors.push(
        "La promoción no corresponde a la empresa origen especificada",
      );
      return { isValid: false, errors };
    }
    return { isValid: true };
  }

  /**
   * Asigna automáticamente el SAP de la venta basado en el correo
   *
   * Reglas:
   * - Si es SIM con correo válido, usa correo.sap_id
   * - De lo contrario, mantiene el SAP original o null
   *
   * @param ventaData Datos de la venta sin vendedor_id
   * @param correo Datos del correo (opcional)
   * @returns Datos de venta con SAP actualizado
   */
  assignSap(
    ventaData: Omit<VentaCreate, "vendedor_id">,
    correo?: CorreoCreate,
  ): Omit<VentaCreate, "vendedor_id"> {
    if (
      correo &&
      ventaData.chip === "SIM" && correo.sap_id
    ) {
      return { ...ventaData, sap: correo.sap_id };
    }
    return ventaData;
  }

  /**
   * Obtiene ventas optimizadas para UI con JOINs completos
   * Incluyen datos del cliente, vendedor, supervisor, plan, promoción y empresa origen
   */
  async getVentasUI(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    userId?: string;
    userRol?: string;
  }) {
    try {
      return await this.modelVenta.getVentasUI(params);
    } catch (error) {
      logger.error("VentaService.getVentasUI:", error);
      throw error;
    }
  }

  /**
   * Obtiene el detalle completo de una venta
   * Incluye cliente, vendedor, supervisor, plan, promoción, empresa origen,
   * portabilidad/línea nueva, historial de estados, historial de correo,
   * comentarios y datos del correo
   */
  async getVentaDetalleCompleto(ventaId: number) {
    try {
      return await this.modelVenta.getVentaDetalleCompleto(ventaId);
    } catch (error) {
      logger.error("VentaService.getVentaDetalleCompleto:", error);
      throw error;
    }
  }
}
