import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVentas, createVenta, updateVenta, VentaResponse } from '../services/ventas';

export const SALES_QUERY_KEY = ['sales'];

export const useSales = (filters?: any) => {
  return useQuery({
    queryKey: [...SALES_QUERY_KEY, filters],
    queryFn: () => getVentas(filters), // TODO: Adapt getVentas to accept filters if needed
  });
};

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSale: any) => createVenta(newSale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY });
    },
  });
};

export const useUpdateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVenta(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY });
    },
  });
};
