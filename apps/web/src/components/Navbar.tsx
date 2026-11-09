import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Building2,
  ChevronDown,
  Compass,
  Users,
  BookOpen,
  Search,
  FileSignature,
  UploadCloud,
  CheckSquare,
  Shield,
  Landmark,
  Menu,
  LogOut,
  UserCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Lock,
  Accessibility,
  Mail,
  MessageCircleQuestion
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenMobile: () => void;
}

interface NavLink {
  view: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const primaryLinks: NavLink[] = [
  { view: 'inicio', label: 'Inicio', icon: Landmark },
  { view: 'regiones', label: 'Regiones', icon: Compass },
  { view: 'memorias', label: 'Archivo de Personas', icon: Users },
  { view: 'guarda_memorias', label: 'Escribe tu Historia', icon: BookOpen },
  { view: 'buscador', label: 'Buscador', icon: Search }
];

const foundationLinks: NavLink[] = [
  { view: 'sobre_nosotros', label: 'Sobre nosotros', icon: Landmark },
  { view: 'preguntas', label: 'Preguntas frecuentes', icon: MessageCircleQuestion },
  { view: 'contacto', label: 'Contacto', icon: Mail },
  { view: 'terminos', label: 'Acuerdo de uso', icon: FileText },
  { view: 'privacidad', label: 'Privacidad', icon: Lock },
  { view: 'accesibilidad', label: 'Accesibilidad', icon: Accessibility }
];

const allRoles: UserRole[] = ['Usuario', 'Digitalizador', 'Gestor de datos', 'Administrador'];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenMobile }) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    logout,
    fontSizeScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
  } = useAuth();
  const [openMenu, setOpenMenu] = useState<'fundacion' | 'gestion' | 'perfil' | null>(null);

  const displayName =
    (currentUser?.full_name || 'Usuario').replace(/\s*\([^)]*\)\s*/g, '').trim() || 'Usuario';

  useEffect(() => {
    setOpenMenu(null);
  }, [currentView]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const isActive = (view: string) => {
    if (view === 'regiones') return currentView === 'regiones' || currentView === 'region_detalle';
    if (view === 'memorias') return currentView === 'memorias' || currentView === 'persona_detalle';
    return currentView === view;
  };

  const managementLinks: NavLink[] = [
    ...(['Digitalizador', 'Administrador'].includes(activeRole)
      ? [
          { view: 'registro_contrato', label: 'Registrar persona', icon: FileSignature },
          { view: 'carga', label: 'Carga de relatos', icon: UploadCloud }
        ]
      : []),
    ...(['Gestor de datos', 'Administrador'].includes(activeRole)
      ? [{ view: 'validacion', label: 'Mesa de curaduría', icon: CheckSquare }]
      : []),
    ...(activeRole === 'Administrador'
      ? [{ view: 'admin', label: 'Administración', icon: Shield }]
      : [])
  ];

  const managementActive = managementLinks.some(link => link.view === currentView);
  const foundationActive =
    foundationLinks.some(link => link.view === currentView) ||
    ['cookies', 'aviso_legal', 'etica'].includes(currentView);

  return (
    <>
      {openMenu && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-[#dde3dc]">
        {/* Franja institucional y accesibilidad */}
        <div className="hidden lg:block bg-[#1f352f] text-[#dde6e0]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between text-[11px]">
            <span className="tracking-wide">
              Fundación Legado Vivo · Palmares, Alajuela, Costa Rica
            </span>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[#aebfb7]">Tamaño del texto</span>
                <button
                  onClick={decreaseFontSize}
                  className="p-1 rounded hover:bg-white/10 transition"
                  aria-label="Disminuir tamaño del texto"
                  title="Disminuir tamaño del texto"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center font-semibold text-[#f2f5f0]">
                  {Math.round(fontSizeScale * 100)}%
                </span>
                <button
                  onClick={increaseFontSize}
                  className="p-1 rounded hover:bg-white/10 transition"
                  aria-label="Aumentar tamaño del texto"
                  title="Aumentar tamaño del texto"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetFontSize}
                  className="p-1 rounded hover:bg-white/10 transition"
                  aria-label="Restablecer tamaño del texto"
                  title="Restablecer tamaño del texto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 hover:text-white transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 lg:h-[72px] flex items-center justify-between gap-3">
            <button
              onClick={() => onNavigate('inicio')}
              className="flex items-center gap-2.5 min-w-0 text-left"
              aria-label="Ir al inicio"
            >
              <div className="w-10 h-10 rounded bg-[#2f5d50] text-white flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-serif font-bold text-base sm:text-lg text-[#1d2b28] truncate">
                  Memoria Viva
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#6b7c75] truncate">
                  Fundación Legado Vivo
                </div>
              </div>
            </button>

            <nav className="hidden lg:flex items-center h-full" aria-label="Navegación principal">
              {primaryLinks.map(link => (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  className={`h-full inline-flex items-center px-2.5 xl:px-3 text-[13px] xl:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    isActive(link.view)
                      ? 'border-[#2f5d50] text-[#2f5d50]'
                      : 'border-transparent text-[#4f625b] hover:text-[#2f5d50]'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="relative h-full flex items-center">
                <button
                  onClick={() => setOpenMenu(openMenu === 'fundacion' ? null : 'fundacion')}
                  className={`h-full inline-flex items-center gap-1 px-2.5 xl:px-3 text-[13px] xl:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    foundationActive
                      ? 'border-[#2f5d50] text-[#2f5d50]'
                      : 'border-transparent text-[#4f625b] hover:text-[#2f5d50]'
                  }`}
                  aria-expanded={openMenu === 'fundacion'}
                >
                  Fundación
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {openMenu === 'fundacion' && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#dde3dc] rounded shadow-lg py-1.5 z-50">
                    {foundationLinks.map(link => (
                      <button
                        key={link.view}
                        onClick={() => {
                          onNavigate(link.view);
                          setOpenMenu(null);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition ${
                          currentView === link.view
                            ? 'bg-[#eef1eb] text-[#2f5d50] font-semibold'
                            : 'text-[#344a43] hover:bg-[#f7f7f3]'
                        }`}
                      >
                        <link.icon className="w-4 h-4 text-[#6b7c75]" />
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {managementLinks.length > 0 && (
                <div className="relative h-full flex items-center">
                  <button
                    onClick={() => setOpenMenu(openMenu === 'gestion' ? null : 'gestion')}
                    className={`h-full inline-flex items-center gap-1 px-2.5 xl:px-3 text-[13px] xl:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      managementActive
                        ? 'border-[#2f5d50] text-[#2f5d50]'
                        : 'border-transparent text-[#4f625b] hover:text-[#2f5d50]'
                    }`}
                    aria-expanded={openMenu === 'gestion'}
                  >
                    Gestión
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {openMenu === 'gestion' && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#dde3dc] rounded shadow-lg py-1.5 z-50">
                      {managementLinks.map(link => (
                        <button
                          key={link.view}
                          onClick={() => onNavigate(link.view)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition ${
                            currentView === link.view
                              ? 'bg-[#eef1eb] text-[#2f5d50] font-semibold'
                              : 'text-[#344a43] hover:bg-[#f7f7f3]'
                          }`}
                        >
                          <link.icon className="w-4 h-4 text-[#6b7c75]" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setOpenMenu(openMenu === 'perfil' ? null : 'perfil')}
                  className="flex items-center gap-2 rounded py-1.5 pl-1.5 pr-2 hover:bg-[#eef1eb] transition"
                  aria-expanded={openMenu === 'perfil'}
                  aria-label="Abrir menú de perfil"
                >
                  <div className="w-8 h-8 rounded bg-[#344a43] text-[#f2f5f0] flex items-center justify-center font-bold text-xs uppercase">
                    {(displayName[0] || 'M').toUpperCase()}
                  </div>
                  <div className="hidden xl:block text-left leading-tight max-w-[170px]">
                    <div
                      className="text-xs font-semibold text-[#1d2b28] truncate"
                      title={displayName}
                    >
                      {displayName}
                    </div>
                    <div className="text-[10px] text-[#6b7c75] truncate">{activeRole}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6b7c75]" />
                </button>

                {openMenu === 'perfil' && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#dde3dc] rounded shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#eef1eb]">
                      <div className="font-semibold text-sm text-[#1d2b28] truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-[#6b7c75] truncate">{currentUser?.email}</div>
                      <div className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-[#2f5d50]">
                        <UserCheck className="w-3.5 h-3.5" />
                        {activeRole}
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8a9a93]">
                        Cambiar perfil
                      </div>
                      {allRoles.map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            switchRole(role);
                            setOpenMenu(null);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded text-xs font-medium transition ${
                            activeRole === role
                              ? 'bg-[#eef1eb] text-[#2f5d50] font-semibold'
                              : 'text-[#344a43] hover:bg-[#f7f7f3]'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 border-t border-[#eef1eb] text-xs font-semibold text-[#a34a3d] hover:bg-[#f9efed] transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onOpenMobile}
                className="lg:hidden p-2.5 rounded border border-[#d5ddd6] text-[#344a43] hover:bg-[#eef1eb] transition"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
