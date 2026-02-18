import React, { useState, memo, useMemo } from 'react';
import { SaleDetail, SaleStatus, LogisticStatus, Genero, TipoDocumento, Sale } from '../../types';
import { useVentaDetalle } from '../../hooks/useVentaDetalle';
import { getClienteById } from '../../services/clientes';
import { VentaDetalleCompletoResponse } from '../../services/ventas';
import { SUPERVISORES_MOCK } from '../../mocks/supervisores';
import { EMPRESAS_ORIGEN_MOCK } from '../../mocks/empresasOrigen';



// Internal components
import { TabVenta } from './tabs/TabVenta';
import { TabCliente } from './tabs/TabCliente';
import { TabPlan } from './tabs/TabPlan';
import { TabCorreo } from './tabs/TabCorreo';
import { TabEstados } from './tabs/TabEstados';
import { getStatusColor } from './SaleModalHelpers';

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



