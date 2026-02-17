import { useQuery } from '@tanstack/react-query';
import { getEmpresasOrigen, getPlanesPorEmpresa, getPromocionesPorEmpresa } from '../services/plan';

// Cache configuration
const STALE_TIME = 10 * 60 * 1000; // 10 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const useEmpresasQuery = () => {
  return useQuery({
    queryKey: ['empresasOrigen'],
    queryFn: async () => {
      const result = await getEmpresasOrigen();
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

export const usePlanesQuery = (empresaId: number | null) => {
  return useQuery({
    queryKey: ['planes', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const result = await getPlanesPorEmpresa(empresaId);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    enabled: !!empresaId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

export const usePromocionesQuery = (empresaId: number | null) => {
  return useQuery({
    queryKey: ['promociones', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const result = await getPromocionesPorEmpresa(empresaId);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    enabled: !!empresaId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};
