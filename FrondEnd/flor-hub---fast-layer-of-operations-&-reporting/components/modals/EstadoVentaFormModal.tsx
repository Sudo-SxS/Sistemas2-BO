import React, { useState } from 'react';
import { z } from 'zod';
import { Sale } from '../../types';

// Estados de venta según el schema
const ESTADOS_VENTA = [
  'PENDIENTE DE CARGA',
  'CREADO SIN DOCU',
  'CREADO DOCU OK',
  'EN TRANSPORTE',
  'ENTREGADO',
  'REPACTAR',
  'ACTIVADO NRO CLARO',
  'ACTIVADO NRO PORTADO',
  'AGENDADO',
  'APROBADO ABD',
  'CANCELADO',
  'CREADO',
  'EVALUANDO DONANTE',
  'PENDIENTE CARGA PIN',
  'PIN INGRESADO',
  'RECHAZADO ABD',
  'RECHAZADO DONANTE',
  'SPN CANCELADA',
] as const;

// Schema Zod para validación
const EstadoVentaFormSchema = z.object({
  estado: z.enum(ESTADOS_VENTA),
  descripcion: z.string().max(75, 'Máximo 75 caracteres').optional(),
});

type EstadoVentaFormData = z.infer<typeof EstadoVentaFormSchema>;

interface EstadoVentaFormModalProps {
  sale: Sale;
  onClose: () => void;
  onSubmit: (data: { estado: string; descripcion?: string }) => void;
}

export const EstadoVentaFormModal: React.FC<EstadoVentaFormModalProps> = ({ 
  sale, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<EstadoVentaFormData>({
    estado: 'PENDIENTE DE CARGA',
    descripcion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof EstadoVentaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo
    const fieldSchema = EstadoVentaFormSchema.shape[field];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [field]: result.error.issues[0].message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = EstadoVentaFormSchema.safeParse(formData);
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

    onSubmit({
      estado: formData.estado,
      descripcion: formData.descripcion || undefined,
    });
  };

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getTextareaClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-medium outline-none transition-all resize-none ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5">
        
        {/* Header con gradiente */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">
              Cambiar Estado de Venta
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">
              Venta: {sale.id} • {sale.customerName}
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
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl p-4">
              <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1">
                Estado Actual
              </p>
              <p className="text-lg font-black text-indigo-900 dark:text-indigo-200 uppercase">
                {sale.status}
              </p>
            </div>

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
                {ESTADOS_VENTA.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {touched.estado && errors.estado && (
                <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.estado}</span>
              )}
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Descripción / Observaciones
              </label>
              <textarea 
                value={formData.descripcion}
                onChange={e => handleChange('descripcion', e.target.value)}
                className={getTextareaClass('descripcion')}
                placeholder="Agrega detalles sobre el cambio de estado..."
                rows={4}
                maxLength={75}
              />
              <div className="flex justify-between">
                {touched.descripcion && errors.descripcion && (
                  <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.descripcion}</span>
                )}
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 ml-auto">
                  {formData.descripcion?.length || 0}/75
                </span>
              </div>
            </div>

            {/* Info del cambio */}
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-4">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                Este cambio será registrado en el historial de la venta
              </p>
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
              className="px-12 py-4 rounded-[22px] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
            >
              Actualizar Estado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
