// services/comentarios.ts
// Servicio para gestionar comentarios de ventas

import { api } from './api';

interface ComentarioResponse {
  comentario_id: number;
  venta_id: number;
  usuario_id: string;
  tipo_comentario: 'GENERAL' | 'IMPORTANTE' | 'SISTEMA' | 'SEGUIMIENTO';
  texto: string;
  fecha_creacion: string;
  usuario_nombre: string;
  usuario_apellido: string;
}

interface ComentariosListResponse {
  comentarios: ComentarioResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Obtener comentarios de una venta específica
export const getComentariosByVenta = async (ventaId: number, page: number = 1, limit: number = 50): Promise<ComentarioResponse[]> => {
  const response = await api.get<ComentariosListResponse>(`comentarios/venta/${ventaId}?page=${page}&limit=${limit}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar comentarios');
  }
  
  return response.data.comentarios;
};

// Obtener todos los comentarios (con filtros)
export const getComentarios = async (params: {
  page?: number;
  limit?: number;
  venta_id?: number;
  usuario_id?: string;
  tipo_comentario?: string;
  desde?: string;
  hasta?: string;
}): Promise<ComentariosListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.venta_id) queryParams.append('venta_id', params.venta_id.toString());
  if (params.usuario_id) queryParams.append('usuario_id', params.usuario_id);
  if (params.tipo_comentario) queryParams.append('tipo_comentario', params.tipo_comentario);
  if (params.desde) queryParams.append('desde', params.desde);
  if (params.hasta) queryParams.append('hasta', params.hasta);
  
  const response = await api.get<ComentariosListResponse>(`comentarios?${queryParams.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar comentarios');
  }
  
  return response.data;
};

// Crear nuevo comentario
export const createComentario = async (comentarioData: {
  venta_id: number;
  tipo_comentario: string;
  texto: string;
}): Promise<ComentarioResponse> => {
  const response = await api.post<ComentarioResponse>('comentarios', comentarioData);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al crear comentario');
  }
  
  return response.data;
};

export type { ComentarioResponse, ComentariosListResponse };