import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../services/api';
import {
  Building2,
  Landmark,
  Compass,
  Users,
  Search,
  BookOpen,
  FileSignature,
  UploadCloud,
  CheckSquare,
  Shield,
  X,
  ZoomIn,
  ZoomOut,
  LogOut,
  FileText,
  Lock,
  Accessibility,
  Mail,
  MessageCircleQuestion
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const allRoles: UserRole[] = ['Usuario', 'Digitalizador', 'Gestor de datos', 'Administrador'];

const foundationLinks = [
  { view: 'sobre_nosotros', label: 'Sobre nosotros', icon: Landmark },
  { view: 'preguntas', label: 'Preguntas frecuentes', icon: MessageCircleQuestion },
  { view: 'contacto', label: 'Contacto', icon: Mail },
  { view: 'terminos', label: 'Acuerdo de uso', icon: FileText },
  { view: 'privacidad', label: 'Privacidad', icon: Lock },
  { view: 'accesibilidad', label: 'Accesibilidad', icon: Accessibility }
];

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
    logout,
    fontSizeScale,
    increaseFontSize,
    decreaseFontSize
  } = useAuth();

  const [pendientesCount, setPendientesCount] = useState<number>(0);

  const displayName =
    (currentUser?.full_name || 'Usuario').replace(/\s*\([^)]*\)\s*/g, '').trim() || 'Usuario';

  useEffect(() => {
    if (activeRole === 'Gestor de datos' || activeRole === 'Administrador') {
      api.getPendientesValidacion()
        .then(res => setPendientesCount(res.length))
        .catch(() => setPendientesCount(0));
    }
  }, [activeRole, currentView]);

  const handleNav = (view: string) => {
    onNavigate(view);
    onCloseMobile();
  };

  const isActive = (view: string) => {
    if (view === 'regiones') return currentView === 'regiones' || currentView === 'region_detalle';
    if (view === 'memorias') return currentView === 'memorias' || currentView === 'persona_detalle';
    return currentView === view;
  };

  const linkClass = (view: string) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition ${
      isActive(view)
        ? 'bg-[#2f5d50] text-white'
        : 'text-[#dde6e0] hover:bg-[#2b4a42] hover:text-white'
    }`;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-[60] w-80 max-w-[85vw] bg-[#1f352f] text-[#f2f5f0] border-r border-[#35564d] flex flex-col transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú de navegación móvil"
      >
        <div className="p-5 border-b border-[#35564d] flex items-center justify-between gap-3">
          <button onClick={() => handleNav('inicio')} className="flex items-center gap-3 text-left min-w-0">
            <div className="w-10 h-10 rounded bg-[#2f5d50] text-white flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-serif font-bold text-base text-white truncate">Memoria Viva</div>
              <div className="text-[10px] uppercase tracking-wider text-[#aebfb7] truncate">
                Fundación Legado Vivo
              </div>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className="p-2 rounded hover:bg-[#2b4a42] text-[#c7d3cd] hover:text-white transition"
            aria-label="Cerrar menú de navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-[#182924] border-b border-[#35564d]">
          <label className="block text-[10px] font-semibold text-[#aebfb7] uppercase tracking-wider mb-1.5">
            Perfil activo
          </label>
          <select
            value={activeRole}
            onChange={event => switchRole(event.target.value as UserRole)}
            className="w-full min-h-[42px] px-3 rounded bg-[#25423b] border border-[#35564d] text-sm font-medium text-white"
          >
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#aebfb7] mb-1.5">
              Navegación
            </div>
            <div className="space-y-1">
              <button onClick={() => handleNav('inicio')} className={linkClass('inicio')}>
                <Landmark className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                <span>Inicio</span>
              </button>
              <button onClick={() => handleNav('regiones')} className={linkClass('regiones')}>
                <Compass className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                <span>Regiones y Comunidades</span>
              </button>
              <button onClick={() => handleNav('memorias')} className={linkClass('memorias')}>
                <Users className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                <span>Archivo de Personas</span>
              </button>
              <button onClick={() => handleNav('guarda_memorias')} className={linkClass('guarda_memorias')}>
                <BookOpen className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                <span>Escribe tu Historia</span>
              </button>
              <button onClick={() => handleNav('buscador')} className={linkClass('buscador')}>
                <Search className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                <span>Buscador Histórico</span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#aebfb7] mb-1.5">
              Fundación
            </div>
            <div className="space-y-1">
              {foundationLinks.map(link => (
                <button key={link.view} onClick={() => handleNav(link.view)} className={linkClass(link.view)}>
                  <link.icon className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#aebfb7] mb-1.5">
                Digitalización
              </div>
              <div className="space-y-1">
                <button onClick={() => handleNav('registro_contrato')} className={linkClass('registro_contrato')}>
                  <FileSignature className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                  <span>Registrar Persona</span>
                </button>
                <button onClick={() => handleNav('carga')} className={linkClass('carga')}>
                  <UploadCloud className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                  <span>Carga de Relatos</span>
                </button>
              </div>
            </div>
          )}

          {['Gestor de datos', 'Administrador'].includes(activeRole) && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#aebfb7] mb-1.5">
                Curaduría
              </div>
              <div className="space-y-1">
                <button onClick={() => handleNav('validacion')} className={linkClass('validacion')}>
                  <CheckSquare className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                  <span className="flex-1 text-left">Mesa de Curaduría</span>
                  {pendientesCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#b9d3c7] text-[#1d2b28] font-bold text-[11px]">
                      {pendientesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeRole === 'Administrador' && (
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#aebfb7] mb-1.5">
                Administración
              </div>
              <div className="space-y-1">
                <button onClick={() => handleNav('admin')} className={linkClass('admin')}>
                  <Shield className="w-4 h-4 text-[#b9d3c7] flex-shrink-0" />
                  <span>Usuarios y Auditoría</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 bg-[#182924] border-t border-[#35564d] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#c7d3cd]">
            <span className="font-medium">Tamaño del texto</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={decreaseFontSize}
                className="p-2 rounded bg-[#25423b] hover:bg-[#2b4a42] text-white transition"
                aria-label="Disminuir tamaño del texto"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-bold px-1 text-[#b9d3c7]">
                {Math.round(fontSizeScale * 100)}%
              </span>
              <button
                onClick={increaseFontSize}
                className="p-2 rounded bg-[#25423b] hover:bg-[#2b4a42] text-white transition"
                aria-label="Aumentar tamaño del texto"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#35564d] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-[#aebfb7] truncate">{currentUser?.email}</div>
            </div>
            <button
              onClick={() => {
                logout();
                onCloseMobile();
              }}
              className="p-2 rounded text-[#c7d3cd] hover:bg-[#2b4a42] hover:text-white transition"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
