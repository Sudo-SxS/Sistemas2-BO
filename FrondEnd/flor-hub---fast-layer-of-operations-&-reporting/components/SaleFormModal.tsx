import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Sale, ProductType, OriginMarket } from '../types';
import { clienteService, ClienteCreate, ClienteResponse } from '../services/cliente';
import { getPlanesPorEmpresa, getPromocionesPorEmpresa, getEmpresasOrigen, getAllPlanes, getAllPromociones, PlanResponse, PromocionResponse, EmpresaOrigenResponse } from '../services/plan';
import { verificarSAP, crearCorreo, CorreoCreate } from '../services/correo';

// Schema de validación por fase
const Fase1Schema = z.object({
  tipo_documento: z.string().min(1, 'Tipo de documento requerido'),
  documento: z.string().min(7, 'Documento inválido').max(20),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  genero: z.string().optional(),
  nacionalidad: z.string().optional(),
});

const Fase2Schema = z.object({
  tipo_venta: z.enum(['PORTABILIDAD', 'LINEA_NUEVA']),
  empresa_origen_id: z.number().positive('Seleccione empresa'),
  plan_id: z.number().positive('Seleccione un plan'),
  promocion_id: z.number().optional(),
  chip: z.enum(['SIM', 'ESIM']),
});

const Fase3Schema = z.object({
  sap_id: z.string().min(1, 'SAP requerido'),
  numero: z.string().min(8, 'Teléfono inválido'),
  tipo: z.enum(['RESIDENCIAL', 'EMPRESARIAL']).optional(),
  direccion: z.string().optional(),
  localidad: z.string().optional(),
  provincia: z.string().optional(),
  codigo_postal: z.string().optional(),
  estado_entrega: z.string().optional(),
});

type Fase1Data = z.infer<typeof Fase1Schema>;
type Fase2Data = z.infer<typeof Fase2Schema>;
type Fase3Data = z.infer<typeof Fase3Schema>;

interface SaleFormModalProps {
  onClose: () => void;
  onSubmit: (sale: Partial<Sale>) => void;
  initialData?: Partial<Sale>;
}

type Fase = 1 | 2 | 3;

