import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (val: boolean) => void;
  rowsPerPage: number | 'TODOS';
  setRowsPerPage: (val: number | 'TODOS') => void;
  onExport: () => void;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery, setSearchQuery,
  startDate, setStartDate,
  endDate, setEndDate,
  showAdvancedFilters, setShowAdvancedFilters,
  rowsPerPage, setRowsPerPage,
  onExport, totalRecords,
  currentPage, totalPages, onPrevPage, onNextPage
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-[1.5vw] glass-panel p-[2.5vh] rounded-[3.5vh] mb-[2vh] relative transition-all z-20">
      <div className="flex-[2] relative w-full h-[7.5vh]">
        <input 
          type="text" 
          placeholder="DNI, Nombre o V-XXXX..." 
          value={searchQuery} 
          className="w-full h-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-[2.2vh] pl-[3vw] pr-[1vw] font-bold outline-none uppercase text-[clamp(1rem,1.8vh,2.2rem)] text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <svg className="absolute left-[1vw] top-1/2 -translate-y-1/2 w-[3.2vh] h-[3.2vh] text-indigo-500 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Filtros de Fecha Rápidos */}
      <div className="flex flex-wrap items-center gap-[1vw]">
        <div className="flex items-center gap-[0.5vw] bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 p-[1.2vh] rounded-[2.2vh] h-[7.5vh] shadow-sm">
          <div className="flex flex-col justify-center px-[0.8vw]">
            <span className="font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-none text-[clamp(0.6rem,1.1vh,1rem)]">Desde</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer p-0 h-[3vh] text-[clamp(0.8rem,1.5vh,1.4rem)] [color-scheme:light] dark:[color-scheme:dark]" 
            />
          </div>
          <div className="w-px h-[5vh] bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex flex-col justify-center px-[0.8vw]">
            <span className="font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-none text-[clamp(0.6rem,1.1vh,1rem)]">Hasta</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer p-0 h-[3vh] text-[clamp(0.8rem,1.5vh,1.4rem)] [color-scheme:light] dark:[color-scheme:dark]" 
            />
          </div>
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-[1vh] hover:text-rose-500 text-slate-300 dark:text-slate-600 transition-colors">
              <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[1vw]">
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
          className={`px-[2vw] h-[7.5vh] rounded-[2.2vh] font-black border transition-all text-[clamp(0.8rem,1.5vh,1.8rem)] ${showAdvancedFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-400 border-slate-200 dark:border-slate-700 shadow-sm'}`}
        >
          Filtros
        </button>
        <button onClick={onExport} className="px-[2vw] h-[7.5vh] rounded-[2.2vh] font-black bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 transition-all text-[clamp(0.8rem,1.5vh,1.8rem)]">
          Exportar
        </button>
        <select 
          className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2.2vh] px-[1.5vw] h-[7.5vh] font-black text-slate-800 dark:text-slate-400 cursor-pointer text-[clamp(0.8rem,1.5vh,1.8rem)] outline-none shadow-sm" 
          value={rowsPerPage} 
          onChange={(e) => setRowsPerPage(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={250}>250</option>
          <option value={500}>500</option>
          <option value={750}>750</option>
          <option value="TODOS">TODOS</option>
        </select>

        <div className="flex items-center gap-[0.5vw]">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="px-[1vw] h-[7.5vh] rounded-[2.2vh] font-black border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-[0.5vw] text-[clamp(0.7rem,1.3vh,1.6rem)]"
          >
            <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Anterior
          </button>
          
          <div className="flex items-center gap-[0.3vw] px-[1vw]">
            <span className="font-black text-slate-600 dark:text-slate-400 text-[clamp(0.7rem,1.3vh,1.5rem)]">
              {currentPage}
            </span>
            <span className="font-black text-slate-400 dark:text-slate-500 text-[clamp(0.6rem,1.1vh,1.3rem)]">
              de
            </span>
            <span className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(0.7rem,1.3vh,1.5rem)]">
              {totalPages}
            </span>
          </div>

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="px-[1vw] h-[7.5vh] rounded-[2.2vh] font-black border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-[0.5vw] text-[clamp(0.7rem,1.3vh,1.6rem)]"
          >
            Siguiente
            <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="ml-auto text-right min-w-[8vw]">
        <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none text-[clamp(0.6rem,1.1vh,1rem)]">Resultados</p>
        <p className="font-black text-indigo-600 dark:text-indigo-400 mt-[0.5vh] text-[clamp(1.5rem,3vh,4rem)]">{totalRecords}</p>
      </div>
    </div>
  );
};
