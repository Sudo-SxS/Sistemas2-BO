// services/ventas.ts
// Servicio para gestionar ventas

import { api } from './api';
import { Sale, SaleStatus, LogisticStatus, LineStatus, ProductType, OriginMarket } from '../types';

// Interfaces para respuestas de la API
interface VentaResponse {
  venta_id: number;
  sds: string | null;
  chip: 'SIM' | 'ESIM';
  stl?: string | null;
  tipo_venta: 'PORTABILIDAD' | 'LINEA_NUEVA';
  cliente_id: string;
  vendedor_id: string;
  plan_id: number;
  promocion_id?: number | null;
  empresa_origen_id?: number | null;
  fecha_creacion: string;
  fecha_modificacion?: string;
  // Campos relacionados (joins)
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_documento?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  vendedor_nombre?: string;
  vendedor_apellido?: string;
  vendedor_email?: string;
  plan_nombre?: string;
  plan_precio?: number;
  promocion_nombre?: string;
  estado_actual?: string;
}

interface VentaListResponse {
  ventas: VentaResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface EstadisticasResponse {
  total_ventas: number;
  ventas_por_estado: Record<string, number>;
  ventas_por_plan: Record<string, number>;
  ventas_por_vendedor: Record<string, number>;
  ventas_por_mes: Record<string, number>;
}

// ============================================
// NUEVA INTERFAZ: VentaUIResponse
// Respuesta del endpoint /ventas/ui con todos los JOINs necesarios
// ============================================
interface VentaUIResponse {
  venta_id: number;
  sds: string | null;
  sap: string | null;
  chip: 'SIM' | 'ESIM';
  stl: string | null;
  tipo_venta: 'PORTABILIDAD' | 'LINEA_NUEVA';
  fecha_creacion: string;
  // Cliente
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_tipo_documento: string;
  cliente_documento: string;
  cliente_email: string;
  cliente_telefono: string;
  // Vendedor
  vendedor_nombre: string;
  vendedor_apellido: string;
  // Supervisor
  supervisor_nombre: string | null;
  supervisor_apellido: string | null;
  // Plan
  plan_nombre: string;
  plan_precio: number;
  // Promoción
  promocion_nombre: string | null;
  // Empresa origen
  empresa_origen_nombre: string | null;
  // Estado
  estado_actual: string;
  // Estado correo
  correo_estado: string | null;
  correo_id?: number | null;
  // Portabilidad
  numero_portar: string | null;
  operador_origen_nombre: string | null;
  mercado_origen: string | null;
  // Último comentario
  ultimo_comentario: string | null;
  ultimo_comentario_titulo: string | null;
  fecha_ultimo_comentario: string | null;
}

interface VentaUIListResponse {
  ventas: VentaUIResponse[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// NUEVA INTERFAZ: VentaDetalleCompletoResponse
// Respuesta del endpoint /ventas/:id/detalle
// ============================================
interface VentaDetalleCompletoResponse {
  venta: {
    venta_id: number;
    sds: string | null;
    chip: 'SIM' | 'ESIM';
    stl: string | null;
    tipo_venta: 'PORTABILIDAD' | 'LINEA_NUEVA';
    sap: string | null;
    multiple: number;
    fecha_creacion: string;
  };
  cliente: {
    persona_id: string;
    nombre: string;
    apellido: string;
    documento: string;
    email: string;
    telefono: string;
  };
  vendedor: {
    persona_id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    legajo?: string;
    exa?: string;
    celula?: number;
  };
  supervisor: {
    nombre: string;
    apellido: string;
    email?: string;
    legajo?: string;
  } | null;
  plan: {
    plan_id: number;
    nombre: string;
    precio: number;
    descripcion: string | null;
  };
  promocion: {
    promocion_id: number;
    nombre: string;
    descuento: number | null;
    beneficios: string | null;
  } | null;
  empresa_origen: {
    empresa_origen_id: number;
    nombre: string;
    pais: string | null;
  } | null;
  estado_actual: {
    estado: string;
    descripcion: string | null;
  };
  correo_estado: {
    estado: string;
    ubicacion: string | null;
  } | null;
  portabilidad: {
    portabilidad_id?: number;
    numero_portar: string | null;
    operador_origen_nombre: string | null;
    mercado_origen: string | null;
  } | null;
  linea_nueva: {
    linea_nueva_id?: number;
    estado: string | null;
    numero_asignado: string | null;
  } | null;
  historial_estados: Array<{
    estado_id: number;
    estado: string;
    descripcion: string | null;
    fecha_creacion: string;
    usuario_id: string;
  }>;
  historial_correo: Array<{
    estado_correo_id: number;
    estado: string;
    descripcion: string | null;
    ubicacion_actual: string | null;
    fecha_creacion: string;
  }>;
  comentarios: Array<{
    comentario_id: number;
    titulo: string;
    comentario: string;
    tipo: string;
    fecha: string;
    author: string;
  }>;
  correo: Record<string, any> | null;
}

// Listar todas las ventas con paginación y filtros
export const getVentas = async (
  page: number = 1, 
  limit: number = 50,
  filters?: {
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
    advisor?: string;
    status?: string;
    logisticStatus?: string;
  }
): Promise<VentaListResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  
  if (filters?.startDate) params.append('start', filters.startDate);
  if (filters?.endDate) params.append('end', filters.endDate);
  if (filters?.searchQuery) params.append('search', filters.searchQuery);
  if (filters?.advisor) params.append('advisor', filters.advisor);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.logisticStatus) params.append('logistic', filters.logisticStatus);

