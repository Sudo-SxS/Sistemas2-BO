import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fase1Schema, Fase2Schema, Fase3Schema, Fase1Data, Fase2Data, Fase3Data } from '../../schemas/sale';
import { Sale, ProductType } from '../../types';
import { usePlansQuery, usePromotionsQuery, useEmpresasQuery } from '../../hooks/useSaleDependencies';
import { useCreateSaleMutation } from '../../hooks/useSales';
import { clienteService } from '../../services/cliente';
import { useToast } from '../../contexts/ToastContext';

interface SaleFormModalProps {
  onClose: () => void;
  onVentaCreada?: () => void;
  initialData?: Partial<Sale>;
}

type Fase = 1 | 2 | 3 | 4;

export const SaleFormModal: React.FC<SaleFormModalProps> = ({ onClose, onVentaCreada, initialData }) => {
  const { addToast } = useToast();
  const [fase, setFase] = useState<Fase>(1);
  const [clienteEncontrado, setClienteEncontrado] = useState<any | null>(null);
  const [isLoadingCliente, setIsLoadingCliente] = useState(false);
  
  // Custom Hooks
  const { data: planes, isLoading: isLoadingPlanes } = usePlansQuery();
  const { data: promociones, isLoading: isLoadingPromociones } = usePromotionsQuery();
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const createSaleMutation = useCreateSaleMutation();

  // Forms
  const formFase1 = useForm<Fase1Data>({
    resolver: zodResolver(Fase1Schema),
    defaultValues: {
      tipo_documento: 'DNI',
      documento: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      telefono_alternativo: '',
      fecha_nacimiento: '',
      genero: '',
      nacionalidad: '',
    }
  });

  const formFase2 = useForm<Fase2Data>({
    resolver: zodResolver(Fase2Schema),
    defaultValues: {
      tipo_venta: initialData?.productType === ProductType.PORTABILITY ? 'PORTABILIDAD' : 'LINEA_NUEVA',
      empresa_origen_id: initialData?.empresa_origen_id || 0,
      plan_id: initialData?.plan_id || 0,
      promocion_id: initialData?.promocion_id,
      chip: 'SIM',
      sds: '',
      stl: '',
      spn: '',
      numero_portar: '',
      pin: '',
      fecha_vencimiento_pin: '',
      mercado_origen: undefined,
    }
  });

  const formFase3 = useForm<Fase3Data>({
    resolver: zodResolver(Fase3Schema),
    defaultValues: {
      sap: '',
      numero: '',
      tipo: 'RESIDENCIAL',
      direccion: '',
      numero_casa: '',
      entre_calles: '',
      barrio: '',
      localidad: '',
      departamento: '',
      codigo_postal: '',
      geolocalizacion: '',
      telefono_alternativo: '',
      piso: '',
      departamento_numero: ''
    }
  });

  // Watchers
  const documento = formFase1.watch('documento');
  const tipoDocumento = formFase1.watch('tipo_documento');
  const tipoVenta = formFase2.watch('tipo_venta');
  const planId = formFase2.watch('plan_id');
  const promocionId = formFase2.watch('promocion_id');
  const chip = formFase2.watch('chip');

  // Filtered Data
  const filteredPlanes = React.useMemo(() => {
    if (!planes) return [];
    if (tipoVenta === 'LINEA_NUEVA') {
      // Logic for logic new line (internal company id 2)
      return planes.filter(p => p.activo !== false && p.empresa_origen_id === 2).sort((a, b) => a.precio - b.precio);
    }
    const empresaId = formFase2.getValues('empresa_origen_id');
    if (tipoVenta === 'PORTABILIDAD' && empresaId) {
       return planes.filter(p => p.activo !== false && p.empresa_origen_id === empresaId).sort((a, b) => a.precio - b.precio);
    }
    return [];
  }, [planes, tipoVenta, formFase2.watch('empresa_origen_id')]);

  const filteredPromociones = React.useMemo(() => {
    if (!promociones) return [];
     if (tipoVenta === 'LINEA_NUEVA') {
      return promociones.filter(p => p.activo !== false && p.descuento > 0 && p.empresa_origen_id === 2).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    const empresaId = formFase2.getValues('empresa_origen_id');
    if (tipoVenta === 'PORTABILIDAD' && empresaId) {
      return promociones.filter(p => p.activo !== false && p.descuento > 0 && p.empresa_origen_id === empresaId).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return [];
  }, [promociones, tipoVenta, formFase2.watch('empresa_origen_id')]);

  // Handlers
  const handleBuscarCliente = async () => {
    if (!documento) {
      addToast({ type: 'error', title: 'Error', message: 'Ingrese un documento' });
      return;
    }
    setIsLoadingCliente(true);
    try {
      console.log('[handleBuscarCliente] Buscando cliente:', tipoDocumento, documento);
      const res = await clienteService.buscarPorDocumento({
        tipo_documento: tipoDocumento,
        documento: documento,
      });
      console.log('[handleBuscarCliente] Respuesta:', res);
      
      if (res.success && res.data) {
        setClienteEncontrado(res.data);
        formFase1.reset({
          ...formFase1.getValues(),
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          email: res.data.email || '',
          telefono: res.data.telefono || '',
          fecha_nacimiento: res.data.fecha_nacimiento ? res.data.fecha_nacimiento.split('T')[0] : '',
          genero: res.data.genero || '',
          nacionalidad: res.data.nacionalidad || '',
        });
        addToast({ type: 'success', title: 'Cliente Encontrado', message: `${res.data.nombre} ${res.data.apellido}` });
      } else {
        setClienteEncontrado(null);
        addToast({ type: 'info', title: 'Cliente No Encontrado', message: 'Complete los datos para registrarlo.' });
      }
    } catch (error) {
      console.error('[handleBuscarCliente] Error:', error);
      addToast({ type: 'error', title: 'Error', message: 'Error al buscar cliente' });
    } finally {
      setIsLoadingCliente(false);
    }
  };

  const handleCrearCliente = async () => {
    const data = formFase1.getValues();
    // Validate manually or assume form is valid if button is enabled
    // Ideally use formFase1.handleSubmit for this part too, but we are in a step flow
    setIsLoadingCliente(true);
    try {
        const res = await clienteService.crear({
            nombre: data.nombre!.toUpperCase(),
            apellido: data.apellido!.toUpperCase(),
            documento: data.documento,
            tipo_documento: data.tipo_documento,
            email: data.email!.toLowerCase(),
            telefono: data.telefono,
            telefono_alternativo: data.telefono_alternativo,
            fecha_nacimiento: data.fecha_nacimiento!,
            genero: data.genero as any,
            nacionalidad: data.nacionalidad!.toUpperCase(),
        });

        if (res.success && res.data) {
            setClienteEncontrado(res.data);
            addToast({ type: 'success', title: 'Cliente Creado', message: 'Cliente registrado correctamente' });
        } else {
            addToast({ type: 'error', title: 'Error', message: res.message || 'No se pudo crear el cliente' });
        }
    } catch (error) {
        addToast({ type: 'error', title: 'Error', message: 'Error al crear cliente' });
    } finally {
        setIsLoadingCliente(false);
    }
  };

  const onSubmit = async () => {
    console.log('[onSubmit] ===== INICIO =====');
    console.log('[onSubmit] chip:', chip, 'fase:', fase);
    
    // Validar campos obligatorios manualmente
    const missingFields = getValidationErrors(3);
    console.log('[onSubmit] Campos faltantes (getValidationErrors):', missingFields);
    
    if (missingFields.length > 0 && chip === 'SIM') {
      console.log('[onSubmit] Validación de fase 3 falló. Campos faltantes:', missingFields.join(', '));
      addToast({ 
        type: 'error', 
        title: 'Faltan datos obligatorios', 
        message: missingFields.join(', ') 
      });
      return;
    }

    if (!clienteEncontrado) {
        addToast({ type: 'error', title: 'Error', message: 'Debe seleccionar un cliente' });
        return;
    }

    try {
      const dataFase1 = formFase1.getValues();
      const dataFase2 = formFase2.getValues();
      const dataFase3 = formFase3.getValues();

      console.log('[onSubmit] dataFase1:', dataFase1);
      console.log('[onSubmit] dataFase2:', dataFase2);
      console.log('[onSubmit] dataFase3:', dataFase3);

      const ventaPayload: any = {
        venta: {
          sds: dataFase2.sds?.toUpperCase() || null,
          chip: dataFase2.chip,
          stl: dataFase2.chip === 'ESIM' ? null : (dataFase2.stl?.toUpperCase() || null),
          tipo_venta: dataFase2.tipo_venta,
          sap: null,
          cliente_id: clienteEncontrado?.persona_id,
          plan_id: dataFase2.plan_id,
          promocion_id: dataFase2.promocion_id || null,
          empresa_origen_id: dataFase2.tipo_venta === 'LINEA_NUEVA' ? 2 : (dataFase2.empresa_origen_id || 0),
        }
      };

      if (dataFase2.chip === 'SIM') {
        ventaPayload.correo = {
          sap: dataFase3?.sap?.toUpperCase() || null,
          telefono_contacto: dataFase3?.numero || '',
          telefono_alternativo: dataFase3?.telefono_alternativo || null,
          destinatario: `${dataFase1?.nombre || ''} ${dataFase1?.apellido || ''}`.trim(),
          direccion: dataFase3?.direccion || '',
          numero_casa: dataFase3?.numero_casa ? Number(dataFase3.numero_casa) : 1,
          entre_calles: dataFase3?.entre_calles || null,
          barrio: dataFase3?.barrio || null,
          localidad: dataFase3?.localidad || '',
          departamento: dataFase3?.departamento || '',
          codigo_postal: dataFase3?.codigo_postal ? Number(dataFase3.codigo_postal) : 1000,
          geolocalizacion: dataFase3?.geolocalizacion || null,
          piso: dataFase3?.piso || null,
          departamento_numero: dataFase3?.departamento_numero || null,
        };
      }

      if (dataFase2.tipo_venta === 'PORTABILIDAD') {
        ventaPayload.portabilidad = {
          spn: dataFase2.spn?.toUpperCase() || null,
          empresa_origen: dataFase2.empresa_origen_id,
          mercado_origen: dataFase2.mercado_origen,
          numero_portar: dataFase2.numero_portar || null,
          pin: dataFase2.pin?.toUpperCase() || null,
          fecha_vencimiento_pin: dataFase2.fecha_vencimiento_pin || null,
        };
      }
      
      console.log('[onSubmit] Enviando payload:', JSON.stringify(ventaPayload, null, 2));
      
      createSaleMutation.mutate(ventaPayload, {
          onSuccess: (res) => {
              console.log('[onSubmit] Venta creada exitosamente:', res);
              addToast({ type: 'success', title: 'Venta Creada', message: `Venta ${res.venta_id || ''} registrada` });
              onVentaCreada && onVentaCreada();
              onClose();
          },
          onError: (err: any) => {
              console.error('[onSubmit] Error al crear venta:', err);
              const errorMessage = err.response?.data?.message || err.message || 'Error al crear venta';
              const errors = err.response?.data?.errors;
              const detailedError = errors ? `${errorMessage}: ${JSON.stringify(errors)}` : errorMessage;
              addToast({ type: 'error', title: 'Error', message: detailedError });
          }
      });
    } catch (error) {
      console.error('[onSubmit] Error en onSubmit:', error);
      addToast({ type: 'error', title: 'Error', message: 'Error inesperado: ' + String(error) });
    }
  }

  // Render Helpers
  const inputClass = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm";
  const labelClass = "block font-black text-slate-500 dark:text-slate-400 uppercase text-xs mb-1 ml-1";
  const errorClass = "text-red-500 text-xs mt-1 font-bold ml-1";

  const getValidationErrors = async (fase: number): Promise<string[]> => {
    const missingFields: string[] = [];
    
    if (fase === 1) {
      const data = formFase1.getValues();
      if (!data.nombre) missingFields.push('Nombre');
      if (!data.apellido) missingFields.push('Apellido');
      if (!data.email) missingFields.push('Email');
      if (!data.telefono) missingFields.push('Teléfono');
      if (!data.fecha_nacimiento) missingFields.push('Fecha de nacimiento');
      if (!data.genero) missingFields.push('Género');
      if (!data.nacionalidad) missingFields.push('Nacionalidad');
    } else if (fase === 2) {
      const data = formFase2.getValues();
      if (!data.plan_id || data.plan_id === 0) missingFields.push('Plan');
      if (tipoVenta === 'PORTABILIDAD') {
        if (!data.empresa_origen_id || data.empresa_origen_id === 0) missingFields.push('Empresa de origen');
        if (!data.numero_portar) missingFields.push('Número a portar');
        if (!data.mercado_origen) missingFields.push('Mercado de origen');
      }
    } else if (fase === 3 && chip === 'SIM') {
      const data = formFase3.getValues();
      if (!data.numero) missingFields.push('Teléfono de contacto');
      if (!data.direccion) missingFields.push('Dirección');
      if (!data.numero_casa) missingFields.push('Número');
      if (!data.localidad) missingFields.push('Localidad');
      if (!data.departamento) missingFields.push('Departamento');
      if (!data.codigo_postal) missingFields.push('Código postal');
    }
    
    return missingFields;
  };

  const nextFase = async () => {
    console.log('[nextFase] Fase actual:', fase, 'clienteEncontrado:', !!clienteEncontrado);
    if (fase === 1) {
        if (!clienteEncontrado) {
          console.log('[nextFase] No hay cliente encontrado, no avanza');
          addToast({ type: 'error', title: 'Error', message: 'Debe seleccionar o crear un cliente' });
          return;
        }
        const missing = await getValidationErrors(1);
        if (missing.length > 0) {
          addToast({ type: 'error', title: 'Faltan datos obligatorios', message: missing.join(', ') });
          return;
        }
        console.log('[nextFase] Avanzando a fase 2');
        setFase(2);
    } else if (fase === 2) {
        console.log('[nextFase] Validando fase 2...');
        
        const missing = await getValidationErrors(2);
        if (missing.length > 0) {
          console.log('[nextFase] Validación falló. Campos faltantes:', missing.join(', '));
          addToast({ type: 'error', title: 'Faltan datos obligatorios', message: missing.join(', ') });
          return;
        }
        
        // Si es ESIM, ir directamente al Resumen (fase 4)
        if (chip === 'ESIM') {
          console.log('[nextFase] ESIM seleccionado - ir a Resumen (fase 4)');
          setFase(4);
          return;
        }
        
        console.log('[nextFase] Avanzando a fase 3');
        setFase(3);
    } else if (fase === 3) {
        console.log('[nextFase] Validando fase 3...');
        
        const missing = await getValidationErrors(3);
        if (missing.length > 0) {
          console.log('[nextFase] Validación falló. Campos faltantes:', missing.join(', '));
          addToast({ type: 'error', title: 'Faltan datos obligatorios', message: missing.join(', ') });
          return;
        }
        
        console.log('[nextFase] Avanzando a fase 4 (Resumen)');
        setFase(4);
    }
  };

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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
             {[1, 2, 3].map((step) => (
                <button key={step} onClick={() => step < fase && setFase(step as Fase)} className={`flex-1 py-3 font-black uppercase text-sm tracking-wider transition-all ${fase === step ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>
                    {step === 1 ? 'Cliente' : step === 2 ? 'Venta' : chip === 'ESIM' ? 'Resumen' : 'Logística'}
                </button>
             ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {/* FASE 1 */}
            {fase === 1 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                             <label className={labelClass}>Tipo <span className="text-red-500">*</span></label>
                             <select {...formFase1.register('tipo_documento')} className={inputClass}>
                                <option value="DNI">DNI</option>
                                <option value="CUIL">CUIL</option>
                                <option value="CI">CI (Cédula Identidad)</option>
                                <option value="PASAPORTE">Pasaporte</option>
                                <option value="LC">LC (Libreta Circulación)</option>
                                <option value="LE">LE (Libreta Enrolamiento)</option>
                             </select>
                        </div>
                        <div className="col-span-2">
                             <label className={labelClass}>Documento <span className="text-red-500">*</span></label>
                             <div className="flex gap-2">
                                <input {...formFase1.register('documento')} className={inputClass} placeholder="12345678" />
                                <button type="button" onClick={handleBuscarCliente} disabled={isLoadingCliente} className="bg-indigo-600 text-white px-6 rounded-xl font-bold">Buscar</button>
                             </div>
                        </div>
                    </div>
                    
                    {clienteEncontrado ? (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 font-bold mb-4">
                                 ✓ Cliente: {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Nombre <span className="text-red-500">*</span></label><input {...formFase1.register('nombre')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Apellido <span className="text-red-500">*</span></label><input {...formFase1.register('apellido')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Email <span className="text-red-500">*</span></label><input {...formFase1.register('email')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Teléfono <span className="text-red-500">*</span></label><input {...formFase1.register('telefono')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Fecha Nac. <span className="text-red-500">*</span></label><input type="date" {...formFase1.register('fecha_nacimiento')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Género <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('genero')} className={inputClass} disabled>
                                        <option value="">Seleccionar...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </select>
                                </div>
                                <div className="col-span-2"><label className={labelClass}>Nacionalidad <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('nacionalidad')} className={inputClass} disabled>
                                        <option value="">Seleccionar...</option>
                                        <option value="ARGENTINA">Argentina</option>
                                        <option value="URUGUAY">Uruguay</option>
                                        <option value="PARAGUAY">Paraguay</option>
                                        <option value="BRASIL">Brasil</option>
                                        <option value="CHILE">Chile</option>
                                        <option value="BOLIVIA">Bolivia</option>
                                        <option value="PERU">Perú</option>
                                        <option value="COLOMBIA">Colombia</option>
                                        <option value="VENEZUELA">Venezuela</option>
                                        <option value="ECUADOR">Ecuador</option>
                                        <option value="ESPAÑA">España</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Nombre <span className="text-red-500">*</span></label><input {...formFase1.register('nombre')} className={inputClass} /></div>
                                <div><label className={labelClass}>Apellido <span className="text-red-500">*</span></label><input {...formFase1.register('apellido')} className={inputClass} /></div>
                                <div><label className={labelClass}>Email <span className="text-red-500">*</span></label><input {...formFase1.register('email')} className={inputClass} placeholder="correo@ejemplo.com" /></div>
                                <div><label className={labelClass}>Teléfono <span className="text-red-500">*</span></label><input {...formFase1.register('telefono')} inputMode="numeric" className={inputClass} /></div>
                                <div><label className={labelClass}>Fecha Nac. <span className="text-red-500">*</span></label><input type="date" {...formFase1.register('fecha_nacimiento')} className={inputClass} /></div>
                                <div><label className={labelClass}>Género <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('genero')} className={inputClass}>
                                        <option value="">Seleccionar...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </select>
                                </div>
                                <div className="col-span-2"><label className={labelClass}>Nacionalidad <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('nacionalidad')} className={inputClass}>
                                        <option value="">Seleccionar...</option>
                                        <option value="ARGENTINA">Argentina</option>
                                        <option value="URUGUAY">Uruguay</option>
                                        <option value="PARAGUAY">Paraguay</option>
                                        <option value="BRASIL">Brasil</option>
                                        <option value="CHILE">Chile</option>
                                        <option value="BOLIVIA">Bolivia</option>
                                        <option value="PERU">Perú</option>
                                        <option value="COLOMBIA">Colombia</option>
                                        <option value="VENEZUELA">Venezuela</option>
                                        <option value="ECUADOR">Ecuador</option>
                                        <option value="ESPAÑA">España</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" onClick={handleCrearCliente} disabled={isLoadingCliente} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Crear Cliente</button>
                        </div>
                    )}
                </div>
            )}

            {/* FASE 2 */}
            {fase === 2 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => formFase2.setValue('tipo_venta', 'LINEA_NUEVA')} className={`p-4 rounded-xl border-2 ${tipoVenta === 'LINEA_NUEVA' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                            📱 Línea Nueva
                        </button>
                        <button type="button" onClick={() => formFase2.setValue('tipo_venta', 'PORTABILIDAD')} className={`p-4 rounded-xl border-2 ${tipoVenta === 'PORTABILIDAD' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                            🔄 Portabilidad
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div><label className={labelClass}>SDS</label><input {...formFase2.register('sds')} className={inputClass} placeholder="SDS001" /></div>
                         <div><label className={labelClass}>STL <span className="text-xs text-slate-400">(Opcional - Solo números)</span></label><input {...formFase2.register('stl')} inputMode="numeric" disabled={chip === 'ESIM'} className={`${inputClass} ${chip === 'ESIM' ? 'opacity-50' : ''}`} placeholder={chip === 'ESIM' ? 'No aplica' : '123456'} /></div>
                    </div>

                    {tipoVenta === 'PORTABILIDAD' && (
                        <div>
                             <label className={labelClass}>Empresa Origen <span className="text-red-500">*</span></label>
                             <select {...formFase2.register('empresa_origen_id', { valueAsNumber: true })} className={inputClass}>
                                <option value={0}>Seleccionar...</option>
                                {empresas?.filter(e => e.empresa_origen_id !== 2).map(e => <option key={e.empresa_origen_id} value={e.empresa_origen_id}>{e.nombre_empresa}</option>)}
                             </select>
                             {formFase2.formState.errors.empresa_origen_id && <p className={errorClass}>{formFase2.formState.errors.empresa_origen_id.message}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className={labelClass}>Plan <span className="text-red-500">*</span></label>
                             <select {...formFase2.register('plan_id', { valueAsNumber: true })} className={inputClass}>
                                <option value={0}>Seleccionar...</option>
                                {filteredPlanes?.map(p => <option key={p.plan_id} value={p.plan_id}>{p.nombre} ({p.precio})</option>)}
                             </select>
                        </div>
                        <div>
                             <label className={labelClass}>Promoción</label>
                             <select {...formFase2.register('promocion_id', { valueAsNumber: true })} className={inputClass}>
                                <option value="">Sin promo</option>
                                {filteredPromociones?.map(p => <option key={p.promocion_id} value={p.promocion_id}>{p.nombre}</option>)}
                             </select>
                        </div>
                    </div>

                    {tipoVenta === 'PORTABILIDAD' && (
                        <div className="grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
                             <div><label className={labelClass}>SPN <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase2.register('spn')} className={inputClass} placeholder="Opcional" /></div>
                             <div><label className={labelClass}>Línea a Portar <span className="text-red-500">*</span></label><input {...formFase2.register('numero_portar')} inputMode="numeric" className={inputClass} placeholder="091123456" /></div>
                             <div><label className={labelClass}>PIN <span className="text-xs text-slate-400">(Opcional - 4 dígitos)</span></label><input {...formFase2.register('pin')} inputMode="numeric" maxLength={4} className={inputClass} placeholder="1234" /></div>
                             <div><label className={labelClass}>Vencimiento PIN</label><input type="date" {...formFase2.register('fecha_vencimiento_pin')} className={inputClass} /></div>
                             <div className="col-span-2">
                                 <label className={labelClass}>Mercado Origen <span className="text-red-500">*</span></label>
                                 <select {...formFase2.register('mercado_origen')} className={inputClass}>
                                     <option value="">Seleccionar...</option>
                                     <option value="PREPAGO">Prepago</option>
                                     <option value="POSPAGO">Pospago</option>
                                 </select>
                             </div>
                        </div>
                    )}
                    
                     <div className="grid grid-cols-2 gap-4">
                         <button type="button" onClick={() => formFase2.setValue('chip', 'SIM')} className={`p-4 rounded-xl border-2 ${chip === 'SIM' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>💳 SIM Física</button>
                         <button type="button" onClick={() => formFase2.setValue('chip', 'ESIM')} className={`p-4 rounded-xl border-2 ${chip === 'ESIM' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>📲 eSIM</button>
                    </div>
                </div>
            )}

            {/* FASE 3 */}
            {fase === 3 && (
                <div className="space-y-6">
                    {chip === 'SIM' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>SAP <span className="text-xs text-slate-400">(Opcional - Solo números)</span></label><input {...formFase3.register('sap')} inputMode="numeric" className={inputClass} placeholder="123456789" /></div>
                                <div><label className={labelClass}>Teléfono Contacto <span className="text-red-500">*</span></label><input {...formFase3.register('numero')} inputMode="numeric" className={inputClass} placeholder="091123456" /></div>
                                <div className="col-span-2"><label className={labelClass}>Dirección <span className="text-red-500">*</span></label><input {...formFase3.register('direccion')} className={inputClass} /></div>
                                <div><label className={labelClass}>Número <span className="text-red-500">*</span></label><input {...formFase3.register('numero_casa')} inputMode="numeric" className={inputClass} /></div>
                                <div><label className={labelClass}>Entre Calles</label><input {...formFase3.register('entre_calles')} className={inputClass} /></div>
                                <div><label className={labelClass}>Barrio</label><input {...formFase3.register('barrio')} className={inputClass} /></div>
                                <div><label className={labelClass}>Localidad <span className="text-red-500">*</span></label><input {...formFase3.register('localidad')} className={inputClass} /></div>
                                <div><label className={labelClass}>Departamento <span className="text-red-500">*</span></label><input {...formFase3.register('departamento')} className={inputClass} /></div>
                                <div><label className={labelClass}>CP <span className="text-red-500">*</span></label><input {...formFase3.register('codigo_postal')} inputMode="numeric" className={inputClass} placeholder="12345" /></div>
                                <div><label className={labelClass}>Tipo</label>
                                    <select {...formFase3.register('tipo')} className={inputClass}>
                                        <option value="RESIDENCIAL">Residencial</option>
                                        <option value="EMPRESARIAL">Empresarial</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Piso <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase3.register('piso')} className={inputClass} placeholder="Opcional" /></div>
                                <div><label className={labelClass}>Depto Número <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase3.register('departamento_numero')} className={inputClass} placeholder="Opcional" /></div>
                                <div><label className={labelClass}>Teléfono Alternativo</label><input {...formFase3.register('telefono_alternativo')} inputMode="numeric" className={inputClass} placeholder="Opcional" /></div>
                                <div className="col-span-2"><label className={labelClass}>Geolocalización</label><input {...formFase3.register('geolocalizacion')} className={inputClass} placeholder="Latitud,Longitud" /></div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-center">
                            <h3 className="font-bold text-indigo-800 dark:text-indigo-300">Venta de eSIM</h3>
                            <p className="text-indigo-600 dark:text-indigo-400">No se requieren datos de logística física.</p>
                        </div>
                    )}
                </div>
            )}

            {/* FASE 4 - RESUMEN */}
            {fase === 4 && (
                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border-l-4 border-indigo-500">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 text-lg mb-4">📋 Resumen de Venta</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                <p className="font-bold text-slate-500 text-xs uppercase">Cliente</p>
                                <p className="font-bold">{clienteEncontrado?.nombre} {clienteEncontrado?.apellido}</p>
                                <p className="text-slate-500">{clienteEncontrado?.email}</p>
                                <p className="text-slate-500">{clienteEncontrado?.telefono}</p>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                <p className="font-bold text-slate-500 text-xs uppercase">Venta</p>
                                <p className="font-bold">{tipoVenta}</p>
                                <p className="text-slate-500">Chip: {chip}</p>
                                <p className="font-bold text-indigo-600">{filteredPlanes?.find(p => p.plan_id === planId)?.nombre}</p>
                                <p className="font-bold">${filteredPlanes?.find(p => p.plan_id === planId)?.precio}</p>
                            </div>

                            {chip === 'SIM' && (
                                <div className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
                                    <p className="font-bold text-slate-500 text-xs uppercase">📍 Datos de Envío</p>
                                    <p>{formFase3.getValues('direccion')} {formFase3.getValues('numero')}</p>
                                    <p>{formFase3.getValues('localidad')}, {formFase3.getValues('departamento')}</p>
                                    <p>CP: {formFase3.getValues('codigo_postal')}</p>
                                    <p className="text-slate-500">Contacto: {formFase3.getValues('numero')}</p>
                                </div>
                            )}

                            {tipoVenta === 'PORTABILIDAD' && (
                                <div className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
                                    <p className="font-bold text-slate-500 text-xs uppercase">📱 Portabilidad</p>
                                    <p>Número a portar: {formFase2.getValues('numero_portar')}</p>
                                    <p>Mercado: {formFase2.getValues('mercado_origen')}</p>
                                    {formFase2.getValues('pin') && <p>PIN: {formFase2.getValues('pin')}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between shrink-0">
             {fase > 1 && <button onClick={() => setFase(prev => (prev - 1) as Fase)} className="px-6 py-3 font-bold text-slate-500">Atrás</button>}
             <div className="ml-auto">
                 {fase < 4 ? (
                     <button onClick={nextFase} disabled={fase === 1 && !clienteEncontrado} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300">Siguiente</button>
                 ) : (
                     <button 
                        onClick={() => {
                          console.log('[BOTON] Click en Confirmar Venta - fase:', fase, 'chip:', chip);
                          onSubmit();
                        }} 
                        disabled={createSaleMutation.isPending} 
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-slate-300"
                      >
                          {createSaleMutation.isPending ? 'Procesando...' : 'Confirmar Venta'}
                      </button>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};
