import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { RegionesView } from './views/RegionesView';
import { RegionDetalleView } from './views/RegionDetalleView';
import { PersonaDetalleView } from './views/PersonaDetalleView';
import { GuardaMemoriasView } from './views/GuardaMemoriasView';
import { RegistroMemoriaContratoView } from './views/RegistroMemoriaContratoView';
import { MemoriasView } from './views/MemoriasView';
import { ConsentimientoView } from './views/ConsentimientoView';
import { CargaRelatosView } from './views/CargaRelatosView';
import { ValidacionView } from './views/ValidacionView';
import { BuscadorView } from './views/BuscadorView';
import { AdminView } from './views/AdminView';
import { SobreNosotrosView } from './views/SobreNosotrosView';
import { ContactoView } from './views/ContactoView';
import { PreguntasFrecuentesView } from './views/PreguntasFrecuentesView';
import { LegalView } from './views/LegalView';
import { Footer } from './components/Footer';

const LEGAL_VIEWS = ['terminos', 'privacidad', 'cookies', 'accesibilidad', 'aviso_legal', 'etica'];

const MainApp: React.FC = () => {
  const { currentUser, setActiveMemoriaId } = useAuth();
  const [currentView, setCurrentView] = useState<string>('inicio');
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('palmares');
  const [personaReturnView, setPersonaReturnView] = useState<string>('memorias');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (view: string, params?: any) => {
    if (params?.memoriaId) {
      setActiveMemoriaId(params.memoriaId);
      setSelectedPersonaId(params.memoriaId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPersona = (id: number, returnView: string = 'memorias') => {
    setActiveMemoriaId(id);
    setSelectedPersonaId(id);
    setPersonaReturnView(returnView);
    setCurrentView('persona_detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setCurrentView('region_detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return <LoginView onSuccess={() => setCurrentView('inicio')} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#1d2b28] flex flex-col font-sans">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-white focus:border focus:border-[#2f5d50] focus:rounded focus:text-sm focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenMobile={() => setMobileSidebarOpen(true)}
      />

      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main
        id="contenido"
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
      >
        {currentView === 'inicio' && (
          <HomeView onNavigate={handleNavigate} onSelectRegion={handleSelectRegion} />
        )}

        {currentView === 'sobre_nosotros' && (
          <SobreNosotrosView onNavigate={handleNavigate} />
        )}

        {currentView === 'contacto' && <ContactoView onNavigate={handleNavigate} />}

        {currentView === 'preguntas' && (
          <PreguntasFrecuentesView onNavigate={handleNavigate} />
        )}

        {LEGAL_VIEWS.includes(currentView) && (
          <LegalView documentId={currentView} onNavigate={handleNavigate} />
        )}

        {currentView === 'regiones' && (
          <RegionesView
            onSelectRegion={handleSelectRegion}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'region_detalle' && (
          <RegionDetalleView
            regionId={selectedRegionId}
            onBack={() => handleNavigate('regiones')}
            onSelectPersona={(id) => handleSelectPersona(id, 'region_detalle')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'persona_detalle' && selectedPersonaId && (
          <PersonaDetalleView
            memoriaId={selectedPersonaId}
            onBack={() => handleNavigate(personaReturnView)}
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

        {currentView === 'admin' && <AdminView />}
      </main>

      <Footer onNavigate={handleNavigate} />
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
