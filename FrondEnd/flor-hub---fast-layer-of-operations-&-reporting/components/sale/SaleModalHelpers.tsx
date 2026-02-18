
import React, { memo } from 'react';

// Tipos necesarios
type TabType = 'venta' | 'cliente' | 'plan' | 'correo' | 'estados';

// Helper para colores de estado
export const getStatusColor = (status: string) => {
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
export const EditableField = memo(({ 
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
  onEdit?: (field: string, value: any) => void;
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

  if (type === 'select' && options && onEdit) {
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

  if (onEdit) {
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
  }
  return null;
});

// Componente de encabezado de sección
export const SectionHeader = memo(({ title, icon }: { title: string; icon: string }) => (
  <div className="flex items-center gap-[2vh] mb-[3vh] mt-[5vh] first:mt-0 px-2">
    <div className="w-[5vh] h-[5vh] rounded-[1.8vh] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[2.2vh] shadow-inner text-indigo-600 dark:text-indigo-400">
      {icon}
    </div>
    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.15em] text-[clamp(0.8rem,1.5vh,1.8rem)]">{title}</h4>
    <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent ml-[2vh]"></div>
  </div>
));
