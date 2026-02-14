// services/ventaDetalle.ts
// Servicio para obtener detalles completos de una venta
// Usa el endpoint optimizado /ventas/:id/detalle

import { api } from './api';
import { getVentaDetalleCompleto, VentaDetalleCompletoResponse } from './ventas';

export { getVentaDetalleCompleto };

export type {
  VentaDetalleCompletoResponse
};