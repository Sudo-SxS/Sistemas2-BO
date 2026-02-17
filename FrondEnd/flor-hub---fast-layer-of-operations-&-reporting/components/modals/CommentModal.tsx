import React, { useState } from 'react';
import { useVentaComentarios, Comentario } from '../../hooks/useVentaComentarios';
import { createComentario, TipoComentario } from '../../services/createComentario';
import { useToast } from '../../contexts/ToastContext';

interface CommentModalProps {
  ventaId: number;
  customerName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr === '{}' || dateStr === 'Invalid Date') return '-';
  // Si ya viene formateado del backend (DD/MM/YYYY HH24:MI), usarlo directamente
  if (/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(dateStr)) return dateStr;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const getTipoIcon = (tipo: string): string => {
  switch (tipo) {
    case 'GENERAL': return '📝';
    case 'IMPORTANTE': return '⚠️';
    case 'SEGUIMIENTO': return '📋';
    case 'SISTEMA': return '🔧';
    default: return '📝';
  }
};

const getTipoColor = (tipo: string): string => {
  switch (tipo) {
    case 'GENERAL': return 'border-l-indigo-500';
    case 'IMPORTANTE': return 'border-l-red-500';
    case 'SEGUIMIENTO': return 'border-l-amber-500';
    case 'SISTEMA': return 'border-l-slate-500';
    default: return 'border-l-indigo-500';
  }
};

