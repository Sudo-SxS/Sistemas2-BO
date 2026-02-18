
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { api } from '../../services/api';

const VendedorFormSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(45, 'Máximo 45 caracteres'),
  apellido: z.string().min(1, 'Apellido requerido').max(45, 'Máximo 45 caracteres'),
  documento: z.string().min(1, 'Documento requerido').max(30, 'Máximo 30 caracteres'),
  tipo_documento: z.string().max(45).default('DNI'),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(20, 'Máximo 20 caracteres').optional(),
  fecha_nacimiento: z.string().optional(),
  nacionalidad: z.string().max(45).default('ARGENTINA'),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFERO NO DECIR']).default('PREFERO NO DECIR'),
  legajo: z.string().length(5, 'El legajo debe tener exactamente 5 caracteres'),
  exa: z.string().min(4, 'Mínimo 4 caracteres').max(8, 'Máximo 8 caracteres'),
  celula: z.number().int().positive('La célula debe ser un número positivo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  rol: z.string().default('VENDEDOR'),
  permisos: z.array(z.string()).default(['VENDEDOR']),
  estado: z.string().default('ACTIVO'),
});

type VendedorFormData = z.infer<typeof VendedorFormSchema>;

interface Usuario {
  usuario_id: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  nacionalidad: string;
  genero: string;
  legajo: string;
  exa: string;
  celula: number;
  rol: string;
  permisos: string[];
  estado: string;
  fecha_creacion?: string;
}

interface Celula {
  celula_id: number;
  nombre: string;
  empresa_origen_id: number;
  supervisor_id: string;
  supervisor_nombre?: string;
  supervisor_exa?: string;
  supervisor_legajo?: string;
  supervisor_email?: string;
}

interface NominaModalProps {
  onClose: () => void;
}

