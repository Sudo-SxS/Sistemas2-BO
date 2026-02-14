
import React, { useState, useMemo } from 'react';
import { MOCK_SALES } from '../constants';
import { SaleStatus, LogisticStatus, LineStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Period = 'DIA' | 'SEMANA' | 'MES' | 'SEMESTRE' | 'AÑO' | 'HISTORICO';

const StatCard = ({ title, value, percentage, color, icon, suffix = "", subtitle = "" }: any) => (
  <div className="bento-card p-6 rounded-[32px] flex flex-col justify-between group transition-all duration-500 overflow-hidden relative">
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
        {icon}
      </div>
      {percentage !== undefined && (
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${color} bg-opacity-10 uppercase tracking-widest border border-white/50`}>
          {percentage}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">{value}{suffix}</p>
      {subtitle && <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{subtitle}</p>}
    </div>
    <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-slate-900">
        {icon}
    </div>
  </div>
);

const MiniStatusBadge = ({ label, percentage, count, colorClass, icon }: any) => (
    <div className="bg-white/60 p-5 rounded-[28px] border border-white shadow-sm flex flex-col group hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-3">
            <div className={`w-7 h-7 rounded-lg ${colorClass} text-white flex items-center justify-center shadow-sm`}>
                {icon}
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase">{count} UNID.</span>
        </div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black italic tracking-tighter leading-none ${colorClass.replace('bg-', 'text-')}`}>{percentage}%</p>
    </div>
);

interface AnalyticsTabProps {
  advisors: string[];
  supervisors: string[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ advisors, supervisors }) => {
  const [reportFilter, setReportFilter] = useState({ advisor: 'TODOS', supervisor: 'TODOS', period: 'MES' as Period });

  const filteredData = useMemo(() => {
    const today = new Date();
    
    return MOCK_SALES.filter(s => {
      const matchAdvisor = reportFilter.advisor === 'TODOS' || s.advisor === reportFilter.advisor;
      const matchSupervisor = reportFilter.supervisor === 'TODOS' || s.supervisor === reportFilter.supervisor;
      
      const saleDate = new Date(s.date);
      let matchPeriod = true;

      if (reportFilter.period === 'DIA') {
        matchPeriod = saleDate.toDateString() === today.toDateString();
      } else if (reportFilter.period === 'SEMANA') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        matchPeriod = saleDate >= weekAgo;
      } else if (reportFilter.period === 'MES') {
        matchPeriod = saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
      } else if (reportFilter.period === 'SEMESTRE') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        matchPeriod = saleDate >= sixMonthsAgo;
      } else if (reportFilter.period === 'AÑO') {
        matchPeriod = saleDate.getFullYear() === today.getFullYear();
      }

      return matchAdvisor && matchSupervisor && matchPeriod;
    });
  }, [reportFilter]);

  const stats = useMemo(() => {
    const total = filteredData.length || 1;
    const data = {
      totalBrutas: filteredData.length,
      activados: 0,
      rechazados: 0,
      cancelados: 0,
      entregados: 0,
      noEntregados: 0,
      agendados: 0,
      pendienteCarga: 0,
      montoBruto: 0,
      montoNeto: 0,
      countNetas: 0
    };

    filteredData.forEach(s => {
      data.montoBruto += s.amount;
      if (s.status === SaleStatus.ACTIVADO) {
        data.activados++;
        data.montoNeto += s.amount;
        data.countNetas++;
      }
      if (s.status === SaleStatus.RECHAZADO) data.rechazados++;
      if (s.status === SaleStatus.CANCELADO) data.cancelados++;
      if (s.status === SaleStatus.EN_PROCESO) data.agendados++;
      if (s.lineStatus === LineStatus.PENDIENTE_PRECARGA) data.pendienteCarga++;

      if ([LogisticStatus.ENTREGADO, LogisticStatus.RENDIDO_AL_CLIENTE].includes(s.logisticStatus)) data.entregados++;
      if ([LogisticStatus.NO_ENTREGADO, LogisticStatus.PIEZA_EXTRAVIADA].includes(s.logisticStatus)) data.noEntregados++;
    });

    return {
      ...data,
      percActivados: ((data.activados / total) * 100).toFixed(1),
      percRechazados: ((data.rechazados / total) * 100).toFixed(1),
      percCancelados: ((data.cancelados / total) * 100).toFixed(1),
      percEntregados: ((data.entregados / total) * 100).toFixed(1),
      percNoEntregados: ((data.noEntregados / total) * 100).toFixed(1),
      percAgendados: ((data.agendados / total) * 100).toFixed(1),
      percPendiente: ((data.pendienteCarga / total) * 100).toFixed(1),
      avgTicket: (data.montoBruto / total).toFixed(2),
      conversionRate: ((data.countNetas / total) * 100).toFixed(1)
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
      const groups: Record<string, any> = {};
      filteredData.forEach(s => {
          if (!groups[s.date]) groups[s.date] = { date: s.date, brutas: 0, netas: 0 };
          groups[s.date].brutas++;
          if (s.status === SaleStatus.ACTIVADO) groups[s.date].netas++;
      });
      return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col gap-6 glass-panel p-8 rounded-[40px] border border-white/60 dark:border-white/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">Intelligence Hub</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Métricas de Rendimiento & Analytics</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/5 p-2 rounded-[24px]">
            {(['DIA', 'SEMANA', 'MES', 'SEMESTRE', 'AÑO', 'HISTORICO'] as Period[]).map(p => (
                <button
                    key={p}
                    onClick={() => setReportFilter(prev => ({ ...prev, period: p }))}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${reportFilter.period === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                >
                    {p === 'DIA' ? 'Hoy' : p}
                </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-200/50"></div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-3">Supervisor</label>
            <select 
              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-[11px] font-black text-slate-800 dark:text-white outline-none hover:shadow-md transition-all cursor-pointer"
              value={reportFilter.supervisor}
              onChange={(e) => setReportFilter(prev => ({ ...prev, supervisor: e.target.value }))}
            >
              <option value="TODOS">TODOS LOS SUPERVISORES</option>
              {supervisors.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-3">Asesor Comercial</label>
            <select 
              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-[11px] font-black text-slate-800 dark:text-white outline-none hover:shadow-md transition-all cursor-pointer"
              value={reportFilter.advisor}
              onChange={(e) => setReportFilter(prev => ({ ...prev, advisor: e.target.value }))}
            >
              <option value="TODOS">TODOS LOS ASESORES</option>
              {advisors.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ventas Brutas" value={stats.totalBrutas} color="bg-indigo-600 dark:bg-slate-800" subtitle="Total registros cargados" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Activaciones (Netas)" value={stats.countNetas} percentage={stats.conversionRate} color="bg-emerald-500" subtitle="Ventas efectivas activadas" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Recaudación Bruta" value={stats.montoBruto.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} suffix="€" color="bg-indigo-600" subtitle="Valor total del embudo" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <StatCard title="Ticket Promedio" value={stats.avgTicket} suffix="€" color="bg-purple-600" subtitle="Gasto medio por cliente" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MiniStatusBadge label="Activados" percentage={stats.percActivados} count={stats.activados} colorClass="bg-emerald-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>} />
        <MiniStatusBadge label="Rechazados" percentage={stats.percRechazados} count={stats.rechazados} colorClass="bg-rose-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>} />
        <MiniStatusBadge label="Cancelados" percentage={stats.percCancelados} count={stats.cancelados} colorClass="bg-slate-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H9" /></svg>} />
        <MiniStatusBadge label="Entregados" percentage={stats.percEntregados} count={stats.entregados} colorClass="bg-indigo-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <MiniStatusBadge label="No Entregados" percentage={stats.percNoEntregados} count={stats.noEntregados} colorClass="bg-orange-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <MiniStatusBadge label="Agendados" percentage={stats.percAgendados} count={stats.agendados} colorClass="bg-amber-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <MiniStatusBadge label="Pdte. Carga" percentage={stats.percPendiente} count={stats.pendienteCarga} colorClass="bg-fuchsia-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bento-card p-10 rounded-[40px] h-[450px] flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Análisis de Tendencia</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Ventas Brutas (Azul) vs Activaciones (Verde)</p>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradBrutas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradNetas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px'}} itemStyle={{fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'}} />
                <Area type="monotone" dataKey="brutas" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#gradBrutas)" />
                <Area type="monotone" dataKey="netas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#gradNetas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-10 rounded-[40px] h-[450px] flex flex-col items-center justify-center text-center">
            <div className="mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Ratio de Conversión</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Eficiencia del Embudo</p>
            </div>
            <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[20px] border-indigo-100"></div>
                <div className="absolute inset-0 rounded-full border-[20px] border-emerald-500 border-t-transparent border-l-transparent transition-all duration-1000" style={{ transform: `rotate(${(Number(stats.conversionRate) * 3.6) - 45}deg)` }}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <span className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">{stats.conversionRate}%</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">Éxito Neto</span>
                </div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Monto Neto</p><p className="text-lg font-black text-indigo-600 italic">{stats.montoNeto.toLocaleString()}€</p></div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pérdida (Cancel/Rech)</p><p className="text-lg font-black text-rose-500 italic">{(stats.montoBruto - stats.montoNeto).toLocaleString()}€</p></div>
            </div>
        </div>
      </div>
    </div>
  );
};
