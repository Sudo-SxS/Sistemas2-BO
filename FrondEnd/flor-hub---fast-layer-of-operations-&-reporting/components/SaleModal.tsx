import React, { useState } from 'react';
import { SaleDetail, SaleStatus, LogisticStatus, Genero, TipoDocumento } from '../types';
import { useVentaDetalle } from '../hooks/useVentaDetalle';
import { getClienteById } from '../services/clientes';
import { VentaDetalleCompletoResponse } from '../services/ventas';
import { SUPERVISORES_MOCK } from '../mocks/supervisores';
import { EMPRESAS_ORIGEN_MOCK } from '../mocks/empresasOrigen';

// Función para mapear datos del backend al formato del componente
const mapBackendToSaleDetail = (data: VentaDetalleCompletoResponse) => {
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
    chip: data.venta.chip,
    tipoVenta: data.venta.tipo_venta,
    fechaCreacion: data.venta.fecha_creacion,
    prioridad: 'MEDIA',
    
    // Cliente
    cliente: data.cliente ? {
      nombre: data.cliente.nombre,
      apellido: data.cliente.apellido,
      documento: data.cliente.documento,
      email: data.cliente.email,
      telefono: data.cliente.telefono,
      tipoDocumento: data.cliente.tipoDocumento || 'DNI',
      genero: data.cliente.genero || 'MASCULINO',
      fechaNacimiento: data.cliente.fechaNacimiento,
      nacionalidad: data.cliente.nacionalidad || 'Argentina',
    } : null,
    
    // Vendedor
    vendedor: data.vendedor ? {
      nombre: data.vendedor.nombre,
      apellido: data.vendedor.apellido,
      email: data.vendedor.email,
      telefono: data.vendedor.telefono,
      legajo: data.vendedor.legajo,
      exa: data.vendedor.exa,
      celula: data.vendedor.celula,
    } : null,
    
    // Supervisor
    supervisor: data.supervisor ? {
      id: data.supervisor.id,
      nombre: data.supervisor.nombre,
      apellido: data.supervisor.apellido,
      legajo: data.supervisor.legajo,
      email: data.supervisor.email,
    } : null,
    
    // Plan
    plan: data.plan ? {
      nombre: data.plan.nombre,
      precio: data.plan.precio,
      gigabyte: data.plan.gigabyte || '0',
      llamadas: data.plan.llamadas || '0',
      mensajes: data.plan.mensajes || '0',
      whatsapp: data.plan.whatsapp || 'Ilimitado',
      beneficios: data.plan.descripcion || '',
    } : null,
    
    // Precio final con descuento
    precioFinal: precioFinal,
    precioBase: precioBase,
    descuento: descuento,
    
    // Promoción
    promocion: data.promocion ? {
      nombre: data.promocion.nombre,
      beneficios: data.promocion.beneficios,
      descuento: data.promocion.descuento,
    } : null,
    
    // Empresa origen
    empresa_origen: data.empresa_origen?.nombre,
    
    // Estados
    estadoVentaActual: data.estado_actual?.estado,
    estadoCorreoActual: data.correo_estado?.estado,
    
    // Historial
    historialEstadosVenta: data.historial_estados?.map(e => ({
      estado: e.estado,
      descripcion: e.descripcion,
      fecha: e.fecha_creacion,
    })) || [],
    
    historialEstadosCorreo: data.historial_correo?.map(e => ({
      estado: e.estado,
      descripcion: e.descripcion,
      ubicacionActual: e.ubicacion_actual,
      fecha: e.fecha_creacion,
    })) || [],
    
    // Correo
    correo: data.correo ? {
      sapId: data.correo.sap_id,
      destinatario: data.correo.destinatario,
      telefonoContacto: data.correo.telefono_contacto,
      telefonoAlternativo: data.correo.telefono_alternativo,
      direccion: data.correo.direccion,
      numeroCasa: data.correo.numero_casa,
      piso: data.correo.piso,
      departamentoNumero: data.correo.departamento_numero,
      entreCalles: data.correo.entre_calles,
      barrio: data.correo.barrio,
      localidad: data.correo.localidad,
      departamento: data.correo.departamento,
      codigoPostal: data.correo.codigo_postal,
      geolocalizacion: data.correo.geolocalizacion,
      comentarioCartero: data.correo.comentario_cartero,
      fechaLimite: data.correo.fecha_limite,
    } : null,
    
    // Portabilidad
    portabilidad: data.portabilidad ? {
      numeroPortar: data.portabilidad.numero_portar,
      operadorOrigen: data.portabilidad.operador_origen_nombre,
      mercadoOrigen: data.portabilidad.mercado_origen,
      spn: data.portabilidad.spn,
      pin: data.portabilidad.pin,
      fechaPortacion: data.portabilidad.fecha_portacion,
    } : null,
    
    // Línea nueva
    lineaNueva: data.linea_nueva ? {
      estado: data.linea_nueva.estado,
      numeroAsignado: data.linea_nueva.numero_asignado,
    } : null,
  };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Componente ErrorBoundary local para capturar fallos en el modal sin tumbar la App
class SaleModalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-[6vh] text-center gap-[4vh] min-h-[50vh] rounded-[4vh] border border-slate-200 dark:border-white/5 shadow-inner">
          <div className="text-[10vh] animate-bounce drop-shadow-2xl">⚠️</div>
          <div className="space-y-[1.5vh]">
            <h2 className="text-[clamp(1.5rem,3vh,4rem)] font-black text-slate-800 dark:text-white uppercase tracking-tighter">Error de Sincronización</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto text-[clamp(0.8rem,1.3vh,1.5rem)] leading-relaxed">
              Hubo un problema al procesar los datos de este expediente. Es posible que la conexión se haya interrumpido.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-[6vh] py-[2.2vh] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[2.5vh] font-black uppercase text-[clamp(0.65rem,1vh,1.2rem)] tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
          >
            Reiniciar Interfaz
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface SaleModalProps {
  sale: any; // Soporta tanto tipo Sale como SaleDetail
  onClose: () => void;
  onUpdate?: (updatedSale: SaleDetail) => void;
}

type TabType = 'venta' | 'cliente' | 'plan' | 'correo' | 'estados';

export const SaleModal: React.FC<SaleModalProps> = ({ sale, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('venta');
  const [isEditing, setIsEditing] = useState(false);
  
  // Obtener detalles completos de la venta con cacheo inteligente
  const { ventaDetalle, isLoading: isLoadingDetalle, isError } = useVentaDetalle(
    String(sale.id).startsWith('INS-') ? sale.id : parseInt(String(sale.id).replace('V-', ''))
  );

  const [editedData, setEditedData] = useState<SaleDetail | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [clienteCompleto, setClienteCompleto] = useState<any>(null);

  // Sincronizar datos editados cuando cargan los detalles
  React.useEffect(() => {
    if (ventaDetalle && !editedData) {
      setEditedData(mapBackendToSaleDetail(ventaDetalle));
    }
  }, [ventaDetalle, editedData]);
  
  React.useEffect(() => {
    if (sale.dni && !String(sale.id).startsWith('INS-')) {
      getClienteById(sale.dni)
        .then(setClienteCompleto)
        .catch(err => console.warn('CORS or Network error fetching client:', err));
    }
  }, [sale.dni, sale.id]);

  const handleEdit = (field: string, value: any) => {
    setEditedData(prev => {
      if (!prev) return null;
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const newData = { ...prev };
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!current[key]) {
            current[key] = {};
          }
          current[key] = { ...current[key] };
          current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      }
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedData);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  const getStatusColor = (status: SaleStatus | LogisticStatus) => {
    const successStates = [SaleStatus.ACTIVADO, LogisticStatus.ENTREGADO, LogisticStatus.RENDIDO_AL_CLIENTE];
    const warningStates = [LogisticStatus.EN_TRANSITO, LogisticStatus.ASIGNADO, SaleStatus.EN_PROCESO, SaleStatus.APROBADO];
    const errorStates = [SaleStatus.CANCELADO, SaleStatus.RECHAZADO, LogisticStatus.NO_ENTREGADO, LogisticStatus.PIEZA_EXTRAVIADA];
    
    if (successStates.includes(status as any)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (warningStates.includes(status as any)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (errorStates.includes(status as any)) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  };

  const renderTabButton = (tab: TabType, icon: string, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative px-[3.5vh] py-[1.8vh] rounded-[2.5vh] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-[1.8vh] text-[clamp(0.65rem,1.1vh,1.3rem)] group overflow-hidden ${
        activeTab === tab
          ? 'text-white scale-105'
          : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
      }`}
    >
      {activeTab === tab && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[0_10px_30px_rgba(79,70,229,0.3)] animate-in fade-in zoom-in-95 duration-500"></div>
      )}
      <span className={`relative z-10 transition-transform duration-500 group-hover:scale-125 ${activeTab === tab ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
    </button>
  );

  const EditableField = ({ 
    label, 
    value, 
    field, 
    type = 'text', 
    options,
    readonly = false 
  }: { 
    label: string; 
    value: string | number | null; 
    field: string; 
    type?: 'text' | 'select' | 'date' | 'number';
    options?: { value: string; label: string }[];
    readonly?: boolean;
  }) => {
    // Función para formatear fechas ISO a dd/mm/aa
    const formatearFecha = (valor: string): string => {
      if (!valor || typeof valor !== 'string') return valor;
      if (valor.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          const fecha = new Date(valor);
          if (!isNaN(fecha.getTime())) {
            return fecha.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            });
          }
        } catch {
          return valor;
        }
      }
      return valor;
    };

    const displayValue = (value: any) => {
      if (value === null || value === undefined) return 'S/D';
      if (typeof value === 'object') return 'S/D';
      const strValue = String(value).trim();
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
            value={value as string}
            onChange={(e) => handleEdit(field, e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-[2vh] px-[2.5vh] py-[1.8vh] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all bg-white dark:bg-slate-800 text-[clamp(0.8rem,1.3vh,1.5rem)]"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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
          onChange={(e) => handleEdit(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-[2vh] px-[2.5vh] py-[1.8vh] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all bg-white dark:bg-slate-800 text-[clamp(0.8rem,1.3vh,1.5rem)]"
        />
      </div>
    );
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <div className="flex items-center gap-[2vh] mb-[3vh] mt-[5vh] first:mt-0 px-2">
      <div className="w-[5vh] h-[5vh] rounded-[1.8vh] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[2.2vh] shadow-inner text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.15em] text-[clamp(0.8rem,1.5vh,1.8rem)]">{title}</h4>
      <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent ml-[2vh]"></div>
    </div>
  );

  const TabVenta = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sección: Datos de la Venta */}
      <div>
        <SectionHeader title="Datos de la Venta" icon="📋" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <EditableField label="ID Venta" value={editedData?.id} field="id" readonly />
          <EditableField label="SAP" value={editedData?.sap} field="sap" />
          <EditableField label="SDS" value={editedData?.sds} field="sds" />
          <EditableField label="STL" value={editedData?.stl} field="stl" />
          
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
              Tipo de Chip
            </label>
            <div className="flex gap-2">
              {['SIM', 'ESIM'].map(chip => (
                <button
                  key={chip}
                  onClick={() => isEditing && handleEdit('chip', chip)}
                  disabled={!isEditing}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    editedData?.chip === chip
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : isEditing 
                        ? 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-500 uppercase tracking-widest mb-[0.8vh] ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">
              Tipo de Venta
            </label>
            <div className="flex gap-[1.2vh]">
              {['PORTABILIDAD', 'LINEA_NUEVA'].map(tipo => (
                <button
                  key={tipo}
                  onClick={() => isEditing && handleEdit('tipoVenta', tipo)}
                  disabled={!isEditing}
                  className={`flex-1 py-[1.8vh] rounded-[1.5vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.65rem,1vh,1.2rem)] ${
                    editedData?.tipoVenta === tipo
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : isEditing
                        ? 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {tipo === 'PORTABILIDAD' ? 'PORTA' : 'LINEA N'}
                </button>
              ))}
            </div>
          </div>

          <div className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm rounded-[2.5vh] px-[2.8vh] py-[2vh] hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500">
            <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-[0.6vh] text-[clamp(0.55rem,0.9vh,1rem)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Fecha Creación
            </label>
            <div className="font-extrabold text-slate-800 dark:text-white text-[clamp(0.8rem,1.4vh,1.6rem)] tracking-tight">
              {editedData?.fechaCreacion ? (
                <>
                  {new Date(editedData.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  <span className="text-indigo-600 ml-2">
                    {new Date(editedData.fechaCreacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : 'S/D'}
            </div>
          </div>
          <EditableField 
            label="Prioridad" 
            value={editedData?.priority} 
            field="priority" 
            type="select"
            options={[
              { value: 'ALTA', label: 'ALTA' },
              { value: 'MEDIA', label: 'MEDIA' },
              { value: 'BAJA', label: 'BAJA' }
            ]}
          />
        </div>
      </div>

      {/* Sección: Datos del Vendedor */}
      <div>
        <SectionHeader title="Datos del Vendedor" icon="👨‍💼" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <EditableField label="Nombre" value={editedData?.vendedor?.nombre} field="vendedor.nombre" />
          <EditableField label="Apellido" value={editedData?.vendedor?.apellido} field="vendedor.apellido" />
          <EditableField label="Legajo" value={editedData?.vendedor?.legajo} field="vendedor.legajo" />
          <EditableField label="EXA" value={editedData?.vendedor?.exa} field="vendedor.exa" />
          <EditableField label="Email" value={editedData?.vendedor?.email} field="vendedor.email" />
          <EditableField label="Teléfono" value={editedData?.vendedor?.telefono} field="vendedor.telefono" />
          <EditableField label="Célula" value={editedData?.vendedor?.celula} field="vendedor.celula" type="number" />
        </div>
      </div>

      {/* Sección: Supervisor Asignado */}
      <div>
        <SectionHeader title="Supervisor Asignado" icon="👔" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isEditing ? (
            <div className="col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
                Supervisor
              </label>
              <select
                value={editedData?.supervisor?.id}
                onChange={(e) => {
                  const sup = SUPERVISORES_MOCK.find(s => s.usuario_id === e.target.value);
                  if (sup) {
                    handleEdit('supervisor', {
                      id: sup.usuario_id,
                      nombre: sup.nombre,
                      apellido: sup.apellido,
                      legajo: sup.legajo,
                      email: sup.email
                    });
                  }
                }}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all bg-white dark:bg-slate-800 [color-scheme:light] dark:[color-scheme:dark]"
              >
                {SUPERVISORES_MOCK.map(sup => (
                  <option key={sup.usuario_id} value={sup.usuario_id}>
                    {sup.nombre} {sup.apellido} ({sup.legajo})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <EditableField label="Nombre" value={`${editedData?.supervisor?.nombre ?? ''} ${editedData?.supervisor?.apellido ?? ''}`.trim() || 'S/D'} field="supervisor" readonly />
              <EditableField label="Legajo" value={editedData?.supervisor?.legajo} field="supervisor.legajo" readonly />
              <EditableField label="Email" value={editedData?.supervisor?.email} field="supervisor.email" readonly />
            </>
          )}
        </div>
      </div>
    </div>
  );

  const TabCliente = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Información Personal" icon="👤" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <EditableField label="Nombre" value={editedData?.cliente?.nombre} field="cliente.nombre" />
        <EditableField label="Apellido" value={editedData?.cliente?.apellido} field="cliente.apellido" />
        <EditableField 
          label="Tipo de Documento" 
          value={editedData?.cliente?.tipoDocumento} 
          field="cliente.tipoDocumento"
          type="select"
          options={[
            { value: TipoDocumento.DNI, label: 'DNI' },
            { value: TipoDocumento.CUIL, label: 'CUIL' },
            { value: TipoDocumento.PASAPORTE, label: 'Pasaporte' }
          ]}
        />
        <EditableField label="Documento" value={editedData?.cliente?.documento} field="cliente.documento" />
        <EditableField label="Email" value={editedData?.cliente?.email} field="cliente.email" />
        <EditableField label="Teléfono" value={editedData?.cliente?.telefono} field="cliente.telefono" />
        <EditableField 
          label="Género" 
          value={editedData?.cliente?.genero} 
          field="cliente.genero"
          type="select"
          options={[
            { value: Genero.MASCULINO, label: 'Masculino' },
            { value: Genero.FEMENINO, label: 'Femenino' },
            { value: Genero.OTRO, label: 'Otro' },
            { value: Genero.PREFIERO_NO_DECIR, label: 'Prefiero no decir' }
          ]}
        />
        <EditableField label="Fecha de Nacimiento" value={editedData?.cliente?.fechaNacimiento} field="cliente.fechaNacimiento" type="date" />
        <EditableField label="Nacionalidad" value={editedData?.cliente?.nacionalidad} field="cliente.nacionalidad" />
      </div>
    </div>
  );

  const TabPlan = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Información del Plan */}
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

      {/* Promoción */}
      {editedData?.promocion && (
        <div>
          <SectionHeader title="Promoción Aplicada" icon="🎁" />
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-emerald-800">{editedData.promocion.nombre}</h4>
                {editedData.promocion.beneficios && (
                  <p className="text-sm font-medium text-emerald-600 mt-1">{editedData.promocion.beneficios}</p>
                )}
              </div>
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-black">
                {editedData.promocion.descuento} OFF
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portabilidad */}
      {editedData.portabilidad && (
        <div>
          <SectionHeader title="Datos de Portabilidad" icon="🔄" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <EditableField label="N° a Portar" value={editedData?.portabilidad?.numeroPortar} field="portabilidad.numeroPortar" />
            <EditableField 
              label="Empresa Origen" 
              value={editedData?.portabilidad?.empresaOrigen} 
              field="portabilidad.empresaOrigen"
              type="select"
              options={EMPRESAS_ORIGEN_MOCK.map(e => ({ value: e.nombre, label: e.nombre }))}
            />
            <EditableField 
              label="Mercado Origen" 
              value={editedData?.portabilidad?.mercadoOrigen} 
              field="portabilidad.mercadoOrigen"
              type="select"
              options={[
                { value: 'Prepago', label: 'Prepago' },
                { value: 'Contrafactura', label: 'Contrafactura' }
              ]}
            />
            <EditableField label="SPN" value={editedData?.portabilidad?.spn} field="portabilidad.spn" />
            <EditableField label="PIN" value={editedData?.portabilidad?.pin} field="portabilidad.pin" type="number" />
            <EditableField label="Fecha Portación" value={editedData?.portabilidad?.fechaPortacion} field="portabilidad.fechaPortacion" type="date" />
          </div>
        </div>
      )}
    </div>
  );

  const TabCorreo = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Información de Envío" icon="📮" />
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <EditableField label="SAP ID" value={editedData?.correo?.sapId} field="correo.sapId" readonly />
        <EditableField label="Destinatario" value={editedData?.correo?.destinatario} field="correo.destinatario" />
        <EditableField label="Persona Autorizada" value={editedData?.correo?.personaAutorizada} field="correo.personaAutorizada" />
        <EditableField label="Teléfono Contacto" value={editedData?.correo?.telefonoContacto} field="correo.telefonoContacto" />
        <EditableField label="Teléfono Alternativo" value={editedData?.correo?.telefonoAlternativo} field="correo.telefonoAlternativo" />
      </div>

      <SectionHeader title="Dirección de Entrega" icon="📍" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <EditableField label="Calle" value={editedData?.correo?.direccion} field="correo.direccion" />
        <EditableField label="Número" value={editedData?.correo?.numeroCasa} field="correo.numeroCasa" type="number" />
        <EditableField label="Piso" value={editedData?.correo?.piso} field="correo.piso" />
        <EditableField label="Departamento" value={editedData?.correo?.departamentoNumero} field="correo.departamentoNumero" />
        <EditableField label="Entre Calles" value={editedData?.correo?.entreCalles} field="correo.entreCalles" />
        <EditableField label="Barrio" value={editedData?.correo?.barrio} field="correo.barrio" />
        <EditableField label="Localidad" value={editedData?.correo?.localidad} field="correo.localidad" />
        <EditableField label="Provincia" value={editedData?.correo?.departamento} field="correo.departamento" />
        <EditableField label="Código Postal" value={editedData?.correo?.codigoPostal} field="correo.codigoPostal" type="number" />
        <EditableField label="Geolocalización" value={editedData?.correo?.geolocalizacion} field="correo.geolocalizacion" />
        <EditableField label="Fecha Límite" value={editedData?.correo?.fechaLimite} field="correo.fechaLimite" type="date" readonly />
      </div>

      {editedData?.correo?.comentarioCartero && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Comentario del Cartero</div>
          <div className="text-sm font-medium text-amber-800">{editedData.correo.comentarioCartero}</div>
        </div>
      )}
    </div>
  );

  const TabEstados = () => (
    <div className="space-y-[6vh] animate-in fade-in duration-500 pb-[10vh]">
      {/* Resumen de Estados en Formato Glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[3vh]">
        {/* Card: Venta */}
        <div className={`relative overflow-hidden p-[4vh] rounded-[4vh] border-2 backdrop-blur-xl shadow-xl transition-all duration-500 hover:scale-[1.02] ${getStatusColor(editedData?.estadoVentaActual ?? SaleStatus.INICIAL)}`}>
          <div className="absolute -right-[2vh] -top-[2vh] text-[12vh] opacity-10 rotate-12 pointer-events-none">📈</div>
          <div className="relative z-10">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-current animate-pulse"></span>
              <span className="font-black uppercase tracking-[0.2em] opacity-70 text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado Operativo</span>
            </div>
            <h4 
              title={editedData?.estadoVentaActual ?? 'S/D'}
              className="font-black uppercase tracking-tight mb-[1vh] text-[clamp(2.2rem,4.5vh,5.5rem)] leading-none truncate max-w-full"
            >
              {editedData?.estadoVentaActual ?? 'S/D'}
            </h4>
            {editedData?.historialEstadosVenta?.[0] && (
              <p className="font-bold opacity-60 text-[clamp(0.7rem,1.2vh,1.5rem)]">
                Última actualización: {new Date(editedData.historialEstadosVenta[0].fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
              </p>
            )}
          </div>
        </div>

        {/* Card: Correo */}
        <div className={`relative overflow-hidden p-[4vh] rounded-[4vh] border-2 backdrop-blur-xl shadow-xl transition-all duration-500 hover:scale-[1.02] ${editedData?.estadoCorreoActual ? getStatusColor(editedData.estadoCorreoActual) : 'bg-slate-100/40 text-slate-400 border-slate-200/50'}`}>
          <div className="absolute -right-[2vh] -top-[2vh] text-[12vh] opacity-10 rotate-12 pointer-events-none">📦</div>
          <div className="relative z-10">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-current opacity-50"></span>
              <span className="font-black uppercase tracking-[0.2em] opacity-70 text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado Logístico</span>
            </div>
            <h4 
              title={editedData?.estadoCorreoActual ?? 'Sin Asignar'}
              className="font-black uppercase tracking-tight mb-[1vh] text-[clamp(2.2rem,3.5vh,4.5rem)] leading-none truncate max-w-full"
            >
              {editedData?.estadoCorreoActual ?? 'Sin Asignar'}
            </h4>
            {editedData?.historialEstadosCorreo?.[0]?.ubicacionActual && (
              <p className="font-bold opacity-60 text-[clamp(0.7rem,1.2vh,1.5rem)] flex items-center gap-2">
                <span className="text-[1.8vh]">📍</span> {editedData.historialEstadosCorreo[0].ubicacionActual}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dual Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[6vh]">
        {/* Timeline: Venta */}
        <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[4.5vh] p-[4vh] border border-white/40 dark:border-white/10 shadow-sm relative">
          <SectionHeader title="Historial Operativo" icon="📉" />
          <div className="space-y-0 mt-[4vh]">
            {(editedData?.historialEstadosVenta ?? []).length === 0 ? (
              <div className="py-[6vh] text-center">
                <p className="text-[clamp(0.8rem,1.4vh,1.8rem)] font-bold text-slate-400 italic">No hay registros operativos aún.</p>
              </div>
            ) : (
              editedData?.historialEstadosVenta?.map((estado, index) => (
                <div key={index} className="relative flex gap-[3vh] group">
                  <div className="flex flex-col items-center">
                    <div className={`w-[2.2vh] h-[2.2vh] rounded-full border-[0.4vh] z-10 transition-all duration-500 scale-100 group-hover:scale-125 ${
                      index === 0 ? 'bg-indigo-600 border-indigo-200 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-300 border-white'
                    }`}></div>
                    {index < (editedData?.historialEstadosVenta?.length ?? 0) - 1 && (
                      <div className="w-[0.3vh] h-full bg-gradient-to-b from-slate-200 to-transparent my-1"></div>
                    )}
                  </div>
                    <div className={`flex-1 pb-[4vh] transition-all duration-500 ${index === 0 ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-[2.5vh] p-[2.5vh] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-center justify-between mb-[1.5vh]">
                        <span className="font-black uppercase tracking-widest text-[clamp(0.75rem,1.2vh,1.5rem)] text-slate-900 dark:text-white">{estado.estado}</span>
                        <div className="px-[1.5vh] py-[0.5vh] bg-indigo-50 dark:bg-indigo-900/40 rounded-full font-bold text-indigo-600 dark:text-indigo-400 text-[clamp(0.55rem,0.9vh,1.1rem)]">
                          {new Date(estado.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-[1vh] mb-[1vh]">
                        <div className="w-[3vh] h-[3vh] rounded-full bg-indigo-100 flex items-center justify-center text-[1.2vh]">👤</div>
                        <span className="font-black text-indigo-600 text-[clamp(0.65rem,1vh,1.2rem)] uppercase tracking-widest">{estado.usuario}</span>
                      </div>
                      {estado.descripcion && (
                        <p className="text-[clamp(0.75rem,1.2vh,1.5rem)] font-medium text-slate-500 leading-relaxed italic border-l-2 border-indigo-100 pl-[1.5vh]">
                          "{estado.descripcion}"
                        </p>
                      )}
                      <div className="mt-[1.5vh] text-[clamp(0.55rem,0.9vh,1rem)] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(estado.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeline: Correo */}
        <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[4.5vh] p-[4vh] border border-white/40 dark:border-white/10 shadow-sm relative">
          <SectionHeader title="Historial Logístico" icon="🚚" />
          <div className="space-y-0 mt-[4vh]">
            {(editedData?.historialEstadosCorreo ?? []).length === 0 ? (
              <div className="py-[6vh] text-center">
                <p className="text-[clamp(0.8rem,1.4vh,1.8rem)] font-bold text-slate-400 italic">Pendiente de ingreso a circuito logístico.</p>
              </div>
            ) : (
              editedData?.historialEstadosCorreo?.map((estado, index) => (
                <div key={index} className="relative flex gap-[3vh] group">
                  <div className="flex flex-col items-center">
                    <div className={`w-[2.2vh] h-[2.2vh] rounded-full border-[0.4vh] z-10 transition-all duration-500 scale-100 group-hover:scale-125 ${
                      index === 0 ? 'bg-purple-600 border-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-300 border-white'
                    }`}></div>
                    {index < (editedData?.historialEstadosCorreo?.length ?? 0) - 1 && (
                      <div className="w-[0.3vh] h-full bg-gradient-to-b from-slate-200 to-transparent my-1"></div>
                    )}
                  </div>
                    <div className={`flex-1 pb-[4vh] transition-all duration-500 ${index === 0 ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-[2.5vh] p-[2.5vh] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-center justify-between mb-[1.5vh]">
                        <span className="font-black uppercase tracking-widest text-[clamp(0.75rem,1.2vh,1.5rem)] text-slate-900 dark:text-white">{estado.estado}</span>
                        <div className="px-[1.5vh] py-[0.5vh] bg-purple-50 dark:bg-purple-900/40 rounded-full font-bold text-purple-600 dark:text-purple-400 text-[clamp(0.55rem,0.9vh,1.1rem)]">
                          {new Date(estado.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {estado.ubicacionActual && (
                        <div className="flex items-center gap-[1vh] mb-[1.5vh] px-[1.5vh] py-[0.8vh] bg-slate-900 text-white rounded-xl w-fit">
                          <span className="text-[1.2vh]">📍</span>
                          <span className="font-black text-[clamp(0.6rem,1vh,1.1rem)] uppercase tracking-widest">{estado.ubicacionActual}</span>
                        </div>
                      )}
                      {estado.descripcion && (
                        <p className="text-[clamp(0.75rem,1.2vh,1.5rem)] font-medium text-slate-500 leading-relaxed italic border-l-2 border-purple-100 pl-[1.5vh]">
                          "{estado.descripcion}"
                        </p>
                      )}
                      <div className="mt-[1.5vh] flex justify-between items-center text-[clamp(0.55rem,0.9vh,1rem)] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{new Date(estado.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        {estado.usuario && <span className="text-purple-400">VIA: {estado.usuario}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-[2vw] bg-slate-950/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-[95vw] bg-[#f8fafc] dark:bg-slate-900 rounded-[5vh] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/40 dark:border-white/10 h-[92vh] flex flex-col">
        <SaleModalErrorBoundary>
          {(isLoadingDetalle || !editedData) ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 gap-[3vh]">
              <div className="w-[8vh] h-[8vh] border-[0.6vh] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-[0.3em] text-[clamp(0.8rem,1.5vh,2rem)] animate-pulse shadow-sm">
                Sincronizando Expediente {sale?.id ?? '...' }...
              </p>
              {isError && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-rose-500 font-black uppercase text-xs tracking-widest">Error de Conexión</p>
                  <p className="text-slate-400 font-medium text-xs max-w-[30ch] text-center">No se pudo conectar con el servidor. Verifique su conexión o CORS.</p>
                </div>
              )}
            </div>
          ) : (
          <>
            {/* Header / Banner */}
            <div className="p-[5vh] bg-gradient-to-br from-indigo-600 via-indigo-800 to-slate-900 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
              <div className="absolute -top-[10vh] -right-[5vh] w-[40vh] h-[40vh] bg-indigo-400/20 blur-[80px] rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-[2vh] mb-[1vh]">
                  <span className="px-[1.5vh] py-[0.5vh] bg-white/20 backdrop-blur-md rounded-full text-[clamp(0.6rem,1vh,1.2rem)] font-black tracking-widest uppercase border border-white/20 shadow-sm">
                    Expediente Digital
                  </span>
                </div>
                <h3 className="font-black italic tracking-tighter uppercase flex items-center gap-[2vh] text-[clamp(1.8rem,4.5vh,4.5rem)] leading-none text-white">
                  <span className="text-indigo-400 hidden lg:inline">#</span>
                  VENTA {editedData?.id ?? sale?.id}
                </h3>
                <p className="font-bold uppercase tracking-[0.2em] opacity-80 mt-[1.5vh] flex items-center gap-[1.5vh] text-[clamp(0.75rem,1.4vh,1.8rem)] text-indigo-100">
                  <span className="w-[0.8vh] h-[0.8vh] bg-indigo-400 rounded-full"></span>
                  {editedData?.cliente?.nombre ?? '...'} {editedData?.cliente?.apellido ?? ''} 
                  <span className="opacity-40">|</span> 
                  DNI: {editedData?.cliente?.documento ?? 'S/D'}
                </p>
              </div>

              <div className="flex items-center gap-[3vh] relative z-10">
                {hasChanges && (
                  <div className="hidden lg:flex items-center gap-[1.8vh] px-[3vh] py-[1.8vh] bg-amber-400/10 rounded-full border border-amber-400/30 backdrop-blur-xl animate-pulse">
                    <div className="w-[1.2vh] h-[1.2vh] rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
                    <span className="font-black uppercase tracking-[0.1em] text-amber-400 text-[clamp(0.65rem,1.1vh,1.2rem)]">Pendiente de Guardado</span>
                  </div>
                )}
                <button onClick={onClose} className="p-[2.2vh] bg-white/10 hover:bg-rose-500/80 hover:scale-110 active:scale-95 rounded-[2.5vh] transition-all duration-500 border border-white/20 backdrop-blur-md group">
                  <svg className="w-[3.5vh] h-[3.5vh] group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Glass Navigation */}
            <div className="px-10 py-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 flex gap-4 overflow-x-auto shrink-0 scrollbar-hide">
              {renderTabButton('venta', '📋', 'Información General')}
              {renderTabButton('cliente', '👤', 'Ficha del Cliente')}
              {renderTabButton('plan', '📱', 'Plan & Servicios')}
              {editedData?.chip !== 'ESIM' && renderTabButton('correo', '📮', 'Logística & Entrega')}
              {renderTabButton('estados', '📊', 'Trazabilidad')}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white/50 dark:bg-slate-900/50 no-scrollbar">
              {activeTab === 'venta' && <TabVenta />}
              {activeTab === 'cliente' && <TabCliente />}
              {activeTab === 'plan' && <TabPlan />}
              {activeTab === 'correo' && editedData?.chip !== 'ESIM' && <TabCorreo />}
              {activeTab === 'estados' && <TabEstados />}
            </div>

        <div className="p-[4vh] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 flex justify-between items-center shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] relative z-20">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-[5vh] py-[2.5vh] rounded-[2.5vh] font-black uppercase tracking-[0.1em] transition-all duration-500 text-[clamp(0.75rem,1.3vh,1.6rem)] flex items-center gap-[1.5vh] hover:scale-105 active:scale-95 ${
              isEditing 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700' 
                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/20'
            }`}
          >
            <span>{isEditing ? '❌' : '✏️'}</span>
            {isEditing ? 'Descartar Edición' : 'Editar Información'}
          </button>

          <div className="flex gap-[2.5vh]">
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-[6vh] py-[2.5vh] rounded-[2.5vh] font-black uppercase tracking-[0.1em] transition-all duration-500 text-[clamp(0.75rem,1.3vh,1.6rem)] flex items-center gap-[1.5vh] shadow-xl ${
                  hasChanges
                    ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 hover:shadow-emerald-300'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>💾</span>
                Guardar Expediente
              </button>
            )}
            <button
              className="px-[6vh] py-[2.5vh] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[2.5vh] font-black uppercase tracking-[0.1em] shadow-2xl shadow-indigo-200 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-500 text-[clamp(0.75rem,1.3vh,1.6rem)] flex items-center gap-[1.5vh] overflow-hidden group relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10">🔄</span>
              <span className="relative z-10">Actualizar Estado</span>
            </button>
          </div>
        </div>
          </>
        )}
        </SaleModalErrorBoundary>
      </div>
    </div>
  );
};

export default SaleModal;
