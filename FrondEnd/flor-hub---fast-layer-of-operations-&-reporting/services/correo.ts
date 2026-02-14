// services/correo.ts
// Servicios para gestión de correos/SIM

import { api } from './api';

export interface CorreoResponse {
  sap_id: string;
  numero: string;
  tipo: 'RESIDENCIAL' | 'EMPRESARIAL';
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigo_postal?: string;
  estado_entrega?: string;
  usuario_id: string;
}

export interface CorreoCreate {
  sap_id: string;
  numero: string;
  tipo: 'RESIDENCIAL' | 'EMPRESARIAL';
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigo_postal?: string;
  estado_entrega?: string;
}

// Verificar si un SAP existe
export const verificarSAP = async (
  sap: string
): Promise<{ success: boolean; existe: boolean; message?: string }> => {
  try {
    await api.get<{ data: CorreoResponse }>(`/correos/search/sap?sap=${sap}`);
    return { success: true, existe: true, message: 'SAP ya existe' };
  } catch (error: any) {
    const errorMessage = error.message || '';
    if (errorMessage.includes('404') || errorMessage.includes('no encontrado') || errorMessage.includes('No se encontraron')) {
      return { success: true, existe: false };
    }
    return { success: false, existe: false, message: errorMessage || 'Error al verificar SAP' };
  }
};

// Crear correo (para chip SIM)
export const crearCorreo = async (
  data: CorreoCreate
): Promise<{ success: boolean; data?: CorreoResponse; message?: string }> => {
  try {
    const response = await api.post<CorreoResponse>('/correos', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al crear correo' };
  }
};

// Obtener correo por SAP
export const obtenerCorreoPorSAP = async (
  sap: string
): Promise<{ success: boolean; data?: CorreoResponse; message?: string }> => {
  try {
    const response = await api.get<CorreoResponse>(`/correos/search/sap?sap=${sap}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener correo' };
  }
};
