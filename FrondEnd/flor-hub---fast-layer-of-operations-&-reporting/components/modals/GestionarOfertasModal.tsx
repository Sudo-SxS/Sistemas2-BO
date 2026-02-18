import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

interface GestionarOfertasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'promociones' | 'planes' | 'empresas';

interface Empresa {
  empresa_origen_id: number;
  nombre_empresa: string;
  pais: string;
}

interface Promocion {
  promocion_id: number;
  nombre: string;
  beneficios?: string;
  empresa_origen_id: number;
  descuento: number;
  activo: boolean;
  empresa?: Empresa;
}

interface Plan {
  plan_id: number;
  nombre: string;
  precio: number;
  gigabyte: number;
  llamadas: string;
  mensajes: string;
  whatsapp: string;
  roaming: string;
  beneficios?: string;
  empresa_origen_id: number;
  promocion_id?: number;
  activo: boolean;
  empresa?: Empresa;
  promocion?: Promocion;
}

const initialPromocion: Partial<Promocion> = {
  nombre: '',
  beneficios: '',
  empresa_origen_id: undefined,
  descuento: 0,
  activo: true,
};

const initialPlan: Partial<Plan> = {
  nombre: '',
  precio: 0,
  gigabyte: 0,
  llamadas: 'Ilimitadas',
  mensajes: 'Ilimitados',
  whatsapp: 'SI',
  roaming: 'Nacional',
  beneficios: '',
  empresa_origen_id: undefined,
  promocion_id: undefined,
  activo: true,
};

const initialEmpresa: Partial<Empresa> = {
  nombre_empresa: '',
  pais: 'Argentina',
};

