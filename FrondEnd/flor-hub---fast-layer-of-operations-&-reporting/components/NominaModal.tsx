
import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { MOCK_SELLERS } from '../constants';
import { Seller } from '../types';
import { SUPERVISORES_MOCK } from '../mocks/supervisores';

// Schema Zod para crear vendedor (Persona + Usuario + Vendedor)
const VendedorFormSchema = z.object({
  // Datos de persona
  nombre: z.string().min(1, 'Nombre requerido').max(45, 'Máximo 45 caracteres'),
  apellido: z.string().min(1, 'Apellido requerido').max(45, 'Máximo 45 caracteres'),
  documento: z.string().min(1, 'Documento requerido').max(30, 'Máximo 30 caracteres'),
  tipo_documento: z.string().max(45).default('DNI'),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(20, 'Máximo 20 caracteres').optional(),
  fecha_nacimiento: z.string().optional(),
  nacionalidad: z.string().max(45).default('ARGENTINA'),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFERO NO DECIR']).default('PREFERO NO DECIR'),
  
  // Datos de usuario
  legajo: z.string().length(5, 'El legajo debe tener exactamente 5 caracteres'),
  exa: z.string().min(4, 'Mínimo 4 caracteres').max(8, 'Máximo 8 caracteres'),
  celula: z.number().int().positive('La célula debe ser un número positivo'),
  supervisor_id: z.string().uuid('Debe seleccionar un supervisor'),
  
  // Datos de cuenta (password)
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
});

type VendedorFormData = z.infer<typeof VendedorFormSchema>;

interface NominaModalProps {
  onClose: () => void;
}

