/**
 * Controlador para gestión de ventas en el sistema telecom
 *
 * Maneja operaciones CRUD de ventas incluyendo:
 * - Creación completa de ventas (líneas nuevas y portabilidades)
 * - Validaciones de negocio y compatibilidad
 * - Gestión de estados y estadísticas
 * - Integración con correo y promociones
 *
 * @author Equipo de Desarrollo System-Back-Office
 */

// BackEnd/src/Controller/VentaController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { VentaService } from "../services/VentaService.ts";
import { ClienteService } from "../services/ClienteService.ts";
import {
  VentaCreate,
  VentaCreateSchema,
  VentaUpdate,
  VentaUpdateSchema,
} from "../schemas/venta/Venta.ts";
import {
  DateRangeQuery,
  PaginationQuery,
  VentaRequest,
  VentaResponse,
  VentaUpdateRequest,
} from "../types/ventaTypes.ts";
import { DBVenta } from "../interface/venta.ts";
import { PlanService } from "../services/PlanService.ts";
import { PromocionService } from "../services/PromocionService.ts";
import { CorreoController } from "./CorreoController.ts";
import { CorreoService } from "../services/CorreoService.ts";
import { PortabilidadController } from "./PortabilidadController.ts";
import { LineaNuevaController } from "./LineaNuevaController.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { CorreoCreate, CorreoCreateSchema } from "../schemas/correo/Correo.ts";
import { PortabilidadCreate, PortabilidadCreateSchema } from "../schemas/venta/Portabilidad.ts";

