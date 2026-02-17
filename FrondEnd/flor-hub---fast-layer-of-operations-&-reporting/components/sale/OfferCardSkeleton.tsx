import React from 'react';

export const OfferCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3vh] p-[3.5vh] flex flex-col animate-in fade-in duration-500 overflow-hidden relative border border-slate-200 dark:border-white/10 h-full">
      <div className="absolute inset-0 skeleton pointer-events-none opacity-50"></div>
      
      {/* Header Skeleton */}
      <div className="flex justify-between items-start mb-[2.5vh]">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-20 bg-slate-200/60 rounded-md"></div>
          <div className="h-8 w-[70%] bg-slate-300/50 rounded-lg"></div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-10 w-24 bg-slate-300/60 rounded-xl ml-auto"></div>
          <div className="h-4 w-16 bg-slate-200/40 rounded-md ml-auto"></div>
        </div>
      </div>

      {/* Promo Box Skeleton */}
      <div className="h-12 w-full bg-slate-200/40 rounded-[2vh] mb-[2.5vh]"></div>

      {/* GB/Calls info boxes */}
      <div className="flex gap-[2vh] mb-[2.5vh]">
        <div className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 rounded-[1.5vh]"></div>
        <div className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 rounded-[1.5vh]"></div>
      </div>

      {/* Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-[2vh] mt-auto">
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-[2vh]"></div>
        <div className="h-12 bg-slate-200/60 rounded-[2vh]"></div>
      </div>
    </div>
  );
};
