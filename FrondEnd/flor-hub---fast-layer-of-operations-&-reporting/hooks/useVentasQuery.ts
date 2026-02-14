// hooks/useVentasQuery.ts
// Hook para gestión de ventas con React Query
// Usa el endpoint optimizado /ventas/ui

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVentasUI, mapVentaUIToSale } from '../services/ventas';
import { Sale } from '../types';

interface UseVentasQueryReturn {
  ventas: Sale[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  total: number;
  page: number;
  limit: number;
  refetch: () => void;
}

export const useVentasQuery = (
  page: number = 1, 
  limit: number = 50,
  filters?: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }
): UseVentasQueryReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventasUI', page, limit, filters],
    queryFn: async () => {
      console.log('[useVentasQuery] Fetching ventas con filtros:', { page, limit, filters });
      if (limit === 0) return { ventas: [], total: 0, page: 1, limit: 0 };
      const result = await getVentasUI(page, limit, filters);
      console.log('[useVentasQuery] Respuesta del servidor:', result);
      return result;
    },
    select: (response) => {
      console.log('[useVentasQuery] Datos crudos recibidos:', response);
      const ventas = response.ventas?.map((v, index) => {
        console.log(`[useVentasQuery] Mapeando venta ${index + 1}:`, v);
        const mapped = mapVentaUIToSale(v);
        console.log(`[useVentasQuery] Venta mapeada ${index + 1}:`, mapped);
        return mapped;
      }) || [];
      console.log('[useVentasQuery] Total ventas mapeadas:', ventas.length);
      return {
        ventas,
        total: Number(response.total) || 0,
        page: Number(response.page) || 1,
        limit: Number(response.limit) || 50
      };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    ventas: data?.ventas || [],
    isLoading,
    isError,
    error,
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 50,
    refetch: refetch || (() => {})
  };
};

export default useVentasQuery;