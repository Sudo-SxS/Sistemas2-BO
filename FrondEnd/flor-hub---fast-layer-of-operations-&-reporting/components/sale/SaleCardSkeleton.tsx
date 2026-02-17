import React from 'react';

export const SaleCardSkeleton: React.FC = () => {
  return (
    <div className="w-full bento-card rounded-[3.5vh] p-[2vh] flex flex-col lg:flex-row items-center gap-[2vh] animate-in fade-in duration-500 overflow-hidden relative">
      <div className="absolute inset-0 skeleton pointer-events-none opacity-50"></div>
      
      {/* ID Skeleton */}
      <div className="w-full lg:w-[8%] flex flex-col items-start lg:items-center">
        <div className="h-4 w-12 bg-slate-200/50 rounded-full mb-2"></div>
        <div className="h-6 w-16 bg-slate-300/50 rounded-lg"></div>
      </div>

      {/* Cliente Skeleton */}
      <div className="w-full lg:w-[20%] flex items-center gap-[1.5vh]">
        <div className="w-[5.5vh] h-[5.5vh] rounded-full bg-slate-200/60 shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-[80%] bg-slate-300/50 rounded-md"></div>
          <div className="h-3 w-[60%] bg-slate-200/40 rounded-sm"></div>
        </div>
      </div>

      {/* Info Mixta Skeleton */}
      <div className="w-full lg:w-[15%] space-y-2">
        <div className="h-3 w-[70%] bg-slate-200/40 rounded-sm"></div>
        <div className="h-3 w-[50%] bg-slate-200/30 rounded-sm"></div>
      </div>

      {/* Comentario Skeleton */}
      <div className="w-full lg:w-[25%] p-[1.5vh] rounded-[2vh] bg-white/30 border border-white/40 space-y-2">
        <div className="h-3 w-full bg-slate-200/40 rounded-sm"></div>
        <div className="h-3 w-[80%] bg-slate-200/40 rounded-sm"></div>
      </div>

      {/* Registro Skeleton */}
      <div className="w-full lg:w-[10%] flex flex-col items-center gap-2">
        <div className="h-5 w-20 bg-slate-300/40 rounded-md"></div>
        <div className="h-3 w-12 bg-slate-200/30 rounded-sm"></div>
      </div>

      {/* Status Skeletons */}
      <div className="w-full lg:w-[12%] h-[5vh] bg-slate-200/50 rounded-[1.8vh]"></div>
      <div className="w-full lg:w-[12%] h-[5vh] bg-slate-200/50 rounded-[1.8vh]"></div>
    </div>
  );
};
