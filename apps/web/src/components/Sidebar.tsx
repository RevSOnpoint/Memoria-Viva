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
          className="fixed inset-0 bg-warm-woodDark/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Principal en Tono Madera Cálida */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#26170d] text-[#f4ede2] border-r border-[#442a17] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera Institucional Cálida */}
        <div className="p-5 border-b border-[#3d2514] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded bg-[#c05600] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#e07722]/40">
              <Building2 className="w-6 h-6 text-[#fef6ee]" />
            </div>
            <div>
              <div className="font-bold text-base tracking-wide text-white leading-tight font-serif">
                Memoria Viva
              </div>
              <div className="text-xs text-[#d6c7b5]">
                Fundación Legado Vivo
              </div>
              <div className="text-[11px] text-[#e89b52] font-medium">
                Palmares, Costa Rica
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded hover:bg-[#3d2514] text-[#d6c7b5] hover:text-white"
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Perfil Sobrio */}
        <div className="px-4 py-3 bg-[#1c1109] border-b border-[#3d2514] text-xs">
          <div className="text-[11px] font-semibold text-[#baa995] uppercase tracking-wider mb-1.5">
            Rol del Usuario:
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-[#331f11] hover:bg-[#3e2716] border border-[#52331c] text-white font-medium transition"
            >
              <div className="flex items-center space-x-2 truncate">
                <UserCheck className="w-4 h-4 text-[#e89b52] flex-shrink-0" />
                <span className="truncate font-semibold">{activeRole}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#baa995]" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-1 bg-white text-[#261b12] rounded shadow-lg border border-[#e3d9cb] py-1 z-50"
                onClick={() => setRoleMenuOpen(false)}
              >
                {allRoles.map(r => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-[#f4ede2] ${
                      activeRole === r ? 'bg-[#fef6ee] text-[#c05600] font-bold border-l-4 border-[#c05600]' : 'text-[#442a17]'
                    }`}
                  >
                    <span>{r}</span>
                    {activeRole === r && (
                      <span className="text-[10px] bg-[#c05600] text-white px-2 py-0.5 rounded font-normal">
                        Activo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Menú de Navegación Limpio y Formal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-sm">
          {/* Módulo 1: Patrimonio Cultural */}
          <div>
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-[#d2baa0] mb-2 font-serif">
              Patrimonio & Historia
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('regiones')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                  currentView === 'regiones'
                    ? 'bg-[#c05600] text-white font-bold shadow-xs'
                    : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                }`}
              >
                <Compass className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                <span>Regiones & Comunidades</span>
              </button>

              <button
                onClick={() => handleNav('memorias')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                  currentView === 'memorias' || currentView === 'persona_detalle'
                    ? 'bg-[#c05600] text-white font-bold shadow-xs'
                    : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                <span>Archivo de Personas</span>
              </button>

              <button
                onClick={() => handleNav('buscador')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                  currentView === 'buscador'
                    ? 'bg-[#c05600] text-white font-bold shadow-xs'
                    : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                }`}
              >
                <Search className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                <span>Buscador Histórico</span>
              </button>
            </div>
          </div>

          {/* Módulo 2: Participación & Aporte */}
          <div>
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-[#d2baa0] mb-2 font-serif">
              Participación Familiar
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('guarda_memorias')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                  currentView === 'guarda_memorias'
                    ? 'bg-[#c05600] text-white font-bold shadow-xs'
                    : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5 text-[#e5a867] flex-shrink-0" />
                <span>Escribe tu Historia</span>
              </button>

              {['Digitalizador', 'Administrador'].includes(activeRole) && (
                <button
                  onClick={() => handleNav('registro_contrato')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                    currentView === 'registro_contrato'
                      ? 'bg-[#c05600] text-white font-bold shadow-xs'
                      : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                  }`}
                >
                  <FileSignature className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                  <span>Registrar Persona & Contrato</span>
                </button>
              )}

              {['Digitalizador', 'Administrador'].includes(activeRole) && (
                <button
                  onClick={() => handleNav('carga')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                    currentView === 'carga'
                      ? 'bg-[#c05600] text-white font-bold shadow-xs'
                      : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                  <span>Carga de Relatos</span>
                </button>
              )}
            </div>
          </div>

          {/* Módulo 3: Curaduría (Gestor y Admin) */}
          {['Gestor de datos', 'Administrador'].includes(activeRole) && (
            <div>
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-[#d2baa0] mb-2 font-serif">
                Revisión Histórica
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('validacion')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded font-medium transition ${
                    currentView === 'validacion'
                      ? 'bg-[#c05600] text-white font-bold shadow-xs'
                      : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                    <span>Mesa de Curaduría</span>
                  </div>
                  {pendientesCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#f4ba7e] text-[#26170d] font-bold text-xs">
                      {pendientesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Módulo 4: Administración */}
          {activeRole === 'Administrador' && (
            <div>
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-[#d2baa0] mb-2 font-serif">
                Administración
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded font-medium transition ${
                    currentView === 'admin'
                      ? 'bg-[#c05600] text-white font-bold shadow-xs'
                      : 'text-[#e9ddcf] hover:bg-[#382313] hover:text-white'
                  }`}
                >
                  <Shield className="w-5 h-5 text-[#f4ba7e] flex-shrink-0" />
                  <span>Usuarios & Auditoría</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Pie del Sidebar: Accesibilidad de Lectura */}
        <div className="p-4 bg-[#1c1109] border-t border-[#3d2514] text-xs space-y-2">
          <div className="flex items-center justify-between text-[#d6c7b5]">
            <span className="font-medium">Tamaño de letra:</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 rounded bg-[#331f11] hover:bg-[#442a17] text-white transition"
                title="Disminuir tamaño de letra"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-bold px-1.5 text-[#e89b52]">
                {Math.round(fontSizeScale * 100)}%
              </span>
              <button
                onClick={increaseFontSize}
                className="p-1.5 rounded bg-[#331f11] hover:bg-[#442a17] text-white transition"
                title="Aumentar tamaño de letra"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#331f11] text-[11px] text-[#9c8976] text-center">
            Fundación Legado Vivo • Palmares
          </div>
        </div>
      </aside>
    </>
  );
};
