
import React from 'react';
import { SaleStatus, LogisticStatus, LineStatus } from '../types';

interface UpdateMenuProps {
  selectedCount: number;
  onUpdateStatus: (status: SaleStatus) => void;
  onUpdateLogistic: (status: LogisticStatus) => void;
  onUpdateLine: (status: LineStatus) => void;
  onClear: () => void;
}

export const UpdateMenu: React.FC<UpdateMenuProps> = ({ selectedCount, onUpdateStatus, onUpdateLogistic, onUpdateLine, onClear }) => {
  return (
    <div className="fixed bottom-[5vh] left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 ease-out w-full max-w-[95vw] px-[2vw]">
      <div className="bg-white/90 dark:bg-slate-900/98 backdrop-blur-3xl border border-slate-200 dark:border-white/15 rounded-[4vh] p-[3.5vh] shadow-[0_5vh_10vh_-2vh_rgba(0,0,0,0.1)] dark:shadow-[0_5vh_10vh_-2vh_rgba(0,0,0,0.6)] flex items-center justify-between gap-[3vh] overflow-x-auto lg:overflow-visible no-scrollbar">
        
        {/* Counter Section */}
        <div className="flex items-center gap-[2vh] pr-[3vh] border-r border-white/10 shrink-0">
          <div className="relative">
            <div className="w-[7vh] h-[7vh] rounded-[2vh] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[clamp(1.5rem,2.8vh,2.5rem)] shadow-[0_1.5vh_3vh_-1vh_rgba(79,70,229,0.5)]">
              {selectedCount}
            </div>
            <div className="absolute -top-[0.5vh] -right-[0.5vh] w-[1.5vh] h-[1.5vh] bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <p className="font-black text-indigo-500 dark:text-indigo-300 uppercase tracking-[0.2em] leading-none text-[clamp(0.6rem,1.1vh,0.9rem)]">Ventas</p>
            <p className="font-black text-slate-800 dark:text-white uppercase tracking-widest mt-[0.5vh] text-[clamp(0.6rem,1.1vh,0.9rem)]">Seleccionadas</p>
            <button onClick={onClear} className="font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 uppercase mt-[1vh] transition-colors flex items-center gap-[0.5vh] text-[clamp(0.5rem,0.9vh,0.75rem)]">
              <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              Cancelar
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-1 items-center gap-[3vh] justify-center">
          {/* Status Venta */}
          <div className="flex flex-col gap-[1vh] min-w-[18vw]">
            <label className="font-black text-slate-500 uppercase tracking-[0.2em] ml-[1vh] text-[clamp(0.55rem,0.95vh,0.8rem)]">1. Status Venta</label>
            <div className="relative group">
              <select 
                className="w-full h-[6.5vh] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.8vh] px-[1.5vw] font-black text-slate-900 dark:text-white outline-none cursor-pointer hover:bg-white dark:hover:bg-white/10 hover:border-indigo-500 transition-all uppercase appearance-none text-[clamp(0.8rem,1.3vh,1.1rem)]"
                onChange={(e) => e.target.value !== "" && onUpdateStatus(e.target.value as SaleStatus)}
                value=""
              >
                <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">Actualizar...</option>
                {Object.values(SaleStatus).map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900">{s.replace('_', ' ')}</option>)}
              </select>
              <div className="absolute right-[1vw] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/40">
                <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Seguimiento Línea */}
          <div className="flex flex-col gap-[1vh] min-w-[18vw]">
            <label className="font-black text-indigo-400/80 uppercase tracking-[0.2em] ml-[1vh] text-[clamp(0.55rem,0.95vh,0.8rem)]">2. Seguimiento Línea</label>
            <div className="relative">
              <select 
                className="w-full h-[6.5vh] bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-[1.8vh] px-[1.5vw] font-black text-indigo-900 dark:text-white outline-none cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/10 hover:border-indigo-400 transition-all uppercase appearance-none text-[clamp(0.8rem,1.3vh,1.1rem)]"
                onChange={(e) => e.target.value !== "" && onUpdateLine(e.target.value as LineStatus)}
                value=""
              >
                <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">Actualizar...</option>
                {Object.values(LineStatus).map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900">{s}</option>)}
              </select>
              <div className="absolute right-[1vw] top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400/50">
                <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Correo / Logística */}
          <div className="flex flex-col gap-[1vh] min-w-[18vw]">
            <label className="font-black text-purple-400/80 uppercase tracking-[0.2em] ml-[1vh] text-[clamp(0.55rem,0.95vh,0.8rem)]">3. Estado Correo</label>
            <div className="relative">
              <select 
                className="w-full h-[6.5vh] bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-[1.8vh] px-[1.5vw] font-black text-purple-900 dark:text-white outline-none cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-500/10 hover:border-purple-400 transition-all uppercase appearance-none text-[clamp(0.8rem,1.3vh,1.1rem)]"
                onChange={(e) => e.target.value !== "" && onUpdateLogistic(e.target.value as LogisticStatus)}
                value=""
              >
                <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">Actualizar...</option>
                {Object.values(LogisticStatus).map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900">{s}</option>)}
              </select>
              <div className="absolute right-[1vw] top-1/2 -translate-y-1/2 pointer-events-none text-purple-400/50">
                <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Group Section */}
        <div className="pl-[3vh] border-l border-slate-200 dark:border-white/10 shrink-0">
          <button className="w-[8vh] h-[8vh] rounded-[2.2vh] bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20 group shadow-2xl flex items-center justify-center" title="Eliminar Selección">
            <svg className="w-[3.5vh] h-[3.5vh] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>

      </div>
    </div>
  );
};