export const NominaModal: React.FC<NominaModalProps> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);

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
    supervisor_id: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  const filteredSellers = useMemo(() => {
    return sellers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.legajo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sellers]);

  const handleChange = (field: keyof VendedorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const supervisor = SUPERVISORES_MOCK.find(s => s.usuario_id === formData.supervisor_id);
    
    const newSeller: Seller = {
      legajo: formData.legajo!,
      exa: formData.exa!,
      name: `${formData.nombre} ${formData.apellido}`,
      email: formData.email!,
      dni: formData.documento!,
      supervisor: supervisor ? `${supervisor.nombre} ${supervisor.apellido}` : '',
      status: 'ACTIVO',
    };

    setSellers(prev => [...prev, newSeller]);
    setShowForm(false);
    resetForm();
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
      supervisor_id: '',
      password: '',
    });
    setErrors({});
    setTouched({});
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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-[2vw] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-[95vw] h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-[4vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5">
        
        {/* Header Premium */}
        <div className="p-[4vh] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-slate-900 text-white flex justify-between items-center relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3.5vh,3.5rem)]">Nómina de Vendedores</h3>
            <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.4rem)]">Gestión de Talento & Legajos • FLOR HUB</p>
          </div>
          <div className="flex items-center gap-[2.5vh] relative z-10">
            <button 
              onClick={() => setShowForm(true)}
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

        {/* Formulario de Nuevo Vendedor */}
        {showForm && (
          <div className="p-[4vh] bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-[3vh]">
              <h4 className="font-black text-slate-900 dark:text-white uppercase italic text-[clamp(1.1rem,2vh,2.5rem)]">Nuevo Vendedor</h4>
              <button 
                onClick={() => { setShowForm(false); resetForm(); }}
                className="p-[1vh] hover:bg-slate-200 rounded-[1.2vh] transition-all"
              >
                <svg className="w-[2.2vh] h-[2.2vh] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-[3vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[2.5vh]">
                {/* Nombre */}
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

                {/* Apellido */}
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

                {/* Documento */}
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

                {/* Email */}
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

                {/* Teléfono */}
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

                {/* Fecha Nacimiento */}
                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Fecha Nacimiento</label>
                  <input 
                    type="date" 
                    value={formData.fecha_nacimiento}
                    onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                    className={getInputClass('fecha_nacimiento')}
                  />
                </div>

                {/* Legajo */}
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

                {/* EXA */}
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

                {/* Célula */}
                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Célula *</label>
                  <input 
                    type="number" 
                    value={formData.celula || ''}
                    onChange={e => handleChange('celula', e.target.value ? Number(e.target.value) : undefined)}
                    className={getInputClass('celula')}
                    placeholder="1"
                  />
                  {touched.celula && errors.celula && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.celula}</span>
                  )}
                </div>

                {/* Supervisor */}
                <div className="flex flex-col gap-[1vh]">
                  <label className="font-black text-slate-500 uppercase text-[clamp(0.6rem,1.1vh,1.3rem)]">Supervisor *</label>
                  <select 
                    value={formData.supervisor_id}
                    onChange={e => handleChange('supervisor_id', e.target.value)}
                    className={getSelectClass('supervisor_id')}
                  >
                    <option value="">Seleccionar...</option>
                    {SUPERVISORES_MOCK.map(s => (
                      <option key={s.usuario_id} value={s.usuario_id}>
                        {s.nombre} {s.apellido}
                      </option>
                    ))}
                  </select>
                  {touched.supervisor_id && errors.supervisor_id && (
                    <span className="font-bold text-rose-500 text-[clamp(0.6rem,1vh,1.1rem)]">{errors.supervisor_id}</span>
                  )}
                </div>

                {/* Género */}
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

                {/* Password */}
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
              </div>

              {/* Requisitos de contraseña */}
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

              <div className="flex justify-end gap-[2vh]">
                <button 
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-[4vh] py-[1.8vh] rounded-[22px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all text-[clamp(0.7rem,1.2bh,1.4rem)]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-[4vh] py-[1.8vh] rounded-[22px] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all text-[clamp(0.7rem,1.2bh,1.4rem)]"
                >
                  Crear Vendedor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content - Table Bento Style */}
        <div className="flex-1 overflow-auto p-[4vh] bg-slate-50/50 dark:bg-slate-950/20 no-scrollbar">
          <div className="grid grid-cols-1 gap-[2vh]">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-7 gap-[2vh] px-[3vh] py-[2vh] bg-white dark:bg-slate-900 rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm mb-[1vh]">
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">Legajo / EXA</span>
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">Nombre Completo</span>
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">ID / Cédula</span>
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">Email</span>
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">Supervisor</span>
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center text-[clamp(0.6rem,1vh,1.2rem)]">Estado</span>
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right text-[clamp(0.6rem,1vh,1.2rem)]">Acciones</span>
            </div>

            {/* Seller Cards */}
            {filteredSellers.map((seller) => (
              <div key={seller.legajo} className="group grid grid-cols-1 lg:grid-cols-7 gap-[2vh] items-center bg-white dark:bg-slate-900 lg:hover:bg-indigo-50/50 lg:dark:hover:bg-indigo-900/20 px-[3vh] py-[2.5vh] rounded-[3vh] border border-slate-100 dark:border-white/5 lg:hover:border-indigo-200 lg:dark:hover:border-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex flex-col">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-[1.2vh] py-[0.5vh] rounded-[1vh] w-fit mb-[0.5vh] text-[clamp(0.7rem,1.1vh,1.3rem)]">{seller.legajo}</span>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.1rem)]">{seller.exa}</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase italic text-[clamp(0.8rem,1.4vh,1.7rem)]">{seller.name}</h4>
                </div>
                <div className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.7rem,1.2vh,1.5rem)]">
                  {seller.dni}
                </div>
                <div className="font-medium text-slate-600 dark:text-slate-400 truncate text-[clamp(0.7rem,1.2vh,1.5rem)]">
                  {seller.email}
                </div>
                <div>
                  <span className="font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/40 px-[1.2vh] py-[0.5vh] rounded-[1vh] text-[clamp(0.65rem,1vh,1.2rem)]">{seller.supervisor}</span>
                </div>
                <div className="flex justify-center">
                  <span className={`px-[1.5vh] py-[0.5vh] rounded-full font-black uppercase tracking-widest text-[clamp(0.65rem,1vh,1.2rem)] ${seller.status === 'ACTIVO' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                    {seller.status}
                  </span>
                </div>
                <div className="flex justify-end gap-[1vh]">
                  <button className="w-[4.5vh] h-[4.5vh] rounded-[1.2vh] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center">
                    <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="w-[4.5vh] h-[4.5vh] rounded-[1.2vh] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-500 dark:hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center">
                    <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}

            {filteredSellers.length === 0 && (
              <div className="py-[10vh] text-center glass-panel rounded-[4vh]">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[clamp(1rem,1.8vh,2.5rem)]">No se encontraron vendedores registrados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-[3vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-between items-center shadow-[0_-1vh_3vh_-1vh_rgba(0,0,0,0.05)]">
          <div className="flex gap-[6vh]">
            <div className="flex flex-col">
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[0.5vh] text-[clamp(0.6rem,1.1vh,1.3rem)]">Total Plantilla</span>
              <span className="font-black text-slate-900 dark:text-white text-[clamp(1.2rem,2.2vh,3rem)]">{sellers.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-emerald-400 dark:text-emerald-500/80 uppercase tracking-widest mb-[0.5vh] text-[clamp(0.6rem,1.1vh,1.3rem)]">Vendedores Activos</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-[clamp(1.2rem,2.2vh,3rem)]">{sellers.filter(s => s.status === 'ACTIVO').length}</span>
            </div>
          </div>
          <button className="px-[5vh] py-[2.2vh] bg-indigo-600 dark:bg-indigo-600 text-white rounded-[2vh] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all active:scale-95 text-[clamp(0.7rem,1.2vh,1.5rem)]">
            Exportar Nómina CSV
          </button>
        </div>
      </div>
    </div>
  );
};
