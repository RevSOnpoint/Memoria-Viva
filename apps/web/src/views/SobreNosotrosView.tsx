import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Heart,
  Landmark,
  Lock,
  MapPin,
  Scale,
  ShieldCheck,
  Users
} from 'lucide-react';
import {
  FOUNDATION_TIMELINE,
  FOUNDATION_VALUES,
  GOVERNANCE_BODIES,
  LEGAL_NAV_LINKS
} from '../data/institutional';

interface SobreNosotrosViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const SobreNosotrosView: React.FC<SobreNosotrosViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto">
      <section className="rounded-lg overflow-hidden border border-[#d5ddd6] bg-[#1f352f] text-white">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr]">
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b9d3c7]">
              Fundación Legado Vivo
            </div>
            <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl leading-tight">
              Una fundación para que la memoria de nuestros pueblos siga viva.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#dde6e0] leading-relaxed max-w-2xl">
              Somos una organización sin fines de lucro dedicada a registrar, custodiar y compartir
              la historia oral de Palmares y los cantones de Alajuela. Trabajamos junto a familias,
              personas mayores, centros educativos y organizaciones comunitarias.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('memorias')}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded bg-white text-sm font-bold text-[#1f352f] hover:bg-[#eef1eb] transition"
              >
                Conocer el archivo
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('contacto')}
                className="inline-flex items-center justify-center min-h-[48px] px-5 rounded border border-[#7fa99a] text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Escribir a la Fundación
              </button>
            </div>
          </div>

          <div className="bg-[#182924] p-6 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[#35564d]">
            <Landmark className="w-7 h-7 text-[#a8c5b8]" />
            <blockquote className="mt-4 font-serif text-xl text-[#f2f5f0] leading-relaxed">
              “Una comunidad que recuerda sabe quién es y puede decidir hacia dónde camina.”
            </blockquote>
            <p className="mt-4 text-xs text-[#c7d3cd] leading-relaxed">
              Este principio guía nuestro trabajo cotidiano con cada familia y cada territorio.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <div className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#2f5d50]">
            Quiénes somos
          </div>
          <h2 className="mt-2 font-serif font-bold text-2xl text-[#1d2b28]">
            Una institución cercana, comunitaria y responsable.
          </h2>
          <div className="mt-4 space-y-3 text-sm text-[#5a6b64] leading-relaxed">
            <p>
              La Fundación Legado Vivo nació de una convicción sencilla: las historias de las
              personas mayores son patrimonio colectivo y merecen un lugar seguro para permanecer.
            </p>
            <p>
              No somos un museo cerrado ni un archivo frío. Somos un equipo que conversa, escucha
              y acompaña. Cada expediente se construye con consentimiento, revisión cuidadosa y
              respeto por la dignidad de quien comparte su memoria.
            </p>
            <p>
              Nuestra labor combina el trabajo humano de curaduría con herramientas tecnológicas
              que ayudan a conservar y consultar los relatos, siempre bajo límites éticos claros.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-[#dde3dc] rounded p-6">
            <Heart className="w-5 h-5 text-[#2f5d50]" />
            <h3 className="mt-2 font-serif font-bold text-lg text-[#1d2b28]">Nuestra misión</h3>
            <p className="mt-2 text-sm text-[#5a6b64] leading-relaxed">
              Custodiar la historia oral de las comunidades de Alajuela, garantizando el
              consentimiento, la veracidad y el acceso respetuoso al patrimonio narrado.
            </p>
          </div>

          <div className="bg-[#eef1eb] border border-[#dde3dc] rounded p-6">
            <BookOpen className="w-5 h-5 text-[#2f5d50]" />
            <h3 className="mt-2 font-serif font-bold text-lg text-[#1d2b28]">Nuestra visión</h3>
            <p className="mt-2 text-sm text-[#5a6b64] leading-relaxed">
              Ser una red regional de memoria viva, reconocida por su rigor, su calidez y su
              capacidad de devolver a las comunidades el valor de su propia historia.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#2f5d50]">
          Lo que nos guía
        </div>
        <h2 className="mt-2 font-serif font-bold text-2xl text-[#1d2b28]">Nuestros valores</h2>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOUNDATION_VALUES.map(value => (
            <div key={value.title}>
              <h3 className="font-serif font-bold text-base text-[#1d2b28]">{value.title}</h3>
              <p className="mt-1.5 text-xs text-[#5a6b64] leading-relaxed">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#2f5d50]">
          Nuestra historia
        </div>
        <h2 className="mt-2 font-serif font-bold text-2xl text-[#1d2b28]">
          Un camino construido con la comunidad
        </h2>

        <div className="mt-6 space-y-0">
          {FOUNDATION_TIMELINE.map((item, index) => (
            <div key={item.year} className="grid grid-cols-[64px_1fr] sm:grid-cols-[90px_1fr] gap-4">
              <div className="text-sm font-bold text-[#2f5d50] pt-0.5">{item.year}</div>
              <div
                className={`pb-6 ${
                  index < FOUNDATION_TIMELINE.length - 1
                    ? 'border-l border-[#dde3dc] pl-4 sm:pl-5'
                    : 'pl-4 sm:pl-5'
                }`}
              >
                <h3 className="font-serif font-bold text-base text-[#1d2b28]">{item.title}</h3>
                <p className="mt-1 text-xs text-[#5a6b64] leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#2f5d50]">
          Gobernanza
        </div>
        <h2 className="mt-2 font-serif font-bold text-2xl text-[#1d2b28]">
          Cómo tomamos decisiones
        </h2>
        <p className="mt-2 text-sm text-[#5a6b64] leading-relaxed max-w-3xl">
          La Fundación combina la dirección estratégica de sus órganos de gobierno con el
          conocimiento cotidiano del equipo de curaduría y de las comunidades.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GOVERNANCE_BODIES.map(body => (
            <div key={body.title} className="p-4 rounded border border-[#e9ede6] bg-[#fbfbf8]">
              <Users className="w-4 h-4 text-[#2f5d50]" />
              <h3 className="mt-2 font-serif font-bold text-sm text-[#1d2b28]">{body.title}</h3>
              <p className="mt-1 text-xs text-[#5a6b64] leading-relaxed">{body.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#eef1eb] border border-[#dde3dc] rounded p-6 sm:p-8">
          <ShieldCheck className="w-6 h-6 text-[#2f5d50]" />
          <h2 className="mt-3 font-serif font-bold text-xl text-[#1d2b28]">
            Transparencia y rendición de cuentas
          </h2>
          <p className="mt-2 text-sm text-[#5a6b64] leading-relaxed">
            Nuestros compromisos éticos, legales y de privacidad están publicados para que
            cualquier persona pueda consultarlos y hacernos observaciones.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LEGAL_NAV_LINKS.slice(0, 4).map(link => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded bg-white border border-[#aebbb3] text-xs font-semibold text-[#344a43] hover:bg-[#f7f7f3] transition"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#2f5d50]" />
            <Scale className="w-5 h-5 text-[#2f5d50]" />
          </div>
          <h2 className="mt-3 font-serif font-bold text-xl text-[#1d2b28]">
            Nuestro compromiso con la comunidad
          </h2>
          <p className="mt-2 text-sm text-[#5a6b64] leading-relaxed">
            Escuchamos las solicitudes de corrección, retiro o cambio de visibilidad de los
            relatos. La palabra de las personas protagonistas prevalece sobre cualquier interés
            institucional o tecnológico.
          </p>
          <button
            onClick={() => onNavigate('contacto')}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition"
          >
            <MapPin className="w-4 h-4" />
            Contactar a la Fundación
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
