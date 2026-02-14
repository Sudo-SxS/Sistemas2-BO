// hooks/useVentaComentarios.ts
// Hook para obtener todos los comentarios de una venta
// Usa el endpoint /comentarios/venta/:id

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '../services/api';

export interface ComentarioBackend {
  comentario_id: number;
  titulo: string;
  comentario: string;
  tipo_comentario: string;
  fecha_creacion: string;
  usuario_nombre: string;
  usuario_apellido: string;
}

export interface Comentario {
  comentario_id: number;
  titulo: string;
  comentario: string;
  tipo: string;
  fecha: string;
  author: string;
}

interface UseVentaComentariosReturn {
  comentarios: Comentario[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useVentaComentarios = (ventaId: number | string | null): UseVentaComentariosReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['comentarios', ventaId],
    queryFn: async () => {
      if (!ventaId) return [];
      const res = await api.get<ComentarioBackend[]>(`comentarios/venta/${ventaId}?page=1&limit=100`);
      const comentarios = res.data || [];
      return comentarios.map(c => ({
        comentario_id: c.comentario_id,
        titulo: c.titulo,
        comentario: c.comentario,
        tipo: c.tipo_comentario,
        fecha: c.fecha_creacion,
        author: `${c.usuario_nombre} ${c.usuario_apellido}`.trim()
      }));
    },
    enabled: !!ventaId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    comentarios: data || [],
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch: refetch || (() => {})
  };
};

export default useVentaComentarios;