export const CommentModal: React.FC<CommentModalProps> = ({ ventaId, customerName, onClose, onSuccess }) => {
  const { comentarios, isLoading, refetch } = useVentaComentarios(ventaId);
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tipo, setTipo] = useState<TipoComentario>('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComentario({
        titulo: title,
        comentario: text,
        venta_id: ventaId,
        tipo_comentario: tipo
      });
      setTitle('');
      setText('');
      setTipo('GENERAL');

      // Toast de éxito
      addToast({
        type: 'success',
        title: 'Comentario Agregado',
        message: 'El comentario se ha publicado correctamente.'
      });

      if (onSuccess) onSuccess();
      refetch();
    } catch (error) {
      console.error('Error al añadir comentario:', error);

      // Toast de error
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el comentario. Intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500 p-2 sm:p-4">
      <div 
        className="w-full max-w-4xl h-[85vh] sm:h-[80vh] lg:max-w-6xl lg:h-[85vh] bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 duration-500 rounded-2xl lg:rounded-[2vh] overflow-hidden border border-white/50 dark:border-white/5"
      >
        <div className="relative p-4 sm:p-6 lg:p-[4vh] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-white shrink-0 flex-shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10 flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 lg:gap-[3vh]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[8vh] lg:h-[8vh] bg-white/10 rounded-xl sm:rounded-2xl lg:rounded-[2.5vh] flex items-center justify-center text-2xl sm:text-3xl lg:text-[4vh] shadow-inner border border-white/10">
                💬
              </div>
              <div>
                <h3 className="text-lg sm:text-xl lg:text-[clamp(1.2rem,3vh,3.5rem)] font-black italic tracking-tighter uppercase leading-tight">Bitácora de Eventos</h3>
                <div className="flex items-center gap-2 lg:gap-[1.5vh] mt-1 lg:mt-[0.5vh]">
                  <span className="w-2 h-2 lg:w-[1.2vh] lg:h-[1.2vh] rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-xs sm:text-sm lg:text-[clamp(0.6rem,1.1vh,1.3rem)] font-black uppercase tracking-[0.2em] text-indigo-200 dark:text-indigo-300">Expediente V-{ventaId} • {customerName}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 sm:p-3 lg:p-[2vh] hover:bg-white/10 rounded-xl lg:rounded-[2.5vh] transition-all group bg-white/5 border border-white/10"
            >
              <svg className="w-6 h-6 lg:w-[3vh] lg:h-[3vh] group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-6 lg:py-6 space-y-4 lg:space-y-6 bg-slate-50/50 dark:bg-slate-950/20 no-scrollbar min-h-0">
            <div className="flex items-center gap-3 lg:gap-[2vh] mb-4 lg:mb-[2vh]">
              <span className="text-xs sm:text-sm lg:text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Línea de Tiempo</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {isLoading ? (
              <div className="text-center py-12 lg:py-[15vh]">
                <div className="w-12 h-12 lg:w-[6vh] lg:h-[6vh] border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 lg:mb-[2vh]"></div>
                <p className="text-sm lg:text-[clamp(0.8rem,1.6vh,2.2rem)] font-bold text-slate-400">Cargando comentarios...</p>
              </div>
            ) : !comentarios || comentarios.length === 0 ? (
              <div className="text-center py-12 lg:py-[15vh] bg-white/50 dark:bg-slate-900/40 rounded-2xl lg:rounded-[4vh] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm lg:text-[clamp(0.8rem,1.6vh,2.2rem)] font-bold text-slate-400 dark:text-slate-600 italic">No hay movimientos registrados.</p>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {comentarios.map((comment, idx) => (
                  <div key={comment.comentario_id || idx} className="group relative animate-in slide-in-from-top-4 duration-500">
                    <div className="flex gap-3 lg:gap-[3vh]">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 lg:w-[6vh] lg:h-[6vh] rounded-xl lg:rounded-[2.2vh] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg lg:text-[clamp(1rem,2vh,2.5rem)] font-black text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-colors">
                          {comment.author?.charAt(0) || '?'}
                        </div>
                        {idx < comentarios.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 my-2 lg:my-[1vh]"></div>}
                      </div>
                      <div className="flex-1 space-y-2 lg:space-y-[1.5vh] pb-4 lg:pb-[1vh]">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm lg:text-[clamp(0.8rem,1.3vh,1.6rem)] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{comment.author}</span>
                            <span className="text-xs lg:text-[clamp(0.6rem,1vh,1.2rem)] font-medium px-2 py-0.5 lg:px-[1.5vh] lg:py-[0.5vh] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {getTipoIcon(comment.tipo)} {comment.tipo}
                            </span>
                          </div>
                          <span className="text-xs lg:text-[clamp(0.6rem,1vh,1.2rem)] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 lg:px-[1.5vh] lg:py-[0.5vh] rounded-full border border-indigo-100 dark:border-indigo-800/20">{formatDate(comment.fecha)}</span>
                        </div>
                        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 lg:p-[3vh] rounded-xl lg:rounded-[3.5vh] rounded-tl-none shadow-sm group-hover:shadow-xl group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-all duration-500 border-l-4 ${getTipoColor(comment.tipo)}`}>
                          <h4 className="text-sm lg:text-[clamp(0.7rem,1.2vh,1.4rem)] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2 lg:mb-[1vh] tracking-widest leading-none">{comment.titulo}</h4>
                          <p className="text-sm lg:text-[clamp(0.85rem,1.6vh,2.2rem)] font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{comment.comentario}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )).reverse()}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[380px] xl:w-[420px] p-4 lg:p-6 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 shrink-0 flex flex-col justify-start gap-4 lg:gap-[3vh] overflow-y-auto max-h-[40vh] lg:max-h-none">
            <div className="space-y-3 lg:space-y-[3vh]">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 lg:p-[3vh] rounded-xl lg:rounded-[3vh] border border-indigo-100 dark:border-indigo-800/40">
                <p className="text-xs lg:text-[clamp(0.7rem,1.2vh,1.4rem)] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em] leading-relaxed">
                  Registra nuevas novedades sobre este expediente
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-[3vh]">
                <div className="space-y-2 lg:space-y-[1.5vh]">
                  <label className="text-xs lg:text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 lg:ml-[1.5vh]">Tipo de evento</label>
                  <select 
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoComentario)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl lg:rounded-[2.5vh] px-4 py-3 lg:px-[2.5vh] lg:py-[2vh] text-sm lg:text-[clamp(0.9rem,1.6vh,1.9rem)] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all outline-none cursor-pointer"
                  >
                    <option value="GENERAL">📝 General</option>
                    <option value="IMPORTANTE">⚠️ Importante</option>
                    <option value="SEGUIMIENTO">📋 Seguimiento</option>
                    <option value="SISTEMA">🔧 Sistema</option>
                  </select>
                </div>
                
                <div className="space-y-2 lg:space-y-[1.5vh]">
                  <label className="text-xs lg:text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 lg:ml-[1.5vh]">Título del Evento</label>
                  <input 
                    type="text"
                    placeholder="Ej: Cliente ausente"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl lg:rounded-[2.5vh] px-4 py-3 lg:px-[2.5vh] lg:py-[2vh] text-sm lg:text-[clamp(0.9rem,1.6vh,1.9rem)] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all outline-none"
                  />
                </div>
                
                <div className="space-y-2 lg:space-y-[1.5vh]">
                  <label className="text-xs lg:text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 lg:ml-[1.5vh]">Detalle Informativo</label>
                  <textarea 
                    placeholder="Escribe aquí..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl lg:rounded-[2.5vh] px-4 py-3 lg:px-[3vh] lg:py-[3vh] text-sm lg:text-[clamp(0.9rem,1.6vh,1.9rem)] font-medium text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 outline-none h-32 lg:h-[25vh] resize-none transition-all"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={!title || !text || isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black py-3 lg:py-[2.5vh] rounded-xl lg:rounded-[2.5vh] shadow-lg disabled:shadow-none transition-all flex items-center justify-center gap-2 lg:gap-[2vh] uppercase tracking-[0.2em] text-sm lg:text-[clamp(0.7rem,1.2vh,1.4rem)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 lg:w-[3vh] lg:h-[3vh] border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Registrar</span>
                      <svg className="w-5 h-5 lg:w-[2.5vh] lg:h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
