import React from 'react';
import {
  ArrowRight,
  Calendar,
  FileText,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { LEGAL_DOCUMENTS, LEGAL_NAV_LINKS } from '../data/institutional';

interface LegalViewProps {
  documentId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ documentId, onNavigate }) => {
  const document = LEGAL_DOCUMENTS[documentId] || LEGAL_DOCUMENTS.terminos;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <section className="rounded-lg border border-[#d5ddd6] bg-[#1f352f] text-white p-6 sm:p-9">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b9d3c7]">
          InformaciÃ³n legal
        </div>
        <h1 className="mt-3 font-serif font-bold text-2xl sm:text-3xl leading-tight">
          {document.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#c7d3cd]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#a8c5b8]" />
            Ãšltima actualizaciÃ³n: {document.updated}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#a8c5b8]" />
            Documento institucional
          </span>
        </div>
      </section>

      <div className="lg:hidden">
        <nav
          aria-label="Documentos legales"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {LEGAL_NAV_LINKS.map(link => (
            <button
              key={link.view}
              onClick={() => onNavigate(link.view)}
              aria-current={document.id === link.view ? 'page' : undefined}
              className={`px-3 py-2 rounded border text-xs font-semibold whitespace-nowrap transition ${
                document.id === link.view
                  ? 'bg-[#2f5d50] border-[#2f5d50] text-white'
                  : 'bg-white border-[#d5ddd6] text-[#344a43] hover:bg-[#eef1eb]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
        <aside className="hidden lg:block sticky top-24">
          <div className="bg-white border border-[#dde3dc] rounded p-4">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#7a8b84]">
              Documentos
            </div>
            <nav aria-label="Documentos legales" className="space-y-1">
              {LEGAL_NAV_LINKS.map(link => (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  aria-current={document.id === link.view ? 'page' : undefined}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-medium text-left transition ${
                    document.id === link.view
                      ? 'bg-[#eef1eb] text-[#2f5d50] font-semibold'
                      : 'text-[#344a43] hover:bg-[#f7f7f3]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-[#eef1eb]">
              <button
                onClick={() => onNavigate('contacto')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-semibold text-[#2f5d50] hover:bg-[#f7f7f3] transition"
              >
                <Mail className="w-3.5 h-3.5" />
                Consultas legales
              </button>
            </div>
          </div>
        </aside>

        <article className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
          <p className="text-sm text-[#344a43] leading-relaxed border-l-4 border-[#a8c5b8] pl-4">
            {document.intro}
          </p>

          <div className="mt-7 space-y-6">
            {document.sections.map(section => (
              <section key={section.title}>
                <h2 className="font-serif font-bold text-lg text-[#1d2b28] leading-snug">
                  {section.title}
                </h2>

                {section.paragraphs?.map(paragraph => (
                  <p key={paragraph} className="mt-2 text-sm text-[#5a6b64] leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#5a6b64] leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2f5d50] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-[#e9ede6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#7a8b84] leading-relaxed">
              FundaciÃ³n Legado Vivo Â· Palmares, Alajuela, Costa Rica
            </p>
            <button
              onClick={() => onNavigate('contacto')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition self-start sm:self-auto"
            >
              Realizar una consulta
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

