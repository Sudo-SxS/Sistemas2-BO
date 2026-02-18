import React, { useState, useEffect } from 'react';
import { SaleStatus, LogisticStatus } from '../../types';

interface UpdateMenuProps {
  selectedCount: number;
  onUpdateBoth: (saleStatus: SaleStatus | null, logisticStatus: LogisticStatus | null) => void;
  onClear: () => void;
  isUpdating?: boolean;
}

export const UpdateMenu: React.FC<UpdateMenuProps> = ({ selectedCount, onUpdateBoth, onClear, isUpdating = false }) => {
  const [selectedSaleStatus, setSelectedSaleStatus] = useState<SaleStatus | ''>('');
  const [selectedLogisticStatus, setSelectedLogisticStatus] = useState<LogisticStatus | ''>('');

  useEffect(() => {
    // console.log('SaleStatus values:', Object.values(SaleStatus));
    // console.log('LogisticStatus values:', Object.values(LogisticStatus));
  }, []);

  const handleApply = () => {
    console.log('[DEBUG UpdateMenu] handleApply - selectedSaleStatus:', selectedSaleStatus);
    console.log('[DEBUG UpdateMenu] handleApply - selectedLogisticStatus:', selectedLogisticStatus);
    console.log('[DEBUG UpdateMenu] handleApply - selectedCount:', selectedCount);
    
    // Llamar a onUpdateBoth con ambos estados seleccionados (pueden ser null)
    onUpdateBoth(
      selectedSaleStatus || null,
      selectedLogisticStatus || null
    );
    setSelectedSaleStatus('');
    setSelectedLogisticStatus('');
  };

  const canApply = selectedSaleStatus || selectedLogisticStatus;

  return (
    <div className="fixed bottom-[5vh] left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 ease-out w-full max-w-[95vw] px-[2vw]">
      <div className="bg-white/90 dark:bg-slate-800 backdrop-blur-3xl border border-slate-200 dark:border-slate-700 rounded-[4vh] p-[3.5vh] shadow-[0_5vh_10vh_-2vh_rgba(0,0,0,0.1)] dark:shadow-[0_5vh_10vh_-2vh_rgba(0,0,0,0.6)] flex items-center justify-between gap-[3vh] overflow-x-auto lg:overflow-visible no-scrollbar">

        {/* Counter Section */}
        <div className="flex items-center gap-[2vh] pr-[3vh] border-r border-slate-200 dark:border-slate-700 shrink-0">
          <div className="relative">
            <div className="w-[7vh] h-[7vh] rounded-[2vh] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[clamp(1.5rem,2.8vh,2.5rem)] shadow-[0_1.5vh_3vh_-1vh_rgba(79,70,229,0.5)]">
              {selectedCount}
            </div>
            <div className="absolute -top-[0.5vh] -right-[0.5vh] w-[1.5vh] h-[1.5vh] bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
          </div>
          <div>
            <p className="font-black text-indigo-500 dark:text-indigo-300 uppercase tracking-[0.2em] leading-none text-[clamp(0.6rem,1.1vh,0.9rem)]">Ventas</p>
            <p className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mt-[0.5vh] text-[clamp(0.6rem,1.1vh,0.9rem)]">Seleccionadas</p>
            <button onClick={onClear} className="font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 uppercase mt-[1vh] transition-colors flex items-center gap-[0.5vh] text-[clamp(0.5rem,0.9vh,0.75rem)]">
              <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              Cancelar
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-1 items-center gap-[3vh] justify-center">
          {/* Estado de Venta */}
          <div className="flex flex-col gap-[1vh] min-w-[20vw]">
            <label className="font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-[0.2em] ml-[1vh] text-[clamp(0.55rem,0.95vh,0.8rem)]">1. Estado de Venta</label>
            <div className="relative group">
              <select
                className="w-full h-[6.5vh] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[1.8vh] px-[1.5vw] font-black text-slate-900 dark:text-slate-100 outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-600 hover:border-indigo-500 transition-all uppercase appearance-none text-[clamp(0.8rem,1.3vh,1.1rem)]"
                onChange={(e) => {
                  const v = e.target.value as SaleStatus | '';
                  setSelectedSaleStatus(v);
                }}
                value={selectedSaleStatus}
              >
                <option value="">Sin cambio</option>
                {Object.values(SaleStatus).map(s => <option key={s} value={s} className="uppercase">{s.replace(/_/g, ' ')}</option>)}
              </select>
              <div className="absolute right-[1vw] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-300">
                <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Estado de Correo */}
          <div className="flex flex-col gap-[1vh] min-w-[20vw]">
            <label className="font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-[0.2em] ml-[1vh] text-[clamp(0.55rem,0.95vh,0.8rem)]">2. Estado de Correo</label>
            <div className="relative">
              <select
                className="w-full h-[6.5vh] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[1.8vh] px-[1.5vw] font-black text-slate-900 dark:text-slate-100 outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-600 hover:border-indigo-500 transition-all uppercase appearance-none text-[clamp(0.8rem,1.3vh,1.1rem)]"
                onChange={(e) => {
                  const v = e.target.value as LogisticStatus | '';
                  setSelectedLogisticStatus(v);
                }}
                value={selectedLogisticStatus}
              >
                <option value="">Sin cambio</option>
                {Object.values(LogisticStatus).map(s => <option key={s} value={s} className="uppercase">{s.replace(/_/g, ' ')}</option>)}
              </select>
              <div className="absolute right-[1vw] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-300">
                <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Single Apply Button */}
        <div className="pl-[2vh] shrink-0 flex items-center">
          <button onClick={handleApply} disabled={!canApply || isUpdating} className="px-6 py-3 rounded-[1.6vh] bg-emerald-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition">{isUpdating ? 'Actualizando...' : 'Aplicar'}</button>
        </div>
      </div>
    </div>
  );
};