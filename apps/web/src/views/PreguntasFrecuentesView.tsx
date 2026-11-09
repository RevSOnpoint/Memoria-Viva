import React from 'react';
import { ArrowRight, ChevronDown, Mail, MessageCircleQuestion } from 'lucide-react';
import { FAQ_CATEGORIES } from '../data/institutional';

interface PreguntasFrecuentesViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const PreguntasFrecuentesView: React.FC<PreguntasFrecuentesViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto">
      <section className="rounded-lg border border-[#d5ddd6] bg-[#1f352f] text-white p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b9d3c7]">
          <MessageCircleQuestion className="w-4 h-4" />
          Centro de ayuda
        </div>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl">Preguntas frecuentes</h1>
        <p className="mt-4 text-sm sm:text-base text-[#dde6e0] leading-relaxed max-w-2xl">
          Respuestas claras sobre el archivo, el consentimiento, el narrador de inteligencia
          artificial y las formas de participar en Memoria Viva.
        </p>
      </section>

      <div className="space-y-6">
        {FAQ_CATEGORIES.map(category => (
          <section
            key={category.title}
            className="bg-white border border-[#dde3dc] rounded p-5 sm:p-7"
          >
            <h2 className="font-serif font-bold text-xl text-[#1d2b28]">{category.title}</h2>

            <div className="mt-4 divide-y divide-[#e9ede6] border-t border-[#e9ede6]">
              {category.items.map(item => (
                <details key={item.question} className="group py-3">
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                    <span className="text-sm font-semibold text-[#1d2b28] leading-relaxed">
                      {item.question}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#2f5d50] flex-shrink-0 mt-1 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-sm text-[#5a6b64] leading-relaxed pr-6">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-lg bg-[#eef1eb] border border-[#dde3dc] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1d2b28]">¿No encontró su respuesta?</h2>
          <p className="mt-1 text-sm text-[#5a6b64] leading-relaxed">
            Escríbanos y una persona del equipo le responderá.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('contacto')}
            className="btn-primary text-sm gap-2"
          >
            <Mail className="w-4 h-4" />
            Contactar
          </button>
          <button
            onClick={() => onNavigate('sobre_nosotros')}
            className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-4 rounded border border-[#aebbb3] bg-white text-sm font-semibold text-[#344a43] hover:bg-[#f7f7f3] transition"
          >
            Sobre la Fundación
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
