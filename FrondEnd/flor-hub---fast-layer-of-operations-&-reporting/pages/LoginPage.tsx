import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-10 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[450px] lg:w-[600px] h-[300px] md:h-[450px] lg:h-[600px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[450px] lg:w-[600px] h-[300px] md:h-[450px] lg:h-[600px] bg-fuchsia-600/15 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-[320px] md:max-w-[450px] lg:max-w-[480px] glass-panel rounded-2xl md:rounded-[36px] lg:rounded-[48px] p-6 md:p-8 lg:p-14 border border-white/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-700 relative z-10 text-center">
        
        <div className="flex flex-col items-center mb-6 md:mb-8 lg:mb-12">
          <Logo size={60} className="mb-4 md:mb-6 lg:mb-8" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">FLOR</h1>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-indigo-600 uppercase italic leading-none">HUB</h1>
          </div>
          <p className="text-[10px] md:text-[11px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.5em] mt-3 md:mt-4 opacity-70">
            SISTEMA INTEGRADO DE CAPAS OPERATIVAS
          </p>
        </div>

        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium">
                {localError || error || 'Error de autenticación'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-[10px] md:text-[11px] lg:text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Operador Autorizado</label>
            <div className="relative group">
              <input 
                required
                type="email" 
                name="email"
                placeholder="correo@ejemplo.com"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-3 md:py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300"
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-[11px] lg:text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Protocolo de Seguridad</label>
            <div className="relative group">
              <input 
                required
                type="password" 
                name="password"
                placeholder="••••••••••••••••••••"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-3 md:py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300"
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all" />
              <span className="text-[10px] md:text-[11px] lg:text-xs font-black text-slate-500 uppercase tracking-tight group-hover:text-slate-700">Mantener Sesión</span>
            </label>
            <button type="button" className="text-[10px] md:text-[11px] lg:text-xs font-black text-indigo-600 uppercase tracking-tight hover:underline">Acceso Alternativo</button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl py-4 md:py-5 text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sincronizando...</span>
              </div>
            ) : (
              <span className="relative z-10">Autenticar en el HUB</span>
            )}
            <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>
        </form>

        <div className="mt-8 md:mt-10 lg:mt-12">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] md:text-[11px] lg:text-xs font-black uppercase tracking-widest">Conexión Segura SSL v4</span>
          </div>
          <p className="text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-6">
            © 2024 FLOR TELECOM INFRASTRUCTURE • CORE ENGINE
          </p>
        </div>
      </div>

      <div className="fixed bottom-[-50px] left-1/2 -translate-x-1/2 text-[15vw] md:text-[20vw] lg:text-[25vw] font-black text-slate-900/[0.02] pointer-events-none select-none italic uppercase">
        LAYER
      </div>
    </div>
  );
};
