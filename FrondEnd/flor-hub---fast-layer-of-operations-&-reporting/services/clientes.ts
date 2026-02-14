// services/clientes.ts
// Servicio para gestionar datos de clientes

import { api } from './api';

interface ClienteResponse {
  cliente_id: string;
  nombre: string;
  apellido: string;
  tipo_documento: 'DNI' | 'CUIL' | 'PASAPORTE';
  documento: string;
  nacionalidad: string;
  genero: string;
  fecha_nacimiento: string;
  email: string;
  telefono: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigo_postal?: string;
  fecha_creacion: string;
}

interface ClientesListResponse {
  clientes: ClienteResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Obtener cliente por ID
export const getClienteById = async (id: string): Promise<ClienteResponse> => {
  const response = await api.get<ClienteResponse>(`clientes/${id}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Cliente no encontrado');
  }
  
  return response.data;
};

// Obtener cliente completo con datos adicionales
export const getClienteCompleto = async (id: string): Promise<ClienteResponse> => {
  const response = await api.get<ClienteResponse>(`/clientes/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Cliente no encontrado');
  }

  return response.data;
};

// Buscar clientes
export const getClientes = async (params: {
  page?: number;
  limit?: number;
  nombre?: string;
  documento?: string;
  email?: string;
}): Promise<ClientesListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.nombre) queryParams.append('nombre', params.nombre);
  if (params.documento) queryParams.append('documento', params.documento);
  if (params.email) queryParams.append('email', params.email);
  
  const response = await api.get<ClientesListResponse>(`clientes/buscar?${queryParams.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al buscar clientes');
  }
  
  return response.data;
};

// Obtener lista completa de clientes
export const getClientesLista = async (page: number = 1, limit: number = 50): Promise<ClientesListResponse> => {
  const response = await api.get<ClientesListResponse>(`clientes?page=${page}&limit=${limit}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar clientes');
  }
  
  return response.data;
};

export type { ClienteResponse, ClientesListResponse };