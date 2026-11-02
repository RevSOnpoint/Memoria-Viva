import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../services/api';
import {
  BookOpen,
  FileCheck2,
  UploadCloud,
  CheckSquare,
  Search,
  Bot,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface ShellBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const ShellBar: React.FC<ShellBarProps> = ({ currentTab, onTabChange }) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    fontSizeScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
  } = useAuth();

  const [pendientesCount, setPendientesCount] = useState<number>(0);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Si es Gestor o Admin, consultar número de aportes pendientes de revisión
    if (activeRole === 'Gestor de datos' || activeRole === 'Administrador') {
      api.getPendientesValidacion()
        .then(res => setPendientesCount(res.length))
        .catch(() => setPendientesCount(0));
    }
  }, [activeRole, currentTab]);

  const allRoles: UserRole[] = ['Digitalizador', 'Gestor de datos', 'Usuario', 'Administrador'];

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-sap-shell text-white border-b border-sap-shellHover sticky top-0 z-50 shadow-md">
      {/* Barra superior de gobernanza y accesibilidad (Mobile-First) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14 text-sm">
        {/* Identidad institucional con toggle móvil */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-slate-800 text-gray-200 transition focus:outline-none"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>

          <div className="w-8 h-8 rounded bg-sap-blue flex items-center justify-center font-bold text-white shadow flex-shrink-0 text-xs">
            MV
          </div>
          <div>
            <div className="font-bold tracking-tight text-white leading-tight flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base">Memoria Viva</span>
              <span className="text-[10px] sm:text-xs font-normal px-1.5 py-0.5 rounded bg-blue-900/90 text-blue-200 border border-blue-700 hidden xs:inline-block">
                Palmares
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-300 hidden sm:block">Fundación Legado Vivo</div>
          </div>
        </div>

        {/* Controles de accesibilidad y selector de rol de demo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Herramienta de Zoom accesible (para adultos mayores) */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-800/80 px-1.5 py-1 rounded border border-slate-700">
            <button
              onClick={decreaseFontSize}
              title="Reducir tamaño de letra"
              className="p-1 rounded hover:bg-slate-700 text-gray-200 transition"
              aria-label="Reducir tamaño de letra"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[11px] sm:text-xs font-mono px-1 font-semibold text-blue-300">
              {Math.round(fontSizeScale * 100)}%
            </span>
            <button
              onClick={increaseFontSize}
              title="Aumentar tamaño de letra"
              className="p-1 rounded hover:bg-slate-700 text-gray-200 transition"
              aria-label="Aumentar tamaño de letra"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {fontSizeScale !== 1.0 && (
              <button
                onClick={resetFontSize}
                title="Restablecer tamaño normal"
                className="p-1 rounded hover:bg-slate-700 text-gray-400 hover:text-white transition hidden sm:inline-block"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Selector Rápido de Rol de Demostración (SAP Quick Role Switcher) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 py-1.5 rounded border border-slate-600 text-xs sm:text-sm font-medium transition"
              aria-expanded={roleMenuOpen}
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
              <div className="text-left max-w-[85px] sm:max-w-none truncate">
                <span className="text-[10px] text-gray-400 block leading-none hidden sm:block">Rol activo:</span>
                <span className="text-white font-semibold leading-tight text-xs sm:text-sm truncate block">{activeRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Cambiar Rol de Demostración
                </div>
                {allRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                      activeRole === role ? 'bg-blue-50 text-sap-blue font-bold border-l-4 border-sap-blue' : 'text-slate-700'
                    }`}
                  >
                    <span>{role}</span>
                    {activeRole === role && (
                      <span className="text-[10px] bg-sap-blue text-white px-2 py-0.5 rounded-full font-normal">
                        Activo
                      </span>
                    )}
                  </button>
                ))}
                <div className="px-3 py-2 text-[11px] text-slate-500 bg-slate-50 mt-1 border-t border-slate-100">
                  Simula la experiencia de cada perfil en 1 clic.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable (Mobile Drawer) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleTabClick('memorias')}
            className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
              currentTab === 'memorias' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>P02 Mis Memorias</span>
            </div>
          </button>

          {['Digitalizador', 'Gestor de datos', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => handleTabClick('consentimiento')}
              className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
                currentTab === 'consentimiento' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>P03 Consentimiento</span>
              </div>
            </button>
          )}

          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => handleTabClick('carga')}
              className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
                currentTab === 'carga' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>P04 Carga de Relatos</span>
              </div>
            </button>
          )}

          {['Gestor de datos', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => handleTabClick('validacion')}
              className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
                currentTab === 'validacion' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>P05 Revisión & Validación</span>
              </div>
              {pendientesCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                  {pendientesCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => handleTabClick('buscador')}
            className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
              currentTab === 'buscador' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>P06 Buscador</span>
            </div>
          </button>

          <button
            onClick={() => handleTabClick('narrador')}
            className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
              currentTab === 'narrador' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Bot className="w-4 h-4 text-teal-400" />
              <span>P07 Narrador IA</span>
            </div>
          </button>

          {activeRole === 'Administrador' && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full px-3 py-2.5 text-sm font-semibold rounded flex items-center justify-between transition ${
                currentTab === 'admin' ? 'bg-sap-blue text-white' : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>P08 Admin & Auditoría</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Barra de Navegación de Escritorio/Tablet Fiori */}
      <nav className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
          {/* P02: Mis memorias */}
          <button
            onClick={() => handleTabClick('memorias')}
            className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition ${
              currentTab === 'memorias'
                ? 'bg-sap-blue text-white shadow'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>P02 Mis Memorias</span>
          </button>

          {/* P03: Consentimiento y privacidad */}
          {['Digitalizador', 'Gestor de datos', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => handleTabClick('consentimiento')}
              className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition ${
                currentTab === 'consentimiento'
                  ? 'bg-sap-blue text-white shadow'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>P03 Consentimiento</span>
            </button>
          )}

          {/* P04: Carga de relatos */}
          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => handleTabClick('carga')}
              className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition ${
                currentTab === 'carga'
                  ? 'bg-sap-blue text-white shadow'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>P04 Carga de Relatos</span>
            </button>
          )}

          {/* P05: Revisión y validación */}
          {['Gestor de datos', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => handleTabClick('validacion')}
              className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition relative ${
                currentTab === 'validacion'
                  ? 'bg-sap-blue text-white shadow'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>P05 Revisión & Validación</span>
              {pendientesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                  {pendientesCount}
                </span>
              )}
            </button>
          )}

          {/* P06: Buscador */}
          <button
            onClick={() => handleTabClick('buscador')}
            className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition ${
              currentTab === 'buscador'
                ? 'bg-sap-blue text-white shadow'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>P06 Buscador</span>
          </button>

          {/* P07: Narrador IA */}
          <button
            onClick={() => handleTabClick('narrador')}
            className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition ${
              currentTab === 'narrador'
                ? 'bg-sap-blue text-white shadow'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-400" />
            <span>P07 Narrador IA</span>
          </button>

          {/* P08: Administración */}
          {activeRole === 'Administrador' && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`px-3 py-2 text-sm font-semibold rounded flex items-center space-x-1.5 whitespace-nowrap transition ${
                currentTab === 'admin'
                  ? 'bg-sap-blue text-white shadow'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Admin & Auditoría</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
