import React from 'react';
import { useToast } from '../contexts/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-[12vh] right-[2vw] z-[1000] flex flex-col gap-[1.5vh] max-w-[400px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-panel rounded-[2.5vh] p-[2.5vh] border-2 border-white/80 dark:border-white/20 shadow-2xl animate-in slide-in-from-right-full duration-500 overflow-hidden relative group"
        >
          <div className="flex items-start gap-[1.5vh] relative z-10">
            <div className={`w-[5vh] h-[5vh] rounded-[1.5vh] flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-600' :
              toast.type === 'error' ? 'bg-red-500/20 text-red-600' :
              toast.type === 'warning' ? 'bg-amber-500/20 text-amber-600' :
              'bg-indigo-500/20 text-indigo-600'
            }`}>
              {toast.type === 'success' ? '✅' : 
               toast.type === 'error' ? '❌' : 
               toast.type === 'warning' ? '⚠️' : '🔔'}
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-[clamp(0.8rem,1.4vh,1.8rem)]">{toast.title}</h4>
              <p className="font-bold text-slate-500 dark:text-slate-400 mt-[0.5vh] text-[clamp(0.7rem,1.2vh,1.5rem)] leading-tight">{toast.message}</p>
            </div>
          </div>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="absolute top-[1.5vh] right-[1.5vh] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/30 animate-shrink" style={{ animation: 'shrink 5s linear forwards' }}></div>
          
          <style>{`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};
