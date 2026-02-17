import React, { useState } from 'react';
import { AppTab } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { NotificationCenter } from './NotificationCenter';
import { ProfileMenu } from './ProfileMenu';
import { Logo } from '../common/Logo';

// Variables de entorno para la aplicación
const APP_NAME = import.meta.env.VITE_APP_NAME || 'FLOR HUB';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenNomina: () => void;
  onLogoClick?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNomina,
  onLogoClick,
  isDarkMode,
  setIsDarkMode
}) => {
  const { logout } = useAuth();
  const { user } = useAuthCheck();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState(false);

  // Orden de prioridad de permisos (de mayor a menor)
  const permisosPrioridad = ["SUPERADMIN", "ADMIN", "BACK_OFFICE", "SUPERVISOR", "VENDEDOR"];

  // Obtener el permiso principal (el de mayor prioridad que tenga el usuario)
  const permisoPrincipal = user?.permisos?.find(p => permisosPrioridad.includes(p));

  // Obtener el resto de permisos
  const otrosPermisos = user?.permisos?.filter(p => p !== permisoPrincipal);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const toggleProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const closeMenus = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  return (
    <>
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/20 dark:bg-black/60 backdrop-blur-sm transition-all duration-500 animate-in fade-in"
          onClick={closeMenus}
        ></div>
      )}

      <header className="sticky top-0 z-50 w-full px-[1vw] py-[1vh]">
        <div className="w-[98vw] mx-auto flex items-center justify-between glass-panel rounded-[3.2vh] px-[2vw] py-[1vh] relative min-h-[8.5vh]">
          
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-fuchsia-500/5 pointer-events-none rounded-[3.2vh] overflow-hidden"></div>

          <div className="flex items-center gap-[2vw] relative z-10">
            <div 
              className="flex items-center gap-[1vw] cursor-pointer group" 
              onClick={() => {
                setActiveTab('GESTIÓN');
                onLogoClick?.();
              }}
            >
              <div className="h-[6.2vh] aspect-square flex items-center justify-center overflow-hidden">
                <Logo size="lg" className="w-full h-full" /> 
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-baseline gap-[0.4vw]">
                  {APP_NAME.includes(' ') ? (
                    // Si el nombre tiene espacio, separarlo en dos partes
                    <>
                      <span className="font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase text-[clamp(1.5rem,3.5vh,4.2rem)]">
                        {APP_NAME.split(' ')[0]}
                      </span>
                      <span className="font-black tracking-tighter text-indigo-600 dark:text-indigo-400 leading-none uppercase text-[clamp(1.5rem,3.5vh,4.2rem)]">
                        {APP_NAME.split(' ').slice(1).join(' ')}
                      </span>
                    </>
                  ) : (
                    // Si no tiene espacio, mostrar todo junto
                    <span className="font-black tracking-tighter text-indigo-600 dark:text-indigo-400 leading-none uppercase text-[clamp(1.5rem,3.5vh,4.2rem)]">
                      {APP_NAME}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-[0.5vw] mt-[0.2vh]">
                  <div className="w-[1vh] h-[1vh] rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-black text-slate-400 dark:text-slate-500 tracking-[0.4em] uppercase opacity-80 text-[clamp(0.55rem,1.1vh,1.3rem)]">
                    v{APP_VERSION}
                  </span>
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center bg-white/30 backdrop-blur-md p-[0.6vh] rounded-[2vh] border border-white/40">
              {(['GESTIÓN', 'SEGUIMIENTO', 'REPORTES', 'OFERTAS'] as AppTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-[1.8vw] py-[1.2vh] rounded-[1.5vh] font-black transition-all uppercase tracking-widest text-[clamp(0.7rem,1.4vh,1.5rem)] ${
                    activeTab === tab 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' 
                      : 'text-indigo-900/60 dark:text-indigo-300/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-[1.5vw] relative z-10">
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className={`relative w-[5.5vh] h-[5.5vh] flex items-center justify-center rounded-[2.2vh] transition-all border shadow-sm ${showNotifications ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/40 dark:bg-slate-800/40 text-indigo-900 dark:text-indigo-400 border-white/60 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
              >
                <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span className="absolute top-[0.8vh] right-[0.8vh] w-[1.2vh] h-[1.2vh] bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
              {showNotifications && <NotificationCenter onClose={closeMenus} />}
            </div>
            
            <div className="h-[4vh] w-px bg-indigo-900/10 mx-[0.2vw]"></div>

            <div className="relative">
              <div
                className="flex items-center gap-[1vw] cursor-pointer group"
                onClick={toggleProfile}
              >
                <div className="text-right hidden sm:block">
                  {/* Nombre y Apellido del usuario */}
                  <p className={`font-black leading-none transition-colors text-[clamp(0.8rem,1.6vh,2.2rem)] ${showProfileMenu ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>
                    {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
                  </p>
                  {/* Rol y Permiso principal con hover para ver más permisos */}
                  <div
                    className="relative inline-block"
                    onMouseEnter={() => setShowPermissionsTooltip(true)}
                    onMouseLeave={() => setShowPermissionsTooltip(false)}
                  >
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-[0.6vh] bg-emerald-100 dark:bg-emerald-900/30 px-[1vh] py-[0.3vh] rounded-full inline-block text-[clamp(0.6rem,1.1vh,1.3rem)] cursor-help">
                      {user?.rol || 'Rol'} {permisoPrincipal ? `| ${permisoPrincipal}` : ''}
                      {otrosPermisos && otrosPermisos.length > 0 && (
                        <span className="ml-1 text-[0.6em]">▼</span>
                      )}
                    </p>

                    {/* Tooltip con permisos adicionales */}
                    {showPermissionsTooltip && otrosPermisos && otrosPermisos.length > 0 && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-2">
                        <p className="font-bold mb-1 text-emerald-400">Permisos adicionales:</p>
                        <ul className="space-y-1">
                          {otrosPermisos.map((permiso, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                              {permiso}
                            </li>
                          ))}
                        </ul>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`w-[6vh] h-[6vh] rounded-[1.8vh] border-2 overflow-hidden shadow-lg transition-all ${showProfileMenu ? 'border-indigo-600 scale-110 ring-4 ring-indigo-50' : 'border-white/80 group-hover:scale-105'}`}>
                  <img src="https://picsum.photos/100/100?random=1" alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              {showProfileMenu && (
                <ProfileMenu
                  onClose={closeMenus}
                  onOpenNomina={onOpenNomina}
                  onLogout={logout}
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
