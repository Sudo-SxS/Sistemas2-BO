import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEstadisticas, Periodo } from '../hooks/useEstadisticas';
import { exportToExcel } from '../utils/exportExcel';

type Period = 'DIA' | 'SEMANA' | 'MES' | 'SEMESTRE' | 'AÑO' | 'HISTORICO';

const mapPeriodToBackend = (period: Period): Periodo => {
  switch (period) {
    case 'DIA': return 'HOY';
    case 'SEMANA': return 'SEMANA';
    case 'MES': return 'MES';
    case 'SEMESTRE': return 'SEMESTRE';
    case 'AÑO': return 'AÑO';
    case 'HISTORICO': return 'TODO';
    default: return 'MES';
  }
};

const StatCard = ({ title, value, percentage, color, icon, suffix = "", subtitle = "" }: any) => (
  <div className="bento-card p-[3vh] rounded-[3.5vh] flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[18vh] dark:bg-slate-900/40 dark:border-white/5">
    <div className="flex justify-between items-start mb-[1.5vh] relative z-10">
      <div className={`w-[7vh] h-[7vh] rounded-[2vh] ${color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
        {React.cloneElement(icon, { className: "w-[3.5vh] h-[3.5vh]" })}
      </div>
      {percentage !== undefined && (
        <span className={`text-[clamp(0.85rem,1.4vh,1.6rem)] font-black px-[1.8vh] py-[1vh] rounded-full ${color} bg-opacity-10 dark:bg-opacity-20 uppercase tracking-widest border border-white/50 dark:border-white/10`}>
          {percentage}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h4 className="text-[clamp(0.75rem,1.3vh,1.5rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh]">{title}</h4>
      <p className="text-[clamp(2.5rem,5.5vh,6rem)] font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{value}{suffix}</p>
      {subtitle && <p className="text-[clamp(0.65rem,1.2vh,1.4rem)] font-bold text-slate-400 dark:text-slate-500 mt-[1vh] uppercase">{subtitle}</p>}
    </div>
    <div className="absolute -right-[2vh] -bottom-[2vh] w-[16vh] h-[16vh] opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-slate-900 dark:text-white">
        {icon}
    </div>
  </div>
);

const MiniStatusBadge = ({ label, percentage, count, colorClass, icon }: any) => (
    <div className="bg-white/60 dark:bg-slate-900/40 p-[2.2vh] rounded-[3vh] border border-white dark:border-white/5 shadow-sm flex flex-col group hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-[1.5vh]">
            <div className={`w-[4.5vh] h-[4.5vh] rounded-[1.2vh] ${colorClass} text-white flex items-center justify-center shadow-sm`}>
                {React.cloneElement(icon, { className: "w-[2.5vh] h-[2.5vh]" })}
            </div>
            <span className="text-[clamp(0.65rem,1.2vh,1.4rem)] font-black text-slate-400 dark:text-slate-500 uppercase">{count} UNID.</span>
        </div>
        <p className="text-[clamp(0.65rem,1.2vh,1.4rem)] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-[0.5vh]">{label}</p>
        <p className={`text-[clamp(1.5rem,3.5vh,3.5rem)] font-black italic tracking-tighter leading-none ${colorClass.replace('bg-', 'text-').replace('-500', '-600 dark:text-400')}`}>{percentage}%</p>
    </div>
);

interface ReportesPageProps {
  advisors?: string[];
  supervisors?: string[];
}

export const ReportesPage: React.FC<ReportesPageProps> = ({ 
  advisors = [], 
  supervisors = [] 
}) => {
  const [reportFilter, setReportFilter] = useState({ advisor: 'TODOS', supervisor: 'TODOS', period: 'MES' as Period });

  const { data: estadisticas, isLoading, error } = useEstadisticas({
    periodo: mapPeriodToBackend(reportFilter.period),
    cellaId: reportFilter.supervisor !== 'TODOS' ? reportFilter.supervisor : undefined,
    asesorId: reportFilter.advisor !== 'TODOS' ? reportFilter.advisor : undefined,
  });

  const stats = useMemo(() => {
    if (!estadisticas) {
      return {
        totalBrutas: 0,
        activados: 0,
        countNetas: 0,
        aprobadoAbd: 0,
        rechazados: 0,
        cancelados: 0,
        spCancelados: 0,
        entregados: 0,
        noEntregados: 0,
        rendidos: 0,
        agendados: 0,
        pendienteCarga: 0,
        montoBruto: 0,
        montoNeto: 0,
        percActivados: '0',
        percAprobadoAbd: '0',
        percRechazados: '0',
        percCancelados: '0',
        percSpCancelados: '0',
        percEntregados: '0',
        percNoEntregados: '0',
        percRendidos: '0',
        percAgendados: '0',
        percPendiente: '0',
        avgTicket: '0',
        conversionRate: '0'
      };
    }

    const { resumen, totales } = estadisticas;
    const total = resumen.totalVentas || 1;

    return {
      totalBrutas: resumen.totalVentas,
      activados: totales.totalActivados,
      countNetas: totales.totalActivados,
      aprobadoAbd: resumen.aprobadoAbd,
      rechazados: resumen.rechazados,
      cancelados: resumen.cancelados,
      spCancelados: resumen.spCancelados,
      entregados: resumen.entregados,
      noEntregados: resumen.noEntregados,
      rendidos: resumen.rendidos,
      agendados: resumen.agendados,
      pendienteCarga: resumen.pendientePin,
      montoBruto: 0,
      montoNeto: 0,
      percActivados: ((totales.totalActivados / total) * 100).toFixed(1),
      percAprobadoAbd: ((resumen.aprobadoAbd / total) * 100).toFixed(1),
      percRechazados: ((resumen.rechazados / total) * 100).toFixed(1),
      percCancelados: ((resumen.cancelados / total) * 100).toFixed(1),
      percSpCancelados: ((resumen.spCancelados / total) * 100).toFixed(1),
      percEntregados: ((resumen.entregados / total) * 100).toFixed(1),
      percNoEntregados: ((resumen.noEntregados / total) * 100).toFixed(1),
      percRendidos: ((resumen.rendidos / total) * 100).toFixed(1),
      percAgendados: ((resumen.agendados / total) * 100).toFixed(1),
      percPendiente: ((resumen.pendientePin / total) * 100).toFixed(1),
      avgTicket: '0',
      conversionRate: totales.tasaConversion.toString()
    };
  }, [estadisticas]);

  const chartData = useMemo(() => {
    if (!estadisticas?.detalle) return [];
    
    const groups: Record<string, any> = {};
    estadisticas.detalle.forEach((item) => {
      const date = new Date(item.fechaCreacion).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = { date, brutas: 0, netas: 0 };
      }
      groups[date].brutas++;
      if (['ACTIVADO NRO PORTADO', 'ACTIVADO NRO CLARO', 'ACTIVADO', 'EXITOSO'].includes(item.estado)) {
        groups[date].netas++;
      }
    });
    return Object.values(groups).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [estadisticas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500 font-black text-lg">Error al cargar estadísticas</p>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[3vh] animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col gap-[2vh] glass-panel p-[3vh] rounded-[3.5vh] border border-white/60 dark:border-white/5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[2vh]">
          <div>
            <h2 className="font-black tracking-tighter text-slate-900 dark:text-white italic uppercase leading-none text-[clamp(1.5rem,3.5vh,4rem)]">Intelligence Hub</h2>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-[0.8vh] text-[clamp(0.6rem,1.2vh,1.5rem)]">Métricas de Rendimiento & Analytics</p>
          </div>
          <div className="flex flex-wrap items-center gap-[0.8vh] bg-slate-900/5 dark:bg-white/5 p-[1vh] rounded-[2vh]">
            {(['DIA', 'SEMANA', 'MES', 'SEMESTRE', 'AÑO', 'HISTORICO'] as Period[]).map(p => (
                <button
                    key={p}
                    onClick={() => setReportFilter(prev => ({ ...prev, period: p }))}
                    className={`px-[2vh] py-[1vh] rounded-[1.2vh] font-black uppercase tracking-widest transition-all text-[clamp(0.6rem,1vh,1.4rem)] ${reportFilter.period === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}
                >
                    {p === 'DIA' ? 'Hoy' : p}
                </button>
            ))}
            <button
              onClick={() => {
                if (estadisticas) {
                  exportToExcel(
                    {
                      totalVentas: estadisticas.resumen.totalVentas,
                      agendados: estadisticas.resumen.agendados,
                      aprobadoAbd: estadisticas.resumen.aprobadoAbd,
                      rechazados: estadisticas.resumen.rechazados,
                      noEntregados: estadisticas.resumen.noEntregados,
                      entregados: estadisticas.resumen.entregados,
                      rendidos: estadisticas.resumen.rendidos,
                      activadoPortado: estadisticas.resumen.activadoPortado,
                      activadoClaro: estadisticas.resumen.activadoClaro,
                      cancelados: estadisticas.resumen.cancelados,
                      spCancelados: estadisticas.resumen.spCancelados,
                      pendientePin: estadisticas.resumen.pendientePin,
                      tasaConversion: estadisticas.totales.tasaConversion,
                    },
                    estadisticas.recargas.numerosRecargados,
                    estadisticas.detalle,
                    `estadisticas_${reportFilter.period.toLowerCase()}`
                  );
                }
              }}
              disabled={!estadisticas}
              className="px-[2vh] py-[1vh] rounded-[1.2vh] font-black uppercase tracking-widest transition-all text-[clamp(0.6rem,1vh,1.4rem)] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200/50 dark:bg-slate-800/50"></div>

        <div className="flex flex-wrap gap-[1vw]">
          <div className="flex-1 min-w-[200px] flex flex-col gap-[1vh]">
            <label className="text-[clamp(0.6rem,1.1vh,1.2rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[1vh]">Célula</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8vh] px-[2.5vh] py-[1.5vh] font-black text-slate-800 dark:text-slate-200 outline-none hover:shadow-md transition-all cursor-pointer text-[clamp(0.7rem,1.2vh,1.5rem)]"
              value={reportFilter.supervisor}
              onChange={(e) => setReportFilter(prev => ({ ...prev, supervisor: e.target.value }))}
            >
              <option value="TODOS">TODAS LAS CÉLULAS</option>
              {estadisticas?.ventasPorCell.map(c => (
                <option key={c.cellaId} value={c.cellaId}>{c.cellaNombre}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] flex flex-col gap-[1vh]">
            <label className="text-[clamp(0.6rem,1.1vh,1.2rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[1vh]">Asesor Comercial</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8vh] px-[2.5vh] py-[1.5vh] font-black text-slate-800 dark:text-slate-200 outline-none hover:shadow-md transition-all cursor-pointer text-[clamp(0.7rem,1.2vh,1.5rem)]"
              value={reportFilter.advisor}
              onChange={(e) => setReportFilter(prev => ({ ...prev, advisor: e.target.value }))}
            >
              <option value="TODOS">TODOS LOS ASESORES</option>
              {estadisticas?.ventasPorVendedor.map(v => (
                <option key={v.vendedorId} value={v.vendedorId}>{v.vendedorNombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2vh]">
        <StatCard title="Ventas Brutas" value={stats.totalBrutas} color="bg-slate-900" subtitle="Total registros" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Activados" value={stats.countNetas} percentage={stats.conversionRate} color="bg-emerald-500" subtitle="Ventas efectivas" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Recargas" value={estadisticas?.recargas.totalRecargas || 0} color="bg-amber-500" subtitle="Números re-portados" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
        <StatCard title="Tasa Conversión" value={stats.conversionRate} suffix="%" color="bg-purple-600" subtitle="Activados/Ventas" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[1vw]">
        <MiniStatusBadge label="Agendados" percentage={stats.percAgendados} count={stats.agendados} colorClass="bg-amber-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <MiniStatusBadge label="Aprob. ABD" percentage={stats.percAprobadoAbd} count={stats.aprobadoAbd} colorClass="bg-teal-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <MiniStatusBadge label="Activ. Portado" percentage={((estadisticas?.resumen.activadoPortado || 0) / (stats.totalBrutas || 1) * 100).toFixed(1)} count={estadisticas?.resumen.activadoPortado || 0} colorClass="bg-emerald-600" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>} />
        <MiniStatusBadge label="Activ. Claro" percentage={((estadisticas?.resumen.activadoClaro || 0) / (stats.totalBrutas || 1) * 100).toFixed(1)} count={estadisticas?.resumen.activadoClaro || 0} colorClass="bg-emerald-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>} />
        <MiniStatusBadge label="Rechazados" percentage={stats.percRechazados} count={stats.rechazados} colorClass="bg-rose-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>} />
        <MiniStatusBadge label="Cancelados" percentage={stats.percCancelados} count={stats.cancelados} colorClass="bg-slate-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H9" /></svg>} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[1vw]">
        <MiniStatusBadge label="SP Cancelado" percentage={stats.percSpCancelados} count={stats.spCancelados} colorClass="bg-red-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H9" /></svg>} />
        <MiniStatusBadge label="Entregados" percentage={stats.percEntregados} count={stats.entregados} colorClass="bg-indigo-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <MiniStatusBadge label="No Entreg." percentage={stats.percNoEntregados} count={stats.noEntregados} colorClass="bg-orange-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <MiniStatusBadge label="Rendidos" percentage={stats.percRendidos} count={stats.rendidos} colorClass="bg-cyan-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <MiniStatusBadge label="Pdte. PIN" percentage={stats.percPendiente} count={stats.pendienteCarga} colorClass="bg-fuchsia-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>} />
      </div>

      {estadisticas && estadisticas.recargas.totalRecargas > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2vh]">
          <div className="bento-card p-[3vh] rounded-[3.5vh] dark:bg-slate-900/40 dark:border-white/5">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest mb-[2vh] text-[clamp(0.8rem,1.3vh,1.5rem)]">Top Asesores con Más Recargas</h3>
            <div className="space-y-[1vh]">
              {estadisticas.recargas.topAsesorRecargas.slice(0, 5).map((asesor, idx) => (
                <div key={asesor.vendedorId} className="flex justify-between items-center p-[1.5vh] rounded-[1vh] bg-white/50 dark:bg-white/5">
                  <div className="flex items-center gap-[1vh]">
                    <span className="font-black text-slate-400">{idx + 1}.</span>
                    <span className="font-black text-slate-700 dark:text-slate-300 text-[clamp(0.7rem,1.1vh,1.3rem)]">{asesor.vendedorNombre}</span>
                  </div>
                  <span className="font-black text-amber-500 text-[clamp(0.8rem,1.2vh,1.4rem)]">{asesor.cantidadRecargas} recargas</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bento-card p-[3vh] rounded-[3.5vh] dark:bg-slate-900/40 dark:border-white/5">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest mb-[2vh] text-[clamp(0.8rem,1.3vh,1.5rem)]">Top Células con Más Recargas</h3>
            <div className="space-y-[1vh]">
              {estadisticas.recargas.topCellRecargas.slice(0, 5).map((cell, idx) => (
                <div key={cell.cellaId} className="flex justify-between items-center p-[1.5vh] rounded-[1vh] bg-white/50 dark:bg-white/5">
                  <div className="flex items-center gap-[1vh]">
                    <span className="font-black text-slate-400">{idx + 1}.</span>
                    <span className="font-black text-slate-700 dark:text-slate-300 text-[clamp(0.7rem,1.1vh,1.3rem)]">{cell.cellaNombre}</span>
                  </div>
                  <span className="font-black text-amber-500 text-[clamp(0.8rem,1.2vh,1.4rem)]">{cell.cantidadRecargas} recargas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2vh]">
        <div className="lg:col-span-2 bento-card p-[3vh] rounded-[3.5vh] h-[50vh] flex flex-col dark:bg-slate-900/40 dark:border-white/5">
          <div className="flex justify-between items-start mb-[3vh]">
            <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none text-[clamp(0.8rem,1.3vh,1.5rem)]">Análisis de Tendencia</h3>
                <p className="font-bold text-slate-400 dark:text-slate-500 uppercase mt-[0.8vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">Ventas Brutas (Azul) vs Activaciones (Verde)</p>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px'}} itemStyle={{fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'}} />
                <Area type="monotone" dataKey="brutas" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#gradBrutas)" />
                <Area type="monotone" dataKey="netas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#gradNetas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-[3vh] rounded-[3.5vh] h-[50vh] flex flex-col items-center justify-center text-center dark:bg-slate-900/40 dark:border-white/5">
            <div className="mb-[3vh]">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none text-[clamp(0.8rem,1.3vh,1.5rem)]">Ratio de Conversión</h3>
                <p className="font-bold text-slate-400 dark:text-slate-500 uppercase mt-[0.8vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">Eficiencia del Embudo</p>
            </div>
            <div className="relative w-[25vh] h-[25vh] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[2.5vh] border-indigo-100 dark:border-indigo-900/20"></div>
                <div className="absolute inset-0 rounded-full border-[2.5vh] border-emerald-500 border-t-transparent border-l-transparent transition-all duration-1000" style={{ transform: `rotate(${(Number(stats.conversionRate) * 3.6) - 45}deg)` }}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <span className="font-black text-slate-900 dark:text-white italic tracking-tighter leading-none text-[clamp(2.5rem,5.5vh,6rem)]">{stats.conversionRate}%</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-[0.8vh] text-[clamp(0.65rem,1.1vh,1.4rem)]">Éxito Neto</span>
                </div>
            </div>
            <div className="mt-[4vh] grid grid-cols-2 gap-[1.5vw] w-full">
                <div className="bg-slate-50 dark:bg-white/5 p-[2.2vh] rounded-[2.5vh]"><p className="font-black text-slate-400 dark:text-slate-500 uppercase mb-[0.5vh] text-[clamp(0.6rem,1vh,1.2rem)]">Total Recargas</p><p className="font-black text-amber-500 italic text-[clamp(1.2rem,2vh,2rem)]">{estadisticas?.recargas.totalRecargas || 0}</p></div>
                <div className="bg-slate-50 dark:bg-white/5 p-[2.2vh] rounded-[2.5vh]"><p className="font-black text-slate-400 dark:text-slate-500 uppercase mb-[0.5vh] text-[clamp(0.6rem,1vh,1.2rem)]">Portaciones</p><p className="font-black text-amber-600 italic text-[clamp(1.2rem,2vh,2rem)]">{estadisticas?.recargas.totalPortacionesRecargadas || 0}</p></div>
            </div>
        </div>
      </div>
    </div>
  );
};
