import React, { useState } from 'react';
import { z } from 'zod';
import { Sale } from '../../types';

// Schema Zod para validación del correo
const CorreoFormSchema = z.object({
  // Obligatorios
  sap_id: z.string()
    .min(1, 'SAP ID es requerido')
    .max(255, 'Máximo 255 caracteres')
    .transform(val => val.toUpperCase()),
  
  telefono_contacto: z.string()
    .min(1, 'Teléfono de contacto es requerido')
    .max(20, 'Máximo 20 caracteres'),
  
  destinatario: z.string()
    .min(1, 'Destinatario es requerido')
    .max(255, 'Máximo 255 caracteres'),
  
  direccion: z.string()
    .min(1, 'Dirección es requerida')
    .max(255, 'Máximo 255 caracteres'),
  
  numero_casa: z.number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo'),
  
  localidad: z.string()
    .min(1, 'Localidad es requerida')
    .max(255, 'Máximo 255 caracteres'),
  
  departamento: z.string()
    .min(1, 'Departamento es requerido')
    .max(255, 'Máximo 255 caracteres'),
  
  codigo_postal: z.number()
    .int('Debe ser un número entero')
    .min(1000, 'Código postal inválido')
    .max(9999, 'Código postal inválido'),
  
  // Opcionales
  telefono_alternativo: z.string().max(20, 'Máximo 20 caracteres').optional(),
  persona_autorizada: z.string().max(255, 'Máximo 255 caracteres').optional(),
  entre_calles: z.string().max(255, 'Máximo 255 caracteres').optional(),
  barrio: z.string().max(255, 'Máximo 255 caracteres').optional(),
  piso: z.string().max(255, 'Máximo 255 caracteres').optional(),
  departamento_numero: z.string().max(255, 'Máximo 255 caracteres').optional(),
  geolocalizacion: z.string().max(255, 'Máximo 255 caracteres').optional(),
  comentario_cartero: z.string().max(255, 'Máximo 255 caracteres').optional(),
});

type CorreoFormData = z.infer<typeof CorreoFormSchema>;

interface CorreoFormModalProps {
  sale?: Sale;
  onClose: () => void;
  onSubmit: (data: CorreoFormData) => void;
}