export const GestionarOfertasModal: React.FC<GestionarOfertasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('promociones');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formPromocion, setFormPromocion] = useState<Partial<Promocion>>(initialPromocion);
  const [formPlan, setFormPlan] = useState<Partial<Plan>>(initialPlan);
  const [formEmpresa, setFormEmpresa] = useState<Partial<Empresa>>(initialEmpresa);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, promoRes, planRes] = await Promise.all([
        api.get('/empresa-origen'),
        api.get('/promociones'),
        api.get('/planes'),
      ]);
      
      setEmpresas(empRes.data || []);
      setPromociones(promoRes.data || []);
      setPlanes(planRes.data || []);
    } catch (err: any) {
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setShowForm(false);
      setEditingId(null);
    }
  }, [isOpen, loadData]);

  const resetForm = () => {
    setFormPromocion(initialPromocion);
    setFormPlan(initialPlan);
    setFormEmpresa(initialEmpresa);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.promocion_id || item.plan_id || item.empresa_origen_id);
    
    if (activeTab === 'promociones') {
      setFormPromocion({ ...item });
    } else if (activeTab === 'planes') {
      setFormPlan({ ...item });
    } else {
      setFormEmpresa({ ...item });
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    setLoading(true);
    try {
      if (activeTab === 'promociones') {
        await api.delete(`/promociones/${id}`);
        setPromociones(prev => prev.filter(p => p.promocion_id !== id));
      } else if (activeTab === 'planes') {
        await api.delete(`/planes/${id}`);
        setPlanes(prev => prev.filter(p => p.plan_id !== id));
      } else {
        await api.delete(`/empresa-origen/${id}`);
        setEmpresas(prev => prev.filter(e => e.empresa_origen_id !== id));
      }
    } catch (err: any) {
      setError('Error al eliminar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'promociones') {
        if (!formPromocion.nombre || !formPromocion.empresa_origen_id) {
          setError('Nombre y Empresa son requeridos');
          setLoading(false);
          return;
        }
        
        const data = {
          nombre: formPromocion.nombre?.toUpperCase(),
          beneficios: formPromocion.beneficios || '',
          empresa_origen_id: formPromocion.empresa_origen_id,
          descuento: formPromocion.descuento || 0,
          activo: formPromocion.activo ?? true,
        };

        if (editingId) {
          const res = await api.put(`/promociones/${editingId}`, data);
          setPromociones(prev => prev.map(p => p.promocion_id === editingId ? { ...p, ...res.data } : p));
        } else {
          const res = await api.post('/promociones', data);
          setPromociones(prev => [...prev, res.data]);
        }
      } else if (activeTab === 'planes') {
        if (!formPlan.nombre || !formPlan.precio || !formPlan.gigabyte || !formPlan.empresa_origen_id) {
          setError('Nombre, Precio, GB y Empresa son requeridos');
          setLoading(false);
          return;
        }

        const data = {
          nombre: formPlan.nombre?.toUpperCase(),
          precio: formPlan.precio,
          gigabyte: formPlan.gigabyte,
          llamadas: formPlan.llamadas || 'Ilimitadas',
          mensajes: formPlan.mensajes || 'Ilimitados',
          whatsapp: formPlan.whatsapp || 'SI',
          roaming: formPlan.roaming || 'Nacional',
          beneficios: formPlan.beneficios || '',
          empresa_origen_id: formPlan.empresa_origen_id,
          promocion_id: formPlan.promocion_id || null,
          activo: formPlan.activo ?? true,
        };

        if (editingId) {
          const res = await api.put(`/planes/${editingId}`, data);
          setPlanes(prev => prev.map(p => p.plan_id === editingId ? { ...p, ...res.data } : p));
        } else {
          const res = await api.post('/planes', data);
          setPlanes(prev => [...prev, res.data]);
        }
      } else {
        if (!formEmpresa.nombre_empresa || !formEmpresa.pais) {
          setError('Nombre de empresa y País son requeridos');
          setLoading(false);
          return;
        }

        const data = {
          nombre_empresa: formEmpresa.nombre_empresa,
          pais: formEmpresa.pais,
        };

        if (editingId) {
          const res = await api.put(`/empresa-origen/${editingId}`, data);
          setEmpresas(prev => prev.map(e => e.empresa_origen_id === editingId ? { ...e, ...res.data } : e));
        } else {
          const res = await api.post('/empresa-origen', data);
          setEmpresas(prev => [...prev, res.data]);
        }
      }

      resetForm();
    } catch (err: any) {
      setError('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaName = (empresaId: number) => {
    const emp = empresas.find(e => e.empresa_origen_id === empresaId);
    return emp?.nombre_empresa || 'Sin asignar';
  };

  const getPromocionName = (promocionId: number | undefined) => {
    if (!promocionId) return 'Sin promoción';
    const promo = promociones.find(p => p.promocion_id === promocionId);
    return promo?.nombre || 'Sin promoción';
  };

  if (!isOpen) return null;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'promociones', label: 'Promociones' },
    { key: 'planes', label: 'Planes' },
    { key: 'empresas', label: 'Empresas' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[5vh]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[900px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 p-[3vh] text-white flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2vh]">
              <div className="w-[7vh] h-[7vh] rounded-[2vh] bg-white/10 flex items-center justify-center backdrop-blur-md">
                <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[clamp(1rem,2vh,2.5rem)]">Gestionar Ofertas</h3>
                <p className="font-bold text-amber-200 uppercase text-[clamp(0.7rem,1.2vh,1.5rem)]">Promociones, Planes y Empresas</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-[6vh] h-[6vh] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              disabled={loading}
            >
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-[1vh] mt-[2vh]">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); resetForm(); }}
                className={`px-[2vh] py-[1vh] rounded-[1.5vh] font-black uppercase tracking-wider text-[clamp(0.7rem,1.2vh,1.3rem)] transition-all ${
                  activeTab === tab.key 
                    ? 'bg-white text-amber-700 shadow-lg' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-[3vh] space-y-[2.5vh]">
          {/* Error */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[2vh] p-[2vh] flex items-center gap-[2vh] animate-in slide-in-from-top-2">
              <svg className="w-[3vh] h-[3vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.7rem,1.1vh,1.4rem)]">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-[4vh]">
              <svg className="w-[5vh] h-[5vh] animate-spin text-amber-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          )}

          {/* Botón Crear Nuevo */}
          {!showForm && !loading && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-[2vh] rounded-[2vh] font-black uppercase tracking-widest bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-[1.5vh] text-[clamp(0.8rem,1.3vh,1.7rem)]"
            >
              <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Crear Nuevo
            </button>
          )}

          {/* Formulario */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-amber-50 dark:bg-amber-900/20 rounded-[2vh] p-[2.5vh] border border-amber-200 dark:border-amber-800 space-y-[2vh]">
              <p className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest text-[clamp(0.8rem,1.3vh,1.5rem)]">
                {editingId ? 'Editar' : 'Crear'} {activeTab === 'promociones' ? 'Promoción' : activeTab === 'planes' ? 'Plan' : 'Empresa'}
              </p>

              {activeTab === 'promociones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formPromocion.nombre || ''}
                      onChange={e => setFormPromocion({ ...formPromocion, nombre: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="NOMBRE DE PROMOCIÓN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Empresa *
                    </label>
                    <select
                      value={formPromocion.empresa_origen_id || ''}
                      onChange={e => setFormPromocion({ ...formPromocion, empresa_origen_id: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    >
                      <option value="">Seleccionar empresa</option>
                      {empresas.map(emp => (
                        <option key={emp.empresa_origen_id} value={emp.empresa_origen_id}>
                          {emp.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formPromocion.descuento || 0}
                      onChange={e => setFormPromocion({ ...formPromocion, descuento: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Beneficios
                    </label>
                    <input
                      type="text"
                      value={formPromocion.beneficios || ''}
                      onChange={e => setFormPromocion({ ...formPromocion, beneficios: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Beneficios de la promoción"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-[2vh]">
                    <input
                      type="checkbox"
                      id="promoActivo"
                      checked={formPromocion.activo ?? true}
                      onChange={e => setFormPromocion({ ...formPromocion, activo: e.target.checked })}
                      className="w-[3vh] h-[3vh] rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="promoActivo" className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Activo
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'planes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formPlan.nombre || ''}
                      onChange={e => setFormPlan({ ...formPlan, nombre: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="NOMBRE DEL PLAN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Empresa *
                    </label>
                    <select
                      value={formPlan.empresa_origen_id || ''}
                      onChange={e => setFormPlan({ ...formPlan, empresa_origen_id: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    >
                      <option value="">Seleccionar empresa</option>
                      {empresas.map(emp => (
                        <option key={emp.empresa_origen_id} value={emp.empresa_origen_id}>
                          {emp.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formPlan.precio || 0}
                      onChange={e => setFormPlan({ ...formPlan, precio: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Gigabytes *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formPlan.gigabyte || 0}
                      onChange={e => setFormPlan({ ...formPlan, gigabyte: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Llamadas
                    </label>
                    <input
                      type="text"
                      value={formPlan.llamadas || ''}
                      onChange={e => setFormPlan({ ...formPlan, llamadas: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Ilimitadas"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Mensajes
                    </label>
                    <input
                      type="text"
                      value={formPlan.mensajes || ''}
                      onChange={e => setFormPlan({ ...formPlan, mensajes: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Ilimitados"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      WhatsApp
                    </label>
                    <select
                      value={formPlan.whatsapp || 'SI'}
                      onChange={e => setFormPlan({ ...formPlan, whatsapp: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Roaming
                    </label>
                    <select
                      value={formPlan.roaming || 'Nacional'}
                      onChange={e => setFormPlan({ ...formPlan, roaming: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    >
                      <option value="Nacional">Nacional</option>
                      <option value="Internacional">Internacional</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Promoción
                    </label>
                    <select
                      value={formPlan.promocion_id || ''}
                      onChange={e => setFormPlan({ ...formPlan, promocion_id: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    >
                      <option value="">Sin promoción</option>
                      {promociones.map(promo => (
                        <option key={promo.promocion_id} value={promo.promocion_id}>
                          {promo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Beneficios
                    </label>
                    <input
                      type="text"
                      value={formPlan.beneficios || ''}
                      onChange={e => setFormPlan({ ...formPlan, beneficios: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Beneficios adicionales"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-[2vh]">
                    <input
                      type="checkbox"
                      id="planActivo"
                      checked={formPlan.activo ?? true}
                      onChange={e => setFormPlan({ ...formPlan, activo: e.target.checked })}
                      className="w-[3vh] h-[3vh] rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="planActivo" className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Activo
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'empresas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Nombre de Empresa *
                    </label>
                    <input
                      type="text"
                      value={formEmpresa.nombre_empresa || ''}
                      onChange={e => setFormEmpresa({ ...formEmpresa, nombre_empresa: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="NOMBRE DE LA EMPRESA"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      País *
                    </label>
                    <input
                      type="text"
                      value={formEmpresa.pais || ''}
                      onChange={e => setFormEmpresa({ ...formEmpresa, pais: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Argentina"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-[2vh] pt-[1vh]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[clamp(0.8rem,1.3vh,1.7rem)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:shadow-none text-[clamp(0.8rem,1.3vh,1.7rem)]"
                >
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Registros */}
          {!showForm && !loading && (
            <div className="space-y-[1.5vh]">
              {activeTab === 'promociones' && (
                <>
                  {promociones.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-[4vh] font-bold">No hay promociones</p>
                  ) : (
                    promociones.map(promo => (
                      <div key={promo.promocion_id} className="flex items-center justify-between p-[2vh] bg-white dark:bg-slate-800 rounded-[2vh] border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.4rem)]">{promo.nombre}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1vh,1.2rem)]">
                            {getEmpresaName(promo.empresa_origen_id)} • {promo.descuento}% descuento
                          </p>
                        </div>
                        <div className="flex items-center gap-[1vh]">
                          <span className={`px-[1.5vh] py-[0.5vh] rounded-full text-[clamp(0.6rem,1vh,1rem)] font-bold ${promo.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {promo.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <button
                            onClick={() => handleEdit(promo)}
                            className="p-[1vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(promo.promocion_id)}
                            className="p-[1vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'planes' && (
                <>
                  {planes.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-[4vh] font-bold">No hay planes</p>
                  ) : (
                    planes.map(plan => (
                      <div key={plan.plan_id} className="flex items-center justify-between p-[2vh] bg-white dark:bg-slate-800 rounded-[2vh] border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.4rem)]">{plan.nombre}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1vh,1.2rem)]">
                            {getEmpresaName(plan.empresa_origen_id)} • ${plan.precio} • {plan.gigabyte}GB
                          </p>
                        </div>
                        <div className="flex items-center gap-[1vh]">
                          <span className={`px-[1.5vh] py-[0.5vh] rounded-full text-[clamp(0.6rem,1vh,1rem)] font-bold ${plan.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {plan.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-[1vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(plan.plan_id)}
                            className="p-[1vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'empresas' && (
                <>
                  {empresas.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-[4vh] font-bold">No hay empresas</p>
                  ) : (
                    empresas.map(emp => (
                      <div key={emp.empresa_origen_id} className="flex items-center justify-between p-[2vh] bg-white dark:bg-slate-800 rounded-[2vh] border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.4rem)]">{emp.nombre_empresa}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1vh,1.2rem)]">{emp.pais}</p>
                        </div>
                        <div className="flex items-center gap-[1vh]">
                          <button
                            onClick={() => handleEdit(emp)}
                            className="p-[1vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(emp.empresa_origen_id)}
                            className="p-[1vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
