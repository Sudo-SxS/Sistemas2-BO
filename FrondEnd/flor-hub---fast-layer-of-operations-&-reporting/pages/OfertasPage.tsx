import React, { useState, useEffect, useMemo } from 'react';
import { ProductType, Sale } from '../types';
import { getAllPlanes, getEmpresasOrigen, PlanResponse, EmpresaOrigenResponse } from '../services/plan';

interface OfertaPlan {
  id: number;
  name: string;
  gb: string;
  calls: string;
  whatsapp: boolean;
  price: string;
  oldPrice?: string;
  discount: string;
  promo: string;
  companyName: string;
  companyId: number;
  amount: number;
  fullDetails: {
    roaming: string;
    sms: string;
    services: string[];
    finePrint: string;
  };
}

const PlanDetailModal = ({ plan, onClose, companyColor }: { plan: OfertaPlan, onClose: () => void, companyColor: string }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-[2vh] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="w-[90vw] max-w-[900px] bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-white/5">
      <div className={`p-[3vh] ${companyColor} text-white flex justify-between items-start`}>
        <div>
          <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3vh,3.5rem)]">{plan.name}</h3>
          <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">Ficha Técnica de Ventas • {plan.companyName}</p>
        </div>
        <button onClick={onClose} className="p-[1vh] bg-white/20 hover:bg-white/40 rounded-[1.5vh] transition-all">
          <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div className="p-[4vh] grid grid-cols-2 gap-[3vh] bg-slate-50/50 dark:bg-white/5">
        <div className="space-y-[2vh]">
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Roaming Incluido</p>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-[clamp(0.9rem,1.6vh,1.8rem)]">{plan.fullDetails.roaming}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Mensajería (SMS)</p>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-[clamp(0.9rem,1.6vh,1.8rem)]">{plan.fullDetails.sms}</p>
          </div>
        </div>
        <div className="space-y-[2vh]">
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Servicios Digitales</p>
            <div className="flex flex-wrap gap-[0.5vh]">
              {plan.fullDetails.services.map((s: string, i: number) => (
                <span key={i} className="px-[1vh] py-[0.5vh] bg-slate-100 dark:bg-white/10 rounded-full font-black text-slate-600 dark:text-slate-300 uppercase text-[clamp(0.65rem,1.1vh,1.3rem)]">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Argumentario</p>
            <p className="font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic text-[clamp(0.8rem,1.4vh,1.6rem)]">"{plan.fullDetails.finePrint}"</p>
          </div>
        </div>
      </div>
      <div className="p-[3vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-end">
        <button onClick={onClose} className="px-[4vh] py-[2vh] bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2vh] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-[clamp(0.8rem,1.4vh,1.6rem)]">
          Cerrar Expediente
        </button>
      </div>
    </div>
  </div>
);

interface OfertasPageProps {
  onSell: (sale: Partial<Sale>) => void;
}

// Mapeo de colores para empresas
const COMPANY_COLORS: Record<string, { color: string; text: string }> = {
  'Movistar': { color: 'bg-sky-500', text: 'text-sky-500' },
  'MOVISTAR': { color: 'bg-sky-500', text: 'text-sky-500' },
  'Vodafone': { color: 'bg-rose-600', text: 'text-rose-600' },
  'Orange': { color: 'bg-orange-500', text: 'text-orange-500' },
  'Yoigo': { color: 'bg-purple-600', text: 'text-purple-600' },
  'Personal': { color: 'bg-blue-600', text: 'text-blue-600' },
  'Tuenti': { color: 'bg-pink-500', text: 'text-pink-500' },
  'Claro': { color: 'bg-red-600', text: 'text-red-600' },
};

export const OfertasPage: React.FC<OfertasPageProps> = ({ onSell }) => {
  const [offerType, setOfferType] = useState<'PORTA' | 'LN'>('PORTA');
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [detailedPlan, setDetailedPlan] = useState<OfertaPlan | null>(null);
  const [planes, setPlanes] = useState<PlanResponse[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaOrigenResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [planesRes, empresasRes] = await Promise.all([
        getAllPlanes(),
        getEmpresasOrigen()
      ]);
      
      if (planesRes.success && planesRes.data) {
        setPlanes(planesRes.data);
      }
      if (empresasRes.success && empresasRes.data) {
        setEmpresas(empresasRes.data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Mapear planes a formato de oferta
  const mapearPlanAOferta = (plan: PlanResponse): OfertaPlan => {
    const empresa = empresas.find(e => e.empresa_origen_id === plan.empresa_origen_id);
    const esClaro = plan.empresa_origen_id === 2;
    const discount = esClaro ? '11%' : '30%';
    const promo = esClaro ? 'Sin permanencia' : '50% Dto x 12 meses';
    
    return {
      id: plan.plan_id,
      name: plan.nombre,
      gb: `${plan.gigabyte} GB`,
      calls: plan.llamadas,
      whatsapp: plan.whatsapp?.toLowerCase().includes('ilimitado') || false,
      price: `$${plan.precio}`,
      oldPrice: esClaro ? undefined : `$${Math.round(plan.precio * 1.3)}`,
      discount: discount,
      promo: promo,
      companyName: empresa?.nombre_empresa || 'Claro',
      companyId: plan.empresa_origen_id,
      amount: plan.precio,
      fullDetails: {
        roaming: plan.roaming || 'No incluido',
        sms: plan.mensajes || 'Según plan',
        services: plan.beneficios ? [plan.beneficios] : ['Servicio estándar'],
        finePrint: plan.beneficios || 'Plan estándar con condiciones generales'
      }
    };
  };

  // Filtrar planes según tipo de oferta
  const planesFiltrados = useMemo(() => {
    if (offerType === 'PORTA') {
      // PORTA: planes de empresas competencia (empresa_origen_id !== 2)
      return planes.filter(p => p.empresa_origen_id !== 2);
    } else {
      // LN: planes de Claro (empresa_origen_id === 2)
      return planes.filter(p => p.empresa_origen_id === 2);
    }
  }, [planes, offerType]);

  // Agrupar planes por empresa
  const planesPorEmpresa = useMemo(() => {
    const agrupado: Record<string, OfertaPlan[]> = {};
    planesFiltrados.forEach(plan => {
      const oferta = mapearPlanAOferta(plan);
      const empresa = empresas.find(e => e.empresa_origen_id === plan.empresa_origen_id);
      const nombreEmpresa = empresa?.nombre_empresa || 'Otras';
      
      if (!agrupado[nombreEmpresa]) {
        agrupado[nombreEmpresa] = [];
      }
      agrupado[nombreEmpresa].push(oferta);
    });
    return agrupado;
  }, [planesFiltrados, empresas]);

  // Lista de empresas para tabs
  const empresasDisponibles = useMemo(() => {
    return Object.keys(planesPorEmpresa).sort();
  }, [planesPorEmpresa]);

  // Seleccionar primera empresa por defecto
  useEffect(() => {
    if (empresasDisponibles.length > 0 && !selectedOperator) {
      setSelectedOperator(empresasDisponibles[0]);
    }
  }, [empresasDisponibles, selectedOperator]);

  // Obtener planes de la empresa seleccionada
  const currentPlans = useMemo(() => {
    return selectedOperator ? planesPorEmpresa[selectedOperator] || [] : [];
  }, [planesPorEmpresa, selectedOperator]);

  // Obtener color de empresa
  const getCompanyColor = (nombreEmpresa: string) => {
    for (const [key, colors] of Object.entries(COMPANY_COLORS)) {
      if (nombreEmpresa.toLowerCase().includes(key.toLowerCase())) {
        return colors;
      }
    }
    return { color: 'bg-slate-900', text: 'text-slate-900' };
  };

  if (loading) {
    return (
      <div className="p-[4vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-[4vh] space-y-[3vh] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[2vh]">
        <div>
          <h2 className="font-black italic text-slate-900 dark:text-white uppercase tracking-tighter text-[clamp(1.8rem,3.5vh,3.5rem)]">Ofertas Activas</h2>
          <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-[clamp(0.7rem,1.2vh,1rem)]">Planes y Promociones Comerciales</p>
        </div>
        <div className="flex gap-[1vh] bg-white dark:bg-slate-800 p-[0.8vh] rounded-[2vh] border border-slate-200 dark:border-white/5 shadow-lg">
          <button 
            onClick={() => { setOfferType('PORTA'); setSelectedOperator(''); }}
            className={`px-[3vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-widest text-[clamp(0.7rem,1.3vh,1.1rem)] transition-all ${offerType === 'PORTA' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            🔄 Portabilidad
          </button>
          <button 
            onClick={() => { setOfferType('LN'); setSelectedOperator(''); }}
            className={`px-[3vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-widest text-[clamp(0.7rem,1.3vh,1.1rem)] transition-all ${offerType === 'LN' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-purple-600'}`}
          >
            📱 Línea Nueva
          </button>
        </div>
      </div>

      {/* Tabs de Empresas (solo para PORTA) */}
      {offerType === 'PORTA' && empresasDisponibles.length > 0 && (
        <div className="flex gap-[1vh] overflow-x-auto pb-[1vh]">
          {empresasDisponibles.map(empresa => {
            const colors = getCompanyColor(empresa);
            return (
              <button
                key={empresa}
                onClick={() => setSelectedOperator(empresa)}
                className={`flex-shrink-0 px-[2.5vh] py-[1.2vh] rounded-[1.5vh] font-black uppercase tracking-widest text-[clamp(0.65rem,1.1vh,1rem)] transition-all ${
                  selectedOperator === empresa 
                    ? `${colors.color} text-white shadow-lg` 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-indigo-300'
                }`}
              >
                {empresa}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2.5vh]">
        {currentPlans.map((plan, idx) => {
          const colors = getCompanyColor(plan.companyName);
          return (
            <div key={idx} className="bento-card rounded-[4vh] p-[4.5vh] flex flex-col hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:scale-[1.03] group relative overflow-hidden transition-all duration-500 border border-white/40 dark:bg-slate-900/40 dark:border-white/5">
              <div className="absolute top-[2vh] right-[2vh] bg-emerald-500 text-white px-[2vh] py-[1vh] rounded-full font-black uppercase tracking-widest shadow-lg animate-pulse z-20 text-[clamp(0.65rem,1.1vh,1.2rem)]">-{plan.discount} DTO</div>
              <div className="flex justify-between items-start mb-[3.5vh] relative z-10">
                <div className="flex-1">
                  <span className={`px-[1.5vh] py-[0.6vh] rounded-[1vh] font-black text-white uppercase text-[clamp(0.6rem,1vh,1.2rem)] ${colors.color}`}>{plan.companyName}</span>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight italic mt-[1.5vh] text-[clamp(1.5rem,3.2vh,3rem)]">{plan.name}</h4>
                </div>
                <div className="text-right">
                  <p className={`font-black ${colors.text} dark:text-white italic tracking-tighter leading-none text-[clamp(2rem,4.5vh,4.5rem)]`}>{plan.price}</p>
                  {plan.oldPrice && <p className="text-slate-400 line-through font-bold text-[clamp(0.9rem,1.6vh,1.8rem)]">{plan.oldPrice}</p>}
                </div>
              </div>
              <div className={`p-[3vh] rounded-[2.5vh] ${colors.color} text-white shadow-xl relative overflow-hidden mb-[3.5vh]`}>
                <p className="font-black leading-snug text-[clamp(0.9rem,1.6vh,1.8rem)]">{plan.promo}</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rotate-45 translate-x-10 -translate-y-10 group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="grid grid-cols-2 gap-[2vh] mt-auto relative z-10">
                <button onClick={() => setDetailedPlan(plan)} className="py-[2.2vh] rounded-[2vh] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 hover:border-indigo-100 transition-all active:scale-95 text-[clamp(0.8rem,1.4vh,1.5rem)] shadow-sm">Ficha</button>
                <button 
                  onClick={() => onSell({ 
                    plan: plan.name, 
                    amount: plan.amount, 
                    promotion: plan.promo, 
                    productType: offerType === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE, 
                    originCompany: plan.companyName,
                    plan_id: plan.id,
                    empresa_origen_id: plan.companyId
                  })}
                  className="py-[2.2vh] rounded-[2vh] bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all active:scale-95 text-[clamp(0.8rem,1.4vh,1.5rem)] shadow-xl"
                >
                  Vender
                </button>
              </div>
            </div>
          );
        })}
        {currentPlans.length === 0 && (
          <div className="col-span-full p-[6vh] text-center glass-panel rounded-[3vh] dark:bg-slate-900/40 dark:border-white/5">
            <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.8rem,1.5vh,1rem)]">No hay ofertas configuradas para esta categoría.</p>
          </div>
        )}
      </div>
      {detailedPlan && <PlanDetailModal plan={detailedPlan} onClose={() => setDetailedPlan(null)} companyColor={getCompanyColor(detailedPlan.companyName).color} />}
    </div>
  );
};
