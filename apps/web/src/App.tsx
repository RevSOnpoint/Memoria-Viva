import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShellBar } from './components/ShellBar';
import { LoginView } from './views/LoginView';
import { MemoriasView } from './views/MemoriasView';
import { ConsentimientoView } from './views/ConsentimientoView';
import { CargaRelatosView } from './views/CargaRelatosView';
import { ValidacionView } from './views/ValidacionView';
import { BuscadorView } from './views/BuscadorView';
import { NarradorView } from './views/NarradorView';
import { AdminView } from './views/AdminView';
import { ShieldCheck, Info } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, setActiveMemoriaId } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('memorias');

  const handleNavigate = (tab: string, memoriaId?: number) => {
    if (memoriaId !== undefined) {
      setActiveMemoriaId(memoriaId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return <LoginView onSuccess={() => setCurrentTab('memorias')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-sap-bg">
      {/* Barra de navegación superior estilo SAP ShellBar */}
      <ShellBar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Contenido principal de la pantalla activa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'memorias' && <MemoriasView onNavigate={handleNavigate} />}
        {currentTab === 'consentimiento' && <ConsentimientoView onNavigate={handleNavigate} />}
        {currentTab === 'carga' && <CargaRelatosView onNavigate={handleNavigate} />}
        {currentTab === 'validacion' && <ValidacionView onNavigate={handleNavigate} />}
        {currentTab === 'buscador' && <BuscadorView onNavigate={handleNavigate} />}
        {currentTab === 'narrador' && <NarradorView onNavigate={handleNavigate} />}
        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* Pie de página institucional SAP Fiori */}
      <footer className="bg-white border-t border-sap-border py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Fundación Legado Vivo</span>
            <span>•</span>
            <span>Palmares, Alajuela, Costa Rica</span>
            <span>•</span>
            <span>Plataforma "Memoria Viva" v1.0.0</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sap-success" />
              <span>Gobernanza Criptográfica SHA-256</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sap-blue" />
              <span>Modo IA: Simulado (AI_MODE=mock)</span>
            </span>
          </div>
        </div>
      </footer>
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
