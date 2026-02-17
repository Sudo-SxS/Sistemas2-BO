import React, { useState, useEffect, useRef } from 'react';
import { AppTab } from '../../types';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (tab: AppTab) => void;
  onSearch: (query: string) => void;
  onAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onNavigate, onSearch, onAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'gestion', label: 'Ir a Gestión', icon: '📋', category: 'Navegación', action: () => onNavigate('GESTIÓN') },
    { id: 'seguimiento', label: 'Ir a Seguimiento', icon: '🚚', category: 'Navegación', action: () => onNavigate('SEGUIMIENTO') },
    { id: 'reportes', label: 'Ir a Reportes', icon: '📊', category: 'Navegación', action: () => onNavigate('REPORTES') },
    { id: 'ofertas', label: 'Ir a Ofertas', icon: '🔥', category: 'Navegación', action: () => onNavigate('OFERTAS') },
    { id: 'nueva_venta', label: 'Nueva Venta', icon: '➕', category: 'Acciones', action: () => onAction('NEW_SALE') },
    { id: 'dark_mode', label: 'Cambiar Tema', icon: '🌓', category: 'Sistema', action: () => onAction('TOGGLE_THEME') },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      if (e.key === 'Enter') {
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        } else if (query) {
          onSearch(query);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredCommands, selectedIndex, query, onSearch]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-[2vw]">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="w-full max-w-[650px] bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3.5vh] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 relative z-10">
        <div className="p-[2.5vh] border-b border-slate-100 dark:border-white/5 flex items-center gap-[2vh]">
          <svg className="w-[3vh] h-[3vh] text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="¿Qué necesitas hacer? (DNI, Gestión, Nueva Venta...)"
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white font-bold text-[clamp(1rem,1.8vh,2.5rem)] placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <div className="px-[1.2vh] py-[0.5vh] rounded-[1vh] bg-slate-100 dark:bg-white/5 text-slate-400 text-[1.2vh] font-black tracking-widest border border-slate-200 dark:border-white/10">ESC</div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-[1.5vh] space-y-[0.5vh] no-scrollbar">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => { cmd.action(); onClose(); }}
                className={`w-full flex items-center justify-between p-[1.8vh] rounded-[2vh] transition-all ${i === selectedIndex ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-[2vh]">
                  <span className="text-[2.5vh]">{cmd.icon}</span>
                  <div className="text-left">
                    <p className={`font-black uppercase tracking-tight ${i === selectedIndex ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{cmd.label}</p>
                    <p className={`text-[1.1vh] font-bold uppercase tracking-widest opacity-60 ${i === selectedIndex ? 'text-indigo-100' : ''}`}>{cmd.category}</p>
                  </div>
                </div>
                {i === selectedIndex && (
                  <div className="flex items-center gap-[1vh] opacity-80">
                    <span className="text-[1.1vh] font-black uppercase tracking-widest">Ejecutar</span>
                    <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  </div>
                )}
              </button>
            ))
          ) : query ? (
            <div className="p-[4vh] text-center space-y-[2vh]">
              <div className="text-[4vh] opacity-20">🔎</div>
              <p className="font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
                Presiona <span className="text-indigo-500">ENTER</span> para buscar <br/>
                <span className="text-slate-800 dark:text-slate-200">"{query}"</span> en toda la base.
              </p>
            </div>
          ) : (
            <div className="p-[4vh] text-center text-slate-400 uppercase font-black tracking-widest text-[1.2vh] opacity-40 italic">
              Empieza a escribir para ver comandos...
            </div>
          )}
        </div>

        <div className="p-[2vh] bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-[2vh]">
            <div className="flex items-center gap-[0.8vh]">
              <kbd className="px-[0.8vh] py-[0.2vh] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[1vh] text-slate-400 shadow-sm font-black italic">↑↓</kbd>
              <span className="text-[0.9vh] font-black uppercase text-slate-400 tracking-wider">Navegar</span>
            </div>
            <div className="flex items-center gap-[0.8vh]">
              <kbd className="px-[0.8vh] py-[0.2vh] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[1vh] text-slate-400 shadow-sm font-black italic">Enter</kbd>
              <span className="text-[0.9vh] font-black uppercase text-slate-400 tracking-wider">Accionar</span>
            </div>
          </div>
          <p className="text-[0.9vh] font-black text-slate-300 uppercase tracking-[0.2em] italic">FlorHub Spotlight v1.0</p>
        </div>
      </div>
    </div>
  );
};
