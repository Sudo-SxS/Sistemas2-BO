// utils/exportExcel.ts
// Utilidad para exportar datos a Excel

import * as XLSX from 'xlsx';

export interface ResumenData {
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  tasaConversion: number;
}

export interface RecargaData {
  numeroPortar: string;
  cantidadPortaciones: number;
  ultimaVentaId: number;
  ultimaFecha: string;
}

export interface DetalleData {
  ventaId: number;
  sds: string;
  sap: string | null;
  tipoVenta: string;
  estado: string;
  fechaCreacion: string;
  fechaPortacion: string | null;
  clienteNombre: string;
  clienteDocumento: string;
  clienteEmail: string;
  vendedorId: string;
  vendedorNombre: string;
  vendedorLegajo: string;
  vendedorExa: string;
  vendedorEmail: string;
  cellaNombre: string;
}

export const exportToExcel = (
  resumen: ResumenData,
  recargas: RecargaData[],
  detalle: DetalleData[],
  filename: string = 'reporte_estadisticas'
) => {
  const workbook = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.json_to_sheet([
    { 'Métrica': 'Total Ventas', 'Valor': resumen.totalVentas, '%': '' },
    { 'Métrica': 'Agendados', 'Valor': resumen.agendados, '%': `${((resumen.agendados / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Aprobado ABD', 'Valor': resumen.aprobadoAbd, '%': `${((resumen.aprobadoAbd / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Activado Portado', 'Valor': resumen.activadoPortado, '%': `${((resumen.activadoPortado / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Activado Claro', 'Valor': resumen.activadoClaro, '%': `${((resumen.activadoClaro / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Rechazados', 'Valor': resumen.rechazados, '%': `${((resumen.rechazados / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Cancelados', 'Valor': resumen.cancelados, '%': `${((resumen.cancelados / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'SP Cancelados', 'Valor': resumen.spCancelados, '%': `${((resumen.spCancelados / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Entregados', 'Valor': resumen.entregados, '%': `${((resumen.entregados / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'No Entregados', 'Valor': resumen.noEntregados, '%': `${((resumen.noEntregados / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Rendidos', 'Valor': resumen.rendidos, '%': `${((resumen.rendidos / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Pendiente PIN', 'Valor': resumen.pendientePin, '%': `${((resumen.pendientePin / (resumen.totalVentas || 1)) * 100).toFixed(2)}%` },
    { 'Métrica': 'Tasa Conversión (%)', 'Valor': `${resumen.tasaConversion}%`, '%': '' },
  ]);

  wsResumen['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

  if (recargas.length > 0) {
    const wsRecargas = XLSX.utils.json_to_sheet(
      recargas.map(r => ({
        'Número a Portar': r.numeroPortar,
        'Cantidad Portaciones': r.cantidadPortaciones,
        'Última Venta ID': r.ultimaVentaId,
        'Última Fecha': r.ultimaFecha,
      }))
    );

    wsRecargas['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsRecargas, 'Recargas');
  }

  if (detalle.length > 0) {
    const wsDetalle = XLSX.utils.json_to_sheet(
      detalle.map(d => ({
        'ID Venta': d.ventaId,
        'SDS': d.sds,
        'SAP': d.sap || '',
        'Tipo Venta': d.tipoVenta,
        'Estado': d.estado,
        'Fecha Creación': d.fechaCreacion,
        'Fecha Portación': d.fechaPortacion || '',
        'Cliente': d.clienteNombre,
        'Documento': d.clienteDocumento,
        'Email Cliente': d.clienteEmail,
        'Vendedor': d.vendedorNombre,
        'Legajo Vendedor': d.vendedorLegajo,
        'EXA Vendedor': d.vendedorExa,
        'Email Vendedor': d.vendedorEmail,
        'Célula': d.cellaNombre,
      }))
    );

    wsDetalle['!cols'] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle');
  }

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
};