  const response = await api.get<VentaListResponse>(`ventas?${params.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar ventas');
  }
  
  return response.data;
};

// Obtener venta por ID
export const getVentaById = async (id: number | string): Promise<VentaResponse> => {
  const response = await api.get<VentaResponse>(`ventas/${id}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Buscar venta por SDS
export const getVentaBySDS = async (sds: string): Promise<VentaResponse> => {
  const response = await api.get<VentaResponse>(`ventas/sds/${sds}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Buscar venta por SAP
export const getVentaBySAP = async (sap: string): Promise<VentaResponse> => {
  const response = await api.get<VentaResponse>(`ventas/sap/${sap}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Obtener ventas por rango de fechas
export const getVentasByDateRange = async (
  start: string, 
  end: string
): Promise<VentaResponse[]> => {
  const response = await api.get<VentaResponse[]>(
    `ventas/fechas?start=${start}&end=${end}`
  );
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al buscar ventas');
  }
  
  return response.data;
};

// Obtener estadísticas de ventas
export const getEstadisticas = async (): Promise<EstadisticasResponse> => {
  const response = await api.get<EstadisticasResponse>('ventas/estadisticas');
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar estadísticas');
  }
  
  return response.data;
};

// Crear nueva venta
export const createVenta = async (ventaData: any): Promise<VentaResponse> => {
  const response = await api.post<VentaResponse>('ventas', ventaData);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al crear venta');
  }
  
  return response.data;
};

// Actualizar venta
export const updateVenta = async (
  id: number | string, 
  ventaData: any
): Promise<VentaResponse> => {
  const response = await api.put<VentaResponse>(`ventas/${id}`, ventaData);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al actualizar venta');
  }
  
