// ============================================
// BackEnd/src/interface/Estadistica.ts
// Interfaces para el módulo de estadísticas
// ============================================

export type Periodo = 'HOY' | 'SEMANA' | 'MES' | 'SEMESTRE' | 'AÑO' | 'TODO';

export interface EstadisticaFilters {
  periodo: Periodo;
  cellaId?: string;
  asesorId?: string;
  userId: string;
  userRol: string;
  fechaPortacionDesde?: string;
  fechaPortacionHasta?: string;
}

export interface EstadisticaResumen {
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  
  // Porcentajes sobre totalVentas
  percAgendados: number;
  percAprobadoAbd: number;
  percRechazados: number;
  percNoEntregados: number;
  percEntregados: number;
  percRendidos: number;
  percActivadoPortado: number;
  percActivadoClaro: number;
  percCancelados: number;
  percSpCancelados: number;
  percPendientePin: number;
}

export interface RecargaInfo {
  numeroPortar: string;
  cantidadPortaciones: number;
  ultimaVentaId: number;
  ultimaFecha: string;
}

export interface TopAsesorRecarga {
  vendedorId: string;
  vendedorNombre: string;
  cantidadRecargas: number;
}

export interface TopCellRecarga {
  cellaId: string;
  cellaNombre: string;
  cantidadRecargas: number;
}

export interface RecargaDetallada {
  totalRecargas: number;
  totalPortacionesRecargadas: number;
  topAsesorRecargas: TopAsesorRecarga[];
  topCellRecargas: TopCellRecarga[];
  numerosRecargados: RecargaInfo[];
}

export interface EstadisticaVendedor {
  vendedorId: string;
  vendedorNombre: string;
  legajo: string;
  exa: string;
  email: string;
  cellaId: string;
  cellaNombre: string;
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  percActivados: number;
}

export interface EstadisticaCell {
  cellaId: string;
  cellaNombre: string;
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  percActivados: number;
}

export interface EstadisticaDetalle {
  ventaId: number;
  sds: string;
  sap: string | null;
  tipoVenta: string;
  estado: string;
  fechaCreacion: string;
  fechaPortacion: string | null;
  clienteNombre: string;
  clienteDocumento: string;
  clienteEmail: string;
  vendedorId: string;
  vendedorNombre: string;
  vendedorLegajo: string;
  vendedorExa: string;
  vendedorEmail: string;
  cellaNombre: string;
}

export interface EstadisticaCompleta {
  resumen: EstadisticaResumen;
  ventasPorVendedor: EstadisticaVendedor[];
  ventasPorCell: EstadisticaCell[];
  detalle: EstadisticaDetalle[];
  recargas: RecargaDetallada;
  totales: {
    totalVentas: number;
    totalActivados: number;
    tasaConversion: number;
  };
}
