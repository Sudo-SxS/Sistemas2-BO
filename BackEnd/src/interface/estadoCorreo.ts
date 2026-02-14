// ============================================
// BackEnd/src/interface/estadoCorreo.ts
// ============================================
import { EstadoCorreo, EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";

export interface EstadoCorreoModelDB {
  connection: unknown;

  // Métodos CRUD básicos
  getAll(): Promise<EstadoCorreo[]>;

  getById(params: { id: number }): Promise<EstadoCorreo | undefined>;

  add(params: { input: EstadoCorreoCreate }): Promise<EstadoCorreo>;

  update(params: {
    id: number;
    input: Partial<EstadoCorreo>;
  }): Promise<EstadoCorreo | undefined>;

  delete(params: { id: number }): Promise<boolean>;

  // Métodos de búsqueda por SAP
  getBySAP(params: { sap: string }): Promise<EstadoCorreo[]>;

  getLastBySAP(params: { sap: string }): Promise<EstadoCorreo | undefined>;

  // Métodos de filtrado por estado
  getEntregados(): Promise<EstadoCorreo[]>;

  getNoEntregados(): Promise<EstadoCorreo[]>;

  getDevueltos(): Promise<EstadoCorreo[]>;

  getEnTransito(): Promise<EstadoCorreo[]>;

  getAsignados(): Promise<EstadoCorreo[]>;

  getByEstado(params: { estado: string }): Promise<EstadoCorreo[]>;

  // Métodos de búsqueda
  getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoCorreo[]>;

  getByUbicacion(params: { ubicacion: string }): Promise<EstadoCorreo[]>;

  // Métodos de acción
  marcarComoEntregado(params: { id: number }): Promise<EstadoCorreo | undefined>;

  actualizarUbicacion(params: {
    id: number;
    ubicacion: string;
  }): Promise<EstadoCorreo | undefined>;

  // Métodos de conteo
  countByEstado(params: { estado: string }): Promise<number>;

  countBySAP(params: { sap_id: string }): Promise<number>;
}
