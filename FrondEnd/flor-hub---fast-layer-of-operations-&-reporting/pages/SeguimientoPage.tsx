
import React from 'react';
import { SaleCard } from '../components/sale/SaleCard';
import { Sale } from '../types';

interface SeguimientoPageProps {
  trackingSubTab: string;
  setTrackingSubTab: (tab: any) => void;
  sales: Sale[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewSale: (sale: Sale) => void;
  onCommentSale: (sale: Sale) => void;
  counts: Record<string, number>;
}

import { VirtualList } from '../components/common/VirtualList';

export const SeguimientoPage: React.FC<SeguimientoPageProps> = ({ 
  trackingSubTab, setTrackingSubTab, sales, selectedIds, onToggleSelect, onViewSale, onCommentSale, counts
}) => {
  const TABS = [
    { id: 'AGENDADOS', label: 'Agendados', icon: '📅', count: counts.agendados },
    { id: 'ENTREGADOS_PORTA', label: 'Entregados Porta', icon: '✅', count: counts.entregadosPorta },
    { id: 'NO_ENTREGADOS_PORTA', label: 'No Entregados Porta', icon: '❌', count: counts.noEntregadosPorta },
    { id: 'NO_ENTREGADOS_LN', label: 'No Entregados LN', icon: '📱', count: counts.noEntregadosLN },
    { id: 'PENDIENTE_PIN', label: 'Pendiente de PIN', icon: '🔑', count: counts.pendientePin },
    { id: 'RECHAZADOS', label: 'Rechazados', icon: '🚫', count: counts.rechazados }
  ];

  // Conversión aproximada de 12vh + gap a píxeles
  const ESTIMATED_ITEM_HEIGHT = (window.innerHeight * 0.12) + (window.innerHeight * 0.02);

  return (
    <div className="space-y-[4vh] animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-[1.5vh] bg-slate-100/50 dark:bg-slate-800/40 p-[1vh] rounded-[3vh] border border-slate-200/50 dark:border-white/5">
        {TABS.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setTrackingSubTab(tab.id)} 
            className={`flex-1 min-w-[20vh] flex items-center justify-between gap-[2vh] px-[3vh] py-[2.5vh] rounded-[2.2vh] transition-all duration-300 ${trackingSubTab === tab.id ? 'bg-white dark:bg-indigo-600 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/40 ring-2 ring-indigo-500/20 scale-[1.02]' : 'hover:bg-white/60 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500'}`}
          >
            <div className="flex items-center gap-[1.5vh]">
              <span className="text-[clamp(1rem,2vh,2.5rem)]">{tab.icon}</span>
              <span className={`font-black uppercase tracking-tighter text-[clamp(0.6rem,1.1vh,1.4rem)] ${trackingSubTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{tab.label}</span>
            </div>
            <span className={`px-[1.2vh] py-[0.4vh] rounded-[0.8vh] font-black text-[clamp(0.6rem,1vh,1.2rem)] ${trackingSubTab === tab.id ? 'bg-indigo-600 dark:bg-white text-white dark:text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-[2.5vh]">
        {sales.length === 0 ? (
          <div className="py-[12vh] text-center glass-panel rounded-[4vh] shadow-inner bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-white/5">
            <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[clamp(0.8rem,1.8vh,2.5rem)]">No hay registros en esta etapa</p>
          </div>
        ) : (
          <VirtualList
            items={sales}
            itemHeight={window.innerHeight * 0.12}
            gap={window.innerHeight * 0.01}
            renderItem={(sale: Sale) => (
              <SaleCard 
                key={sale.id} 
                sale={sale} 
                isSelected={selectedIds.has(sale.id)} 
                onToggleSelect={onToggleSelect} 
                onClick={onViewSale} 
                onComment={onCommentSale} 
              />
            )}
          />
        )}
      </div>
    </div>
  );
};
