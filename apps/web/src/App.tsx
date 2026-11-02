import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { RegionesView } from './views/RegionesView';
import { PersonaDetalleView } from './views/PersonaDetalleView';
import { GuardaMemoriasView } from './views/GuardaMemoriasView';
import { RegistroMemoriaContratoView } from './views/RegistroMemoriaContratoView';
import { MemoriasView } from './views/MemoriasView';
import { ConsentimientoView } from './views/ConsentimientoView';
import { CargaRelatosView } from './views/CargaRelatosView';
import { ValidacionView } from './views/ValidacionView';
import { BuscadorView } from './views/BuscadorView';
import { AdminView } from './views/AdminView';
import {
  Menu,
  Building2,
  ShieldCheck,
  Info,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, setActiveMemoriaId, activeRole } = useAuth();
  const [currentView, setCurrentView] = useState<string>('regiones');
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (view: string, params?: any) => {
    if (params?.memoriaId) {
      setActiveMemoriaId(params.memoriaId);
      setSelectedPersonaId(params.memoriaId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPersona = (id: number) => {
    setActiveMemoriaId(id);
    setSelectedPersonaId(id);
    setCurrentView('persona_detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return <LoginView onSuccess={() => setCurrentView('regiones')} />;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#261b12] flex flex-col font-sans">
      {/* Sidebar Lateral */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Contenedor Principal (Con padding lateral para el Sidebar en desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Topbar Institucional Cálido (Header de Contexto y Acciones) */}
        <header className="bg-white border-b border-[#e3d9cb] sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Toggle de Sidebar Móvil & Migas de Pan */}
            <div className="flex items-center space-x-3 truncate">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded hover:bg-[#f4ede2] text-[#442a17] transition border border-[#d8ccba]"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs sm:text-sm text-[#665546] truncate">
                <span className="font-bold text-[#261b12] font-serif">Archivo</span>
                <ChevronRight className="w-4 h-4 text-[#baa995]" />
                <span className="font-medium text-[#c05600] truncate">
                  {currentView === 'regiones' && 'Regiones & Territorios'}
                  {currentView === 'memorias' && 'Archivo de Personas'}
                  {currentView === 'persona_detalle' && 'Expediente Biográfico'}
                  {currentView === 'guarda_memorias' && 'Escribe tu Historia'}
                  {currentView === 'registro_contrato' && 'Registro & Contrato'}
                  {currentView === 'carga' && 'Carga de Relatos'}
                  {currentView === 'validacion' && 'Mesa de Curaduría'}
                  {currentView === 'buscador' && 'Búsqueda Documental'}
                  {currentView === 'admin' && 'Gobernanza Institucional'}
                </span>
              </div>
            </div>

            {/* Perfil del Operador y Estado */}
            <div className="flex items-center space-x-3 text-xs sm:text-sm flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#fcf8f3] text-[#442a17] border border-[#d8ccba]">
                <UserCheck className="w-4 h-4 text-[#c05600]" />
                <span>Perfil: <strong>{activeRole}</strong></span>
              </div>

              <div className="text-right hidden md:block">
                <div className="font-bold text-[#261b12] text-xs sm:text-sm truncate max-w-[170px]">
                  {currentUser.full_name}
                </div>
                <div className="text-[11px] text-[#665546] truncate max-w-[170px]">
                  {currentUser.email}
                </div>
              </div>

              <div className="w-9 h-9 rounded bg-[#442a17] text-[#fef6ee] flex items-center justify-center font-bold text-sm uppercase border border-[#2a1a0f] shadow-xs">
                {currentUser.full_name[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Zona de Vistas Dinámicas */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'regiones' && (
            <RegionesView
              onSelectPersona={handleSelectPersona}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'persona_detalle' && selectedPersonaId && (
            <PersonaDetalleView
              memoriaId={selectedPersonaId}
              onBack={() => setCurrentView('regiones')}
              onNavigateCarga={(id) => handleNavigate('carga', { memoriaId: id })}
            />
          )}

          {currentView === 'memorias' && (
            <MemoriasView
              onNavigate={handleNavigate}
              onSelectPersona={handleSelectPersona}
            />
          )}

          {currentView === 'guarda_memorias' && (
            <GuardaMemoriasView onNavigate={handleNavigate} />
          )}

          {currentView === 'registro_contrato' && (
            <RegistroMemoriaContratoView
              onSuccessNavigate={handleSelectPersona}
              onNavigateCarga={(id) => handleNavigate('carga', { memoriaId: id })}
            />
          )}

          {currentView === 'consentimiento' && (
            <ConsentimientoView onNavigate={handleNavigate} />
          )}

          {currentView === 'carga' && (
            <CargaRelatosView onNavigate={handleNavigate} />
          )}

          {currentView === 'validacion' && (
            <ValidacionView onNavigate={handleNavigate} />
          )}

          {currentView === 'buscador' && (
            <BuscadorView onNavigate={handleNavigate} />
          )}

          {currentView === 'admin' && (
            <AdminView />
          )}
        </main>

        {/* Pie Institucional Formal */}
        <footer className="bg-white border-t border-[#e3d9cb] py-5 text-xs text-[#665546] mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-bold text-[#261b12] font-serif text-sm">Fundación Legado Vivo</span>
              <span className="mx-2 text-[#baa995]">•</span>
              <span className="font-medium text-[#442a17]">Palmares, Alajuela, Costa Rica</span>
              <span className="mx-2 text-[#baa995]">•</span>
              <span>Custodia y Preservación del Patrimonio Oral</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#665546]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#1b6e39]" />
                <span>Integridad Criptográfica SHA-256</span>
              </span>
              <span className="text-[#baa995]">•</span>
              <span className="text-[#8c6239] font-medium">
                Rigor Ético & Consentimiento
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
