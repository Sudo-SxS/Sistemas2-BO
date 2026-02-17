import React from 'react';
import { SaleCard } from '../components/sale/SaleCard';
import { Sale } from '../types';
import { SaleCardSkeleton } from '../components/sale/SaleCardSkeleton';

interface GestionPageProps {
  sales: Sale[];
  isLoading?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewSale: (sale: Sale) => void;
  onCommentSale: (sale: Sale) => void;
}

import { VirtualList } from '../components/common/VirtualList';

export const GestionPage: React.FC<GestionPageProps> = ({ 
  sales, isLoading, selectedIds, onToggleSelect, onViewSale, onCommentSale 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-[2vh] animate-in fade-in duration-500">
        {[1, 2, 3, 4, 5].map(i => <SaleCardSkeleton key={i} />)}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="p-[10vh] text-center glass-panel rounded-[4vh] animate-in fade-in duration-700 flex flex-col items-center justify-center gap-[3vh] border-2 border-white/50">
        <div className="w-[12vh] h-[12vh] rounded-[3vh] bg-slate-100 flex items-center justify-center text-slate-300">
          <svg className="w-[6vh] h-[6vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8" />
          </svg>
        </div>
        <p className="font-black text-slate-400 uppercase tracking-[0.3em] max-w-[40vw] leading-relaxed text-[clamp(1rem,1.8vh,2.5rem)]">
          No hay registros para mostrar con los filtros aplicados.
        </p>
      </div>
    );
  }

  // Altura base de SaleCard (12vh)
  const ITEM_HEIGHT = window.innerHeight * 0.12;
  const GAP = window.innerHeight * 0.015;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-[10vh]">
      <VirtualList
        items={sales}
        itemHeight={ITEM_HEIGHT}
        gap={GAP}
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
    </div>
  );
};
