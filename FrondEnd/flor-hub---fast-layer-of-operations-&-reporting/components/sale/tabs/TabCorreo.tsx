
import React, { memo, useState } from 'react';
import { SaleDetail, LogisticStatus } from '../../../types';
import { EditableField, SectionHeader } from '../SaleModalHelpers';

export const TabCorreo = memo(({ editedData, isEditing, onEdit, onUpdateLogistic }: { 
  editedData: SaleDetail | null, 
  isEditing: boolean, 
  onEdit: (f: string, v: any) => void,
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>
}) => {
  const [showLogisticForm, setShowLogisticForm] = useState(false);
  const [newLogistic, setNewLogistic] = useState<LogisticStatus | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogisticSubmit = async () => {
    // console.log('handleLogisticSubmit called', { newLogistic, hasOnUpdate: !!onUpdateLogistic });
    if (!newLogistic || !onUpdateLogistic) return;
    setIsSubmitting(true);
    try {
      await onUpdateLogistic(newLogistic as LogisticStatus, comment);
      setShowLogisticForm(false);
      setNewLogistic('');
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <SectionHeader title="Información de Envío" icon="📮" />
        {!showLogisticForm && (
          <button 
            onClick={() => setShowLogisticForm(true)}
            className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl font-black uppercase text-xs transition-all border border-indigo-600/20"
          >
            🔄 Actualizar Estado
          </button>
        )}
      </div>

      {showLogisticForm && (
        <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl border-2 border-indigo-500/30 space-y-4 animate-in slide-in-from-top-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Nuevo Estado Logístico</label>
              <select 
                value={newLogistic}
                onChange={(e) => setNewLogistic(e.target.value as LogisticStatus)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar estado...</option>
                {Object.values(LogisticStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Comentario</label>
              <input 
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escriba un comentario..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setShowLogisticForm(false)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all text-slate-500"
            >
              Cancelar
            </button>
            <button 
              onClick={handleLogisticSubmit}
              disabled={!newLogistic || isSubmitting}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
            </button>
          </div>
        </div>
      )}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <EditableField label="Destinatario" value={editedData?.correo?.destinatario || ''} field="correo.destinatario" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Persona Autorizada" value={editedData?.correo?.personaAutorizada || ''} field="correo.personaAutorizada" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Teléfono Contacto" value={editedData?.correo?.telefonoContacto || ''} field="correo.telefonoContacto" isEditing={isEditing} onEdit={onEdit} />
    </div>

    <SectionHeader title="Dirección de Entrega" icon="📍" />
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <EditableField label="Calle" value={editedData?.correo?.direccion || ''} field="correo.direccion" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Número" value={editedData?.correo?.numeroCasa || ''} field="correo.numeroCasa" type="number" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Localidad" value={editedData?.correo?.localidad || ''} field="correo.localidad" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="Provincia" value={editedData?.correo?.departamento || ''} field="correo.departamento" isEditing={isEditing} onEdit={onEdit} />
      <EditableField label="C.P." value={editedData?.correo?.codigoPostal || ''} field="correo.codigoPostal" type="number" isEditing={isEditing} onEdit={onEdit} />
    </div>
    </div>
  );
});
