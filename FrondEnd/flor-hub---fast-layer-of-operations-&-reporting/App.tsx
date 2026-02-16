// App.tsx
// Main App Component with React Query implementation

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SaleModal } from './components/SaleModal';
import { CommentModal } from './components/CommentModal';
import { QuickActionFAB } from './components/QuickActionFAB';
import { UpdateMenu } from './components/UpdateMenu';
import { AdvancedFilters } from './components/AdvancedFilters';
import { SaleFormModal } from './components/SaleFormModal';
import { NominaModal } from './components/NominaModal';
import { FilterBar } from './components/FilterBar';
import { GestionPage } from './pages/GestionPage';
import { SeguimientoPage } from './pages/SeguimientoPage';
import { api } from './services/api';
import { ReportesPage } from './pages/ReportesPage';
import { OfertasPage } from './pages/OfertasPage';
import { KPICards } from './components/KPICards';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer } from './components/ToastContainer';
import { ToastProvider } from './contexts/ToastContext';

import { AppTab, Sale, SaleStatus, ProductType, LogisticStatus, LineStatus } from './types';

// Hooks y servicios de API
import { useAuth } from './hooks/useAuth';
import { useAuthCheck, VerifiedUser } from './hooks/useAuthCheck';
import { useVentasQuery } from './hooks/useVentasQuery';
import { useVentaDetalle } from './hooks/useVentaDetalle';

import { getSaleDetailById } from './mocks/ventasDetalle';
import { mapVentaToSale } from './services/ventas';
import { getInspectionSales } from './mocks/ventasInspeccion';

// Componentes Zod (mantener por compatibilidad)
import { EstadoVentaFormModal } from './components/EstadoVentaFormModal';
import { CorreoFormModal } from './components/CorreoFormModal';
import { EstadoCorreoFormModal } from './components/EstadoCorreoFormModal';

// Páginas
import { LoginPage } from './pages/LoginPage';

// Componentes de transición
import { TransitionOverlay } from './components/TransitionOverlay';

