import React, { useState } from 'react';
import { z } from 'zod';

// Estados de correo según el schema
const ESTADOS_CORREO = [
  'INICIAL',
  'ASIGNADO',
  'DEVUELTO AL CLIENTE',
  'EN DEVOLUCION',
  'EN TRANSITO',
  'ENTREGADO',
  'INGRESADO CENTRO LOGISTICO - ECOMMERCE',
  'INGRESADO EN AGENCIA',
  'INGRESADO PICK UP CENTER UES',
  'NO ENTREGADO',
  'PIEZA EXTRAVIADA',
  'RENDIDO AL CLIENTE',
] as const;

// Schema Zod para validación
const EstadoCorreoFormSchema = z.object({
  estado: z.enum(ESTADOS_CORREO),
  descripcion: z.string().max(255, 'Máximo 255 caracteres').optional(),
  ubicacion_actual: z.string().max(255, 'Máximo 255 caracteres').optional(),
});

type EstadoCorreoFormData = z.infer<typeof EstadoCorreoFormSchema>;

interface EstadoCorreoFormModalProps {
  sapId?: string;
  currentEstado?: string;
  onClose: () => void;
  onSubmit: (data: EstadoCorreoFormData) => void;
}

export const EstadoCorreoFormModal: React.FC<EstadoCorreoFormModalProps> = ({ 
  sapId, 
  currentEstado,
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<EstadoCorreoFormData>({
    estado: 'INICIAL',
    descripcion: '',
    ubicacion_actual: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof EstadoCorreoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo
    const fieldSchema = EstadoCorreoFormSchema.shape[field];
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
    
    const result = EstadoCorreoFormSchema.safeParse(formData);
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

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getInputClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getTextareaClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all resize-none ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5">
        
        {/* Header con gradiente */}
        <div className="p-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">
              Actualizar Estado de Correo
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">
              {sapId ? `SAP: ${sapId}` : 'Gestión Logística'}
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

        <form onSubmit={handleSubmit} className="p-10 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="space-y-6">
            
            {/* Estado actual info */}
            {currentEstado && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40 rounded-2xl p-4">
                <p className="text-[10px] font-black text-purple-400 dark:text-purple-500 uppercase tracking-widest mb-1">
                  Estado Actual
                </p>
                <p className="text-lg font-black text-purple-900 dark:text-purple-200 uppercase">
                  {currentEstado}
                </p>
              </div>
            )}

            {/* Nuevo Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Nuevo Estado <span className="text-rose-500">*</span>
              </label>
              <select 
                value={formData.estado}
                onChange={e => handleChange('estado', e.target.value)}
                className={getSelectClass('estado')}
              >
                {ESTADOS_CORREO.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {touched.estado && errors.estado && (
                <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.estado}</span>
              )}
            </div>

            {/* Ubicación Actual */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Ubicación Actual
              </label>
              <input 
                type="text" 
                value={formData.ubicacion_actual}
                onChange={e => handleChange('ubicacion_actual', e.target.value)}
                className={getInputClass('ubicacion_actual')}
                placeholder="Centro de distribución Buenos Aires, Sucursal Córdoba..."
              />
              {touched.ubicacion_actual && errors.ubicacion_actual && (
                <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.ubicacion_actual}</span>
              )}
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Descripción / Detalles
              </label>
              <textarea 
                value={formData.descripcion}
                onChange={e => handleChange('descripcion', e.target.value)}
                className={getTextareaClass('descripcion')}
                placeholder="Detalles adicionales sobre el estado..."
                rows={4}
                maxLength={255}
              />
              <div className="flex justify-between">
                {touched.descripcion && errors.descripcion && (
                  <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.descripcion}</span>
                )}
                <span className="text-[9px] font-bold text-slate-400 ml-auto">
                  {formData.descripcion?.length || 0}/255
                </span>
              </div>
            </div>

            {/* Info según estado seleccionado */}
            <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Información del Estado
              </p>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 space-y-1">
                {formData.estado === 'INICIAL' && (
                  <p>El envío ha sido registrado en el sistema pero aún no ha sido procesado.</p>
                )}
                {formData.estado === 'ASIGNADO' && (
                  <p>El paquete ha sido asignado a un repartidor o agencia de correo.</p>
                )}
                {formData.estado === 'EN TRANSITO' && (
                  <p>El paquete está en camino hacia su destino final.</p>
                )}
                {formData.estado === 'ENTREGADO' && (
                  <p>El paquete ha sido entregado exitosamente al destinatario.</p>
                )}
                {formData.estado === 'NO ENTREGADO' && (
                  <p>No se pudo realizar la entrega. Se programará un nuevo intento.</p>
                )}
                {formData.estado === 'DEVUELTO AL CLIENTE' && (
                  <p>El paquete ha sido devuelto al remitente.</p>
                )}
                {formData.estado === 'PIEZA EXTRAVIADA' && (
                  <p>Alerta: El paquete se encuentra extraviado. Iniciar investigación.</p>
                )}
                {!['INICIAL', 'ASIGNADO', 'EN TRANSITO', 'ENTREGADO', 'NO ENTREGADO', 'DEVUELTO AL CLIENTE', 'PIEZA EXTRAVIADA'].includes(formData.estado) && (
                  <p>Estado: {formData.estado}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-12 py-4 rounded-[22px] bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-200 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all"
            >
              Actualizar Estado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