// Función helper para convertir BigInt a string en respuestas JSON
function convertBigIntToString(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (obj !== null && typeof obj === 'object') {
    if (typeof obj.toISOString === 'function') {
      return obj.toISOString();
    }
    if (obj.epoch && typeof obj.epoch === 'number') {
      return new Date(obj.epoch * 1000).toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  return obj;
}

export class VentaController {
  private ventaService: VentaService;
  private clienteService: ClienteService;
  private planService: PlanService;
  private promocionService: PromocionService;
  private correoController: CorreoController;
  private correoService: CorreoService;
  private portabilidadController: PortabilidadController;
  private lineaNuevaController: LineaNuevaController;

  /**
   * Constructor del controlador de ventas
   * @param ventaModel Modelo para operaciones de ventas
   * @param clienteModel Modelo para validación de clientes
   * @param correoModel Modelo para gestión de correos
   * @param lineaNuevaModel Modelo para líneas nuevas
   * @param portabilidadModel Modelo para portabilidades
   * @param planModel Modelo para validación de planes
   * @param promocionModel Modelo para validación de promociones
   * @param estadoVentaModel Modelo para gestión de estados de venta
   */
  constructor(
    ventaModel: VentaModelDB,
    clienteModel: ClienteModelDB,
    correoModel: CorreoModelDB,
    lineaNuevaModel: LineaNuevaModelDB,
    portabilidadModel: PortabilidadModelDB,
    planModel: PlanModelDB,
    promocionModel: PromocionModelDB,
    estadoVentaModel: EstadoVentaModelDB,
  ) {
    this.planService = new PlanService(planModel);
    this.promocionService = new PromocionService(promocionModel);
    this.ventaService = new VentaService(ventaModel, estadoVentaModel);
    this.clienteService = new ClienteService(clienteModel);
    this.correoController = new CorreoController(correoModel);
    this.correoService = new CorreoService(correoModel);
    this.lineaNuevaController = new LineaNuevaController(
      lineaNuevaModel,
      ventaModel,
      portabilidadModel,
    );
    this.portabilidadController = new PortabilidadController(
      portabilidadModel,
      ventaModel,
      lineaNuevaModel,
    );
  }

  async getAll(input: { page?: number; limit?: number }) {
    try {
      const ventas = await this.ventaService.getAll(input);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const venta = await this.ventaService.getById(input.id);
      return venta;
    } catch (error) {
      logger.error("VentaController.getById:", error);
      throw error;
    }
  }

  async getBySDS(input: { sds: string }) {
    try {
      const venta = await this.ventaService.getBySDS(input.sds);
      return venta;
    } catch (error) {
      logger.error("VentaController.getBySDS:", error);
      throw error;
    }
  }

  async getBySAP(input: { sap: string }) {
    try {
      const venta = await this.ventaService.getBySAP(input.sap);
      return venta;
    } catch (error) {
      logger.error("VentaController.getBySAP:", error);
      throw error;
    }
  }

  async create(input: { venta: VentaCreate; userId: string }) {
    try {
      // Verificar que el cliente existe
      const cliente = await this.clienteService.getById(input.venta.cliente_id);
      if (!cliente) {
        throw new Error("Cliente no existe");
      }

      // Verificar que empresa_origen_id existe
      if (input.venta.empresa_origen_id) {
        // TODO: Agregar validación de empresa_origen_id usando EmpresaOrigenService
        // Por ahora confiamos en que el FK lo valide en BD
      }

      const newVenta = await this.ventaService.create(input.venta, input.userId);
      return newVenta;
    } catch (error) {
      logger.error("VentaController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; venta: VentaUpdate }) {
    try {
      const updatedVenta = await this.ventaService.update(
        input.id,
        input.venta,
      );
      return updatedVenta;
    } catch (error) {
      logger.error("VentaController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.ventaService.delete(input.id);
      return deleted;
    } catch (error) {
      logger.error("VentaController.delete:", error);
      throw error;
    }
  }

  async getByVendedor(input: { vendedor: string }) {
    try {
      const ventas = await this.ventaService.getByVendedor(input.vendedor);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByVendedor:", error);
      throw error;
    }
  }

  async getByCliente(input: { cliente: string }) {
    try {
      const ventas = await this.ventaService.getByCliente(input.cliente);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByCliente:", error);
      throw error;
    }
  }

  async getByPlan(input: { plan: number }) {
    try {
      const ventas = await this.ventaService.getByPlan(input.plan);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByPlan:", error);
      throw error;
    }
  }

  async getByDateRange(input: { start: Date; end: Date }) {
    try {
      const ventas = await this.ventaService.getByDateRange(
        input.start,
        input.end,
      );
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByDateRange:", error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const stats = await this.ventaService.getStatistics();
      return stats;
    } catch (error) {
      logger.error("VentaController.getStatistics:", error);
      throw error;
    }
  }

  async getVentasWithPagination(
    query: PaginationQuery,
  ): Promise<VentaResponse<DBVenta[]>> {
    try {
      const ventas = (await this.ventaService.getAll(query)) || [];
      const total = ventas.length; // Assuming the model returns all, but in real implementation, model should handle count.
      return {
        success: true,
        data: ventas as DBVenta[],
        pagination: { page: query.page, limit: query.limit, total },
      };
    } catch (error) {
      logger.error("VentaController.getVentasWithPagination:", error);
      throw error;
    }
  }

  async getVentaByDateRange(
    query: DateRangeQuery,
  ): Promise<VentaResponse<DBVenta[]>> {
    try {
      const validation = this.ventaService.validateDates(
        query.start.toISOString(),
        query.end.toISOString(),
      );
      if (!validation.isValid) {
        return { success: false, message: validation.errors?.join(", ") };
      }
      const ventas = await this.ventaService.getByDateRange(
        query.start,
        query.end,
      );
      return { success: true, data: ventas as DBVenta[] };
    } catch (error) {
      logger.error("VentaController.getVentaByDateRange:", error);
      throw error;
    }
  }

  async getVentaByParam(
    param: string,
    type: "sds" | "sap" | "vendedor" | "cliente" | "plan",
  ): Promise<VentaResponse<DBVenta>> {
    try {
      let venta;
      switch (type) {
        case "sds":
          venta = await this.ventaService.getBySDS(param);
          break;
        case "sap":
          venta = await this.ventaService.getBySAP(param);
          break;
        case "vendedor":
          venta = await this.ventaService.getByVendedor(param);
          break;
        case "cliente":
          venta = await this.ventaService.getByCliente(param);
          break;
        case "plan":
          venta = await this.ventaService.getByPlan(Number(param));
          break;
        default:
          return { success: false, message: "Tipo de búsqueda inválido" };
      }
      if (!venta) {
        return { success: false, message: "Venta no encontrada" };
      }
      return { success: true, data: venta as DBVenta };
    } catch (error) {
      logger.error(`VentaController.getVentaByParam (${type}):`, error);
      throw error;
    }
  }

  async updateVenta(
    request: VentaUpdateRequest,
  ): Promise<VentaResponse<DBVenta>> {
    try {
      const result = VentaUpdateSchema.safeParse(request.venta);
      if (!result.success) {
        return {
          success: false,
          message: "Validación fallida",
          errors: result.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        };
      }
      const updatedVenta = await this.ventaService.update(
        request.id,
        result.data,
      );
      return { success: true, data: updatedVenta };
    } catch (error) {
      logger.error("VentaController.updateVenta:", error);
      throw error;
    }
  }

  /**
   * Crea una venta completa incluyendo validaciones y entidades relacionadas
   *
   * ESTRATEGIA OPTIMIZADA:
   * 1. VALIDAR TODO PRIMERO (sin crear nada en BD)
   * 2. CREAR TODO AL FINAL (solo si todas las validaciones pasaron)
   *
   * Proceso completo:
   * FASE 1 - VALIDACIONES (sin tocar BD):
   *   1.1. Validación de estructura y datos básicos
   *   1.2. Asignación de SAP para correos
   *   1.3. Validación de reglas de negocio (chip/correo)
   *   1.4. Validación de correo con Zod
   *   1.5. Verificación de cliente existe
   *   1.6. Validación de venta con Zod
   *   1.7. Validación de plan pertenece a empresa
   *   1.8. Validación de promoción pertenece a empresa
   *   1.9. Verificación de SAP no duplicado
   *
   * FASE 2 - CREACIÓN (solo si TODO validó):
   *   2.1. Crear correo (si es SIM)
   *   2.2. Crear venta
   *   2.3. Post-procesamiento (portabilidad o línea nueva)
   *
   * @param request Datos de la venta con correo y portabilidad opcionales
   * @param userId ID del usuario que crea la venta
   * @returns Resultado de la creación con datos de la venta
   * @throws Error si hay problemas de validación o BD
   */
  async createFullVenta(
    request: VentaRequest,
    userId: string,
  ): Promise<VentaResponse<DBVenta>> {
    // Variable para tracking del correo creado (solo para rollback en caso de error de BD)
    let correoCreado: { sap_id: string } | null = null;

    try {
      logger.info("Iniciando createFullVenta - FASE DE VALIDACIONES");

      // ============================================
      // FASE 1: VALIDACIONES (SIN CREAR NADA EN BD)
      // ============================================

      // 1.1. Validar estructura básica
      if (!request.venta) {
        logger.debug("Estructura básica inválida");
        return {
          success: false,
          message: "Estructura de datos inválida. Se requiere { venta: {...} }",
        };
      }

      logger.debug("request.venta:", request.venta);
      logger.debug("request.correo:", request.correo);

      // 1.2. Asignar SAP automáticamente
      const ventaData = this.ventaService.assignSap(
        request.venta,
        request.correo,
      );
      logger.debug(`SAP asignado: ${ventaData.sap || "null"}`);

      // 1.3. Validar reglas de negocio chip/correo
      if (ventaData.chip === "ESIM" && request.correo) {
        logger.debug("Validación fallida: ESIM con correo");
        return {
          success: false,
          message: "Para chip ESIM, no se permite información de correo",
        };
      }

      if (ventaData.chip === "ESIM" && ventaData.stl) {
        logger.debug("Validación fallida: ESIM con STL");
        return {
          success: false,
          message: "Para chip ESIM, no se permite asignar un número STL",
        };
      }

      if (ventaData.chip === "SIM" && (!request.correo || !ventaData.sap)) {
        logger.debug("Validación fallida: SIM sin correo o SAP");
        return {
          success: false,
          message:
            "Para chip SIM, se requiere información de correo completa con SAP",
        };
      }

      // 1.4. Validar correo con Zod (si aplica)
      let correoValidado: CorreoCreate | null = null;
      if (ventaData.chip === "SIM" && request.correo) {
        logger.debug("Validando datos de correo con Zod");

        const correoResult = CorreoCreateSchema.safeParse(request.correo);
        if (!correoResult.success) {
          logger.debug("Validación Zod de correo fallida");
          return {
            success: false,
            message: "Validación fallida en datos de correo",
            errors: correoResult.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          };
        }

        correoValidado = {
          ...correoResult.data,
          usuario_id: userId,
        };

        logger.debug("Correo validado exitosamente con Zod");
      }

      // 1.5. Verificar que cliente existe
      logger.debug(
        `Verificando existencia de cliente: ${ventaData.cliente_id}`,
      );
      const cliente = await this.clienteService.getById(ventaData.cliente_id);
      if (!cliente) {
        logger.debug("Validación fallida: Cliente no existe");
        return { success: false, message: "Cliente no existe" };
      }
      logger.debug("Cliente existe ✓");

      // 1.6. Preparar y validar venta con Zod
      const ventaWithUser = {
        ...ventaData,
        vendedor_id: userId,
        sap: ventaData.sap, // Ya viene del assignSap
      };

      logger.debug("Validando datos de venta con Zod");
      const ventaResult = VentaCreateSchema.safeParse(ventaWithUser);
      if (!ventaResult.success) {
        logger.debug("Validación Zod de venta fallida");
        return {
          success: false,
          message: "Validación fallida en datos de venta",
          errors: ventaResult.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        };
      }
      logger.debug("Venta validada exitosamente con Zod");

      const ventaValidada = ventaResult.data;

      // 1.7. Determinar empresa para validaciones
      let idEmpresa: number;
      if (ventaValidada.tipo_venta === "LINEA_NUEVA") {
        idEmpresa = 2; // id de la empresa que se usa para línea nueva
        logger.debug(`Tipo LINEA_NUEVA - usando empresa_id: ${idEmpresa}`);
      } else {
        idEmpresa = ventaValidada.empresa_origen_id;
        logger.debug(`Tipo PORTABILIDAD - usando empresa_id: ${idEmpresa}`);
      }

      // 1.8. Validar plan pertenece a empresa
      if (ventaValidada.plan_id) {
        logger.debug(
          `Validando plan ${ventaValidada.plan_id} pertenece a empresa ${idEmpresa}`,
        );
        const planValidation = await this.ventaService.validatePlan(
          ventaValidada.plan_id,
          idEmpresa,
          this.planService,
        );
        if (!planValidation.isValid) {
          logger.debug("Validación de plan fallida");
          return {
            success: false,
            message: planValidation.errors?.join(", "),
          };
        }
        logger.debug("Plan válido ✓");
      }

      // 1.9. Validar promoción pertenece a empresa
      if (ventaValidada.promocion_id) {
        logger.debug(
          `Validando promoción ${ventaValidada.promocion_id} pertenece a empresa ${idEmpresa}`,
        );
        const promoValidation = await this.ventaService.validatePromocion(
          ventaValidada.promocion_id,
          idEmpresa,
          this.promocionService,
        );
        if (!promoValidation.isValid) {
          logger.debug("Validación de promoción fallida");
          return {
            success: false,
            message: promoValidation.errors?.join(", "),
          };
        }
        logger.debug("Promoción válida ✓");
      }

      // 1.10. Verificar que SAP no esté duplicado (si aplica)
      if (ventaValidada.sap) {
        logger.debug(`Verificando que SAP ${ventaValidada.sap} no exista`);
        try {
          const existingSap = await this.correoController.getBySAP({
            sap: ventaValidada.sap,
          });
          if (existingSap) {
            logger.debug("Validación fallida: SAP ya existe");
            return {
              success: false,
              message:
                `Ya existe un correo registrado para SAP: ${ventaValidada.sap}`,
            };
          }
        } catch (error) {
          // No existe, continuar
        }
        logger.debug("SAP no duplicado ✓");
      }

      logger.info("✅ TODAS LAS VALIDACIONES PASARON - Iniciando creación");

      // ============================================
      // FASE 2: CREACIÓN (SOLO SI TODO VALIDÓ)
      // ============================================

      // 2.1. Crear correo (si es SIM)
      if (ventaValidada.chip === "SIM" && correoValidado) {
        try {
          logger.info("Creando correo en BD...");
          const nuevoCorreo = await this.correoController.create(
            correoValidado,
          );

          // Guardar referencia para rollback solo en caso de error de BD posterior
          correoCreado = { sap_id: nuevoCorreo.sap_id };

          logger.info(
            `✅ Correo creado exitosamente: SAP ${nuevoCorreo.sap_id}`,
          );
        } catch (error) {
          logger.error("Error al crear correo:", error);
          return {
            success: false,
            message: `Error al crear correo: ${(error as Error).message}`,
          };
        }
      }

      // 2.2. Crear venta en BD
      let newVenta;
      try {
        logger.info("Creando venta en BD...");
        newVenta = await this.ventaService.create(ventaValidada, userId);
        console.log("newVenta:", newVenta);
        logger.info(`✅ Venta creada exitosamente: ID ${newVenta.venta_id}`);
      } catch (error) {
        logger.error("Error al crear venta:", error);

        // ROLLBACK: Eliminar correo si fue creado
        if (correoCreado) {
          await this.rollbackCorreo(
            correoCreado.sap_id,
            `Error al crear venta en BD: ${(error as Error).message}`,
          );
        }

        throw error;
      }

      // 2.3. Post-procesamiento (portabilidad o línea nueva)
      try {
        logger.info("Iniciando post-procesamiento...");
        await this.postProcessVenta(newVenta, request?.portabilidad);
        logger.info("✅ Post-procesamiento completado");
      } catch (error) {
        logger.error("Error en post-procesamiento:", error);

        // ROLLBACK COMPLETO: Eliminar venta Y correo
        logger.warn("Iniciando rollback completo (venta + correo)");

        // Eliminar venta
        try {
          await this.ventaService.delete(String(newVenta.venta_id));
          logger.info(`✅ Venta ${newVenta.venta_id} eliminada (rollback)`);
        } catch (deleteError) {
          logger.error(
            "Error al eliminar venta durante rollback:",
            deleteError,
          );
        }

        // Eliminar correo si fue creado
        if (correoCreado) {
          await this.rollbackCorreo(
            correoCreado.sap_id,
            `Error en post-procesamiento: ${(error as Error).message}`,
          );
        }

        throw error;
      }

      logger.info("✅ createFullVenta completado exitosamente");
      return { success: true, data: newVenta };
    } catch (error) {
      logger.error("VentaController.createFullVenta - Error crítico:", error);
      throw error;
    }
  }

  /**
   * Realiza rollback del correo creado en caso de error de BD
   * Elimina el correo y sus estados asociados
   *
   * NOTA: Este método solo se llama si hubo un error DESPUÉS de crear el correo
   * (no durante las validaciones, ya que esas se hacen antes de crear nada)
   *
   * @param sapId SAP ID del correo a eliminar
   * @param reason Razón del rollback para logging
   */
  private async rollbackCorreo(
    sapId: string,
    reason: string,
  ): Promise<void> {
    try {
      logger.warn(`🔄 Iniciando rollback de correo SAP: ${sapId}`);
      logger.warn(`   Razón: ${reason}`);

      await this.correoService.delete({ id: sapId });
      logger.info(`✅ Correo ${sapId} eliminado exitosamente (rollback)`);
    } catch (error) {
      logger.error(`❌ Error al hacer rollback del correo ${sapId}:`, error);
      // No re-lanzamos el error para no ocultar el error original
    }
  }

  /**
   * Post-procesamiento de venta: crea portabilidad o línea nueva según tipo
   *
   * @param venta Venta creada con su ID
   * @param portabilidad Datos de portabilidad si aplica
   */
  private async postProcessVenta(
    venta: VentaCreate & { venta_id: number },
    portabilidad?: PortabilidadCreate,
  ): Promise<void> {
    logger.debug(
      `Post-procesando venta ${venta.venta_id} de tipo ${venta.tipo_venta}`,
    );

    if (venta.tipo_venta === "PORTABILIDAD" && portabilidad) {
      logger.debug(`Creando portabilidad para venta ${venta.venta_id}`);

      const portaData = {
        venta: venta.venta_id,
        spn: portabilidad.spn,
        empresa_origen: portabilidad.empresa_origen,
        mercado_origen: portabilidad.mercado_origen,
        numero_porta: portabilidad.numero_porta,
        pin: portabilidad.pin ?? null,
        fecha_portacion: portabilidad.fecha_portacion,
      };

      // Validar con schema Zod para aplicar transformaciones (ej: mercado_origen a mayúsculas)
      const validatedPorta = PortabilidadCreateSchema.parse(portaData);

      logger.debug("Datos de portabilidad validados:", validatedPorta);

      await this.portabilidadController.create({
        portabilidad: validatedPorta,
      });

      logger.debug(`✅ Portabilidad creada para venta ${venta.venta_id}`);
    } else if (venta.tipo_venta === "LINEA_NUEVA" && !portabilidad) {
      logger.debug(`Creando línea nueva para venta ${venta.venta_id}`);

      await this.lineaNuevaController.create({
        lineaNueva: { venta: venta.venta_id },
      });

      logger.debug(`✅ Línea nueva creada para venta ${venta.venta_id}`);
    }

    logger.debug(`Post-procesamiento completado para venta ${venta.venta_id}`);
  }

  /**
   * Obtiene ventas optimizadas para UI
   * Router → Controller → Service → Model
   */
  async getVentasUI(ctx: any) {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 50;
      const startDate = url.searchParams.get("startDate") || undefined;
      const endDate = url.searchParams.get("endDate") || undefined;
      const search = url.searchParams.get("search") || undefined;

      const userId = ctx.state.user?.id;
      const userRol = ctx.state.user?.rol;

      logger.debug(`VentaController.getVentasUI - Página: ${page}, Límite: ${limit}`);

      const result = await this.ventaService.getVentasUI({
        page,
        limit,
        startDate,
        endDate,
        search,
        userId,
        userRol,
      });

      ctx.response.body = {
        success: true,
        data: {
          ...convertBigIntToString(result),
          totalPages: Math.ceil(Number(result.total) / result.limit),
        },
      };
    } catch (error) {
      logger.error("VentaController.getVentasUI:", error);
      const isDev = Deno.env.get("MODO") === "development";
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: isDev ? (error as Error).message : "Error al obtener ventas",
      };
    }
  }

  /**
   * Obtiene el detalle completo de una venta
   * Router → Controller → Service → Model
   */
  async getVentaDetalleCompleto(ctx: any) {
    try {
      const { id } = ctx.params;
      const ventaId = Number(id);

      if (isNaN(ventaId)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "ID de venta inválido",
        };
        return;
      }

      logger.debug(`VentaController.getVentaDetalleCompleto - ID: ${ventaId}`);

      const venta = await this.ventaService.getVentaDetalleCompleto(ventaId);

      if (!venta) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Venta no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: convertBigIntToString(venta),
      };
    } catch (error) {
      logger.error("VentaController.getVentaDetalleCompleto:", error);
      const isDev = Deno.env.get("MODO") === "development";
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: isDev ? (error as Error).message : "Error al obtener detalle de venta",
      };
    }
  }
}
