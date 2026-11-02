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
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans">
      {/* Sidebar Lateral */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Contenedor Principal (Con padding lateral para el Sidebar en desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Topbar Institucional (Header de Contexto y Acciones) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Toggle de Sidebar Móvil & Migas de Pan */}
            <div className="flex items-center space-x-3 truncate">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-700 transition"
                aria-label="Abrir menú lateral"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500 truncate font-mono">
                <span className="font-semibold text-slate-800">Archivo</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize text-slate-600 truncate">
                  {currentView === 'regiones' && 'Regiones & Territorios'}
                  {currentView === 'memorias' && 'Archivo de Personas'}
                  {currentView === 'persona_detalle' && 'Expediente Biográfico'}
                  {currentView === 'guarda_memorias' && 'Escribe tu Historia'}
                  {currentView === 'registro_contrato' && 'Registro & Contrato'}
                  {currentView === 'carga' && 'Carga de Relatos'}
                  {currentView === 'validacion' && 'Mesa de Curaduría'}
                  {currentView === 'buscador' && 'Búsqueda Documental'}
                  {currentView === 'admin' && 'Administración'}
                </span>
              </div>
            </div>

            {/* Perfil del Operador y Estado */}
            <div className="flex items-center space-x-3 text-xs flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Perfil: <strong>{activeRole}</strong></span>
              </div>

              <div className="text-right hidden md:block">
                <div className="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                  {currentUser.email}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#0c1a2d] text-amber-200 flex items-center justify-center font-bold text-xs uppercase border border-slate-700">
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
        <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-bold text-slate-700 font-serif">Fundación Legado Vivo</span>
              <span className="mx-1.5">•</span>
              <span>Palmares, Alajuela, Costa Rica</span>
              <span className="mx-1.5">•</span>
              <span className="font-mono">Plataforma de Preservación Histórica</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custodia Criptográfica SHA-256</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulador IA v1.1</span>
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
