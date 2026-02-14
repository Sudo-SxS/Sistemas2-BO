// services/plan.ts
// Servicios para planes y promociones

import { api } from './api';

// Tipos de Plan
export interface PlanResponse {
  plan_id: number;
  nombre: string;
  precio: number;
  gigabyte: number;
  llamadas: string;
  mensajes: string;
  beneficios?: string;
  whatsapp: string;
  roaming: string;
  empresa_origen_id: number;
  fecha_duracion?: string;
  promocion_id?: number;
}

export interface PromocionResponse {
  promocion_id: number;
  nombre: string;
  descuento: number;
  beneficios?: string;
  empresa_origen_id: number;
  fecha_terminacion?: string;
}

export interface EmpresaOrigenResponse {
  empresa_origen_id: number;
  nombre_empresa: string; // Corregido: es nombre_empresa en BD
  pais: string;
}

// Obtener planes por empresa
export const getPlanesPorEmpresa = async (
  empresaId: number
): Promise<{ success: boolean; data?: PlanResponse[]; message?: string }> => {
  try {
    const response = await api.get<PlanResponse[]>(`/planes/empresa/${empresaId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener planes' };
  }
};

// Obtener promociones por empresa
export const getPromocionesPorEmpresa = async (
  empresaId: number
): Promise<{ success: boolean; data?: PromocionResponse[]; message?: string }> => {
  try {
    const response = await api.get<PromocionResponse[]>(`/promociones/empresa/${empresaId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener promociones' };
  }
};

// Obtener todas las empresas origen
export const getEmpresasOrigen = async (): Promise<{ success: boolean; data?: EmpresaOrigenResponse[]; message?: string }> => {
  try {
    const response = await api.get<EmpresaOrigenResponse[]>('/empresa-origen'); // Corregido: singular
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener empresas' };
  }
};

// Obtener plan por ID
export const getPlanPorId = async (
  planId: number
): Promise<{ success: boolean; data?: PlanResponse; message?: string }> => {
  try {
    const response = await api.get<PlanResponse>(`/planes/${planId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener plan' };
  }
};

// Obtener TODOS los planes (sin filtro de empresa) - para LINEA_NUEVA
export const getAllPlanes = async (): Promise<{ success: boolean; data?: PlanResponse[]; message?: string }> => {
  try {
    const response = await api.get<PlanResponse[]>('/planes');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener todos los planes' };
  }
};

// Obtener TODAS las promociones (sin filtro de empresa) - para LINEA_NUEVA
export const getAllPromociones = async (): Promise<{ success: boolean; data?: PromocionResponse[]; message?: string }> => {
  try {
    const response = await api.get<PromocionResponse[]>('/promociones');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener todas las promociones' };
  }
};
