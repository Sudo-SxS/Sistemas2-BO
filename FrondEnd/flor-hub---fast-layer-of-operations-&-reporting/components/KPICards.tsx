import React from 'react';
import { SaleStatus, LogisticStatus } from '../types';

interface KPIProps {
  sales: any[];
  onFilterChange: (filters: any) => void;
}

export const KPICards: React.FC<KPIProps> = ({ sales, onFilterChange }) => {
  const stats = {
    todaySales: sales.filter(s => {
      const today = new Date().toISOString().split('T')[0];
      return s.date?.startsWith(today);
    }).length,
    pinPending: sales.filter(s => s.status === SaleStatus.PENDIENTE_DOCUMENTACION).length,
    logisticPending: sales.filter(s => 
      s.logisticStatus === LogisticStatus.ASIGNADO || 
      s.logisticStatus === LogisticStatus.EN_TRANSITO
    ).length,
    deliveryRate: sales.length > 0 
      ? Math.round((sales.filter(s => s.logisticStatus === LogisticStatus.ENTREGADO).length / sales.length) * 100) 
      : 0
  };

  const cards = [
    { label: 'Ventas de Hoy', value: stats.todaySales, icon: '📈', gradient: 'from-indigo-500 to-indigo-600', filter: { status: 'TODOS' } },
    { label: 'Pendiente Doc', value: stats.pinPending, icon: '📄', gradient: 'from-amber-500 to-amber-600', filter: { status: SaleStatus.PENDIENTE_DOCUMENTACION } },
    { label: 'En Logística', value: stats.logisticPending, icon: '🚚', gradient: 'from-purple-500 to-purple-600', filter: { logisticStatus: 'EN_PROCESO' } },
    { label: '% Entrega', value: `${stats.deliveryRate}%`, icon: '✅', gradient: 'from-emerald-500 to-emerald-600', filter: { logisticStatus: LogisticStatus.ENTREGADO } }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1.5vw] mb-[3vh]">
      {cards.map((card, i) => (
        <button
          key={i}
          onClick={() => onFilterChange(card.filter)}
          className="group relative overflow-hidden bento-card rounded-[3.5vh] p-[2.5vh] flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="relative z-10">
            <p className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.3rem)] mb-[0.5vh] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {card.label}
            </p>
            <h3 className="font-black text-slate-800 dark:text-white text-[clamp(1.5rem,3vh,4rem)] leading-none tracking-tighter">
              {card.value}
            </h3>
          </div>
          <div className={`w-[7vh] h-[7vh] rounded-[2.2vh] bg-gradient-to-br ${card.gradient} flex items-center justify-center text-[3vh] shadow-lg shadow-indigo-500/10 group-hover:rotate-12 transition-transform`}>
            {card.icon}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </button>
      ))}
    </div>
  );
};
