import React, { useState, useEffect } from 'react';
import { Logo } from '../components/common/Logo';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  error?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    try {
      const success = await onLogin(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-[5vh] relative overflow-hidden bg-slate-950">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[100vmin] h-[100vmin] bg-indigo-600/20 rounded-full blur-[15vmin] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[100vmin] h-[100vmin] bg-fuchsia-600/20 rounded-full blur-[15vmin] animate-pulse delay-700"></div>

      {/* Main Login Panel - Compressed for Zero-Scroll & Vertical Spacing */}
      <div className="w-[clamp(450px,80vmin,1600px)] max-h-[85vh] glass-panel rounded-[4vmin] p-[clamp(1.5rem,4vmin,8rem)] border border-white/40 shadow-[0_4vmin_15vmin_-2vmin_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-700 relative z-10 text-center flex flex-col justify-center gap-[clamp(1rem,2.8vmin,6rem)] transition-all">
        
        <header className="flex flex-col items-center flex-shrink-0">
          <div className="w-[clamp(3.5rem,15vmin,16rem)] h-[clamp(3.5rem,15vmin,16rem)] relative mb-[1.5vmin]">
            <Logo size="md" className="!w-full !h-full" />
          </div>
          <div className="flex items-baseline gap-[1vw] justify-center">
            <h1 className="text-[clamp(1.5rem,6vmin,10rem)] font-black tracking-tighter text-slate-900 uppercase italic leading-none">FLOR</h1>
            <h1 className="text-[clamp(1.5rem,6vmin,10rem)] font-black tracking-tighter text-indigo-600 uppercase italic leading-none">HUB</h1>
          </div>
          <p className="text-[clamp(8px,1.3vmin,20px)] font-black text-slate-400 uppercase tracking-[0.4em] mt-[0.5vmin] opacity-80">
            SISTEMA INTEGRADO DE CAPAS OPERATIVAS
          </p>
        </header>

        {(localError || error) && (
          <div className="bg-red-50/80 border border-red-200 rounded-[2vmin] p-[1.5vmin] text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-[1vmin] text-red-600">
              <svg className="w-[2.5vmin] h-[2.5vmin] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-[clamp(10px,1.5vmin,18px)] font-bold">
                {localError || error || 'Error de autenticación'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[clamp(1rem,3vmin,4rem)] text-left flex-shrink flex flex-col justify-center">
          <div className="space-y-[0.8vmin]">
            <label className="text-[clamp(8px,1.2vmin,14px)] font-black text-slate-400 uppercase tracking-widest ml-[2vmin]">Operador Autorizado</label>
            <div className="relative group">
              <input 
                required
                type="email" 
                name="email"
                placeholder="OPERADOR@SISTEMA"
                className="w-full bg-white/60 border border-slate-200 rounded-[2vmin] px-[3vmin] py-[clamp(0.6rem,1.8vmin,2rem)] text-[clamp(12px,2vmin,24px)] font-bold text-slate-900 outline-none focus:ring-[0.5vmin] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-200"
              />
              <svg className="absolute right-[3vmin] top-1/2 -translate-y-1/2 w-[2.2vmin] h-[2.2vmin] text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-[0.8vmin]">
            <label className="text-[clamp(8px,1.2vmin,14px)] font-black text-slate-400 uppercase tracking-widest ml-[2vmin]">Protocolo de Seguridad</label>
            <div className="relative group">
              <input 
                required
                type="password" 
                name="password"
                placeholder="••••••••••••"
                className="w-full bg-white/60 border border-slate-200 rounded-[2vmin] px-[3vmin] py-[clamp(0.6rem,1.8vmin,2rem)] text-[clamp(12px,2vmin,24px)] font-bold text-slate-900 outline-none focus:ring-[0.5vmin] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-200"
              />
              <svg className="absolute right-[3vmin] top-1/2 -translate-y-1/2 w-[2.2vmin] h-[2.2vmin] text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between px-[1vmin]">
            <label className="flex items-center gap-[1vmin] cursor-pointer group">
              <input type="checkbox" className="w-[1.8vmin] h-[1.8vmin] rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
              <span className="text-[clamp(8px,1.5vmin,16px)] font-black text-slate-500 uppercase tracking-tight group-hover:text-slate-700">Mantener Sesión</span>
            </label>
            <button type="button" className="text-[clamp(8px,1.5vmin,16px)] font-black text-indigo-600 uppercase tracking-tight hover:underline">Acceso Alternativo</button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-[2.5vmin] py-[clamp(0.8rem,2.5vmin,2.5rem)] text-[clamp(10px,2vmin,22px)] font-black uppercase tracking-[0.3em] shadow-[0_1vmin_3vmin_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Sincronizando..." : "Autenticar en el HUB"}
          </button>
        </form>

        <footer className="flex-shrink-0">
          <div className="inline-flex items-center gap-[1vmin] bg-white/40 text-slate-900 px-[3vmin] py-[0.8vmin] rounded-full border border-white/60">
            <div className="w-[1vmin] h-[1vmin] bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[clamp(8px,1.3vmin,14px)] font-black uppercase tracking-widest whitespace-nowrap">Conexión Segura SSL v4</span>
          </div>
          <p className="text-[clamp(8px,1.3vmin,14px)] font-bold text-slate-400 uppercase tracking-[0.3em] mt-[1vmin]">
            © 2024 FLOR TELECOM INFRASTRUCTURE
          </p>
        </footer>
      </div>

      <div className="fixed bottom-[-5vmin] left-1/2 -translate-x-1/2 text-[20vmin] font-black text-white/[0.03] pointer-events-none select-none italic uppercase leading-none whitespace-nowrap">
        LAYER
      </div>
    </div>
  );
};