  return response.data;
};

// Eliminar venta
export const deleteVenta = async (id: number | string): Promise<void> => {
  const response = await api.delete<void>(`ventas/${id}`);
  
  if (!response.success) {
    throw new Error(response.message || 'Error al eliminar venta');
  }
};

// ============================================
// NUEVA FUNCIÓN: getVentasUI
// Usa el endpoint optimizado con todos los JOINs para la UI
// ============================================
export const getVentasUI = async (
  page: number = 1,
  limit: number = 50,
  filters?: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }
): Promise<VentaUIListResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get<VentaUIListResponse>(`ventas/ui?${params.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar ventas');
  }
  
  return response.data;
};

// ============================================
// NUEVA FUNCIÓN: getVentaDetalleCompleto
// Usa el endpoint de detalle completo
// ============================================
export const getVentaDetalleCompleto = async (id: number | string): Promise<VentaDetalleCompletoResponse> => {
  const response = await api.get<VentaDetalleCompletoResponse>(`ventas/${id}/detalle`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// ============================================
// NUEVA FUNCIÓN: mapVentaUIToSale
// Mapea la respuesta del endpoint /ventas/ui al tipo Sale
// ============================================
export const mapVentaUIToSale = (venta: VentaUIResponse): Sale => {
  // Determinar estado logístico desde correo_estado
  const mapCorreoEstadoToLogisticStatus = (estado: string | null): LogisticStatus => {
    if (!estado) return LogisticStatus.INICIAL;
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper.includes('ENTREGADO')) return LogisticStatus.ENTREGADO;
    if (estadoUpper.includes('TRANSITO') || estadoUpper.includes('TRÁNSITO') || estadoUpper.includes('CAMINO')) return LogisticStatus.EN_TRANSITO;
    if (estadoUpper.includes('REPARTO') || estadoUpper.includes('REPARTIENDO')) return LogisticStatus.EN_REPARTO;
    if (estadoUpper.includes('LLEGADA')) return LogisticStatus.LLEGADA_DESTINO;
    if (estadoUpper.includes('DEVUELTO')) return LogisticStatus.DEVUELTO;
    if (estadoUpper.includes('ASIGNADO')) return LogisticStatus.ASIGNADO;
    if (estadoUpper.includes('PENDIENTE')) return LogisticStatus.PENDIENTE;
    return LogisticStatus.INICIAL;
  };

  // Determinar estado de venta - USA EL ESTADO DIRECTAMENTE DEL BACKEND
  const mapEstadoToSaleStatus = (estado: string | undefined): SaleStatus => {
    // Si no hay estado, retorna INICIAL
    if (!estado) return SaleStatus.INICIAL;
    
    // Usa el estado exactamente como viene del backend (sin transformaciones)
    // El backend garantiza que siempre devuelve estados válidos del enum SaleStatus
    return (estado as SaleStatus) || SaleStatus.INICIAL;
  };

  // Determinar mercado origen
  const mercadoOrigen = venta.mercado_origen?.toUpperCase();
  
  // Determinar número de contacto (numero_portar para portabilidad, telefono para línea nueva)
  const phoneNumber = venta.tipo_venta === 'PORTABILIDAD' 
    ? (venta.numero_portar || venta.cliente_telefono || '')
    : venta.cliente_telefono || '';
  
  return {
    id: `V-${venta.venta_id}`,
    customerName: `${venta.cliente_nombre} ${venta.cliente_apellido}`.trim(),
    dni: venta.cliente_documento || '',
    phoneNumber: phoneNumber,
    status: mapEstadoToSaleStatus(venta.estado_actual),
    logisticStatus: venta.chip === 'ESIM'
      ? LogisticStatus.ESIM
      : mapCorreoEstadoToLogisticStatus(venta.correo_estado),
    logisticStatusDisplay: venta.chip === 'ESIM'
      ? 'ESIM'
      : (venta.correo_estado || 'INICIAL'),
    lineStatus: venta.tipo_venta === 'PORTABILIDAD' 
      ? (venta.stl ? LineStatus.PENDIENTE_PORTABILIDAD : LineStatus.PENDIENTE_PRECARGA)
      : LineStatus.PENDIENTE_PRECARGA,
    productType: venta.tipo_venta === 'PORTABILIDAD' 
      ? ProductType.PORTABILITY 
      : ProductType.NEW_LINE,
    originMarket: mercadoOrigen === 'POSPAGO' ? OriginMarket.POSPAGO : OriginMarket.PREPAGO,
    originCompany: venta.empresa_origen_nombre || undefined,
    plan: venta.plan_nombre || '',
    promotion: venta.promocion_nombre || '',
    priority: 'MEDIA',
    date: venta.fecha_creacion,
    amount: venta.plan_precio || 0,
    comments: venta.ultimo_comentario 
      ? [{ 
          id: `comment-${Date.now()}`,
          title: venta.ultimo_comentario_titulo || 'Comentario',
          text: venta.ultimo_comentario || '-',
          type: 'GENERAL', 
          date: venta.fecha_ultimo_comentario || '',
          author: venta.vendedor_nombre ? `${venta.vendedor_nombre} ${venta.vendedor_apellido}`.trim() : 'Sistema'
        }]
      : [],
    advisor: `${venta.vendedor_nombre} ${venta.vendedor_apellido}`.trim(),
    supervisor: venta.supervisor_nombre 
      ? `${venta.supervisor_nombre} ${venta.supervisor_apellido || ''}`.trim()
      : '',
    correo_id: venta.correo_id,
    sap: venta.sap
  };
};

// Helper para mapear respuesta API a tipo Sale
export const mapVentaToSale = (venta: VentaResponse): Sale => {
  return {
    id: `V-${venta.venta_id}`,
    customerName: `${venta.cliente_nombre || ''} ${venta.cliente_apellido || ''}`.trim(),
    dni: venta.cliente_documento || '',
    phoneNumber: venta.cliente_telefono || '',
    status: (venta.estado_actual as SaleStatus) || SaleStatus.INICIAL,
    logisticStatus: LogisticStatus.INICIAL, // Se obtiene del correo
    lineStatus: venta.tipo_venta === 'PORTABILIDAD' ? 
      (venta.stl ? LineStatus.PENDIENTE_PORTABILIDAD : LineStatus.PENDIENTE_PRECARGA) : 
      LineStatus.PENDIENTE_PRECARGA,
    productType: venta.tipo_venta === 'PORTABILIDAD' ? 
      ProductType.PORTABILITY : ProductType.NEW_LINE,
    originMarket: OriginMarket.PREPAGO, // Default, se obtiene de portabilidad
    originCompany: undefined,
    plan: venta.plan_nombre || '',
    promotion: venta.promocion_nombre || '',
    priority: 'MEDIA',
    date: venta.fecha_creacion,
    amount: venta.plan_precio || 0,
    comments: [],
    advisor: `${venta.vendedor_nombre || ''} ${venta.vendedor_apellido || ''}`.trim(),
    supervisor: '' // Se obtiene del supervisor asignado
  };
};

export type { 
  VentaResponse, 
  VentaListResponse, 
  EstadisticasResponse,
  VentaUIResponse,
  VentaUIListResponse,
  VentaDetalleCompletoResponse
};