export const SaleFormModal: React.FC<SaleFormModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [fase, setFase] = useState<Fase>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos de fase 1 - Cliente
  const [fase1, setFase1] = useState<Fase1Data>({
    tipo_documento: 'DNI',
    documento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    nacionalidad: '',
  });

  // Datos de fase 2 - Venta
  const [fase2, setFase2] = useState<Fase2Data>({
    tipo_venta: initialData?.productType === ProductType.PORTABILITY ? 'PORTABILIDAD' : 'LINEA_NUEVA',
    empresa_origen_id: initialData?.empresa_origen_id || 0,
    plan_id: initialData?.plan_id || 0,
    promocion_id: initialData?.promocion_id || undefined,
    chip: 'SIM',
  });

  // Datos de fase 3 - Correo (solo si chip = SIM)
  const [fase3, setFase3] = useState<Fase3Data>({
    sap_id: '',
    numero: '',
    tipo: 'RESIDENCIAL',
    direccion: '',
    localidad: '',
    provincia: '',
    codigo_postal: '',
    estado_entrega: '',
  });

  // Datos cargados del backend
  const [empresas, setEmpresas] = useState<EmpresaOrigenResponse[]>([]);
  const [planes, setPlanes] = useState<PlanResponse[]>([]);
  const [promociones, setPromociones] = useState<PromocionResponse[]>([]);
  const [clienteEncontrado, setClienteEncontrado] = useState<ClienteResponse | null>(null);
  const [sapVerificado, setSapVerificado] = useState(false);

  // Cargar empresas al inicio
  useEffect(() => {
    getEmpresasOrigen().then(res => {
      if (res.success && res.data) setEmpresas(res.data);
    });
  }, []);

  // Cargar planes y promociones según tipo de venta
  useEffect(() => {
    setIsLoading(true);
    
    if (fase2.tipo_venta === 'LINEA_NUEVA') {
      // LINEA_NUEVA: cargar todos los planes y promociones disponibles
      getAllPlanes().then(res => {
        if (res.success && res.data) {
          const sortedPlanes = res.data.sort((a, b) => a.precio - b.precio);
          setPlanes(sortedPlanes);
        }
        setIsLoading(false);
      });
      
      getAllPromociones().then(res => {
        if (res.success && res.data) {
          const sortedPromociones = res.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
          setPromociones(sortedPromociones);
        }
      });
    } else if (fase2.tipo_venta === 'PORTABILIDAD' && fase2.empresa_origen_id > 0) {
      // PORTABILIDAD: cargar planes y promociones de la empresa seleccionada
      getPlanesPorEmpresa(fase2.empresa_origen_id).then(res => {
        if (res.success && res.data) {
          const sortedPlanes = res.data.sort((a, b) => a.precio - b.precio);
          setPlanes(sortedPlanes);
        }
        setIsLoading(false);
      });
      
      getPromocionesPorEmpresa(fase2.empresa_origen_id).then(res => {
        if (res.success && res.data) {
          const sortedPromociones = res.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
          setPromociones(sortedPromociones);
        }
      });
    } else {
      // Limpiar si no hay empresa seleccionada en portabilidad
      setPlanes([]);
      setPromociones([]);
      setIsLoading(false);
    }
  }, [fase2.tipo_venta, fase2.empresa_origen_id]);

  // Buscar cliente por documento
  const handleBuscarCliente = async () => {
    if (!fase1.documento) return;
    setIsLoading(true);
    setError(null);
    
    const res = await clienteService.buscarPorDocumento({
      tipo_documento: fase1.tipo_documento,
      documento: fase1.documento,
    });

    if (res.success && res.data) {
      setClienteEncontrado(res.data);
      setFase1(prev => ({
        ...prev,
        nombre: res.data!.nombre,
        apellido: res.data!.apellido,
        email: res.data!.email,
        telefono: res.data!.telefono || '',
        fecha_nacimiento: res.data!.fecha_nacimiento.split('T')[0],
        genero: res.data!.genero,
        nacionalidad: res.data!.nacionalidad,
      }));
    } else {
      setClienteEncontrado(null);
      setError('Cliente no encontrado. Complete los datos para crear uno nuevo.');
    }
    setIsLoading(false);
  };

  // Crear cliente nuevo
  const handleCrearCliente = async () => {
    const clienteData: ClienteCreate = {
      nombre: fase1.nombre!.toUpperCase(),
      apellido: fase1.apellido!.toUpperCase(),
      documento: fase1.documento,
      tipo_documento: fase1.tipo_documento,
      email: fase1.email!.toLowerCase(),
      telefono: fase1.telefono,
      fecha_nacimiento: fase1.fecha_nacimiento!,
      genero: fase1.genero as 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFERO NO DECIR',
      nacionalidad: fase1.nacionalidad!.toUpperCase(),
    };

    setIsLoading(true);
    const res = await clienteService.crear(clienteData);
    
    if (res.success && res.data) {
      setClienteEncontrado(res.data);
      setError(null);
    } else {
      setError(res.message || 'Error al crear cliente');
    }
    setIsLoading(false);
  };

  // Verificar SAP
  const handleVerificarSAP = async () => {
    if (!fase3.sap_id) return;
    setIsLoading(true);
    const res = await verificarSAP(fase3.sap_id);
    if (res.success && !res.existe) {
      setSapVerificado(true);
      setError(null);
    } else {
      setSapVerificado(false);
      setError(res.message || 'SAP ya existe');
    }
    setIsLoading(false);
  };

  // Navegación entre fases
  const puedePasarFase1 = () => {
    return !!clienteEncontrado && fase1.nombre && fase1.apellido && fase1.email;
  };

  const puedePasarFase2 = () => {
    if (fase2.tipo_venta === 'PORTABILIDAD' && fase2.empresa_origen_id === 0) return false;
    return fase2.plan_id > 0;
  };

  const puedePasarFase3 = () => {
    if (fase2.chip === 'ESIM') return true;
    return sapVerificado && fase3.numero;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!clienteEncontrado) {
      setError('Debe buscar o crear un cliente primero');
      return;
    }

    const empresa = empresas.find(e => e.empresa_origen_id === fase2.empresa_origen_id);
    const plan = planes.find(p => p.plan_id === fase2.plan_id);
    const promocion = promociones.find(p => p.promocion_id === fase2.promocion_id);
    
    // Para LINEA_NUEVA, si no hay empresa seleccionada, usar la primera disponible
    const empresaParaVenta = fase2.tipo_venta === 'LINEA_NUEVA' && empresas.length > 0 
      ? empresas[0] 
      : empresa;

    // Calcular precio con descuento
    // const descuentoNum = promocion?.descuento ? parseFloat(promocion.descuento) : 0;
    // const precioFinal = plan ? plan.precio - descuentoNum : 0;
    const precioFinal = plan ? plan.precio : 0;

    const saleData: Partial<Sale> = {
      customerName: `${fase1.nombre} ${fase1.apellido}`.trim(),
      dni: fase1.documento,
      phoneNumber: fase1.telefono,
      productType: fase2.tipo_venta as ProductType,
      originMarket: empresaParaVenta?.nombre_empresa as OriginMarket,
      plan: plan?.nombre || '',
      promotion: promocion ? `${promocion.nombre} (${promocion.descuento ? `-$${promocion.descuento}` : ''})` : '',
      amount: precioFinal,
      chip: fase2.chip,
      sds: fase2.chip === 'ESIM' ? null : fase3.sap_id.toUpperCase(),
      plan_id: fase2.plan_id,
      promocion_id: fase2.promocion_id,
      empresa_origen_id: empresaParaVenta?.empresa_origen_id,
    };

    // Crear correo si es SIM
    if (fase2.chip === 'SIM' && sapVerificado) {
      const correoData: CorreoCreate = {
        sap_id: fase3.sap_id.toUpperCase(),
        numero: fase3.numero,
        tipo: fase3.tipo || 'RESIDENCIAL',
        direccion: fase3.direccion,
        localidad: fase3.localidad,
        provincia: fase3.provincia,
        codigo_postal: fase3.codigo_postal,
        estado_entrega: fase3.estado_entrega,
      };
      await crearCorreo(correoData);
    }

    onSubmit(saleData);
  };

  // Clases UI reutilizables
  const inputClass = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm";
  const labelClass = "block font-black text-slate-500 dark:text-slate-400 uppercase text-xs mb-1 ml-1";
  const errorClass = "text-red-500 text-xs font-bold ml-1";
  const sectionTitleClass = "font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs border-b border-slate-200 dark:border-slate-800 pb-2 mb-4";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black italic uppercase text-xl">Nueva Venta</h3>
            <p className="font-black uppercase tracking-wider text-xs opacity-80">Registro en FLOR HUB</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
          {[
            { n: 1, t: 'Cliente' },
            { n: 2, t: 'Venta' },
            { n: 3, t: fase2.chip === 'ESIM' ? 'Resumen' : 'Correo' },
          ].map(tab => (
            <button
              key={tab.n}
              onClick={() => setFase(tab.n as Fase)}
              className={`flex-1 py-3 font-black uppercase text-sm tracking-wider transition-all ${
                fase === tab.n
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${
                fase > tab.n ? 'bg-green-500 text-white' : fase === tab.n ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }">
                {fase > tab.n ? '✓' : tab.n}
              </span>
              {tab.t}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
              {error}
            </div>
          )}

          {/* FASE 1: CLIENTE */}
          {fase === 1 && (
            <div className="space-y-6">
              <div className={sectionTitleClass}>Búsqueda de Cliente</div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Tipo Documento</label>
                  <select
                    value={fase1.tipo_documento}
                    onChange={e => setFase1(prev => ({ ...prev, tipo_documento: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="DNI">DNI</option>
                    <option value="NIE">NIE</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="CUIL">CUIL</option>
                    <option value="CUIT">CUIT</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Número Documento *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fase1.documento}
                      onChange={e => setFase1(prev => ({ ...prev, documento: e.target.value }))}
                      className={inputClass}
                      placeholder="12345678"
                    />
                    <button
                      onClick={handleBuscarCliente}
                      disabled={!fase1.documento || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                      {isLoading ? '...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              </div>

              {clienteEncontrado ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="font-bold text-green-700 dark:text-green-400">
                    ✓ Cliente encontrado: {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                  </p>
                </div>
              ) : (
                <>
                  <div className={sectionTitleClass}>Datos del Nuevo Cliente</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre *</label>
                      <input
                        type="text"
                        value={fase1.nombre}
                        onChange={e => setFase1(prev => ({ ...prev, nombre: e.target.value }))}
                        className={inputClass}
                        placeholder="JUAN"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Apellido *</label>
                      <input
                        type="text"
                        value={fase1.apellido}
                        onChange={e => setFase1(prev => ({ ...prev, apellido: e.target.value }))}
                        className={inputClass}
                        placeholder="PÉREZ"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email *</label>
                      <input
                        type="email"
                        value={fase1.email}
                        onChange={e => setFase1(prev => ({ ...prev, email: e.target.value }))}
                        className={inputClass}
                        placeholder="juan.perez@email.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Teléfono</label>
                      <input
                        type="tel"
                        value={fase1.telefono}
                        onChange={e => setFase1(prev => ({ ...prev, telefono: e.target.value }))}
                        className={inputClass}
                        placeholder="3511234567"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Fecha Nacimiento *</label>
                      <input
                        type="date"
                        value={fase1.fecha_nacimiento}
                        onChange={e => setFase1(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Género *</label>
                      <select
                        value={fase1.genero}
                        onChange={e => setFase1(prev => ({ ...prev, genero: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                        <option value="OTRO">Otro</option>
                        <option value="PREFIERO NO DECIR">Prefiero no decir</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Nacionalidad *</label>
                      <input
                        type="text"
                        value={fase1.nacionalidad}
                        onChange={e => setFase1(prev => ({ ...prev, nacionalidad: e.target.value }))}
                        className={inputClass}
                        placeholder="ARGENTINA"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCrearCliente}
                    disabled={!puedePasarFase1() || isLoading}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {isLoading ? 'Creando...' : 'Crear Cliente'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* FASE 2: VENTA */}
          {fase === 2 && (
            <div className="space-y-6">
              <div className={sectionTitleClass}>Tipo de Venta</div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setFase2(prev => ({ ...prev, tipo_venta: 'LINEA_NUEVA', empresa_origen_id: 0 }));
                    setPlanes([]);
                    setPromociones([]);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fase2.tipo_venta === 'LINEA_NUEVA'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-black text-lg text-slate-900 dark:text-white">📱 Línea Nueva</div>
                  <div className="text-xs text-slate-500 mt-1">Activación de línea nueva</div>
                </button>
                <button
                  onClick={() => setFase2(prev => ({ ...prev, tipo_venta: 'PORTABILIDAD' }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fase2.tipo_venta === 'PORTABILIDAD'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-black text-lg text-slate-900 dark:text-white">🔄 Portabilidad</div>
                  <div className="text-xs text-slate-500 mt-1">Trae tu número a Claro</div>
                </button>
              </div>

              <div className={sectionTitleClass}>Empresa y Plan</div>
              
              {/* Solo mostrar empresa origen para PORTABILIDAD */}
              {fase2.tipo_venta === 'PORTABILIDAD' && (
                <div className="mb-4">
                  <label className={labelClass}>Empresa Origen *</label>
                  <select
                    value={fase2.empresa_origen_id || ''}
                    onChange={e => {
                      setFase2(prev => ({ 
                        ...prev, 
                        empresa_origen_id: Number(e.target.value),
                        plan_id: 0,
                        promocion_id: undefined
                      }));
                    }}
                    className={inputClass}
                  >
                    <option value="">Seleccionar empresa...</option>
                    {empresas.map(e => (
                      <option key={e.empresa_origen_id} value={e.empresa_origen_id}>
                        {e.nombre_empresa} ({e.pais})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Plan *</label>
                  <select
                    value={fase2.plan_id || ''}
                    onChange={e => {
                      setFase2(prev => ({ 
                        ...prev, 
                        plan_id: Number(e.target.value),
                        promocion_id: undefined
                      }));
                    }}
                    className={inputClass}
                    disabled={planes.length === 0}
                  >
                    <option value="">Seleccionar plan...</option>
                    {planes.map(p => (
                      <option key={p.plan_id} value={p.plan_id}>
                        {p.nombre} - {p.gigabyte} GB
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Promoción</label>
                  <select
                    value={fase2.promocion_id || ''}
                    onChange={e => setFase2(prev => ({ ...prev, promocion_id: e.target.value ? Number(e.target.value) : undefined }))}
                    className={inputClass}
                    disabled={planes.length === 0}
                  >
                    <option value="">Sin promoción</option>
                    {promociones.map(promo => (
                      <option key={promo.promocion_id} value={promo.promocion_id}>
                        {promo.nombre} {promo.descuento ? `(-${promo.descuento}%)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen del Plan Seleccionado */}
              {fase2.plan_id > 0 && (
                <div>
                  <label className={labelClass}>Resumen del Plan</label>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm space-y-1">
                    {(() => {
                      const selectedPlan = planes.find(p => p.plan_id === fase2.plan_id);
                      const selectedPromo = promociones.find(p => p.promocion_id === fase2.promocion_id);
                      
                      // Calcular descuento (puede ser porcentaje o monto fijo)
                      const descuentoNum = selectedPromo?.descuento ? Number(selectedPromo.descuento) : 0;
                      const precioBase = selectedPlan ? selectedPlan.precio : 0;
                      let precioConDescuento = precioBase;
                      
                      // Si el descuento es porcentaje (menor a 100), aplicar como porcentaje
                      if (descuentoNum > 0 && descuentoNum <= 100) {
                        precioConDescuento = precioBase - (precioBase * descuentoNum / 100);
                      } else if (descuentoNum > 100) {
                        // Si es mayor a 100, es un monto fijo
                        precioConDescuento = precioBase - descuentoNum;
                      }
                      
                      if (!selectedPlan) {
                        return <div className="text-slate-500">Seleccionar un plan</div>;
                      }
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Plan:</span>
                            <span className="font-bold">{selectedPlan.nombre}</span>
                          </div>
                          {selectedPromo && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Promoción:</span>
                              <span className="font-bold text-green-600">{selectedPromo.nombre}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Precio:</span>
                            {selectedPromo && descuentoNum > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-400 line-through">${precioBase.toLocaleString('es-AR')}</span>
                                <span className="font-bold text-green-600">${precioConDescuento.toLocaleString('es-AR')}</span>
                              </div>
                            ) : (
                              <span className="font-bold">${precioBase.toLocaleString('es-AR')}</span>
                            )}
                          </div>
                          <div className="mt-2 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Gigas:</span>
                              <span>{selectedPlan.gigabyte} GB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Llamadas:</span>
                              <span>{selectedPlan.llamadas}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Mensajes:</span>
                              <span>{selectedPlan.mensajes}</span>
                            </div>
                            {(selectedPlan.whatsapp || selectedPlan.roaming || selectedPlan.beneficios) && (
                              <div className="mt-1 text-slate-500">
                                {selectedPlan.whatsapp && <span>✓ WhatsApp {selectedPlan.whatsapp === 'Ilimitado' ? 'Ilimitado' : selectedPlan.whatsapp}</span>}
                                {selectedPlan.roaming && <span>✓ Roaming {selectedPlan.roaming}</span>}
                                {selectedPlan.beneficios && <span>✓ {selectedPlan.beneficios}</span>}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className={sectionTitleClass}>Tipo de Chip</div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFase2(prev => ({ ...prev, chip: 'SIM' }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fase2.chip === 'SIM'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-black text-lg text-slate-900 dark:text-white">💳 SIM Física</div>
                  <div className="text-xs text-slate-500 mt-1">Requiere correo</div>
                </button>
                <button
                  onClick={() => setFase2(prev => ({ ...prev, chip: 'ESIM' }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fase2.chip === 'ESIM'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-black text-lg text-slate-900 dark:text-white">📲 eSIM Digital</div>
                  <div className="text-xs text-slate-500 mt-1">Sin correo físico</div>
                </button>
              </div>
            </div>
          )}

          {/* FASE 3: CORREO o RESUMEN */}
          {fase === 3 && (
            <div className="space-y-6">
              {fase2.chip === 'SIM' ? (
                <>
                  <div className={sectionTitleClass}>Datos del Correo SIM</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>SAP ID *</label>
                      <input
                        type="text"
                        value={fase3.sap_id}
                        onChange={e => {
                          setFase3(prev => ({ ...prev, sap_id: e.target.value }));
                          setSapVerificado(false);
                        }}
                        className={`${inputClass} uppercase`}
                        placeholder="SAP123456"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleVerificarSAP}
                        disabled={!fase3.sap_id || isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        {sapVerificado ? '✓ SAP Disponible' : 'Verificar SAP'}
                      </button>
                    </div>
                    <div>
                      <label className={labelClass}>Número Teléfono *</label>
                      <input
                        type="tel"
                        value={fase3.numero}
                        onChange={e => setFase3(prev => ({ ...prev, numero: e.target.value }))}
                        className={inputClass}
                        placeholder="600000000"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Tipo</label>
                      <select
                        value={fase3.tipo}
                        onChange={e => setFase3(prev => ({ ...prev, tipo: e.target.value as 'RESIDENCIAL' | 'EMPRESARIAL' }))}
                        className={inputClass}
                      >
                        <option value="RESIDENCIAL">Residencial</option>
                        <option value="EMPRESARIAL">Empresarial</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Dirección</label>
                      <input
                        type="text"
                        value={fase3.direccion}
                        onChange={e => setFase3(prev => ({ ...prev, direccion: e.target.value }))}
                        className={inputClass}
                        placeholder="Calle 123"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Localidad</label>
                      <input
                        type="text"
                        value={fase3.localidad}
                        onChange={e => setFase3(prev => ({ ...prev, localidad: e.target.value }))}
                        className={inputClass}
                        placeholder="Buenos Aires"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                  <p className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                    ✓ Venta con eSIM - No requiere datos de correo
                  </p>
                </div>
              )}

              <div className={sectionTitleClass}>Resumen de la Venta</div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-bold">{clienteEncontrado?.nombre} {clienteEncontrado?.apellido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DNI:</span>
                  <span className="font-bold">{clienteEncontrado?.documento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipo:</span>
                  <span className="font-bold">{fase2.tipo_venta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold">{planes.find(p => p.plan_id === fase2.plan_id)?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Precio:</span>
                  <span className="font-bold text-green-600">${planes.find(p => p.plan_id === fase2.plan_id)?.precio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chip:</span>
                  <span className="font-bold">{fase2.chip}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones de navegación */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between shrink-0">
          <button
            onClick={() => setFase(prev => (prev > 1 ? prev - 1 : 1) as Fase)}
            disabled={fase === 1}
            className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
          >
            ← Atrás
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-500 font-bold hover:text-red-500 transition-colors"
            >
              Cancelar
            </button>
            {fase < 3 ? (
              <button
                onClick={() => setFase(prev => (prev + 1) as Fase)}
                disabled={
                  (fase === 1 && !puedePasarFase1()) ||
                  (fase === 2 && !puedePasarFase2())
                }
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!puedePasarFase3() || isLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Finalizar Venta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};