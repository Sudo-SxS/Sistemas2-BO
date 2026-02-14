// components/SaleDetail.tsx
// Componente para mostrar detalles completos de una venta

import React from 'react';
import { VentaCompletaResponse } from '../services/ventaDetalle';
import { SaleStatus, LogisticStatus } from '../types';

interface SaleDetailProps {
  ventaDetalle: VentaCompletaResponse | null;
  isLoading?: boolean;
  isError?: boolean;
}

export const SaleDetail: React.FC<SaleDetailProps> = ({ ventaDetalle, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-indigo-600 font-medium">Cargando detalles...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 font-medium">
          Error al cargar los detalles de la venta
        </div>
      </div>
    );
  }

  if (!ventaDetalle) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">No se encontraron detalles</div>
      </div>
    );
  }

  const { venta, comentarios, linea_nueva, portabilidad, estados, correos } = ventaDetalle;

  return (
    <div className="p-6 space-y-6">
      {/* Información Principal */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">Información de Venta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">SDS</span>
            <p className="text-lg font-mono font-bold text-indigo-900">{venta.sds}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">SAP</span>
            <p className="text-lg font-mono font-bold text-indigo-900">{venta.sap || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Chip</span>
            <p className="text-lg font-bold text-indigo-900">{venta.chip}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Tipo</span>
            <p className="text-lg font-bold text-indigo-900">{venta.tipo_venta}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Multiple</span>
            <p className="text-lg font-bold text-indigo-900">{venta.multiple}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Fecha</span>
            <p className="text-lg font-bold text-indigo-900">
              {new Date(venta.fecha_creacion).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Datos del Cliente */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <h3 className="text-lg font-bold text-green-900 mb-4">Datos del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Nombre Completo</span>
            <p className="text-lg font-bold text-green-900">{venta.cliente_nombre} {venta.cliente_apellido}</p>
          </div>
          <div>
            <span className="text-xs text-green-600 font-bold uppercase tracking-wider">DNI</span>
            <p className="text-lg font-mono font-bold text-green-900">{venta.cliente_documento}</p>
          </div>
          <div>
            <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Email</span>
            <p className="text-sm font-medium text-green-900">{venta.cliente_email}</p>
          </div>
          <div>
            <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Teléfono</span>
            <p className="text-lg font-bold text-green-900">{venta.cliente_telefono}</p>
          </div>
        </div>
      </div>

      {/* Vendedor y Plan */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Vendedor y Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Vendedor</span>
            <p className="text-lg font-bold text-amber-900">{venta.vendedor_nombre} {venta.vendedor_apellido}</p>
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Email Vendedor</span>
            <p className="text-sm font-medium text-amber-900">{venta.vendedor_email}</p>
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Plan</span>
            <p className="text-lg font-bold text-amber-900">{venta.plan_nombre}</p>
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Precio</span>
            <p className="text-lg font-bold text-amber-900">${venta.plan_precio || '0'}</p>
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Promoción</span>
            <p className="text-lg font-bold text-amber-900">{venta.promocion_nombre || 'Sin promoción'}</p>
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Empresa Origen</span>
            <p className="text-lg font-bold text-amber-900">{venta.empresa_origen_nombre}</p>
          </div>
        </div>
      </div>

      {/* Sección Dinámica según tipo de venta */}
      {(venta.tipo_venta === 'PORTABILIDAD' && portabilidad) && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4">Datos de Portabilidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">Número a Portar</span>
              <p className="text-lg font-mono font-bold text-purple-900">{portabilidad.numero_portar}</p>
            </div>
            <div>
              <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">Operador Origen</span>
              <p className="text-lg font-bold text-purple-900">{portabilidad.operador_origen_nombre}</p>
            </div>
            <div>
              <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">Estado Portabilidad</span>
              <p className="text-lg font-bold text-purple-900">{portabilidad.estado}</p>
            </div>
            {portabilidad.nro_portabilidad && (
              <div>
                <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">N° Portabilidad</span>
                <p className="text-lg font-mono font-bold text-purple-900">{portabilidad.nro_portabilidad}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {(venta.tipo_venta === 'LINEA_NUEVA' && linea_nueva) && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Datos de Línea Nueva</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Estado Línea</span>
              <p className="text-lg font-bold text-blue-900">{linea_nueva.estado}</p>
            </div>
            {linea_nueva.numero_activacion && (
              <div>
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">N° Activación</span>
                <p className="text-lg font-mono font-bold text-blue-900">{linea_nueva.numero_activacion}</p>
              </div>
            )}
            {linea_nueva.iccid && (
              <div>
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">ICCID</span>
                <p className="text-lg font-mono font-bold text-blue-900">{linea_nueva.iccid}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estados de la Venta */}
      {estados && estados.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Historial de Estados</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {estados.map((estado, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-slate-900">{estado.estado_nuevo}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(estado.fecha_cambio).toLocaleString('es-AR')} • {estado.usuario_nombre}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comentarios */}
      {comentarios && comentarios.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-900 mb-4">Comentarios ({comentarios.length})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comentarios.map((comentario, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                    {comentario.tipo_comentario}
                  </span>
                  <span className="text-xs text-yellow-600">
                    {new Date(comentario.fecha_creacion).toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comentario.texto}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Por: {comentario.usuario_nombre} {comentario.usuario_apellido}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correos/Envíos */}
      {correos && correos.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Correos y Envíos ({correos.length})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {correos.map((correo, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {correo.tipo_envio}
                  </span>
                  <span className="text-xs text-indigo-600">
                    {new Date(correo.fecha_envio).toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{correo.destinatario_nombre}</p>
                <p className="text-xs text-gray-600 mt-1">{correo.destinatario_direccion}</p>
                <p className="text-xs text-gray-600">{correo.destinatario_localidad}</p>
                <p className="text-xs text-indigo-600 font-medium mt-2">
                  Estado: {correo.estado_actual}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleDetail;