// services/createComentario.ts
// Servicio para crear nuevos comentarios en una venta

import { api } from './api';

export type TipoComentario = 'GENERAL' | 'IMPORTANTE' | 'SISTEMA' | 'SEGUIMIENTO';

export interface CreateComentarioData {
  titulo: string;
  comentario: string;
  venta_id: number;
  tipo_comentario: TipoComentario;
}

export const createComentario = async (data: CreateComentarioData): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/comentarios', data);
  return response;
};
