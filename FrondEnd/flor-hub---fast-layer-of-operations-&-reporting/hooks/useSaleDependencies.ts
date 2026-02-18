import { useQuery } from '@tanstack/react-query';
import { getAllPlanes, getAllPromociones, getEmpresasOrigen } from '../services/plan';

export const DEPENDENCIES_KEYS = {
  planes: ['planes'],
  promociones: ['promociones'],
  empresas: ['empresas'],
};

export const usePlansQuery = () => {
  return useQuery({
    queryKey: DEPENDENCIES_KEYS.planes,
    queryFn: async () => {
      const result = await getAllPlanes();
      return result.data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const usePromotionsQuery = () => {
  return useQuery({
    queryKey: DEPENDENCIES_KEYS.promociones,
    queryFn: async () => {
      const result = await getAllPromociones();
      return result.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useEmpresasQuery = () => {
  return useQuery({
    queryKey: DEPENDENCIES_KEYS.empresas,
    queryFn: async () => {
      const result = await getEmpresasOrigen();
      return result.data || [];
    },
    staleTime: Infinity, // Rarely changes
  });
};
