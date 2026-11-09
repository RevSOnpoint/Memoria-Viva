import React from 'react';
import { SafeImage } from '../components/SafeImage';
import { REGIONS } from '../data/regions';
import {
  ArrowRight,
  BookOpen,
  Heart,
  Landmark,
  Lock,
  MapPin,
  PenLine,
  SearchCheck,
  ShieldCheck
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectRegion: (regionId: string) => void;
}

const principles = [
  {
    icon: ShieldCheck,
    title: 'Consentimiento',
    text: 'Cada relato se incorpora únicamente con autorización de la persona o su familia.'
  },
  {
    icon: Lock,
    title: 'Privacidad',
    text: 'La visibilidad de los expedientes respeta la voluntad de cada protagonista.'
  },
  {
    icon: Heart,
    title: 'Respeto',
    text: 'La memoria se trata con dignidad, cuidado y sentido de pertenencia comunitaria.'
  }
];

const steps = [
  {
    icon: PenLine,
    title: 'Se comparte la historia',
    text: 'La familia o la persona narra sus vivencias, aporta fotografías y firma su consentimiento.'
  },
  {
    icon: SearchCheck,
    title: 'Se revisa con cuidado',
    text: 'El equipo de curaduría verifica la información y resguarda cada documento.'
  },
  {
    icon: BookOpen,
    title: 'Se custodia y se transmite',
    text: 'El relato queda disponible para la consulta, la investigación y las nuevas generaciones.'
  }
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectRegion }) => {
  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto">
      {/* Presentación institucional */}
      <section className="overflow-hidden rounded-lg border border-[#d5ddd6] bg-[#1f352f]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b9d3c7]">
              Fundación Legado Vivo
            </div>
            <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
              La memoria de nuestros pueblos merece quedarse.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#dde6e0] leading-relaxed max-w-xl">
              Memoria Viva es una plataforma para registrar, proteger y compartir la historia oral
              de las personas mayores de Palmares y los cantones de Alajuela.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('regiones')}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded bg-white text-sm font-bold text-[#1f352f] hover:bg-[#eef1eb] transition w-full sm:w-auto"
              >
                Explorar regiones
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('guarda_memorias')}
                className="inline-flex items-center justify-center min-h-[48px] px-5 rounded border border-[#7fa99a] text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Compartir una historia
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#c7d3cd]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Consentimiento informado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Privacidad
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Trato respetuoso
              </span>
            </div>
          </div>

          <div className="relative min-h-[240px] sm:min-h-[320px] lg:min-h-[480px]">
            <SafeImage
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
              alt="Paisaje de montaña en Alajuela"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f352f]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#1f352f]/30 lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* Misión y principios */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#2f5d50]">
            Nuestra misión
          </div>
          <h2 className="mt-2 font-serif font-bold text-2xl text-[#1d2b28] leading-snug">
            Custodiar la historia oral y devolverla a la comunidad.
          </h2>
          <p className="mt-3 text-sm text-[#5a6b64] leading-relaxed max-w-3xl">
            Trabajamos junto a familias, personas mayores y organizaciones locales para que las
            vivencias, oficios y tradiciones de Alajuela no se pierdan. Cada expediente se construye
            con consentimiento, cuidado y acompañamiento.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {principles.map(principle => (
              <div key={principle.title}>
                <principle.icon className="w-5 h-5 text-[#2f5d50]" />
                <h3 className="mt-2 font-serif font-bold text-sm text-[#1d2b28]">
                  {principle.title}
                </h3>
                <p className="mt-1 text-xs text-[#5a6b64] leading-relaxed">
                  {principle.text}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('sobre_nosotros')}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition"
          >
            Conozca la Fundación
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <aside className="bg-[#eef1eb] border border-[#dde3dc] rounded p-6 sm:p-8 flex flex-col justify-center">
          <Landmark className="w-6 h-6 text-[#2f5d50]" />
          <blockquote className="mt-4 font-serif text-lg text-[#1d2b28] leading-relaxed">
            “Una comunidad que recuerda sabe quién es y puede decidir hacia dónde camina.”
          </blockquote>
          <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#6b7c75]">
            Fundación Legado Vivo
          </div>
        </aside>
      </section>

      {/* Regiones destacadas */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#1d2b28]">
              Regiones de la red
            </h2>
            <p className="mt-1 text-sm text-[#5a6b64]">
              Una mirada a los territorios donde la memoria sigue viva.
            </p>
          </div>
          <button
            onClick={() => onNavigate('regiones')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition self-start sm:self-auto"
          >
            Ver todas las regiones
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REGIONS.slice(0, 3).map(regionItem => (
            <button
              key={regionItem.id}
              onClick={() => onSelectRegion(regionItem.id)}
              className="group text-left bg-white rounded border border-[#dde3dc] hover:border-[#aebbb3] shadow-2xs hover:shadow-sm transition overflow-hidden"
            >
              <div className="h-40 bg-[#eef1eb] overflow-hidden">
                <SafeImage
                  src={regionItem.imagen}
                  alt={`Paisaje de ${regionItem.canton}`}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-lg text-[#1d2b28] leading-tight">
                    {regionItem.nombre}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-[#7a8b84] mt-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {regionItem.canton}
                  </div>
                  <p className="text-xs text-[#5a6b64] leading-relaxed mt-2 line-clamp-2">
                    {regionItem.descripcion}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2f5d50] flex-shrink-0 mt-1 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Proceso */}
      <section className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
        <h2 className="font-serif font-bold text-2xl text-[#1d2b28]">
          Un proceso claro y respetuoso
        </h2>
        <p className="mt-1 text-sm text-[#5a6b64]">
          Acompañamos a cada familia en todo momento, desde la primera conversación hasta la consulta final.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title}>
              <div className="flex items-center gap-2">
                <step.icon className="w-5 h-5 text-[#2f5d50]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a8b84]">
                  Paso {index + 1}
                </span>
              </div>
              <h3 className="mt-2 font-serif font-bold text-base text-[#1d2b28]">
                {step.title}
              </h3>
              <p className="mt-1 text-xs text-[#5a6b64] leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Llamado final */}
      <section className="rounded-lg bg-[#2f5d50] text-white px-6 py-8 sm:px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl">
            ¿Tiene una historia familiar que merece conservarse?
          </h2>
          <p className="mt-1 text-sm text-[#dde6e0]">
            Podemos acompañarle a registrarla con respeto y cuidado.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('guarda_memorias')}
            className="inline-flex items-center justify-center min-h-[48px] px-5 rounded bg-white text-sm font-bold text-[#1f352f] hover:bg-[#eef1eb] transition"
          >
            Escribir mi historia
          </button>
          <button
            onClick={() => onNavigate('buscador')}
            className="inline-flex items-center justify-center min-h-[48px] px-5 rounded border border-[#7fa99a] text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Consultar el archivo
          </button>
        </div>
      </section>
    </div>
  );
};
