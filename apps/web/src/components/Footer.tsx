import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1f352f] text-[#f2f5f0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-serif font-bold text-lg text-[#f2f5f0]">
              Fundación Legado Vivo
            </div>
            <p className="mt-2 text-xs text-[#c7d3cd] leading-relaxed max-w-sm">
              Custodia y preservación del patrimonio oral de Palmares y los cantones de Alajuela,
              Costa Rica.
            </p>

            <div className="mt-4 space-y-2 text-xs text-[#c7d3cd]">
              <a
                href="mailto:contacto@legadovivo.cr"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Mail className="w-4 h-4 text-[#a8c5b8] flex-shrink-0" />
                contacto@legadovivo.cr
              </a>
              <a
                href="tel:+50624507890"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone className="w-4 h-4 text-[#a8c5b8] flex-shrink-0" />
                +506 2450 7890
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#a8c5b8] flex-shrink-0" />
                Palmares, Alajuela, Costa Rica
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#b9d3c7]">
              Fundación
            </h2>
            <nav aria-label="Enlaces de la Fundación" className="mt-3 space-y-2">
              <button
                onClick={() => onNavigate('sobre_nosotros')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Sobre nosotros
              </button>
              <button
                onClick={() => onNavigate('preguntas')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Preguntas frecuentes
              </button>
              <button
                onClick={() => onNavigate('contacto')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Contacto
              </button>
              <button
                onClick={() => onNavigate('guarda_memorias')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Escribe tu Historia
              </button>
            </nav>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#b9d3c7]">
              Información legal
            </h2>
            <nav aria-label="Información legal" className="mt-3 space-y-2">
              <button
                onClick={() => onNavigate('terminos')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Acuerdo de uso
              </button>
              <button
                onClick={() => onNavigate('privacidad')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Política de privacidad
              </button>
              <button
                onClick={() => onNavigate('cookies')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Política de cookies
              </button>
              <button
                onClick={() => onNavigate('aviso_legal')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Aviso legal
              </button>
              <button
                onClick={() => onNavigate('etica')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Código de ética
              </button>
            </nav>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#b9d3c7]">
              Archivo y acceso
            </h2>
            <nav aria-label="Archivo y accesibilidad" className="mt-3 space-y-2">
              <button
                onClick={() => onNavigate('regiones')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Regiones
              </button>
              <button
                onClick={() => onNavigate('memorias')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Archivo de Personas
              </button>
              <button
                onClick={() => onNavigate('buscador')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Buscador histórico
              </button>
              <button
                onClick={() => onNavigate('accesibilidad')}
                className="block text-xs text-[#dde6e0] hover:text-white transition text-left"
              >
                Accesibilidad
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-[#35564d] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-[#aebfb7]">
          <span>
            © {new Date().getFullYear()} Fundación Legado Vivo · Palmares, Alajuela, Costa Rica
          </span>
          <span className="text-center md:text-right">
            Manejo responsable de los datos personales y del patrimonio oral.
          </span>
        </div>
      </div>
    </footer>
  );
};
