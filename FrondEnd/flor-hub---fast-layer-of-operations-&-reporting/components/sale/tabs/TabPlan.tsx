
import React, { memo } from 'react';
import { SaleDetail } from '../../../types';
import { EditableField, SectionHeader } from '../SaleModalHelpers';
import { EMPRESAS_ORIGEN_MOCK } from '../../../mocks/empresasOrigen';

export const TabPlan = memo(({ editedData, isEditing, onEdit }: { 
  editedData: SaleDetail | null, 
  isEditing: boolean, 
  onEdit: (f: string, v: any) => void 
}) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div>
      <SectionHeader title="Plan Contratado" icon="📱" />
      <div className="bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-transparent dark:from-indigo-500/10 dark:via-purple-500/10 border border-white dark:border-white/5 rounded-[4vh] p-[5vh] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-indigo-100 dark:text-indigo-400 opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/></svg>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-[4vh] relative z-10">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-[clamp(1.5rem,3.5vh,4rem)] leading-tight">{editedData?.plan?.nombre ?? 'Plan Desconocido'}</h3>
            <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-widest uppercase text-[clamp(0.6rem,1.1vh,1.3rem)] mt-2">Cobertura Nacional 5G</p>
          </div>
          <div className="flex flex-col items-end">
            {editedData?.descuento && editedData.descuento > 0 ? (
              <>
                <span className="font-black text-slate-400 dark:text-slate-500 line-through text-xl">
                  ${(editedData?.precioBase ?? 0).toLocaleString()}
                </span>
                <span className="font-black text-green-600 dark:text-green-400 text-[clamp(2.5rem,5.5vh,6rem)] leading-none tracking-tighter">
                  ${(editedData?.precioFinal ?? 0).toLocaleString()}
                </span>
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold mt-1">
                  {editedData.descuento}% OFF
                </span>
              </>
            ) : (
              <span className="font-black text-slate-900 dark:text-white text-[clamp(2.5rem,5.5vh,6rem)] leading-none tracking-tighter">
                ${(editedData?.plan?.precio ?? 0).toLocaleString()}
              </span>
            )}
            <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[clamp(0.7rem,1.2vh,1.4rem)] mt-2">Final por Mes</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2vh] mb-[4vh] relative z-10">
          {[
            { val: editedData?.plan?.gigabyte, label: 'GB Datos', unit: 'GB' },
            { val: editedData?.plan?.llamadas, label: 'Llamadas' },
            { val: editedData?.plan?.mensajes, label: 'SMS' },
            { val: editedData?.plan?.whatsapp, label: 'WhatsApp' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[3vh] p-[3vh] text-center border border-white/80 dark:border-white/5 shadow-sm hover:shadow-indigo-100 dark:hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all duration-500">
              <div className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(1.8rem,3.5vh,4rem)] leading-none mb-2">
                {item.val ?? '???'}
              </div>
              <div className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.55rem,0.9vh,1.1rem)]">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {editedData?.plan?.beneficios && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2.5vh] p-6 border border-white/60 dark:border-white/5 relative z-10">
            <div className="text-[clamp(0.6rem,1vh,1.2rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="text-indigo-400">✦</span> Beneficios Adicionales
            </div>
            <div className="text-[clamp(0.85rem,1.4vh,1.8rem)] font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{editedData.plan.beneficios}"
            </div>
          </div>
        )}
      </div>
    </div>

    {editedData?.portabilidad && (
      <div>
        <SectionHeader title="Datos de Portabilidad" icon="🔄" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <EditableField label="N° a Portar" value={editedData?.portabilidad?.numeroPortar} field="portabilidad.numeroPortar" isEditing={isEditing} onEdit={onEdit} />
          <EditableField 
            label="Empresa Origen" value={editedData?.portabilidad?.empresaOrigen} field="portabilidad.empresaOrigen" type="select"
            options={EMPRESAS_ORIGEN_MOCK.map(e => ({ value: e.nombre, label: e.nombre }))}
            isEditing={isEditing} onEdit={onEdit}
          />
          <EditableField 
            label="Mercado Origen" value={editedData?.portabilidad?.mercadoOrigen} field="portabilidad.mercadoOrigen" type="select"
            options={[{ value: 'Prepago', label: 'Prepago' }, { value: 'Pospago', label: 'Pospago' }]}
            isEditing={isEditing} onEdit={onEdit}
          />
        </div>
      </div>
    )}
  </div>
));
