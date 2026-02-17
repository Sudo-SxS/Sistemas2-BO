
import React from 'react';
import { SaleStatus, LogisticStatus, ProductType, OriginMarket } from '../../types';

interface AdvancedFiltersProps {
  onClose: () => void;
  filters: any;
  setFilters: (filters: any) => void;
  uniqueAdvisors: string[];
  planes?: any[];
  promociones?: any[];
  empresasOrigen?: any[];
  celulas?: number[];
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  onClose, 
  filters, 
  setFilters, 
  uniqueAdvisors,
  planes = [],
  promociones = [],
  empresasOrigen = [],
  celulas = []
}) => {
  // Función para toggle de filtros (permite seleccionar múltiples)
  const toggleFilterValue = (key: string, value: string) => {
    setFilters((prev: any) => {
      const current = prev[key];
      
      // Si es "TODOS", resetear
      if (value === 'TODOS') {
        return { ...prev, [key]: 'TODOS' };
      }
      
      // Convertir a array si no lo es
      let arr: string[] = [];
      if (current === 'TODOS' || !current) {
        arr = [];
      } else if (Array.isArray(current)) {
        arr = [...current];
      } else {
        arr = [current];
      }
      
      // Toggle: si existe, remover; si no existe, agregar
      const isSelected = arr.includes(value);
      
      if (isSelected) {
        arr = arr.filter(v => v !== value);
      } else {
        arr = [...arr, value];
      }
      
      // Si quedó vacío, volver a TODOS
      return { ...prev, [key]: arr.length === 0 ? 'TODOS' : arr };
    });
  };

  // Función helper para verificar si un valor está seleccionado
  const isSelected = (key: string, value: string): boolean => {
    const current = filters[key];
    if (current === 'TODOS' || !current) return false;
    if (Array.isArray(current)) return current.includes(value);
    return current === value;
  };

  // Función para actualizar filtros simples (no multi)
  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'TODOS',
      logisticStatus: 'TODOS',
      productType: 'TODOS',
      originMarket: 'TODOS',
      advisor: 'TODOS',
      plan: 'TODOS',
      promotion: 'TODOS',
      empresaOrigen: 'TODOS',
      correoStatus: 'TODOS',
      celula: 'TODOS'
    });
  };

  // Estados de correo/logística disponibles
  const estadosCorreoLogistica = ['INICIAL', 'IMPRESO', 'EN_REPARTO', 'ENTREGADO', 'RECLAMO', 'DESISTIDO'];

  return (
    <div 
      className="absolute top-24 right-0 w-full lg:w-[1100px] glass-panel rounded-[40px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] z-[200] border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-500"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black italic tracking-tighter uppercase">Panel de Inteligencia de Filtros</h3>
          <p className="text-[10px] font-black text-indigo-200 dark:text-indigo-400 uppercase tracking-[0.2em] mt-1">Refina tu búsqueda operacional</p>
        </div>
        <button onClick={onClose} className="relative z-10 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/40 transition-all group flex items-center justify-center">
           <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-white/98 dark:bg-slate-900/95 backdrop-blur-2xl">
        
        {/* Categoría: Estado de Venta */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Estado de Venta</p>
          <div className="flex flex-wrap gap-2">
            {['TODOS', ...Object.values(SaleStatus)].map(s => (
              <button 
                key={s}
                onClick={() => toggleFilterValue('status', s)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${isSelected('status', s) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40 scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría: Estado de Correo / Logística */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Estado de Correo / Logística</p>
          <div className="flex flex-wrap gap-2">
            {['TODOS', ...estadosCorreoLogistica].map(s => (
              <button 
                key={s}
                onClick={() => toggleFilterValue('logisticStatus', s)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${isSelected('logisticStatus', s) ? 'bg-amber-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría: Tipo de Producto */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Tipo de Producto</p>
          <div className="flex flex-wrap gap-2">
            {['TODOS', ...Object.values(ProductType)].map(p => (
              <button 
                key={p}
                onClick={() => toggleFilterValue('productType', p)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${isSelected('productType', p) ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría: Mercado Origen */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Mercado de Origen</p>
          <div className="flex flex-wrap gap-2">
            {['TODOS', ...Object.values(OriginMarket)].map(m => (
              <button 
                key={m}
                onClick={() => toggleFilterValue('originMarket', m)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${isSelected('originMarket', m) ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría: Empresa Origen */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Empresa de Origen</p>
          <select 
            value={Array.isArray(filters.empresaOrigen) ? filters.empresaOrigen[0] : filters.empresaOrigen}
            onChange={(e) => toggleFilterValue('empresaOrigen', e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none hover:border-indigo-400 transition-all uppercase appearance-none cursor-pointer"
          >
            <option value="TODOS">TODAS LAS EMPRESAS</option>
            {empresasOrigen.map(e => <option key={e.empresa_origen_id} value={e.empresa_origen_id}>{e.nombre_empresa || e.nombre}</option>)}
          </select>
        </div>

        {/* Categoría: Célula */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Célula</p>
          <select 
            value={filters.celula}
            onChange={(e) => updateFilter('celula', e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none hover:border-indigo-400 transition-all uppercase appearance-none cursor-pointer"
          >
            <option value="TODOS">TODAS LAS CÉLULAS</option>
            {celulas.map(c => <option key={c} value={c}>Célula {c}</option>)}
          </select>
        </div>

        {/* Categoría: Asesor */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Asesor Responsable</p>
          <select 
            value={filters.advisor}
            onChange={(e) => updateFilter('advisor', e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none hover:border-indigo-400 transition-all uppercase appearance-none cursor-pointer"
          >
            <option value="TODOS">TODOS LOS ASESORES</option>
            {uniqueAdvisors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Categoría: Plan */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Plan</p>
          <select 
            value={filters.plan}
            onChange={(e) => updateFilter('plan', e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none hover:border-indigo-400 transition-all uppercase appearance-none cursor-pointer"
          >
            <option value="TODOS">TODOS LOS PLANES</option>
            {planes.map(p => <option key={p.plan_id} value={p.nombre}>{p.nombre} - {p.gigabyte}GB</option>)}
          </select>
        </div>

        {/* Categoría: Promoción */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Promoción</p>
          <select 
            value={filters.promotion}
            onChange={(e) => updateFilter('promotion', e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[11px] font-black text-slate-800 dark:text-slate-200 outline-none hover:border-indigo-400 transition-all uppercase appearance-none cursor-pointer"
          >
            <option value="TODOS">TODAS LAS PROMOCIONES</option>
            {promociones.map(p => <option key={p.promocion_id} value={p.nombre}>{p.nombre} {p.descuento ? `(-${p.descuento}%)` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button 
          onClick={clearFilters}
          className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 hover:text-rose-500 transition-all"
        >
          Limpiar Configuración
        </button>
        <button 
          onClick={onClose}
          className="px-10 py-4 rounded-[24px] bg-indigo-600 dark:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 transition-all active:scale-95"
        >
          Cerrar & Aplicar
        </button>
      </div>
    </div>
  );
};
