import React, { useState } from 'react';
import { PasswordChangeModal } from '../modals/PasswordChangeModalSimplificado';
import { UploadEstadoVentaModal } from '../modals/UploadEstadoVentaModal';
import { UploadSeguimientoLineaModal } from '../modals/UploadSeguimientoLineaModal';
import { UploadCorreoModal } from '../modals/UploadCorreoModal';
import { GestionarOfertasModal } from '../modals/GestionarOfertasModal';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { getCurrentUserId, buildPasswordChangeUrl } from '../../utils/userHelpers';
import { api } from '../../services/api';

interface ProfileMenuProps {
  onClose: () => void;
  onOpenNomina: () => void;
  onLogout?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

type MenuState = 'MAIN' | 'UPDATE_SUBMENU' | 'CONFIG_SUBMENU';
type UploadModalType = 'estado-venta' | 'seguimiento-linea' | 'correo' | 'oferta' | null;

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  onClose, 
  onOpenNomina, 
  onLogout,
  isDarkMode,
  setIsDarkMode
}) => {
  const [view, setView] = useState<MenuState>('MAIN');
  const [activeModal, setActiveModal] = useState<UploadModalType>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState(false);

  const { user } = useAuthCheck();

  // Orden de prioridad de permisos (de mayor a menor)
  const permisosPrioridad = ["SUPERADMIN", "ADMIN", "BACK_OFFICE", "SUPERVISOR", "VENDEDOR"];

  // Obtener el permiso principal (el de mayor prioridad que tenga el usuario)
  const permisoPrincipal = user?.permisos?.find(p => permisosPrioridad.includes(p));

  // Obtener el resto de permisos
  const otrosPermisos = user?.permisos?.filter(p => p !== permisoPrincipal);

  const handleUploadEstadoVenta = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{ success: boolean; message: string }>('actualizar/estado-venta', formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSeguimientoLinea = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{ success: boolean; message: string }>('actualizar/seguimiento-linea', formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadCorreo = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{ success: boolean; message: string }>('actualizar/correo', formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const renderMainMenu = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-[2.5vh] pb-[2vh] pt-[1vh] space-y-[1.5vh]">
        <button 
          onClick={() => setView('UPDATE_SUBMENU')}
          className="w-full group relative overflow-hidden flex items-center justify-between gap-[2vh] p-[2.5vh] rounded-[3vh] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-[2vh]">
            <div className="w-[6vh] h-[6vh] rounded-[1.5vh] bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-black uppercase tracking-widest leading-none text-[clamp(0.8rem,1.5vh,2rem)]">Acciones Globales</p>
              <p className="font-bold text-indigo-200 mt-[0.5vh] uppercase opacity-80 text-[clamp(0.6rem,1.1vh,1.5rem)]">Actualizar registros masivamente</p>
            </div>
          </div>
          <svg className="w-[3vh] h-[3vh] opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onOpenNomina(); onClose(); }}
          className="w-full group relative overflow-hidden flex items-center justify-between gap-[2vh] p-[2.5vh] rounded-[3vh] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-[2vh]">
            <div className="w-[6vh] h-[6vh] rounded-[1.5vh] bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 transition-transform">
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-black uppercase tracking-widest leading-none text-[clamp(0.8rem,1.5vh,2rem)]">Nómina Vendedores</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-[0.5vh] uppercase opacity-80 text-[clamp(0.6rem,1.1vh,1.5rem)]">Gestión de Legajos</p>
            </div>
          </div>
          <svg className="w-[3vh] h-[3vh] text-emerald-300 dark:text-emerald-500/60 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-slate-700/60 mx-[3vh] mb-[2vh]"></div>

      <div className="px-[1.5vh] space-y-[0.8vh]">
        <p className="px-[2.5vh] py-[0.5vh] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60 text-[clamp(0.6rem,1vh,1.4rem)]">Configuración</p>
        
        <button className="w-full flex items-center justify-between px-[2.5vh] py-[2vh] rounded-[2.5vh] hover:bg-white dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm">
          <div className="flex items-center gap-[2.5vh]">
            <div className="w-[6vh] h-[6vh] rounded-[1.5vh] bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 011-8 4 4 0 011 8zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <span className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight text-[clamp(0.8rem,1.4vh,1.8rem)]">Mi Perfil Técnico</span>
          </div>
        </button>

        <button 
          onClick={() => setView('CONFIG_SUBMENU')}
          className="w-full flex items-center justify-between px-[2.5vh] py-[2vh] rounded-[2.5vh] hover:bg-white dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm">
          <div className="flex items-center gap-[2.5vh]">
            <div className="w-[6vh] h-[6vh] rounded-[1.5vh] bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <span className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight text-[clamp(0.8rem,1.4vh,1.8rem)]">Preferencias</span>
          </div>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-slate-700/60 mx-[3vh] my-[2vh]"></div>

      <div className="px-[2.5vh] pb-[3vh]">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onLogout?.(); 
            onClose(); 
          }}
          className="w-full flex items-center gap-[2.5vh] p-[2.5vh] rounded-[3vh] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all group border border-rose-100/50 dark:border-rose-500/20 shadow-sm"
        >
          <div className="w-[6vh] h-[6vh] rounded-[1.5vh] bg-white dark:bg-slate-800 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </div>
          <span className="font-black uppercase tracking-[0.2em] text-[clamp(0.8rem,1.3vh,1.8rem)]">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  const renderUpdateSubmenu = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="px-[3vh] py-[1.5vh] mb-[1.5vh] flex items-center gap-[2vh]">
        <button 
          onClick={() => setView('MAIN')}
          className="p-[1.5vh] bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-[1.5vh] transition-all"
        >
          <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h5 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[clamp(0.8rem,1.5vh,2.2rem)]">Actualización Masiva</h5>
      </div>

      <div className="px-[3vh] pb-[4vh] space-y-[2vh]">
        <p className="font-black text-slate-400 uppercase tracking-[0.2em] mb-[2.5vh] text-[clamp(0.6rem,1.1vh,1.5rem)]">Selecciona el tipo de actualización:</p>
        
        {[ 
          { 
            id: 'estado-venta' as UploadModalType, 
            label: 'Actualizar Status', 
            description: 'Estados de ventas por SDS',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 
            color: 'indigo' 
          },
          { 
            id: 'seguimiento-linea' as UploadModalType, 
            label: 'Actualizar Seguimiento Línea', 
            description: 'Datos de líneas y portabilidad',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z', 
            color: 'cyan' 
          },
          { 
            id: 'correo' as UploadModalType, 
            label: 'Actualizar Correo', 
            description: 'Estados de envíos y guías',
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 
            color: 'purple' 
          },
          { 
            id: 'oferta' as UploadModalType, 
            label: 'Gestionar Ofertas', 
            description: 'Promociones, planes y empresas',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
            color: 'amber' 
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModal(item.id)}
            className={`w-full group relative overflow-hidden flex items-center gap-[2.5vh] p-[2.5vh] rounded-[3vh] border-2 border-slate-50 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-${item.color}-200 dark:hover:border-${item.color}-500/30 hover:bg-${item.color}-50/30 dark:hover:bg-${item.color}-500/10 transition-all active:scale-[0.98]`}
          >
            <div className={`w-[7.5vh] h-[7.5vh] rounded-[2vh] bg-${item.color}-50 dark:bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400 flex items-center justify-center transition-colors shadow-inner`}>
              <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon}></path>
              </svg>
            </div>
            <div className="text-left">
              <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-[clamp(0.8rem,1.5vh,2rem)]">{item.label}</span>
              <p className="font-bold text-slate-400 dark:text-slate-500 uppercase mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.5rem)]">{item.description}</p>
            </div>
            <svg className="w-[3vh] h-[3vh] text-slate-300 dark:text-slate-600 ml-auto group-hover:text-${item.color}-500 dark:group-hover:text-${item.color}-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  const renderConfigSubmenu = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="px-[3.5vh] py-[2.5vh] pb-[5vh] space-y-[2.5vh] w-full bg-white dark:bg-slate-900 rounded-[4vh] shadow-2xl flex flex-col">
          <div className="px-[2.5vh] py-[1.5vh] mb-[2vh] flex items-center gap-[2vh]">
            <button 
              onClick={() => setView('MAIN')}
              className="p-[1.8vh] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 rounded-[1.8vh] transition-all flex items-center gap-[1vh]"
            >
              <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
              </svg>
              <span className="font-black uppercase tracking-widest text-[clamp(0.65rem,1.1vh,1.4rem)]">Volver</span>
            </button>
            <h5 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-[clamp(0.8rem,1.5vh,2.2rem)]">Configuración</h5>
          </div>

          <div className="space-y-[2.5vh] flex-1">
            <p className="text-slate-400 uppercase tracking-widest mb-[1.5vh] font-black italic scale-y-95 text-[clamp(0.65rem,1.1vh,1.5rem)]">Apariencia y Sistema</p>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full group relative overflow-hidden flex items-center justify-between gap-[2.5vh] p-[2.5vh] rounded-[3vh] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.98] shadow-sm"
            >
              <div className="flex items-center gap-[2.5vh]">
                <div className={`w-[7.5vh] h-[7.5vh] rounded-[2vh] flex items-center justify-center transition-all shadow-inner ${isDarkMode ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-100 text-slate-600'}`}>
                  {isDarkMode ? (
                    <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                    </svg>
                  ) : (
                    <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none text-[clamp(0.9rem,1.6vh,2.2rem)]">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</p>
                  <p className="font-bold text-slate-500 mt-[1vh] uppercase tracking-[0.2em] opacity-80 text-[clamp(0.6rem,1.1vh,1.5rem)]">Deep Space Theme</p>
                </div>
              </div>
              <div className={`w-[8vh] h-[4vh] rounded-full relative transition-all duration-300 ${isDarkMode ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-[0.5vh] w-[3vh] h-[3vh] bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'right-[0.5vh]' : 'left-[0.5vh]'}`}></div>
              </div>
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-2"></div>

            <p className="text-slate-400 uppercase tracking-widest font-black italic scale-y-95 text-[clamp(0.65rem,1.1vh,1.5rem)]">Seguridad</p>

            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full group relative overflow-hidden flex items-center justify-between gap-[2.5vh] p-[2.5vh] rounded-[3vh] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] shadow-sm"
            >
              <div className="flex items-center gap-[2.5vh]">
                <div className="w-[7.5vh] h-[7.5vh] rounded-[2vh] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-all shadow-inner">
                  <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none text-[clamp(0.9rem,1.6vh,2.2rem)]">Actualizar Contraseña</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-[1vh] uppercase tracking-[0.2em] opacity-80 text-[clamp(0.6rem,1.1vh,1.5rem)]">Gestión de Cuenta</p>
                </div>
              </div>
              <div className="w-[4.5vh] h-[4.5vh] rounded-[1.5vh] bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </button>

            <div className="pt-[4vh] border-t border-slate-100 dark:border-slate-800">
              <p className="text-slate-400 text-center font-black uppercase tracking-[0.3em] opacity-40 text-[clamp(0.6rem,1vh,1.2rem)]">Configuración avanzada próximamente</p>
            </div>
          </div>
        </div>

        {showPasswordModal && (
          <PasswordChangeModal 
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => {
              setShowPasswordModal(false);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        className="absolute top-[8.5vh] right-0 w-[92vw] md:w-[45vw] lg:w-[35vw] xl:w-[26vw] 2xl:w-[22vw] glass-panel rounded-[4vh] shadow-[0_5vh_10vh_-2vh_rgba(0,0,0,0.4)] z-[100] overflow-hidden border-2 border-white/80 dark:border-white/10 animate-in fade-in slide-in-from-top-6 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-[4vh] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 dark:from-slate-900 dark:via-indigo-950 dark:to-indigo-900 text-white relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="flex items-center gap-[3vh] relative z-10">
            <div className="relative">
              <div className="w-[9.5vh] h-[9.5vh] rounded-[2.5vh] border-2 border-indigo-400/40 p-[0.4vh] bg-white/5 backdrop-blur-xl shadow-2xl">
                <img src="https://picsum.photos/100/100?random=1" alt="Avatar" className="w-full h-full object-cover rounded-[2vh]" />
              </div>
              <div className="absolute -bottom-[0.5vh] -right-[0.5vh] w-[2.5vh] h-[2.5vh] bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg"><div className="w-[0.8vh] h-[0.8vh] bg-white rounded-full animate-pulse"></div></div>
            </div>
            <div>
              <div className="flex items-center gap-[1vh]">
                <h4 className="font-black uppercase tracking-tighter leading-none text-[clamp(1.2rem,2.2vh,3rem)]">
                  {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
                </h4>
                {user?.rol && (
                  <span className="px-[0.8vh] py-[0.3vh] rounded-lg bg-indigo-500/20 border border-indigo-400/30 font-black text-indigo-300 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">
                    {user.rol}
                  </span>
                )}
              </div>
              <p className="font-black text-indigo-300 uppercase tracking-[0.3em] mt-[1vh] opacity-80 text-[clamp(0.7rem,1.3vh,1.5rem)] italic">
                {permisoPrincipal ? `Permiso: ${permisoPrincipal}` : 'No autorizado'}
              </p>
              {otrosPermisos && otrosPermisos.length > 0 && (
                <div 
                  className="relative inline-block"
                  onMouseEnter={() => setShowPermissionsTooltip(true)}
                  onMouseLeave={() => setShowPermissionsTooltip(false)}
                >
                  <p className="font-bold text-indigo-200 mt-[0.5vh] uppercase opacity-80 text-[clamp(0.6rem,1.1vh,1.3rem)] cursor-help">
                    Otros permisos ({otrosPermisos.length}) <span className="ml-1 text-[0.6em]">▼</span>
                  </p>
                  {showPermissionsTooltip && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2">
                      <p className="font-bold mb-1 text-indigo-400">Permisos adicionales:</p>
                      <ul className="space-y-1">
                        {otrosPermisos.map((permiso, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                            {permiso}
                          </li>
                        ))}
                      </ul>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl max-h-[60vh] overflow-y-auto no-scrollbar">
          {view === 'MAIN' && renderMainMenu()}
          {view === 'UPDATE_SUBMENU' && renderUpdateSubmenu()}
          {view === 'CONFIG_SUBMENU' && renderConfigSubmenu()}
        </div>
        <div className="p-[2.5vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-[0_-1vh_2vh_rgba(0,0,0,0.02)] shrink-0">
          <p className="font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] text-[clamp(0.6rem,1.1vh,1.2rem)]">FLOR HUB STABLE v4.2</p>
          <div className="flex gap-[0.8vh]"><div className="w-[0.8vh] h-[0.8vh] rounded-full bg-emerald-500 shadow-sm animate-pulse"></div><div className="w-[0.8vh] h-[0.8vh] rounded-full bg-indigo-200 dark:bg-indigo-900"></div></div>
        </div>
      </div>

      {/* Modales de carga */}
      <UploadEstadoVentaModal
        isOpen={activeModal === 'estado-venta'}
        onClose={() => setActiveModal(null)}
        onUpload={handleUploadEstadoVenta}
        isUploading={isUploading}
      />
      
      <UploadSeguimientoLineaModal
        isOpen={activeModal === 'seguimiento-linea'}
        onClose={() => setActiveModal(null)}
        onUpload={handleUploadSeguimientoLinea}
        isUploading={isUploading}
      />
      
      <UploadCorreoModal
        isOpen={activeModal === 'correo'}
        onClose={() => setActiveModal(null)}
        onUpload={handleUploadCorreo}
        isUploading={isUploading}
      />
      
      <GestionarOfertasModal
        isOpen={activeModal === 'oferta'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};