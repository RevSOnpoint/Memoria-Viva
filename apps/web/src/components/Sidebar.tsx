import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../services/api';
import {
  MapPin,
  Users,
  Search,
  BookOpen,
  FileSignature,
  UploadCloud,
  CheckSquare,
  Shield,
  History,
  Building2,
  ChevronDown,
  UserCheck,
  ZoomIn,
  ZoomOut,
  X,
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile
}) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    fontSizeScale,
    increaseFontSize,
    decreaseFontSize
  } = useAuth();

  const [pendientesCount, setPendientesCount] = useState<number>(0);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (activeRole === 'Gestor de datos' || activeRole === 'Administrador') {
      api.getPendientesValidacion()
        .then(res => setPendientesCount(res.length))
        .catch(() => setPendientesCount(0));
    }
  }, [activeRole, currentView]);

  const allRoles: UserRole[] = ['Usuario', 'Digitalizador', 'Gestor de datos', 'Administrador'];

  const handleNav = (view: string) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Principal */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1a2d] text-slate-200 border-r border-[#1a2d47] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera Institucional */}
        <div className="p-5 border-b border-[#1a2d47] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#0056b3] text-white flex items-center justify-center font-bold text-lg shadow-inner border border-blue-400/30">
              <Building2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white leading-tight uppercase font-serif">
                Memoria Viva
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Fundación Legado Vivo
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono">
                Palmares • Costa Rica
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Rol y Auditoría Rápida */}
        <div className="px-4 py-3 bg-[#081220] border-b border-[#1a2d47] text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Perfil Institucional:</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Demo 10 min
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-[#10223b] hover:bg-[#152b4b] border border-[#233d63] text-white font-semibold transition"
            >
              <div className="flex items-center space-x-2 truncate">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{activeRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-800 rounded shadow-xl border border-slate-200 py-1 z-50"
                onClick={() => setRoleMenuOpen(false)}
              >
                {allRoles.map(r => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-100 ${
                      activeRole === r ? 'bg-blue-50 text-[#0056b3] font-bold border-l-4 border-[#0056b3]' : 'text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {activeRole === r && (
                      <span className="text-[10px] bg-[#0056b3] text-white px-1.5 py-0.5 rounded font-normal">
                        Activo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Menú de Navegación Estructurado */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs scrollbar-thin">
          {/* Grupo 1: Patrimonio & Territorio */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Patrimonio Cultural
            </div>
            <div className="space-y-1">
              {/* Regiones y Territorios */}
              <button
                onClick={() => handleNav('regiones')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                  currentView === 'regiones'
                    ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Regiones & Territorios</span>
              </button>

              {/* Archivo de Personas y Memorias */}
              <button
                onClick={() => handleNav('memorias')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                  currentView === 'memorias' || currentView === 'persona_detalle'
                    ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <span>Archivo de Personas</span>
              </button>

              {/* Buscador Histórico */}
              <button
                onClick={() => handleNav('buscador')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                  currentView === 'buscador'
                    ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                <span>Buscador Documental</span>
              </button>
            </div>
          </div>

          {/* Grupo 2: Participación & Aporte */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Participación y Transmisión
            </div>
            <div className="space-y-1">
              {/* Guarda tus Memorias / Escribe tu Historia */}
              <button
                onClick={() => handleNav('guarda_memorias')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                  currentView === 'guarda_memorias'
                    ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Escribe tu Historia</span>
              </button>

              {/* Registro de Persona con Contrato de Consentimiento (Digitalizador / Admin) */}
              {['Digitalizador', 'Administrador'].includes(activeRole) && (
                <button
                  onClick={() => handleNav('registro_contrato')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                    currentView === 'registro_contrato'
                      ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                  }`}
                >
                  <FileSignature className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Registrar Persona & Contrato</span>
                </button>
              )}

              {/* Carga de Aportes Testimoniales */}
              {['Digitalizador', 'Administrador'].includes(activeRole) && (
                <button
                  onClick={() => handleNav('carga')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                    currentView === 'carga'
                      ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                  <span>Carga de Aportes</span>
                </button>
              )}
            </div>
          </div>

          {/* Grupo 3: Curaduría y Gobernanza (Gestor y Admin) */}
          {['Gestor de datos', 'Administrador'].includes(activeRole) && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Curaduría y Verificación
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('validacion')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition ${
                    currentView === 'validacion'
                      ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Mesa de Curaduría</span>
                  </div>
                  {pendientesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                      {pendientesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Grupo 4: Administración Institucional */}
          {activeRole === 'Administrador' && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Administración Institucional
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md font-medium transition ${
                    currentView === 'admin'
                      ? 'bg-[#0056b3] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-[#142640] hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Usuarios & Bitácora</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Footer del Sidebar con Accesibilidad de Lectura */}
        <div className="p-4 bg-[#081220] border-t border-[#1a2d47] text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Lectura accesible:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={decreaseFontSize}
                className="p-1 rounded bg-[#10223b] hover:bg-[#1a3356] text-slate-300 transition"
                title="Disminuir tamaño"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 text-amber-300 font-bold">
                {Math.round(fontSizeScale * 100)}%
              </span>
              <button
                onClick={increaseFontSize}
                className="p-1 rounded bg-[#10223b] hover:bg-[#1a3356] text-slate-300 transition"
                title="Aumentar tamaño"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>© Fundación Legado Vivo</span>
            <span className="font-mono">v1.1</span>
          </div>
        </div>
      </aside>
    </>
  );
};

