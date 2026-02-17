import React, { useState, memo, useMemo } from 'react';
import { SaleDetail, SaleStatus, LogisticStatus, Genero, TipoDocumento, Sale } from '../../types';
import { useVentaDetalle } from '../../hooks/useVentaDetalle';
import { getClienteById } from '../../services/clientes';
import { VentaDetalleCompletoResponse } from '../../services/ventas';
import { SUPERVISORES_MOCK } from '../../mocks/supervisores';
import { EMPRESAS_ORIGEN_MOCK } from '../../mocks/empresasOrigen';



// Tipos auxiliares para el componente
type TabType = 'venta' | 'cliente' | 'plan' | 'correo' | 'estados';

interface SaleModalProps {
  sale: Sale;
  onClose: () => void;
  onUpdate: (updatedSale: any) => Promise<void>;
  onUpdateStatus?: (status: SaleStatus, comment: string) => Promise<void>;
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>;
}

// Función para mapear datos del backend al formato del componente
const mapBackendToSaleDetail = (data: VentaDetalleCompletoResponse): SaleDetail => {
  // Calcular precio con descuento
  const precioBase = data.plan?.precio || 0;
  const descuento = data.promocion?.descuento || 0;
  const precioFinal = descuento > 0 ? Math.round(precioBase * (1 - descuento / 100)) : precioBase;

  return {
    // Datos de venta
    id: `V-${data.venta.venta_id}`,
    sap: data.venta.sap,
    sds: data.venta.sds,
    stl: data.venta.stl,
    chip: data.venta.chip as 'SIM' | 'ESIM',
    tipoVenta: data.venta.tipo_venta as 'PORTABILIDAD' | 'LINEA_NUEVA',
    fechaCreacion: data.venta.fecha_creacion,
    multiple: 0,
    
    // Cliente
    cliente: data.cliente ? {
      id: String(data.cliente.persona_id),
      nombre: data.cliente.nombre,
      apellido: data.cliente.apellido,
      documento: data.cliente.documento,
      email: data.cliente.email,
      telefono: data.cliente.telefono || null,
      tipoDocumento: (data.cliente as any).tipoDocumento || TipoDocumento.DNI,
      genero: (data.cliente as any).genero || Genero.MASCULINO,
      fechaNacimiento: (data.cliente as any).fechaNacimiento || '',
      nacionalidad: (data.cliente as any).nacionalidad || 'Argentina',
    } : {
      id: '', nombre: '', apellido: '', documento: '', email: '',
      telefono: null, tipoDocumento: TipoDocumento.DNI, genero: Genero.MASCULINO,
      fechaNacimiento: '', nacionalidad: 'Argentina'
    },
    
    // Vendedor
    vendedor: data.vendedor ? {
      id: String(data.vendedor.persona_id),
      nombre: data.vendedor.nombre,
      apellido: data.vendedor.apellido,
      email: data.vendedor.email,
      telefono: (data.vendedor as any).telefono || null,
      legajo: (data.vendedor as any).legajo || 'S/D',
      exa: (data.vendedor as any).exa || 'S/D',
      celula: (data.vendedor as any).celula || 0,
    } : {
      id: '', nombre: '', apellido: '', email: '', telefono: null,
      legajo: '', exa: '', celula: 0
    },
    
    // Supervisor (usando casting para evitar errores si faltan campos en la interfaz del backend)
    supervisor: data.supervisor ? {
      id: (data.supervisor as any).id || '',
      nombre: data.supervisor.nombre,
      apellido: data.supervisor.apellido,
      legajo: (data.supervisor as any).legajo || '',
      email: (data.supervisor as any).email || '',
    } : {
      id: '', nombre: '', apellido: '', legajo: '', email: ''
    },
    
    // Plan
    plan: data.plan ? {
      id: data.plan.plan_id,
      nombre: data.plan.nombre,
      precio: data.plan.precio,
      gigabyte: Number((data.plan as any).gigabyte) || 0,
      llamadas: (data.plan as any).llamadas || '0',
      mensajes: (data.plan as any).mensajes || '0',
      whatsapp: (data.plan as any).whatsapp || 'Ilimitado',
      roaming: 'No Incluido',
      beneficios: data.plan.descripcion || '',
    } : {
      id: 0,
      nombre: '',
      precio: 0,
      gigabyte: 0,
      llamadas: '',
      mensajes: '',
      whatsapp: '',
      roaming: '',
      beneficios: ''
    },
    
    // Precio final con descuento
    precioFinal: precioFinal,
    precioBase: precioBase,
    descuento: descuento,
    
    // Promoción
    promocion: data.promocion ? {
      id: data.promocion.promocion_id,
      nombre: data.promocion.nombre,
      beneficios: data.promocion.beneficios,
      descuento: data.promocion.descuento,
    } : undefined,
    
    // Estados
    estadoVentaActual: data.estado_actual?.estado as SaleStatus,
    estadoCorreoActual: data.correo_estado?.estado as LogisticStatus,
    
    // Correo
    correo: data.correo ? {
      sapId: data.correo.sap_id,
      destinatario: data.correo.destinatario,
      personaAutorizada: (data.correo as any).persona_autorizada || null,
      telefonoContacto: data.correo.telefono_contacto,
      telefonoAlternativo: data.correo.telefono_alternativo || null,
      direccion: data.correo.direccion,
      numeroCasa: data.correo.numero_casa,
      piso: data.correo.piso || null,
      departamentoNumero: data.correo.departamento_numero || null,
      entreCalles: data.correo.entre_calles || null,
      barrio: data.correo.barrio || null,
      localidad: data.correo.localidad,
      departamento: data.correo.departamento,
      codigoPostal: data.correo.codigo_postal,
      geolocalizacion: data.correo.geolocalizacion || null,
      comentarioCartero: data.correo.comentario_cartero || null,
      fechaLimite: data.correo.fecha_limite,
    } : undefined,
    
    // Portabilidad
    portabilidad: data.portabilidad ? {
      numeroPortar: data.portabilidad.numero_portar,
      empresaOrigen: data.portabilidad.operador_origen_nombre,
      mercadoOrigen: data.portabilidad.mercado_origen,
      spn: (data.portabilidad as any).spn || '',
      pin: (data.portabilidad as any).pin || null,
      fechaPortacion: (data.portabilidad as any).fecha_portacion || null,
    } : undefined,
    
    // Historiales
    historialEstadosVenta: (data.historial_estados || []).map(h => ({
      estado: h.estado as SaleStatus,
      descripcion: h.descripcion || '',
      fecha: h.fecha_creacion,
      usuario: h.usuario_id || 'Sistema'
    })),
    
    historialEstadosCorreo: (data.historial_correo || []).map(h => ({
      estado: h.estado as LogisticStatus,
      descripcion: h.descripcion || '',
      fecha: h.fecha_creacion,
      usuario: 'Sistema',
      ubicacionActual: h.ubicacion_actual || null
    })),
    
    // Comentarios
    comentarios: (data.comentarios || []).map(c => ({
      id: c.comentario_id,
      titulo: c.titulo,
      comentario: c.comentario,
      tipo: (c.tipo as any) || 'GENERAL',
      fecha: c.fecha,
      autor: {
        nombre: c.author || 'Sistema',
        apellido: '',
        legajo: '',
        rol: ''
      }
    })),
    
    // Prioridad
    priority: 'MEDIA'
  };
};



