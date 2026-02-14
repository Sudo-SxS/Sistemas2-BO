// hooks/useVentas.ts
// Hook para listar y gestionar ventas

import { useState, useEffect, useCallback } from 'react';
import { getVentas, getVentaById, mapVentaToSale } from '../services/ventas';
import { Sale } from '../types';

interface UseVentasReturn {
  ventas: Sale[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  refetch: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
}

export const useVentas = (initialPage: number = 1, limit: number = 50): UseVentasReturn => {
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: limit,
    total: 0,
  });

  const fetchVentas = useCallback(async () => {
    // No hacer peticiones si no hay autenticación
    if (limit === 0) {
      setVentas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getVentas(page, limit);
      
      // Mapear ventas de API a tipo Sale
      const mappedVentas = data.ventas.map(mapVentaToSale);
      
      setVentas(mappedVentas);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar ventas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const nextPage = useCallback(() => {
    if (page < Math.ceil(pagination.total / limit)) {
      setPage(prev => prev + 1);
    }
  }, [page, pagination.total, limit]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.total / limit)) {
      setPage(newPage);
    }
  }, [pagination.total, limit]);

  return {
    ventas,
    isLoading,
    error,
    pagination: {
      ...pagination,
      page,
    },
    refetch: fetchVentas,
    nextPage,
    prevPage,
    setPage: goToPage,
  };
};

// Hook para obtener una venta específica
interface UseVentaReturn {
  venta: Sale | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVenta = (id: string | number | null): UseVentaReturn => {
  const [venta, setVenta] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVenta = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getVentaById(id);
      const mappedVenta = mapVentaToSale(data);
      setVenta(mappedVenta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar venta';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVenta();
  }, [fetchVenta]);

  return {
    venta,
    isLoading,
    error,
    refetch: fetchVenta,
  };
};

export default useVentas;
