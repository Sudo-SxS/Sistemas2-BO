import { ModelDB } from "./model.ts";

export interface EmpresaOrigen {
  empresa_origen_id: number;
  nombre_empresa: string;
  pais: string;
}

export interface EmpresaOrigenCreate {
  nombre_empresa: string;
  pais: string;
}

export interface EmpresaOrigenUpdate {
  nombre_empresa?: string;
  pais?: string;
}

export interface EmpresaOrigenModelDB extends ModelDB<EmpresaOrigenCreate, EmpresaOrigen> {
  // Métodos adicionales si son necesarios
}