export const CorreoFormModal: React.FC<CorreoFormModalProps> = ({ 
  sale, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Partial<CorreoFormData>>({
    sap_id: sale?.id || '',
    telefono_contacto: sale?.phoneNumber || '',
    destinatario: sale?.customerName || '',
    direccion: '',
    numero_casa: undefined,
    localidad: '',
    departamento: '',
    codigo_postal: undefined,
    telefono_alternativo: '',
    persona_autorizada: '',
    entre_calles: '',
    barrio: '',
    piso: '',
    departamento_numero: '',
    geolocalizacion: '',
    comentario_cartero: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof CorreoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo
    const fieldSchema = CorreoFormSchema.shape[field];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors(prev => ({ ...prev, [field]: result.error.issues[0].message }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = CorreoFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    onSubmit(result.data);
  };

  const getInputClass = (field: string, isOptional = false) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5 max-h-[90vh] flex flex-col">
        
        {/* Header con gradiente */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">
              {sale ? 'Editar Correo' : 'Nuevo Correo'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">
              Gestión de Envíos y Logística
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/20 hover:bg-white/40 rounded-2xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto flex-1 no-scrollbar">
          <div className="space-y-8">
            
            {/* Sección: Identificación */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Identificación del Envío
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    SAP ID <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.sap_id}
                    onChange={e => handleChange('sap_id', e.target.value.toUpperCase())}
                    className={`${getInputClass('sap_id')} uppercase`}
                    placeholder="SAP-XXXXXX"
                  />
                  {touched.sap_id && errors.sap_id && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.sap_id}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Destinatario <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.destinatario}
                    onChange={e => handleChange('destinatario', e.target.value)}
                    className={getInputClass('destinatario')}
                    placeholder="Nombre completo"
                  />
                  {touched.destinatario && errors.destinatario && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.destinatario}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Información de Contacto
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Teléfono Contacto <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={formData.telefono_contacto}
                    onChange={e => handleChange('telefono_contacto', e.target.value)}
                    className={getInputClass('telefono_contacto')}
                    placeholder="+54 11 1234-5678"
                  />
                  {touched.telefono_contacto && errors.telefono_contacto && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.telefono_contacto}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Teléfono Alternativo
                  </label>
                  <input 
                    type="tel" 
                    value={formData.telefono_alternativo}
                    onChange={e => handleChange('telefono_alternativo', e.target.value)}
                    className={getInputClass('telefono_alternativo')}
                    placeholder="+54 11 9876-5432"
                  />
                  {touched.telefono_alternativo && errors.telefono_alternativo && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.telefono_alternativo}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Persona Autorizada a Recibir
                </label>
                <input 
                  type="text" 
                  value={formData.persona_autorizada}
                  onChange={e => handleChange('persona_autorizada', e.target.value)}
                  className={getInputClass('persona_autorizada')}
                  placeholder="Nombre de quien puede recibir si no está el destinatario"
                />
                {touched.persona_autorizada && errors.persona_autorizada && (
                  <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.persona_autorizada}</span>
                )}
              </div>
            </div>

            {/* Sección: Dirección */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Dirección de Entrega
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Calle / Dirección <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.direccion}
                    onChange={e => handleChange('direccion', e.target.value)}
                    className={getInputClass('direccion')}
                    placeholder="Av. Corrientes"
                  />
                  {touched.direccion && errors.direccion && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.direccion}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Número <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={formData.numero_casa || ''}
                    onChange={e => handleChange('numero_casa', e.target.value ? Number(e.target.value) : undefined)}
                    className={getInputClass('numero_casa')}
                    placeholder="1234"
                  />
                  {touched.numero_casa && errors.numero_casa && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.numero_casa}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Piso
                  </label>
                  <input 
                    type="text" 
                    value={formData.piso}
                    onChange={e => handleChange('piso', e.target.value)}
                    className={getInputClass('piso')}
                    placeholder="3"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Departamento
                  </label>
                  <input 
                    type="text" 
                    value={formData.departamento_numero}
                    onChange={e => handleChange('departamento_numero', e.target.value)}
                    className={getInputClass('departamento_numero')}
                    placeholder="B"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Entre Calles
                </label>
                <input 
                  type="text" 
                  value={formData.entre_calles}
                  onChange={e => handleChange('entre_calles', e.target.value)}
                  className={getInputClass('entre_calles')}
                  placeholder="Entre Av. Callao y Av. Pueyrredón"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Barrio
                  </label>
                  <input 
                    type="text" 
                    value={formData.barrio}
                    onChange={e => handleChange('barrio', e.target.value)}
                    className={getInputClass('barrio')}
                    placeholder="San Nicolás"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Localidad <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.localidad}
                    onChange={e => handleChange('localidad', e.target.value)}
                    className={getInputClass('localidad')}
                    placeholder="Buenos Aires"
                  />
                  {touched.localidad && errors.localidad && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.localidad}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Departamento/Provincia <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.departamento}
                    onChange={e => handleChange('departamento', e.target.value)}
                    className={getInputClass('departamento')}
                    placeholder="Capital Federal"
                  />
                  {touched.departamento && errors.departamento && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.departamento}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Código Postal <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={formData.codigo_postal || ''}
                    onChange={e => handleChange('codigo_postal', e.target.value ? Number(e.target.value) : undefined)}
                    className={getInputClass('codigo_postal')}
                    placeholder="1043"
                  />
                  {touched.codigo_postal && errors.codigo_postal && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.codigo_postal}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Geolocalización (Coordenadas)
                </label>
                <input 
                  type="text" 
                  value={formData.geolocalizacion}
                  onChange={e => handleChange('geolocalizacion', e.target.value)}
                  className={getInputClass('geolocalizacion')}
                  placeholder="-34.6037, -58.3816"
                />
              </div>
            </div>

            {/* Sección: Comentarios */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Comentarios para el Cartero
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Instrucciones Especiales
                </label>
                <textarea 
                  value={formData.comentario_cartero}
                  onChange={e => handleChange('comentario_cartero', e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition-all resize-none bg-white dark:bg-slate-800 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30"
                  placeholder="Tocar timbre, dejar en portería, llamar antes de entregar..."
                  rows={3}
                  maxLength={255}
                />
                <span className="text-[9px] font-bold text-slate-400 ml-auto">
                  {formData.comentario_cartero?.length || 0}/255
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center pb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Validación de dirección activa
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-12 py-4 rounded-[22px] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
              >
                Guardar Correo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
