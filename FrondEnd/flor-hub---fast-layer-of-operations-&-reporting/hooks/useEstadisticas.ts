// hooks/useEstadisticas.ts
// Hook para obtener estadísticas del backend

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '../services/api';

export type Periodo = 'HOY' | 'SEMANA' | 'MES' | 'SEMESTRE' | 'AÑO' | 'TODO';

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

export interface RecargaInfo {
  numeroPortar: string;
  cantidadPortaciones: number;
  ultimaVentaId: number;
  ultimaFecha: string;
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

interface UseEstadisticasParams {
  periodo: Periodo;
  cellaId?: string;
  asesorId?: string;
  fechaPortacionDesde?: string;
  fechaPortacionHasta?: string;
}

export const useEstadisticas = (
  params: UseEstadisticasParams
): UseQueryResult<EstadisticaCompleta> => {
  return useQuery({
    queryKey: ['estadisticas', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('periodo', params.periodo);
      if (params.cellaId) queryParams.append('cellaId', params.cellaId);
      if (params.asesorId) queryParams.append('asesorId', params.asesorId);
      if (params.fechaPortacionDesde) queryParams.append('fechaPortacionDesde', params.fechaPortacionDesde);
      if (params.fechaPortacionHasta) queryParams.append('fechaPortacionHasta', params.fechaPortacionHasta);

      const response = await api.get<EstadisticaCompleta>(
        `/estadisticas?${queryParams.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener estadísticas');
      }

      return response.data!;
    },
    enabled: true,
    staleTime: 30000,
  });
};

export const useRecargas = (
  periodo: Periodo,
  cellaId?: string,
  fechaPortacionDesde?: string,
  fechaPortacionHasta?: string
): UseQueryResult<RecargaDetallada> => {
  return useQuery({
    queryKey: ['recargas', periodo, cellaId, fechaPortacionDesde, fechaPortacionHasta],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('periodo', periodo);
      if (cellaId) queryParams.append('cellaId', cellaId);
      if (fechaPortacionDesde) queryParams.append('fechaPortacionDesde', fechaPortacionDesde);
      if (fechaPortacionHasta) queryParams.append('fechaPortacionHasta', fechaPortacionHasta);

      const response = await api.get<RecargaDetallada>(
        `/estadisticas/recargas?${queryParams.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener recargas');
      }

      return response.data || {
        totalRecargas: 0,
        totalPortacionesRecargadas: 0,
        topAsesorRecargas: [],
        topCellRecargas: [],
        numerosRecargados: [],
      };
    },
    enabled: true,
    staleTime: 30000,
  });
};
