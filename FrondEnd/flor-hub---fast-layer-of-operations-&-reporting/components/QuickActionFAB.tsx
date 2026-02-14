
import React, { useState } from 'react';

interface QuickActionFABProps {
  onAction: (type: 'PORTA' | 'LN') => void;
}

export const QuickActionFAB: React.FC<QuickActionFABProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[4vh] left-[3vw] z-50 flex flex-col items-start gap-[1.5vh]">
      {isOpen && (
        <div className="flex flex-col gap-[1.2vh] mb-[1.2vh] animate-in fade-in slide-in-from-bottom-6 duration-300">
          <button 
            className="flex items-center gap-[2vh] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-[2.5vh] py-[2vh] rounded-[2.5vh] shadow-2xl border border-indigo-100/50 dark:border-white/10 group hover:bg-slate-900 dark:hover:bg-indigo-600 transition-all active:scale-95"
            onClick={() => { onAction('PORTA'); setIsOpen(false); }}
          >
            <div className="w-[5vh] h-[5vh] rounded-[1.2vh] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-[2.5vh] h-[2.5vh] text-indigo-600 dark:text-indigo-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-black text-slate-700 dark:text-slate-100 group-hover:text-white uppercase tracking-widest text-[clamp(0.7rem,1.3vh,1.1rem)]">Cargar Portabilidad</span>
          </button>

          <button 
            className="flex items-center gap-[2vh] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-[2.5vh] py-[2vh] rounded-[2.5vh] shadow-2xl border border-purple-100/50 dark:border-white/10 group hover:bg-slate-900 dark:hover:bg-purple-600 transition-all active:scale-95"
            onClick={() => { onAction('LN'); setIsOpen(false); }}
          >
            <div className="w-[5vh] h-[5vh] rounded-[1.2vh] bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-[2.5vh] h-[2.5vh] text-purple-600 dark:text-purple-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-black text-slate-700 dark:text-slate-100 group-hover:text-white uppercase tracking-widest text-[clamp(0.7rem,1.3vh,1.1rem)]">Cargar Línea Nueva</span>
          </button>
        </div>
      )}

      <div className="relative group">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-[7vh] h-[7vh] rounded-[2.2vh] bg-gradient-to-br from-indigo-600 to-indigo-900 text-white shadow-[0_2vh_4vh_-1vh_rgba(79,70,229,0.4)] flex items-center justify-center transition-all duration-500 transform ${isOpen ? 'rotate-[135deg] scale-90 bg-slate-900' : 'hover:scale-110 hover:shadow-indigo-500/50'}`}
        >
          <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
