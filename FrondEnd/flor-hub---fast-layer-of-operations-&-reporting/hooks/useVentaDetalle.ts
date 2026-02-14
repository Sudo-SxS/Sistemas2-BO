// hooks/useVentaDetalle.ts
// Hook para obtener detalles completos de una venta con cacheo inteligente
// Usa el endpoint optimizado /ventas/:id/detalle

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVentaDetalleCompleto, VentaDetalleCompletoResponse } from '../services/ventaDetalle';

interface UseVentaDetalleReturn {
  ventaDetalle: VentaDetalleCompletoResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useVentaDetalle = (ventaId: number | string | null): UseVentaDetalleReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventaDetalleCompleto', ventaId],
    queryFn: async () => {
      if (!ventaId) return null;
      return getVentaDetalleCompleto(ventaId);
    },
    enabled: !!ventaId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    ventaDetalle: data || null,
    isLoading,
    isError,
    error,
    refetch: refetch || (() => {})
  };
};

export default useVentaDetalle;