export default function App() {
  // Verificación de autenticación al inicio
  const { isAuthenticated, isLoading: isAuthChecking, user: authUser, refetch, setIsAuthenticated } = useAuthCheck();
  
  // Autenticación con API (para login/logout)
  const { login, error: authError, syncUser } = useAuth();

  // --- MODO INSPECCIÓN ---
  const [inspectionMode, setInspectionMode] = useState(() => localStorage.getItem('inspectionMode') === 'true');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Manejador de filtros desde KPIs
  const handleKPIFilter = (filtersKPI: any) => {
    setFilters(prev => ({
      ...prev,
      ...filtersKPI
    }));
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 5) {
            const newMode = !inspectionMode;
            setInspectionMode(newMode);
            localStorage.setItem('inspectionMode', String(newMode));
            return 0;
        }
        return newCount;
    });
  };

  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);
  // ------------------------

  // Sincronizar usuario entre useAuthCheck y useAuth
  useEffect(() => {
    if (authUser) {
      syncUser(authUser);
    } else if (!isAuthChecking && !isAuthenticated) {
      syncUser(null);
    }
  }, [authUser, isAuthChecking, isAuthenticated, syncUser]);

  // Estado de la aplicación con persistencia
  const [activeTab, setActiveTab] = useState<AppTab>(() => 
    (localStorage.getItem('activeTab') as AppTab) || 'GESTIÓN'
  );
  const [trackingSubTab, setTrackingSubTab] = useState<'AGENDADOS' | 'ENTREGADOS_PORTA' | 'NO_ENTREGADOS_PORTA' | 'NO_ENTREGADOS_LN' | 'PENDIENTE_PIN'>(() => 
    (localStorage.getItem('trackingSubTab') as any) || 'AGENDADOS'
  );
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Sync de pestañas a localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('trackingSubTab', trackingSubTab);
  }, [trackingSubTab]);

  // Sync de Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Estado de Filtros Principales
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState({ 
    status: 'TODOS', 
    logisticStatus: 'TODOS', 
    productType: 'TODOS', 
    originMarket: 'TODOS', 
    advisor: 'TODOS', 
    plan: 'TODOS', 
    promotion: 'TODOS',
    empresaOrigen: 'TODOS',
    correoStatus: 'TODOS',
    celula: 'TODOS'
  });

  // Datos para filtros avanzados
  const [planesData, setPlanesData] = useState<any[]>([]);
  const [promocionesData, setPromocionesData] = useState<any[]>([]);
  const [empresasOrigenData, setEmpresasOrigenData] = useState<any[]>([]);
  const [celulasData, setCelulasData] = useState<number[]>([]);

  // Cargar datos para filtros avanzados
  useEffect(() => {
    const fetchFilterData = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Obtener empresas origen
        const empresasRes = await api.get('/empresa-origen');
        if (empresasRes.success && empresasRes.data) {
          setEmpresasOrigenData(empresasRes.data);
        }

        // Obtener planes
        const planesRes = await api.get('/planes');
        if (planesRes.success && planesRes.data) {
          setPlanesData(planesRes.data);
        }

        // Obtener promociones
        const promoRes = await api.get('/promociones');
        if (promoRes.success && promoRes.data) {
          setPromocionesData(promoRes.data);
        }

        // Células disponibles (1-10)
        setCelulasData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch (error) {
        console.error('Error cargando datos de filtros:', error);
      }
    };

    fetchFilterData();
  }, [isAuthenticated, authUser]);

  // Estado de Interfaz
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showNomina, setShowNomina] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'TODOS'>(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Estado de Modales
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [commentingSale, setCommentingSale] = useState<Sale | null>(null);
  const [creatingSale, setCreatingSale] = useState<Partial<Sale> | null>(null);

  // Modales Zod
  const [editingEstadoVenta, setEditingEstadoVenta] = useState<Sale | null>(null);
  const [editingCorreo, setEditingCorreo] = useState<Sale | null>(null);
  const [editingEstadoCorreo, setEditingEstadoCorreo] = useState<{sale: Sale, currentEstado?: string} | null>(null);

  // Datos de ventas con React Query (solo si está autenticado)
  const { ventas: ventasRaw, isLoading: isVentasLoading, error: ventasError, total, page, limit } = useVentasQuery(
    isAuthenticated ? currentPage : 1, 
    isAuthenticated ? (rowsPerPage === 'TODOS' ? 1000 : rowsPerPage) : 0,
    {
      startDate,
      endDate,
      search: searchQuery
    }
  );

  // Mapear ventas UI (ya viene mapeado de useVentasQuery con mapVentaUIToSale)
  const sales = useMemo(() => {
    // ventasRaw YA viene mapeado como Sale[] desde useVentasQuery
    const apiSales = ventasRaw || [];
    if (inspectionMode) {
      return [...getInspectionSales(), ...apiSales];
    }
    return apiSales;
  }, [ventasRaw, inspectionMode]);

  // Lazy loading para detalles completos de venta seleccionada
  const { ventaDetalle, isLoading: isDetalleLoading, error: detalleError } = useVentaDetalle(
    selectedSale ? (String(selectedSale.id).startsWith('INS-') ? selectedSale.id : parseInt(String(selectedSale.id))) : null
  );

  // Atajos de Teclado Globales (Spotlight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persistencia de Modal Abierta
  useEffect(() => {
    if (selectedSale) {
      localStorage.setItem('selectedSaleId', String(selectedSale.id));
    } else {
      localStorage.removeItem('selectedSaleId');
    }
  }, [selectedSale]);

  // Recuperación automática de Modal al recargar
  useEffect(() => {
    const savedId = localStorage.getItem('selectedSaleId');
    if (savedId && sales?.length > 0 && !selectedSale) {
      const foundSale = sales.find(s => String(s.id) === savedId);
      if (foundSale) {
        setSelectedSale(foundSale);
      }
    }
  }, [sales, selectedSale]);

  // Lógica de Filtrado Global
  const filteredSales = useMemo(() => sales?.filter(sale => {
    const matchesSearch = String(sale.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         String(sale.dni).toLowerCase().includes(searchQuery.toLowerCase()) || 
                         String(sale.phoneNumber).includes(searchQuery);
    const matchesStatus = filters.status === 'TODOS' || sale.status === filters.status;
    const matchesLogistic = filters.logisticStatus === 'TODOS' || sale.logisticStatus === filters.logisticStatus;
    const matchesProduct = filters.productType === 'TODOS' || sale.productType === filters.productType;
    const matchesAdvisor = filters.advisor === 'TODOS' || sale.advisor === filters.advisor;
    const matchesDate = (!startDate || sale.date >= startDate) && (!endDate || sale.date <= endDate);
    
    return matchesSearch && matchesStatus && matchesLogistic && matchesProduct && matchesAdvisor && matchesDate;
  }), [searchQuery, filters, startDate, endDate, sales]);

  // Lista única de asesores para los filtros avanzados
  const uniqueAdvisors = useMemo(() => 
    Array.from(new Set(sales?.map(s => s.advisor).filter(Boolean) || [])), 
    [sales]
  );

  // Agrupación para Seguimiento
  const trackingGroups = useMemo(() => {
    const groups = { agendados: [] as Sale[], entregadosPorta: [] as Sale[], noEntregadosPorta: [] as Sale[], noEntregadosLN: [] as Sale[], pendientePin: [] as Sale[] };
    filteredSales?.forEach(sale => {
      const isDelivered = [LogisticStatus.ENTREGADO, LogisticStatus.RENDIDO_AL_CLIENTE].includes(sale.logisticStatus);
      const isPorta = sale.productType === ProductType.PORTABILITY;
      const isLN = sale.productType === ProductType.NEW_LINE;
      if (sale.lineStatus === LineStatus.PENDIENTE_PORTABILIDAD) groups.pendientePin.push(sale);
      else if (isDelivered && isPorta) groups.entregadosPorta.push(sale);
      else if (!isDelivered && isPorta && sale.logisticStatus !== LogisticStatus.INICIAL) groups.noEntregadosPorta.push(sale);
      else if (!isDelivered && isLN && sale.logisticStatus !== LogisticStatus.INICIAL) groups.noEntregadosLN.push(sale);
      else if (sale.status === SaleStatus.EN_PROCESO || sale.logisticStatus === LogisticStatus.ASIGNADO) groups.agendados.push(sale);
    });
    return groups;
  }, [filteredSales]);

  const currentVisibleInTracking = useMemo(() => {
    switch (trackingSubTab) {
      case 'AGENDADOS': return trackingGroups.agendados;
      case 'ENTREGADOS_PORTA': return trackingGroups.entregadosPorta;
      case 'NO_ENTREGADOS_PORTA': return trackingGroups.noEntregadosPorta;
      case 'NO_ENTREGADOS_LN': return trackingGroups.noEntregadosLN;
      case 'PENDIENTE_PIN': return trackingGroups.pendientePin;
      default: return [];
    }
  }, [trackingSubTab, trackingGroups]);

  // Calcular total de registros filtrados para el componente de paginación
  const currentTotalRecords = filteredSales?.length;

  // Exportar a CSV helper
  const exportToCSV = (data: Sale[], filename: string) => {
    const headers = ['ID', 'Cliente', 'DNI', 'Teléfono', 'Estado', 'Logística', 'Producto', 'Mercado', 'Plan', 'Asesor', 'Supervisor', 'Fecha', 'Monto'];
    const csvContent = [
      headers.join(','),
      ...data.map(s => [
        s.id,
        `"${s.customerName}"`,
        s.dni,
        s.phoneNumber,
        s.status,
        `"${s.logisticStatus}"`,
        s.productType,
        `"${s.originMarket}"`,
        `"${s.plan}"`,
        `"${s.advisor}"`,
        `"${s.supervisor}"`,
        s.date,
        s.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log('🔍 [APP] Renderizando con estados:', { isAuthChecking, isAuthenticated, user: authUser });

  return (
    <ToastProvider>
      {/* Mostrar loading mientras autentica */}
      {isAuthChecking && (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold text-lg">Verificando autenticación...</p>
          </div>
        </div>
      )}

      {/* Mostrar login solo si terminó de verificar y no está autenticado */}
      {!isAuthChecking && !isAuthenticated && (
        <LoginPage 
          onLogin={async (email, password) => {
            const success = await login(email, password);
            if (success) {
              setIsAuthenticated(true);
              setTransitioning(true);
              await refetch();
            }
            return success;
          }}
          error={authError}
        />
      )}

      {/* Transición suave después del login */}
      {transitioning && <TransitionOverlay onComplete={() => setTransitioning(false)} />}

      {/* Solo mostrar el contenido principal si está autenticado y terminó la transición */}
      {isAuthenticated && !transitioning && (
        <div className="min-h-screen pb-40">
          <ToastContainer />
          <Header 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenNomina={() => setShowNomina(true)} 
            onLogoClick={handleLogoClick}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />

          {/* Indicador de Modo Inspección */}
          {inspectionMode && (
            <div className="fixed bottom-[2vh] left-1/2 -translate-x-1/2 z-[100] px-[2vw] py-[1vh] bg-indigo-600/90 backdrop-blur-md text-white font-black rounded-full shadow-2xl flex items-center gap-[1vw] border border-white/20 animate-bounce">
              <div className="w-[1vh] h-[1vh] rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-[clamp(0.7rem,1.4vh,1.8rem)] uppercase tracking-[0.2em]">Modo Inspección Activo</span>
              <button 
                onClick={() => {
                  setInspectionMode(false);
                  localStorage.setItem('inspectionMode', 'false');
                }}
                className="ml-[1vw] bg-white/20 hover:bg-white/40 p-[0.5vh] rounded-full transition-colors"
              >
                <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          
          {showAdvancedFilters && <div className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setShowAdvancedFilters(false)}></div>}
          
          {/* KPI Dashboard - High Impact */}
          <div className="w-[98vw] mx-auto px-[1vw] mb-[2vh] relative z-20">
            <KPICards sales={sales || []} onFilterChange={handleKPIFilter} />
          </div>

          <main className="w-[98vw] max-w-none mx-auto px-[1vw] mt-[2vh]">
            {(activeTab === 'GESTIÓN' || activeTab === 'SEGUIMIENTO') && (
              <FilterBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                onExport={() => exportToCSV(filteredSales, `FLORHUB_Export`)}
                totalRecords={currentTotalRecords}
              />
            )}

            {showAdvancedFilters && (
              <AdvancedFilters 
                onClose={() => setShowAdvancedFilters(false)} 
                filters={filters} 
                setFilters={setFilters}
                uniqueAdvisors={uniqueAdvisors}
                planes={planesData}
                promociones={promocionesData}
                empresasOrigen={empresasOrigenData}
                celulas={celulasData}
              />
            )}

            <QuickActionFAB onAction={(type) => setCreatingSale({ productType: type === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE })} />

            {/* Renderizar contenido según la pestaña activa */}
            {activeTab === 'GESTIÓN' && (
              <GestionPage
                sales={filteredSales || []}
                isLoading={isVentasLoading}
                selectedIds={selectedIds}
                onToggleSelect={(id) => {
                  setSelectedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }}
                onViewSale={(sale) => setSelectedSale(sale)}
                onCommentSale={(sale) => setCommentingSale(sale)}
              />
            )}

            {activeTab === 'SEGUIMIENTO' && (
              <SeguimientoPage
                trackingSubTab={trackingSubTab}
                setTrackingSubTab={setTrackingSubTab}
                sales={currentVisibleInTracking || []}
                selectedIds={selectedIds}
                onToggleSelect={(id) => {
                  setSelectedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }}
                onViewSale={(sale) => setSelectedSale(sale)}
                onCommentSale={(sale) => setCommentingSale(sale)}
                counts={{
                  agendados: trackingGroups.agendados.length,
                  entregadosPorta: trackingGroups.entregadosPorta.length,
                  noEntregadosPorta: trackingGroups.noEntregadosPorta.length,
                  noEntregadosLN: trackingGroups.noEntregadosLN.length,
                  pendientePin: trackingGroups.pendientePin.length
                }}
              />
            )}

            {activeTab === 'REPORTES' && (
              <ReportesPage 
                advisors={Array.from(new Set(sales?.map(s => s.advisor).filter(Boolean) || []))}
                supervisors={Array.from(new Set(sales?.map(s => s.supervisor).filter(Boolean) || []))}
              />
            )}

            {activeTab === 'OFERTAS' && (
              <OfertasPage onSell={(data) => setCreatingSale(data)} />
            )}
          </main>

          {/* Overlays y Modales Globales */}
          {selectedIds.size > 0 && (
            <UpdateMenu 
              selectedCount={selectedIds.size} 
              onUpdateStatus={(s) => { 
                setSelectedIds(new Set()); 
              }} 
              onUpdateLogistic={(l) => { 
                setSelectedIds(new Set()); 
              }} 
              onUpdateLine={(line) => { 
                setSelectedIds(new Set()); 
              }} 
              onClear={() => setSelectedIds(new Set())} 
            />
          )}
          
          {editingEstadoVenta && (
            <EstadoVentaFormModal
              sale={editingEstadoVenta}
              onClose={() => setEditingEstadoVenta(null)}
              onSubmit={(data) => {
                setEditingEstadoVenta(null);
              }}
            />
          )}
          
          {editingCorreo && (
            <CorreoFormModal
              sale={editingCorreo}
              onClose={() => setEditingCorreo(null)}
              onSubmit={(data) => {
                console.log('Correo creado/actualizado:', data);
                setEditingCorreo(null);
              }}
            />
          )}
          
          {editingEstadoCorreo && (
            <EstadoCorreoFormModal
              sapId={editingEstadoCorreo.sale.id}
              currentEstado={editingEstadoCorreo.currentEstado}
              onClose={() => setEditingEstadoCorreo(null)}
              onSubmit={(data) => {
                setEditingEstadoCorreo(null);
              }}
            />
          )}
          
          {creatingSale && (
            <SaleFormModal 
              initialData={creatingSale} 
              onClose={() => setCreatingSale(null)} 
              onSubmit={(sale) => {
                console.log('✅ [VENTA_REGISTRADA]', sale);
                setCreatingSale(null);
              }}
              onVentaCreada={() => {
                refetch();
              }}
            />
          )}

          {showNomina && <NominaModal onClose={() => setShowNomina(false)} />}

          {/* Modales de Detalle y Comentarios */}
          {selectedSale && (
            <SaleModal 
              sale={selectedSale as any} 
              onClose={() => setSelectedSale(null)} 
              onUpdate={() => refetch()}
            />
          )}

          {showCommandPalette && (
            <CommandPalette 
              onClose={() => setShowCommandPalette(false)}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setShowCommandPalette(false);
              }}
              onSearch={(q) => {
                setSearchQuery(q);
                setShowCommandPalette(false);
              }}
              onAction={(action) => {
                if (action === 'NEW_SALE') setCreatingSale({ productType: ProductType.PORTABILITY });
                if (action === 'TOGGLE_THEME') setIsDarkMode(!isDarkMode);
                setShowCommandPalette(false);
              }}
            />
          )}

          {commentingSale && (
            <CommentModal 
              ventaId={Number(commentingSale.id.replace('V-', ''))}
              customerName={commentingSale.customerName}
              onClose={() => setCommentingSale(null)} 
              onSuccess={() => {
                setCommentingSale(null);
                refetch();
              }}
            />
          )}
        </div>
      )}
    </ToastProvider>
  );
}