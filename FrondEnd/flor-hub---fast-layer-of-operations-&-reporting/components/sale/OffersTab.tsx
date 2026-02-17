import React, { useState, useMemo } from 'react';
import { ProductType, Sale } from '../../types';

const PlanDetailModal = ({ plan, onClose, companyColor }: { plan: any, onClose: () => void, companyColor: string }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-[2vh] bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
    <div className="w-[90vw] max-w-[900px] bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-white/5">
      <div className={`p-[3vh] ${companyColor} text-white flex justify-between items-start`}>
        <div>
          <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3vh,2.5rem)]">{plan.name}</h3>
          <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.5rem,0.9vh,0.7rem)]">Ficha Técnica de Ventas • {plan.companyName}</p>
        </div>
        <button onClick={onClose} className="p-[1vh] bg-white/20 hover:bg-white/40 rounded-[1.5vh] transition-all">
          <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div className="p-[4vh] grid grid-cols-2 gap-[3vh] bg-slate-50/50 dark:bg-slate-950/20">
        <div className="space-y-[2vh]">
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 uppercase tracking-widest mb-[1vh] text-[clamp(0.5rem,0.8vh,0.6rem)]">Roaming Incluido</p>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-[clamp(0.8rem,1.5vh,1rem)]">{plan.fullDetails.roaming}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 uppercase tracking-widest mb-[1vh] text-[clamp(0.5rem,0.8vh,0.6rem)]">Mensajería (SMS)</p>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-[clamp(0.8rem,1.5vh,1rem)]">{plan.fullDetails.sms}</p>
          </div>
        </div>
        <div className="space-y-[2vh]">
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 uppercase tracking-widest mb-[1vh] text-[clamp(0.5rem,0.8vh,0.6rem)]">Servicios Digitales</p>
            <div className="flex flex-wrap gap-[0.5vh]">
              {plan.fullDetails.services.map((s: string, i: number) => (
                <span key={i} className="px-[1vh] py-[0.5vh] bg-slate-100 dark:bg-slate-700 rounded-full font-black text-slate-600 dark:text-slate-300 uppercase text-[clamp(0.6rem,1vh,0.8rem)]">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 uppercase tracking-widest mb-[1vh] text-[clamp(0.5rem,0.8vh,0.6rem)]">Argumentario</p>
            <p className="font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic text-[clamp(0.7rem,1.2vh,0.9rem)]">"{plan.fullDetails.finePrint}"</p>
          </div>
        </div>
      </div>
      <div className="p-[3vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-end">
        <button onClick={onClose} className="px-[4vh] py-[1.5vh] bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-[2vh] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-[clamp(0.7rem,1.2vh,0.9rem)]">
          Cerrar Expediente
        </button>
      </div>
    </div>
  </div>
);

interface OffersTabProps {
  onSell: (sale: Partial<Sale>) => void;
}

export const OffersTab: React.FC<OffersTabProps> = ({ onSell }) => {
  const [offerType, setOfferType] = useState<'PORTA' | 'LN'>('PORTA');
  const [selectedOperator, setSelectedOperator] = useState('MOV');
  const [detailedPlan, setDetailedPlan] = useState<any | null>(null);

  const COMPANIES = [
    { id: 'MOV', name: 'Movistar', logo: 'M', color: 'bg-sky-500', text: 'text-sky-500' },
    { id: 'VOD', name: 'Vodafone', logo: 'V', color: 'bg-rose-600', text: 'text-rose-600' },
    { id: 'ORA', name: 'Orange', logo: 'O', color: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'YOI', name: 'Yoigo', logo: 'Y', color: 'bg-purple-600', text: 'text-purple-600' }
  ];

  // Mapeo de códigos de empresa a IDs numéricos (mock - en producción vendrían del backend)
  const COMPANY_ID_MAP: Record<string, number> = {
    'MOV': 1,
    'VOD': 2,
    'ORA': 3,
    'YOI': 4
  };

  const OFFERS_DATA: Record<string, { PORTA: any[], LN: any[] }> = {
    'MOV': {
      PORTA: [
        { id: 101, name: 'Ilimitada Plus 5G+', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '31.95€', oldPrice: '45.00€', discount: '30%', promo: '50% Dto x 12 meses', promocion_id: 1001, companyName: 'Movistar', companyId: 'MOV', amount: 31.95, fullDetails: { roaming: 'EU, UK, Islandia', sms: 'Ilimitados', services: ['MultiSIM', 'Seguro'], finePrint: 'Tarifa líder para portabilidades premium.' } },
        { id: 102, name: 'Plan Avanzado 30GB', gb: '30 GB', calls: 'Ilimitadas', whatsapp: true, price: '19.95€', oldPrice: '25.95€', discount: '23%', promo: 'Segunda línea 50% dto', promocion_id: 1002, companyName: 'Movistar', companyId: 'MOV', amount: 19.95, fullDetails: { roaming: 'EU', sms: '50 SMS/mes', services: ['Antivirus'], finePrint: 'Ideal para ahorro.' } }
      ],
      LN: [{ id: 103, name: 'LN Ilimitada 5G', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '39.95€', oldPrice: '45.00€', discount: '11%', promo: 'Sin permanencia', promocion_id: 1003, companyName: 'Movistar', companyId: 'MOV', amount: 39.95, fullDetails: { roaming: 'EU', sms: 'Ilimitados', services: ['SIM VIP'], finePrint: 'Para altas nuevas.' } }]
    },
    'VOD': {
      PORTA: [
        { id: 201, name: 'Vodafone Ilimitada Max', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '35.60€', oldPrice: '42.00€', discount: '15%', promo: 'Súper descuento x 24 meses', promocion_id: 2001, companyName: 'Vodafone', companyId: 'VOD', amount: 35.60, fullDetails: { roaming: 'EU, USA', sms: 'Ilimitados', services: ['OneNumber'], finePrint: 'Velocidad 5G real.' } }
      ],
      LN: []
    },
    'ORA': {
      PORTA: [
        { id: 301, name: 'Go Max Cine y Series', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '37.00€', oldPrice: '40.00€', discount: '8%', promo: 'Bono TV Gratis', promocion_id: 3001, companyName: 'Orange', companyId: 'ORA', amount: 37.00, fullDetails: { roaming: 'EU', sms: 'Ilimitados', services: ['Orange TV'], finePrint: 'Entretenimiento total.' } }
      ],
      LN: []
    },
    'YOI': {
      PORTA: [
        { id: 401, name: 'La Sinfín Ilimitada', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '25.00€', oldPrice: '32.00€', discount: '22%', promo: 'Precio para siempre', promocion_id: 4001, companyName: 'Yoigo', companyId: 'YOI', amount: 25.00, fullDetails: { roaming: 'EU', sms: 'Ilimitados', services: ['Agile TV'], finePrint: 'Transparencia total.' } }
      ],
      LN: []
    }
  };

  const currentPlans = useMemo(() => {
    if (offerType === 'PORTA') {
      return OFFERS_DATA[selectedOperator]?.PORTA || [];
    } else {
      return Object.values(OFFERS_DATA).flatMap(comp => comp.LN || []);
    }
  }, [offerType, selectedOperator]);

  const activeCompany = COMPANIES.find(c => c.id === selectedOperator);

  return (
    <div className="space-y-[3vh] animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[2vw] glass-panel p-[3vh] rounded-[3.5vh] border border-white/60 dark:border-white/10">
        <div>
          <h2 className="font-black tracking-tighter text-slate-900 italic uppercase text-[clamp(1.5rem,3vh,2.5rem)]">Marketplace Hub</h2>
          <p className="font-black text-slate-400 uppercase tracking-[0.3em] mt-[0.5vh] text-[clamp(0.5rem,0.9vh,0.7rem)]">Argumentarios & Ofertas</p>
        </div>
        <div className="flex items-center gap-[1vw] bg-indigo-900/10 dark:bg-slate-900 p-[1vh] rounded-[2vh] shadow-xl dark:shadow-2xl border border-indigo-200 dark:border-white/5">
          <button onClick={() => setOfferType('PORTA')} className={`px-[2vh] py-[1vh] rounded-[1.5vh] font-black uppercase tracking-widest transition-all text-[clamp(0.6rem,1vh,0.8rem)] ${offerType === 'PORTA' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Portabilidad</button>
          <button onClick={() => setOfferType('LN')} className={`px-[2vh] py-[1vh] rounded-[1.5vh] font-black uppercase tracking-widest transition-all text-[clamp(0.6rem,1vh,0.8rem)] ${offerType === 'LN' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Línea Nueva</button>
        </div>
      </div>

      {offerType === 'PORTA' && (
        <div className="flex flex-wrap gap-[0.5vw] bg-white/40 dark:bg-slate-800/40 p-[1vh] rounded-[2.5vh] border border-white/60 dark:border-white/10 shadow-sm">
          {COMPANIES.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedOperator(company.id)}
              className={`flex-1 min-w-[10vw] flex items-center justify-center gap-[1vw] px-[2vw] py-[1.5vh] rounded-[1.5vh] transition-all duration-300 ${selectedOperator === company.id ? 'bg-white dark:bg-slate-700 shadow-xl ring-2 ring-slate-100 dark:ring-white/5 scale-[1.02]' : 'hover:bg-white/40 dark:hover:bg-slate-700/40 opacity-60 dark:opacity-40 grayscale'}`}
            >
              <div className={`w-[3vh] h-[3vh] rounded-[0.8vh] ${company.color} flex items-center justify-center text-white font-black italic shadow-md text-[clamp(0.8rem,1.5vh,1rem)]`}>
                {company.logo}
              </div>
              <span className={`font-black uppercase tracking-widest text-[clamp(0.6rem,1vh,0.8rem)] ${selectedOperator === company.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {company.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[3vh]">
        {currentPlans.map((plan, idx) => {
            const planComp = COMPANIES.find(c => c.id === plan.companyId);
            return (
                <div key={idx} className="bento-card rounded-[3vh] p-[3vh] flex flex-col hover:shadow-2xl hover:scale-[1.02] group relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-[1.5vh] right-[1.5vh] bg-emerald-500 text-white px-[1vh] py-[0.5vh] rounded-full font-black uppercase tracking-widest shadow-lg animate-pulse z-20 text-[clamp(0.5rem,0.8vh,0.6rem)]">-{plan.discount} DTO</div>
                    <div className="flex justify-between items-start mb-[2vh] relative z-10">
                    <div className="flex-1">
                        <span className={`px-[0.8vh] py-[0.3vh] rounded-[0.5vh] font-black text-white uppercase text-[clamp(0.4rem,0.7vh,0.6rem)] ${planComp?.color || (offerType === 'PORTA' ? activeCompany?.color : 'bg-purple-600')}`}>{plan.companyName}</span>
                        <h4 className="font-black text-slate-900 uppercase tracking-tighter leading-none italic mt-[1vh] text-[clamp(1.2rem,2vh,1.6rem)]">{plan.name}</h4>
                    </div>
                    <div className="text-right">
                        <p className={`font-black ${planComp?.text || (offerType === 'PORTA' ? activeCompany?.text : 'text-purple-600')} italic tracking-tighter text-[clamp(1.5rem,3vh,2.2rem)]`}>{plan.price}</p>
                    </div>
                    </div>
                    <div className={`p-[2vh] rounded-[2vh] ${planComp?.color || (offerType === 'PORTA' ? activeCompany?.color : 'bg-purple-600')} text-white shadow-xl relative overflow-hidden mb-[2vh]`}>
                    <p className="font-black leading-tight text-[clamp(0.7rem,1.2vh,0.9rem)]">{plan.promo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-[1vh] mt-auto relative z-10">
                    <button onClick={() => setDetailedPlan(plan)} className="py-[1.5vh] rounded-[1.5vh] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 text-[clamp(0.6rem,1vh,0.8rem)]">Ficha</button>
                    <button
                        onClick={() => onSell({
                          plan: plan.name,
                          plan_id: plan.id,
                          amount: plan.amount,
                          promotion: plan.promo,
                          promocion_id: plan.promocion_id,
                          productType: offerType === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE,
                          originCompany: plan.companyName,
                          empresa_origen_id: COMPANY_ID_MAP[plan.companyId]
                        })}
                        className="py-[1.5vh] rounded-[1.5vh] bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 text-[clamp(0.6rem,1vh,0.8rem)]"
                    >
                        Vender
                    </button>
                    </div>
                </div>
            );
        })}
        {currentPlans.length === 0 && (
          <div className="col-span-full p-[6vh] text-center glass-panel rounded-[3vh]">
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[clamp(0.8rem,1.5vh,1rem)]">No hay ofertas configuradas para esta categoría.</p>
          </div>
        )}
      </div>
      {detailedPlan && <PlanDetailModal plan={detailedPlan} onClose={() => setDetailedPlan(null)} companyColor={COMPANIES.find(c => c.id === detailedPlan.companyId)?.color || "bg-slate-900"} />}
    </div>
  );
};