// Helper para colores de estado
const getStatusColor = (status: string) => {
  const s = status?.toUpperCase() || '';
  if (s.includes('EXITOSO') || s.includes('COMPLETADO') || s.includes('ENTREGADO') || s.includes('ACTIVA') || s.includes('ACTIVADO')) 
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30';
  if (s.includes('RECHAZADO') || s.includes('CANCELADO') || s.includes('ANULADO') || s.includes('ERROR')) 
    return 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-500/30';
  if (s.includes('PROCESO') || s.includes('PENDIENTE') || s.includes('TRANS')) 
    return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30';
  return 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/30';
};

// Componente de campo editable memorizado
const EditableField = memo(({ 
  label, 
  value, 
  field, 
  type = 'text', 
  options,
  readonly = false,
  isEditing = false,
  onEdit
}: { 
  label: string; 
  value: string | number | null; 
  field: string; 
  type?: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  readonly?: boolean;
  isEditing?: boolean;
  onEdit: (field: string, value: any) => void;
}) => {
  const formatearFecha = (valor: string): string => {
    if (!valor || typeof valor !== 'string') return valor;
    if (valor.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const fecha = new Date(valor);
        if (!isNaN(fecha.getTime())) {
          return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        }
      } catch { return valor; }
    }
    return valor;
  };

  const displayValue = (val: any) => {
    if (val === null || val === undefined) return 'S/D';
    if (typeof val === 'object') return 'S/D';
    const strValue = String(val).trim();
    if (!strValue) return 'S/D';
    return formatearFecha(strValue);
  };
  
  if (!isEditing || readonly) {
    return (
      <div className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm rounded-[2.5vh] px-[2.8vh] py-[2vh] hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500">
        <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-[0.6vh] text-[clamp(0.55rem,0.9vh,1rem)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {label}
        </label>
        <div className="font-extrabold text-slate-800 dark:text-white text-[clamp(0.8rem,1.4vh,1.6rem)] tracking-tight">
          {displayValue(value)}
        </div>
      </div>
    );
  }

  if (type === 'select' && options) {
    return (
      <div className="flex flex-col gap-[0.5vh]">
        <label className="font-black text-slate-500 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">
          {label}
        </label>
        <select
          value={value as string || ''}
          onChange={(e) => onEdit(field, e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-[2vh] px-[2.5vh] py-[1.8vh] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all bg-white dark:bg-slate-800 text-[clamp(0.8rem,1.3vh,1.5rem)]"
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[0.5vh]">
      <label className="font-black text-slate-500 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">
        {label}
      </label>
      <input
        type={type}
        value={value as string || ''}
        onChange={(e) => onEdit(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-[2vh] px-[2.5vh] py-[1.8vh] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all bg-white dark:bg-slate-800 text-[clamp(0.8rem,1.3vh,1.5rem)]"
      />
    </div>
  );
});

// Componente de encabezado de sección
const SectionHeader = memo(({ title, icon }: { title: string; icon: string }) => (
  <div className="flex items-center gap-[2vh] mb-[3vh] mt-[5vh] first:mt-0 px-2">
    <div className="w-[5vh] h-[5vh] rounded-[1.8vh] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[2.2vh] shadow-inner text-indigo-600 dark:text-indigo-400">
      {icon}
    </div>
    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.15em] text-[clamp(0.8rem,1.5vh,1.8rem)]">{title}</h4>
    <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent ml-[2vh]"></div>
  </div>
));

// Note: ErrorBoundary removed temporarily due to React 19 / TS compatibility issues in this environment.

// Tab: Información General
const TabVenta = memo(({ editedData, isEditing, onEdit }: { 
  editedData: SaleDetail | null, 
  isEditing: boolean, 
  onEdit: (f: string, v: any) => void 
}) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div>
      <SectionHeader title="Datos de la Venta" icon="📋" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="ID Venta" value={editedData?.id || ''} field="id" readonly />
        <EditableField label="SAP" value={editedData?.sap || ''} field="sap" isEditing={isEditing} onEdit={onEdit} />
        <EditableField label="SDS" value={editedData?.sds || ''} field="sds" isEditing={isEditing} onEdit={onEdit} />
        <EditableField label="STL" value={editedData?.stl || ''} field="stl" isEditing={isEditing} onEdit={onEdit} />
        
        <div className="flex flex-col gap-[0.5vh]">
          <label className="font-black text-slate-500 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">Tipo de Chip</label>
          <div className="flex gap-[1vh]">
            {['SIM', 'ESIM'].map(chip => (
              <button
                key={chip}
                onClick={() => isEditing && onEdit('chip', chip)}
                disabled={!isEditing}
                className={`flex-1 py-[1.8vh] rounded-[1.5vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.65rem,1vh,1.2rem)] ${
                  editedData?.chip === chip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[0.5vh]">
          <label className="font-black text-slate-500 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">Tipo de Venta</label>
          <div className="flex gap-[1.2vh]">
            {['PORTABILIDAD', 'LINEA_NUEVA'].map(tipo => (
              <button
                key={tipo}
                onClick={() => isEditing && onEdit('tipoVenta', tipo)}
                disabled={!isEditing}
                className={`flex-1 py-[1.8vh] rounded-[1.5vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.65rem,1vh,1.2rem)] ${
                  editedData?.tipoVenta === tipo ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {tipo === 'PORTABILIDAD' ? 'PORTA' : 'LINEA N'}
              </button>
            ))}
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm rounded-[2.5vh] px-[2.8vh] py-[2vh]">
          <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-[0.6vh] text-[clamp(0.55rem,0.9vh,1rem)]">Fecha Creación</label>
          <div className="font-extrabold text-slate-800 dark:text-white text-[clamp(0.8rem,1.4vh,1.6rem)] tracking-tight">
            {editedData?.fechaCreacion ? new Date(editedData.fechaCreacion).toLocaleDateString('es-AR') : 'S/D'}
          </div>
        </div>
        <EditableField 
          label="Prioridad" value={editedData?.priority || 'MEDIA'} field="priority" type="select"
          options={[{ value: 'ALTA', label: 'ALTA' }, { value: 'MEDIA', label: 'MEDIA' }, { value: 'BAJA', label: 'BAJA' }]}
          isEditing={isEditing} onEdit={onEdit}
        />
      </div>
    </div>

    <div>
      <SectionHeader title="Vendedor" icon="👨‍💼" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="Nombre" value={editedData?.vendedor?.nombre || ''} field="vendedor.nombre" readonly />
        <EditableField label="Apellido" value={editedData?.vendedor?.apellido || ''} field="vendedor.apellido" readonly />
        <EditableField label="Legajo" value={editedData?.vendedor?.legajo || ''} field="vendedor.legajo" readonly />
        <EditableField label="EXA" value={editedData?.vendedor?.exa || ''} field="vendedor.exa" readonly />
      </div>
    </div>

    <div>
      <SectionHeader title="Supervisor" icon="👔" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="Nombre Completitud" value={`${editedData?.supervisor?.nombre || ''} ${editedData?.supervisor?.apellido || ''}`} field="supervisor.nombre" readonly />
        <EditableField label="Legajo" value={editedData?.supervisor?.legajo || ''} field="supervisor.legajo" readonly />
        <EditableField label="Email" value={editedData?.supervisor?.email || ''} field="supervisor.email" readonly />
      </div>
    </div>
  </div>
));

// Tab: Ficha del Cliente
const TabCliente = memo(({ editedData }: { editedData: SaleDetail | null }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Información del Cliente" icon="👤" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <EditableField label="Nombre" value={editedData?.cliente?.nombre || ''} field="cliente.nombre" readonly />
      <EditableField label="Apellido" value={editedData?.cliente?.apellido || ''} field="cliente.apellido" readonly />
      <EditableField label="DNI/CUIT" value={editedData?.cliente?.documento || ''} field="cliente.documento" readonly />
      <EditableField label="Email" value={editedData?.cliente?.email || ''} field="cliente.email" readonly />
      <EditableField label="Teléfono" value={editedData?.cliente?.telefono || ''} field="cliente.telefono" readonly />
      <EditableField label="Género" value={editedData?.cliente?.genero || ''} field="cliente.genero" readonly />
      <EditableField label="F. Nacimiento" value={editedData?.cliente?.fechaNacimiento || ''} field="cliente.fechaNacimiento" readonly />
      <EditableField label="Nacionalidad" value={editedData?.cliente?.nacionalidad || ''} field="cliente.nacionalidad" readonly />
    </div>
  </div>
));



// Tab: Plan & Servicios
const TabPlan = memo(({ editedData, isEditing, onEdit }: { 
  editedData: SaleDetail | null, 
  isEditing: boolean, 
  onEdit: (f: string, v: any) => void 
}) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div>
      <SectionHeader title="Plan Contratado" icon="📱" />
      <div className="bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-transparent dark:from-indigo-500/10 dark:via-purple-500/10 border border-white dark:border-white/5 rounded-[4vh] p-[5vh] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-indigo-100 dark:text-indigo-400 opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/></svg>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-[4vh] relative z-10">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-[clamp(1.5rem,3.5vh,4rem)] leading-tight">{editedData?.plan?.nombre ?? 'Plan Desconocido'}</h3>
            <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-widest uppercase text-[clamp(0.6rem,1.1vh,1.3rem)] mt-2">Cobertura Nacional 5G</p>
          </div>
          <div className="flex flex-col items-end">
            {editedData?.descuento && editedData.descuento > 0 ? (
              <>
                <span className="font-black text-slate-400 dark:text-slate-500 line-through text-xl">
                  ${(editedData?.precioBase ?? 0).toLocaleString()}
                </span>
                <span className="font-black text-green-600 dark:text-green-400 text-[clamp(2.5rem,5.5vh,6rem)] leading-none tracking-tighter">
                  ${(editedData?.precioFinal ?? 0).toLocaleString()}
                </span>
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold mt-1">
                  {editedData.descuento}% OFF
                </span>
              </>
            ) : (
              <span className="font-black text-slate-900 dark:text-white text-[clamp(2.5rem,5.5vh,6rem)] leading-none tracking-tighter">
                ${(editedData?.plan?.precio ?? 0).toLocaleString()}
              </span>
            )}
            <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[clamp(0.7rem,1.2vh,1.4rem)] mt-2">Final por Mes</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2vh] mb-[4vh] relative z-10">
          {[
            { val: editedData?.plan?.gigabyte, label: 'GB Datos', unit: 'GB' },
            { val: editedData?.plan?.llamadas, label: 'Llamadas' },
            { val: editedData?.plan?.mensajes, label: 'SMS' },
            { val: editedData?.plan?.whatsapp, label: 'WhatsApp' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[3vh] p-[3vh] text-center border border-white/80 dark:border-white/5 shadow-sm hover:shadow-indigo-100 dark:hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all duration-500">
              <div className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(1.8rem,3.5vh,4rem)] leading-none mb-2">
                {item.val ?? '???'}
              </div>
              <div className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.55rem,0.9vh,1.1rem)]">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {editedData?.plan?.beneficios && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2.5vh] p-6 border border-white/60 dark:border-white/5 relative z-10">
            <div className="text-[clamp(0.6rem,1vh,1.2rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="text-indigo-400">✦</span> Beneficios Adicionales
            </div>
            <div className="text-[clamp(0.85rem,1.4vh,1.8rem)] font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{editedData.plan.beneficios}"
            </div>
          </div>
        )}
      </div>
    </div>

    {editedData?.portabilidad && (
      <div>
        <SectionHeader title="Datos de Portabilidad" icon="🔄" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <EditableField label="N° a Portar" value={editedData?.portabilidad?.numeroPortar} field="portabilidad.numeroPortar" isEditing={isEditing} onEdit={onEdit} />
          <EditableField 
            label="Empresa Origen" value={editedData?.portabilidad?.empresaOrigen} field="portabilidad.empresaOrigen" type="select"
            options={EMPRESAS_ORIGEN_MOCK.map(e => ({ value: e.nombre, label: e.nombre }))}
            isEditing={isEditing} onEdit={onEdit}
          />
          <EditableField 
            label="Mercado Origen" value={editedData?.portabilidad?.mercadoOrigen} field="portabilidad.mercadoOrigen" type="select"
            options={[{ value: 'Prepago', label: 'Prepago' }, { value: 'Pospago', label: 'Pospago' }]}
            isEditing={isEditing} onEdit={onEdit}
          />
        </div>
      </div>
    )}
  </div>
));

// Tab: Logística & Entrega
const TabCorreo = memo(({ editedData, isEditing, onEdit, onUpdateLogistic }: { 
  editedData: SaleDetail | null, 
  isEditing: boolean, 
  onEdit: (f: string, v: any) => void,
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>
}) => {
  const [showLogisticForm, setShowLogisticForm] = useState(false);
  const [newLogistic, setNewLogistic] = useState<LogisticStatus | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogisticSubmit = async () => {
    console.log('handleLogisticSubmit called', { newLogistic, hasOnUpdate: !!onUpdateLogistic });
    if (!newLogistic || !onUpdateLogistic) return;
    setIsSubmitting(true);
    try {
      await onUpdateLogistic(newLogistic as LogisticStatus, comment);
      setShowLogisticForm(false);
      setNewLogistic('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <SectionHeader title="Información de Envío" icon="📮" />
        {!showLogisticForm && (
          <button 
            onClick={() => setShowLogisticForm(true)}
            className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl font-black uppercase text-xs transition-all border border-indigo-600/20"
          >
            🔄 Actualizar Estado
          </button>
        )}
      </div>

      {showLogisticForm && (
        <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl border-2 border-indigo-500/30 space-y-4 animate-in slide-in-from-top-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Nuevo Estado Logístico</label>
              <select 
                value={newLogistic}
                onChange={(e) => setNewLogistic(e.target.value as LogisticStatus)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar estado...</option>
                {Object.values(LogisticStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Comentario</label>
              <input 
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escriba un comentario..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setShowLogisticForm(false)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all text-slate-500"
            >
              Cancelar
            </button>
            <button 
              onClick={handleLogisticSubmit}
              disabled={!newLogistic || isSubmitting}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
            </button>
          </div>
        </div>
      )}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <EditableField label="Destinatario" value={editedData?.correo?.destinatario || ''} field="correo.destinatario" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Persona Autorizada" value={editedData?.correo?.personaAutorizada || ''} field="correo.personaAutorizada" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Teléfono Contacto" value={editedData?.correo?.telefonoContacto || ''} field="correo.telefonoContacto" isEditing={isEditing} onEdit={onEdit} />
    </div>

    <SectionHeader title="Dirección de Entrega" icon="📍" />
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <EditableField label="Calle" value={editedData?.correo?.direccion || ''} field="correo.direccion" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Número" value={editedData?.correo?.numeroCasa || ''} field="correo.numeroCasa" type="number" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Localidad" value={editedData?.correo?.localidad || ''} field="correo.localidad" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Provincia" value={editedData?.correo?.departamento || ''} field="correo.departamento" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="C.P." value={editedData?.correo?.codigoPostal || ''} field="correo.codigoPostal" type="number" isEditing={isEditing} onEdit={onEdit} />
    </div>
    </div>
  );
});

// Tab: Trazabilidad & Estados
const TabEstados = memo(({ 
  editedData, 
  onUpdateStatus, 
  onUpdateLogistic 
}: { 
  editedData: SaleDetail | null,
  onUpdateStatus?: (status: SaleStatus, comment: string) => Promise<void>,
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>
}) => {
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showLogisticForm, setShowLogisticForm] = useState(false);
  const [newStatus, setNewStatus] = useState<SaleStatus | ''>('');
  const [newLogistic, setNewLogistic] = useState<LogisticStatus | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSubmit = async () => {
    console.log('handleStatusSubmit called', { newStatus, hasOnUpdate: !!onUpdateStatus });
    if (!newStatus || !onUpdateStatus) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(newStatus as SaleStatus, comment);
      setShowStatusForm(false);
      setNewStatus('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogisticSubmit = async () => {
    if (!newLogistic || !onUpdateLogistic) return;
    setIsSubmitting(true);
    try {
      await onUpdateLogistic(newLogistic as LogisticStatus, comment);
      setShowLogisticForm(false);
      setNewLogistic('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-[6vh] animate-in fade-in duration-500 pb-[10vh]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[3vh]">
        {/* Card Operativa */}
        <div className={`relative overflow-hidden p-[4vh] rounded-[4vh] border-2 shadow-xl transition-all duration-500 ${getStatusColor(editedData?.estadoVentaActual ?? SaleStatus.INICIAL)}`}>
          <div className="absolute -right-[2vh] -top-[2vh] text-[12vh] opacity-10 rotate-12 pointer-events-none">📈</div>
          <div className="relative z-10">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-current animate-pulse"></span>
              <span className="font-black uppercase tracking-[0.2em] opacity-70 text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado Operativo</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h4 className="font-black uppercase tracking-tight text-[clamp(2.2rem,4.5vh,5.5rem)] leading-none truncate">{editedData?.estadoVentaActual ?? 'S/D'}</h4>
              {!showStatusForm && (
                <button 
                  onClick={() => { setShowStatusForm(true); setShowLogisticForm(false); }}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 dark:hover:text-white rounded-xl font-black uppercase text-xs transition-all border border-indigo-600/30 self-start sm:self-center"
                >
                  🔄 Actualizar
                </button>
              )}
            </div>

            {showStatusForm && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-white/20 rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Nuevo Estado</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as SaleStatus)}
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleccionar estado...</option>
                    {Object.values(SaleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Comentario / Descripción</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escriba el motivo del cambio..."
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleStatusSubmit}
                    disabled={!newStatus || isSubmitting}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-black uppercase text-xs hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
                  </button>
                  <button 
                    onClick={() => setShowStatusForm(false)}
                    className="px-6 bg-slate-200 dark:bg-slate-800 rounded-xl py-3 font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Logística */}
        <div className={`relative overflow-hidden p-[4vh] rounded-[4vh] border-2 shadow-xl transition-all duration-500 ${editedData?.estadoCorreoActual ? getStatusColor(editedData.estadoCorreoActual) : 'bg-slate-100/40 text-slate-400 border-slate-200/50'}`}>
          <div className="absolute -right-[2vh] -top-[2vh] text-[12vh] opacity-10 rotate-12 pointer-events-none">📦</div>
          <div className="relative z-10">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-current opacity-50"></span>
              <span className="font-black uppercase tracking-[0.2em] opacity-70 text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado Logístico</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h4 className="font-black uppercase tracking-tight text-[clamp(2.2rem,3.5vh,4.5rem)] leading-none truncate">{editedData?.estadoCorreoActual ?? 'Sin Asignar'}</h4>
              {!showLogisticForm && (
                <button 
                  onClick={() => { setShowLogisticForm(true); setShowStatusForm(false); }}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 dark:hover:text-white rounded-xl font-black uppercase text-xs transition-all border border-indigo-600/30 self-start sm:self-center"
                >
                  🔄 Actualizar
                </button>
              )}
            </div>

            {showLogisticForm && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-white/20 rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Nuevo Estado Logístico</label>
                  <select 
                    value={newLogistic}
                    onChange={(e) => setNewLogistic(e.target.value as LogisticStatus)}
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleccionar estado...</option>
                    {Object.values(LogisticStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Comentario / Detalle</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Detalles sobre la entrega o incidencia..."
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleLogisticSubmit}
                    disabled={!newLogistic || isSubmitting}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-black uppercase text-xs hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
                  </button>
                  <button 
                    onClick={() => setShowLogisticForm(false)}
                    className="px-6 bg-slate-200 dark:bg-slate-800 rounded-xl py-3 font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[6vh]">
        <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[4.5vh] p-[4vh] border border-white/40 dark:border-white/10 shadow-sm relative">
          <SectionHeader title="Historial Operativo" icon="📉" />
          <div className="space-y-4 mt-[4vh]">
            {(editedData?.historialEstadosVenta ?? []).map((estado, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-[2.5vh] p-[2.5vh] shadow-sm">
                <div className="flex items-center justify-between mb-[1.5vh]">
                  <span className="font-black uppercase tracking-widest text-[clamp(0.75rem,1.2vh,1.5rem)] text-slate-900 dark:text-white">{estado.estado}</span>
                  <span className="font-bold text-slate-400 text-[clamp(0.55rem,0.9vh,1.1rem)]">{new Date(estado.fecha).toLocaleDateString('es-AR')}</span>
                </div>
                <p className="text-[clamp(0.75rem,1.2vh,1.5rem)] font-medium text-slate-500 italic">"{estado.descripcion || 'Sin descripción'}"</p>
                <div className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">VIA: {estado.usuario}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[4.5vh] p-[4vh] border border-white/40 dark:border-white/10 shadow-sm relative">
          <SectionHeader title="Historial Logístico" icon="🚚" />
          <div className="space-y-4 mt-[4vh]">
            {(editedData?.historialEstadosCorreo ?? []).map((estado, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-[2.5vh] p-[2.5vh] shadow-sm">
                <div className="flex items-center justify-between mb-[1.5vh]">
                  <span className="font-black uppercase tracking-widest text-[clamp(0.75rem,1.2vh,1.5rem)] text-slate-900 dark:text-white">{estado.estado}</span>
                  <span className="font-bold text-slate-400 text-[clamp(0.55rem,0.9vh,1.1rem)]">{new Date(estado.fecha).toLocaleDateString('es-AR')}</span>
                </div>
                <p className="text-[clamp(0.75rem,1.2vh,1.5rem)] font-medium text-slate-500 italic">"{estado.descripcion || 'Sin descripción'}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Componente Principal
export const SaleModal = ({ sale, onClose, onUpdate, onUpdateStatus, onUpdateLogistic }: SaleModalProps) => {
  const { ventaDetalle, isLoading: isLoadingDetalle, isError } = useVentaDetalle(sale?.id.replace('V-', ''));
  const [activeTab, setActiveTab] = useState<TabType>('venta');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<SaleDetail | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    if (ventaDetalle) {
      setEditedData(mapBackendToSaleDetail(ventaDetalle));
    }
  }, [ventaDetalle]);

  const handleEdit = (field: string, value: any) => {
    if (!editedData) return;
    const newData = { ...editedData };
    const fieldParts = field.split('.');
    
    if (fieldParts.length === 1) {
      (newData as any)[field] = value;
    } else {
      let current: any = newData;
      for (let i = 0; i < fieldParts.length - 1; i++) {
        current = current[fieldParts[i]];
      }
      current[fieldParts[fieldParts.length - 1]] = value;
    }
    
    setEditedData(newData);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editedData) return;
    try {
      await onUpdate(editedData);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const renderTabButton = (id: TabType, icon: string, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-[1.5vh] px-[3vh] py-[1.8vh] rounded-[2vh] transition-all duration-500 whitespace-nowrap ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' 
          : 'bg-white dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      <span className="text-[2vh]">{icon}</span>
      <span className="font-black uppercase tracking-widest text-[clamp(0.6rem,1.1vh,1.3rem)]">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-[2vw] bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-[95vw] h-[92vh] bg-[#f8fafc] dark:bg-slate-900 rounded-2xl lg:rounded-[2vh] shadow-2xl flex flex-col overflow-hidden border border-white/20 relative group/modal">
        <React.Fragment>
          {isLoadingDetalle || !editedData ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 gap-[3vh]">
              <div className="w-[8vh] h-[8vh] border-[0.6vh] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">Cargando Expediente...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 backdrop-blur-sm">
                    📂
                  </div>
                  <div>
                    <h3 className="font-black text-2xl uppercase italic leading-none tracking-tighter">VENTA {editedData.id}</h3>
                    <p className="text-xs font-bold uppercase opacity-80 mt-1 tracking-widest">{editedData.cliente.nombre} {editedData.cliente.apellido} | DNI: {editedData.cliente.documento}</p>
                  </div>
                </div>
                <button onClick={onClose} className="relative z-10 p-2 bg-white/10 hover:bg-rose-500 rounded-xl transition-all border border-white/10 hover:border-white/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Navigation */}
              <div className="px-10 py-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-slate-200/50 flex gap-4 overflow-x-auto shrink-0 scrollbar-hide">
                {renderTabButton('venta', '📋', 'Información General')}
                {renderTabButton('cliente', '👤', 'Cliente')}
                {renderTabButton('plan', '📱', 'Plan')}
                {editedData.chip !== 'ESIM' && renderTabButton('correo', '📮', 'Logística')}
                {renderTabButton('estados', '📊', 'Estados')}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-white/50 dark:bg-slate-900/50 no-scrollbar pb-24">
                {activeTab === 'venta' && <TabVenta editedData={editedData} isEditing={isEditing} onEdit={handleEdit} />}
                {activeTab === 'cliente' && <TabCliente editedData={editedData} />}
                {activeTab === 'plan' && <TabPlan editedData={editedData} isEditing={isEditing} onEdit={handleEdit} />}
                {activeTab === 'correo' && <TabCorreo editedData={editedData} isEditing={isEditing} onEdit={handleEdit} onUpdateLogistic={onUpdateLogistic} />}
                {activeTab === 'estados' && (
                  <TabEstados 
                    editedData={editedData} 
                    onUpdateStatus={onUpdateStatus}
                    onUpdateLogistic={onUpdateLogistic}
                  />
                )}
              </div>

              {/* Floating Action Buttons */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave} 
                      disabled={!hasChanges}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${hasChanges ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                      title="Guardar Cambios"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); setHasChanges(false); setEditedData(ventaDetalle ? mapBackendToSaleDetail(ventaDetalle) : null); }} 
                      className="w-14 h-14 bg-white dark:bg-slate-800 text-rose-500 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-50 dark:hover:bg-slate-700 transition-all hover:scale-110"
                      title="Cancelar Edición"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-110 hover:rotate-90"
                    title="Editar Venta"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                )}
              </div>
            </>
          )}
        </React.Fragment>
      </div>
    </div>
  );
};



