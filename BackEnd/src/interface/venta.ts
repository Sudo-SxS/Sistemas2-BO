import { Venta, VentaCreate } from "../schemas/venta/Venta.ts";
import { ModelDB } from "./model.ts";

export interface VentaModelDB extends Omit<ModelDB<Venta>, 'add'> {
  add(params: { input: VentaCreate }): Promise<Venta>;
  getBySDS: ({ sds }: { sds: string }) => Promise<Venta | undefined>;

  getBySPN: ({ spn }: { spn: string }) => Promise<Venta | undefined>;

  getBySAP: ({ sap }: { sap: string }) => Promise<Venta | undefined>;

  getByVendedor: ({ vendedor }: { vendedor: string }) => Promise<Venta[]>;

  getByCliente: ({ cliente }: { cliente: string }) => Promise<Venta[]>;

  getByPlan: ({ plan }: { plan: number }) => Promise<Venta[]>;

  getByDateRange: ({ start, end }: { start: Date; end: Date }) => Promise<Venta[]>;

  getStatistics: () => Promise<{
    totalVentas: number;
    ventasPorPlan: Array<{ plan_id: number; plan_nombre: string; cantidad: number }>;
    ventasPorVendedor: Array<{ vendedor_id: string; vendedor_nombre: string; cantidad: number }>;
    ventasPorMes: Array<{ mes: string; cantidad: number }>;
   }>;

  getVentasUI: (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    userId?: string;
    userRol?: string;
  }) => Promise<{ ventas: any[]; total: number; page: number; limit: number }>;

  getVentaDetalleCompleto: (ventaId: number) => Promise<any | undefined>;
}

/**
 * Interfaz para ventas obtenidas de base de datos
 * Incluye campos autogenerados como venta_id, fechas, etc.
 */
export interface DBVenta {
  venta_id: number;
  sds?: string | null;
  chip: "SIM" | "ESIM";
  tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
  cliente_id: string;
  vendedor_id: string;
  multiple: number;
  plan_id: number;
  empresa_origen_id: number;
  fecha_creacion: Date;
  stl?: string | null;
  sap?: string | null;
  promocion_id?: number | null;
  fecha_modificacion?: Date | null;
}