export const NominaModal: React.FC<NominaModalProps> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [selectedCelula, setSelectedCelula] = useState<number | null>(null);
  const [expandedCelulas, setExpandedCelulas] = useState<Set<number>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState<Partial<VendedorFormData>>({
    nombre: '',
    apellido: '',
    documento: '',
    tipo_documento: 'DNI',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    nacionalidad: 'ARGENTINA',
    genero: 'PREFERO NO DECIR',
    legajo: '',
    exa: '',
    celula: undefined,
    password: '',
    rol: 'VENDEDOR',
    permisos: ['VENDEDOR'],
    estado: 'ACTIVO',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usuariosRes, celulasRes] = await Promise.all([
        api.get<{ data: Usuario[]; pagination?: { page: number; limit: number; total: number } }>(`/usuarios?page=${page}&limit=100`),
        api.get<{ data: Celula[] }>('/celulas?limit=100'),
      ]);
      
      setUsuarios(usuariosRes.data || []);
      setCelulas(celulasRes.data || []);
      
      // Actualizar paginación
      if (usuariosRes.pagination) {
        setTotalCount(usuariosRes.pagination.total);
        setTotalPages(Math.ceil(usuariosRes.pagination.total / 100));
      }
      
      const allCelulaIds = new Set(celulasRes.data?.map(c => c.celula_id) || []);
      setExpandedCelulas(allCelulaIds);
    } catch (err: any) {
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => 
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellido.toLowerCase().includes(search.toLowerCase()) ||
      u.legajo.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [usuarios, search]);

  // Células únicas de los usuarios para el dropdown
  const celulasDelSistema = useMemo(() => {
    const uniqueCelulas = new Map<number, { celula_id: number; nombre: string }>();
    
    // Primero agregar las células de la API
    celulas.forEach(c => {
      uniqueCelulas.set(c.celula_id, { celula_id: c.celula_id, nombre: c.nombre });
    });
    
    // Luego agregar las células de los usuarios que no estén en la API
    usuarios.forEach(u => {
      if (!uniqueCelulas.has(u.celula)) {
        uniqueCelulas.set(u.celula, { celula_id: u.celula, nombre: `Célula ${u.celula}` });
      }
    });
    
    return Array.from(uniqueCelulas.values()).sort((a, b) => a.celula_id - b.celula_id);
  }, [usuarios, celulas]);

  const usuariosByCelula = useMemo(() => {
    const grouped: Record<number, Usuario[]> = {};
    
    filteredUsuarios.forEach(usuario => {
      const celulaId = usuario.celula;
      if (!grouped[celulaId]) {
        grouped[celulaId] = [];
      }
      grouped[celulaId].push(usuario);
    });
    
    return grouped;
  }, [filteredUsuarios]);

  const getSupervisorByCelula = (celulaId: number) => {
    return usuarios.find(u => u.celula === celulaId && u.rol === 'SUPERVISOR');
  };

  const getCelulaInfo = (celulaId: number) => {
    const celula = celulas.find(c => c.celula_id === celulaId);
    const supervisor = getSupervisorByCelula(celulaId);
    
    return {
      ...celula,
      supervisor_nombre: supervisor ? `${supervisor.nombre} ${supervisor.apellido}` : undefined,
      supervisor_exa: supervisor?.exa,
      supervisor_legajo: supervisor?.legajo,
      supervisor_email: supervisor?.email,
    };
  };

  const toggleCelula = (celulaId: number) => {
    setExpandedCelulas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(celulaId)) {
        newSet.delete(celulaId);
      } else {
        newSet.add(celulaId);
      }
      return newSet;
    });
  };

  const handleChange = (field: keyof VendedorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const fieldSchema = VendedorFormSchema.shape[field];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors(prev => ({ ...prev, [field]: result.error.issues[0].message }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const result = VendedorFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const userData = {
        user: {
          nombre: formData.nombre?.toUpperCase(),
          apellido: formData.apellido?.toUpperCase(),
          documento: formData.documento?.toUpperCase(),
          tipo_documento: formData.tipo_documento?.toUpperCase(),
          email: formData.email?.toLowerCase(),
          telefono: formData.telefono,
          fecha_nacimiento: formData.fecha_nacimiento,
          nacionalidad: formData.nacionalidad?.toUpperCase(),
          genero: formData.genero?.toUpperCase(),
          legajo: formData.legajo?.toUpperCase(),
          exa: formData.exa?.toUpperCase(),
          celula: formData.celula,
          password: formData.password,
          rol: formData.rol || 'VENDEDOR',
          permisos: formData.permisos || ['VENDEDOR'],
          estado: formData.estado || 'ACTIVO',
        }
      };

      if (editingId) {
        await api.put(`/usuarios/${editingId}`, userData.user);
        setUsuarios(prev => prev.map(u => u.usuario_id === editingId ? { ...u, ...userData.user } : u));
      } else {
        const res = await api.post<{ data: Usuario }>('/usuario/register', userData);
        if (res.data?.data) {
          setUsuarios(prev => [...prev, res.data.data]);
        }
      }

      resetForm();
      loadData();
    } catch (err: any) {
      setError('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.usuario_id);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      documento: usuario.documento,
      tipo_documento: usuario.tipo_documento,
      email: usuario.email,
      telefono: usuario.telefono,
      fecha_nacimiento: usuario.fecha_nacimiento,
      nacionalidad: usuario.nacionalidad,
      genero: usuario.genero,
      legajo: usuario.legajo,
      exa: usuario.exa,
      celula: usuario.celula,
      password: '',
      rol: usuario.rol,
      permisos: usuario.permisos,
      estado: usuario.estado,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vendedor?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(prev => prev.filter(u => u.usuario_id !== id));
    } catch (err: any) {
      setError('Error al eliminar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    const newStatus = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    
    setLoading(true);
    try {
      await api.patch(`/usuarios/${usuario.usuario_id}/status`, { estado: newStatus });
      setUsuarios(prev => prev.map(u => 
        u.usuario_id === usuario.usuario_id ? { ...u, estado: newStatus } : u
      ));
    } catch (err: any) {
      setError('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      documento: '',
      tipo_documento: 'DNI',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      nacionalidad: 'ARGENTINA',
      genero: 'PREFERO NO DECIR',
      legajo: '',
      exa: '',
      celula: undefined,
      password: '',
      rol: 'VENDEDOR',
      permisos: ['VENDEDOR'],
      estado: 'ACTIVO',
    });
    setErrors({});
    setTouched({});
    setEditingId(null);
    setShowForm(false);
  };

  const getInputClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-[2vh] px-[2vh] py-[1.8vh] font-bold outline-none transition-all text-[clamp(0.8rem,1.2vh,1.5rem)] ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-[2vh] px-[2vh] py-[1.8vh] font-bold outline-none transition-all cursor-pointer text-[clamp(0.8rem,1.2vh,1.5rem)] ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  const totalVendedores = totalCount;
  const activos = usuarios.filter(u => u.estado === 'ACTIVO').length;

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[5vh] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-[95vw] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[4vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5">
        
        {/* Header Premium */}
        <div className="p-[4vh] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-slate-900 text-white flex justify-between items-center relative flex-shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3.5vh,3.5rem)]">Nómina de Vendedores</h3>
            <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.4rem)]">Gestión de Talento & Legajos • FLOR HUB</p>
          </div>
          <div className="flex items-center gap-[2.5vh] relative z-10">
            <button 
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-[3.5vh] py-[2vh] bg-indigo-600 hover:bg-indigo-500 rounded-[2vh] font-black uppercase tracking-widest transition-all flex items-center gap-[1.5vh] text-[clamp(0.7rem,1.2vh,1.4rem)]"
            >
              <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Vendedor
            </button>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Buscar vendedor..."
                className="bg-white/10 border border-white/20 rounded-[2vh] px-[2.5vh] py-[1.8vh] font-bold text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-indigo-400 w-[35vh] transition-all text-[clamp(0.8rem,1.3vh,1.6rem)]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <svg className="w-[2.5vh] h-[2.5vh] absolute right-[2vh] top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button onClick={onClose} className="p-[1.8vh] bg-white/10 hover:bg-rose-500 rounded-[1.8vh] transition-all duration-300">
              <svg className="w-[3.2vh] h-[3.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Filtro por Célula */}
        <div className="px-[4vh] py-[2vh] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-[2vh]">
            <span className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[clamp(0.7rem,1.2vh,1.3rem)]">Filtrar por Célula:</span>
            <select
              value={selectedCelula || ''}
              onChange={e => setSelectedCelula(e.target.value ? Number(e.target.value) : null)}
              className="px-[2vh] py-[1.5vh] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[1.5vh] font-bold text-slate-800 dark:text-white text-[clamp(0.8rem,1.2vh,1.4rem)]"
            >
              <option value="">Todas las células</option>
              {celulasDelSistema.map(celula => (
                <option key={celula.celula_id} value={celula.celula_id}>
                  Célula {celula.celula_id} - {celula.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-[4vh] mt-[2vh] bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[2vh] p-[2vh] flex items-center gap-[2vh] animate-in slide-in-from-top-2">
            <svg className="w-[3vh] h-[3vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.7rem,1.1vh,1.4rem)]">{error}</p>
          </div>
        )}

        {/* Formulario de Nuevo Vendedor */}
        {showForm && (
          <div className="p-[4vh] bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[50vh]">
            <div className="flex justify-between items-center mb-[3vh]">
              <h4 className="font-black text-slate-900 dark:text-white uppercase italic text-[clamp(1.1rem,2vh,2.5rem)]">
                {editingId ? 'Editar Vendedor' : 'Nuevo Vendedor'}
              </h4>
              <button 
                onClick={resetForm}
                className="p-[1vh] hover:bg-slate-200 rounded-[1.2vh] transition-all"
              >
                <svg className="w-[2.2vh] h-[2.2vh] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-[3vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[2.5vh]">
                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Nombre *</label>
                  <input 
                    type="text" 
                    value={formData.nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                    className={getInputClass('nombre')}
                    placeholder="Juan"
                  />
                  {touched.nombre && errors.nombre && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.nombre}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Apellido *</label>
                  <input 
                    type="text" 
                    value={formData.apellido}
                    onChange={e => handleChange('apellido', e.target.value)}
                    className={getInputClass('apellido')}
                    placeholder="Pérez"
                  />
                  {touched.apellido && errors.apellido && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.apellido}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">DNI *</label>
                  <input 
                    type="text" 
                    value={formData.documento}
                    onChange={e => handleChange('documento', e.target.value.toUpperCase())}
                    className={`${getInputClass('documento')} uppercase`}
                    placeholder="12345678"
                  />
                  {touched.documento && errors.documento && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.documento}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Email *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value.toLowerCase())}
                    className={getInputClass('email')}
                    placeholder="juan.perez@email.com"
                  />
                  {touched.email && errors.email && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.email}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.telefono}
                    onChange={e => handleChange('telefono', e.target.value)}
                    className={getInputClass('telefono')}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Fecha Nacimiento</label>
                  <input 
                    type="date" 
                    value={formData.fecha_nacimiento}
                    onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                    className={getInputClass('fecha_nacimiento')}
                  />
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Legajo * (5 chars)</label>
                  <input 
                    type="text" 
                    value={formData.legajo}
                    onChange={e => handleChange('legajo', e.target.value.toUpperCase())}
                    className={`${getInputClass('legajo')} uppercase`}
                    placeholder="V0001"
                    maxLength={5}
                  />
                  {touched.legajo && errors.legajo && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.legajo}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Código EXA *</label>
                  <input 
                    type="text" 
                    value={formData.exa}
                    onChange={e => handleChange('exa', e.target.value.toUpperCase())}
                    className={`${getInputClass('exa')} uppercase`}
                    placeholder="EXA001"
                    maxLength={8}
                  />
                  {touched.exa && errors.exa && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.exa}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Célula *</label>
                  <select 
                    value={formData.celula || ''}
                    onChange={e => handleChange('celula', e.target.value ? Number(e.target.value) : undefined)}
                    className={getSelectClass('celula')}
                  >
                    <option value="">Seleccionar célula...</option>
                    {celulas.map(c => (
                      <option key={c.celula_id} value={c.celula_id}>
                        Célula {c.celula_id} - {c.nombre}
                      </option>
                    ))}
                  </select>
                  {touched.celula && errors.celula && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.celula}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Género</label>
                  <select 
                    value={formData.genero}
                    onChange={e => handleChange('genero', e.target.value)}
                    className={getSelectClass('genero')}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                    <option value="PREFERO NO DECIR">Prefiero no decir</option>
                  </select>
                </div>

                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado</label>
                  <select 
                    value={formData.estado}
                    onChange={e => handleChange('estado', e.target.value)}
                    className={getSelectClass('estado')}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>

                {!editingId && (
                  <div className="flex flex-col gap-[1vh]">
                    <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Contraseña *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        className={getInputClass('password')}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-[1.5vh] top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.999-5.123m3.999-2.123a9.96 9.96 0 013.542-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z M3 3l18 18"></path>
                          )}
                        </svg>
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.password}</span>
                    )}
                  </div>
                )}
              </div>

              {!editingId && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-[2vh] p-[2vh]">
                  <p className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-[1vh] text-[clamp(0.7rem,1.2vh,1.4rem)]">
                    Requisitos de Contraseña
                  </p>
                  <ul className="font-medium text-indigo-700 dark:text-indigo-300 space-y-[0.5vh] text-[clamp(0.65rem,1.1vh,1.3rem)]">
                    <li className={formData.password && formData.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      ✓ Mínimo 8 caracteres
                    </li>
                    <li className={formData.password && /[A-Z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      ✓ Al menos una mayúscula
                    </li>
                    <li className={formData.password && /[a-z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      ✓ Al menos una minúscula
                    </li>
                    <li className={formData.password && /[0-9]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      ✓ Al menos un número
                    </li>
                    <li className={formData.password && /[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      ✓ Al menos un carácter especial
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-[2vh]">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-[4vh] py-[1.8vh] rounded-[22px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all text-[clamp(0.7rem,1.2vh,1.4rem)]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-[4vh] py-[1.8vh] rounded-[22px] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all text-[clamp(0.7rem,1.2vh,1.4rem)]"
                >
                  {loading ? 'Guardando...' : editingId ? 'Actualizar Vendedor' : 'Crear Vendedor'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content - Células con Vendedores */}
        <div className="flex-1 overflow-auto p-[4vh] bg-slate-50/50 dark:bg-slate-950/20 no-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-[4vh]">
              <svg className="w-[5vh] h-[5vh] animate-spin text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          )}

          {!loading && Object.keys(usuariosByCelula).length === 0 && (
            <div className="py-[10vh] text-center glass-panel rounded-[4vh]">
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[clamp(1rem,1.8vh,2.5rem)]">No se encontraron vendedores.</p>
            </div>
          )}

          {!loading && Object.entries(usuariosByCelula).map(([celulaId, usuarios]) => {
            const celulaNum = Number(celulaId);
            const celulaInfo = getCelulaInfo(celulaNum);
            const isExpanded = expandedCelulas.has(celulaNum);
            
            if (selectedCelula && selectedCelula !== celulaNum) return null;

            return (
              <div key={celulaId} className="mb-[3vh] bg-white dark:bg-slate-900 rounded-[3vh] border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header de Célula */}
                <button
                  onClick={() => toggleCelula(celulaNum)}
                  className="w-full flex items-center justify-between p-[2.5vh] bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all"
                >
                  <div className="flex items-center gap-[2vh]">
                    <div className="w-[5vh] h-[5vh] rounded-[1.5vh] bg-indigo-600 text-white flex items-center justify-center font-black text-[clamp(0.8rem,1.3vh,1.5rem)]">
                      {celulaNum}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800 dark:text-white uppercase tracking-wide text-[clamp(0.9rem,1.4vh,1.7rem)]">
                        {celulaInfo?.nombre || `Célula ${celulaNum}`}
                      </p>
                      {celulaInfo?.supervisor_nombre && (
                        <div className="flex items-center gap-[1vh] flex-wrap">
                          <span className="font-bold text-purple-600 dark:text-purple-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                            Supervisor: {celulaInfo.supervisor_nombre}
                          </span>
                          {celulaInfo.supervisor_exa && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-[clamp(0.6rem,0.95vh,1.1rem)]">
                                {celulaInfo.supervisor_exa}
                              </span>
                            </>
                          )}
                          {celulaInfo.supervisor_legajo && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[clamp(0.6rem,0.95vh,1.1rem)]">
                                {celulaInfo.supervisor_legajo}
                              </span>
                            </>
                          )}
                          {celulaInfo.supervisor_email && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.6rem,0.95vh,1.1rem)]">
                                {celulaInfo.supervisor_email}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                        {usuarios.length} vendedor{usuarios.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  <svg 
                    className={`w-[3vh] h-[3vh] text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Lista de Vendedores */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700">
                    {usuarios.map((usuario) => (
                      <div 
                        key={usuario.usuario_id} 
                        className="flex items-center justify-between p-[2vh] border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex items-center gap-[2vh] flex-1">
                          <div className="w-[4vh] h-[4vh] rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                            {usuario.nombre[0]}{usuario.apellido[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.5rem)]">
                              {usuario.nombre} {usuario.apellido}
                            </p>
                            <div className="flex items-center gap-[1.5vh] mt-[0.3vh]">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                                {usuario.exa}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                                {usuario.legajo}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                                {usuario.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[1.5vh]">
                          <button
                            onClick={() => handleToggleStatus(usuario)}
                            className={`px-[1.5vh] py-[0.8vh] rounded-full font-black uppercase tracking-wider text-[clamp(0.6rem,1vh,1.1rem)] transition-all ${
                              usuario.estado === 'ACTIVO' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200' 
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {usuario.estado}
                          </button>
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-[1.2vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.usuario_id)}
                            className="p-[1.2vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summary with Pagination */}
        <div className="p-[3vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-between items-center shadow-[0_-1vh_3vh_-1vh_rgba(0,0,0,0.05)] flex-shrink-0">
          <div className="flex gap-[6vh]">
            <div className="flex flex-col">
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[0.5vh] text-[clamp(0.6rem,1.1vh,1.3rem)]">Total Plantilla</span>
              <span className="font-black text-slate-900 dark:text-white text-[clamp(1.2rem,2.2vh,3rem)]">{totalVendedores}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-emerald-400 dark:text-emerald-500/80 uppercase tracking-widest mb-[0.5vh] text-[clamp(0.6rem,1.1vh,1.3rem)]">Vendedores Activos</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-[clamp(1.2rem,2.2vh,3rem)]">{activos}</span>
            </div>
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center gap-[2vh]">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="px-[2vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-wider text-[clamp(0.7rem,1.1vh,1.3rem)] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-[1vh]"
              >
                <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Anterior
              </button>
              
              <div className="flex items-center gap-[1vh] px-[2vh]">
                <span className="font-black text-slate-600 dark:text-slate-400 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                  Página
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(0.8rem,1.2vh,1.5rem)]">
                  {page}
                </span>
                <span className="font-black text-slate-400 dark:text-slate-500 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                  de
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(0.8rem,1.2vh,1.5rem)]">
                  {totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="px-[2vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-wider text-[clamp(0.7rem,1.1vh,1.3rem)] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-[1vh]"
              >
                Siguiente
                <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}

          {totalPages <= 1 && (
            <button className="px-[5vh] py-[2.2vh] bg-indigo-600 dark:bg-indigo-600 text-white rounded-[2vh] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all active:scale-95 text-[clamp(0.7rem,1.2vh,1.5rem)]">
              Exportar Nómina CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
