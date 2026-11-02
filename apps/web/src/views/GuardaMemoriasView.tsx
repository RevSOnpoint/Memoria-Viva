import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileSignature,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Heart,
  Users,
  Building2,
  CheckCircle2,
  Mic,
  Image,
  FileText,
  Clock
} from 'lucide-react';

interface GuardaMemoriasViewProps {
  onNavigate: (view: string) => void;
}

export const GuardaMemoriasView: React.FC<GuardaMemoriasViewProps> = ({ onNavigate }) => {
  const { activeRole } = useAuth();

  const pasos = [
    {
      numero: '01',
      titulo: 'Recopilación del Testimonio Oral y Documental',
      descripcion:
        'Reúna a la persona adulta mayor en un entorno sereno. Grabe sus relatos con el teléfono o micrófono, recopile fotografías antiguas de época o digitalice cartas y apuntes familiares.',
      icono: <Mic className="w-6 h-6 text-[#0056b3]" />,
      detalle: 'Aceptamos relatos de texto escrito, cintas o archivos de audio y fotografías de álbumes familiares.'
    },
    {
      numero: '02',
      titulo: 'Formalización del Contrato de Consentimiento',
      descripcion:
        'La ética es nuestro pilar fundamental. Toda memoria requiere un contrato de consentimiento informado (firma digital, acta notarial o testimonio grabado) donde la persona o sus tutores definen el alcance y visibilidad (privado, familiar o público).',
      icono: <FileSignature className="w-6 h-6 text-amber-600" />,
      detalle: 'Sin consentimiento acreditado, ninguna memoria puede ser procesada ni consultada.'
    },
    {
      numero: '03',
      titulo: 'Custodia Inmutable con Firma SHA-256',
      descripcion:
        'El archivo original nunca es alterado. Al momento de la ingesta en la plataforma, se calcula una huella criptográfica SHA-256 única e inmutable que garantiza la integridad histórica del testimonio a perpetuidad.',
      icono: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      detalle: 'El archivo original se mantiene exactamente como fue entregado por el informante.'
    },
    {
      numero: '04',
      titulo: 'Curaduría Histórica y Transmisión con IA',
      descripcion:
        'El equipo de Gestores de Datos de la Fundación revisa los nombres de lugares de Palmares y hechos históricos. Una vez validada, la memoria alimenta su base de conocimiento aislada para ser explorada con el narrador interactivo.',
      icono: <Sparkles className="w-6 h-6 text-teal-600" />,
      detalle: 'El narrador responde citando siempre la fuente primaria y nunca inventa datos.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner de Bienvenida Institucional */}
      <div className="bg-gradient-to-r from-[#0c1a2d] to-[#142d4f] text-white rounded-xl p-6 sm:p-10 border border-[#1a3861] shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold font-mono">
            <Heart className="w-3.5 h-3.5 text-amber-300" />
            <span>Preservación del Patrimonio Oral • Palmares, Costa Rica</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white leading-tight">
            Guarda tus Memorias, Escribe tu Historia
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            La <strong>Fundación Legado Vivo</strong> acompaña a las familias de Palmares en la dignificación, registro y custodia inmutable de las historias de vida, costumbres agrícolas, oficios y tradiciones de nuestras personas adultas mayores.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            {['Digitalizador', 'Administrador'].includes(activeRole) ? (
              <button
                onClick={() => onNavigate('registro_contrato')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <FileSignature className="w-4 h-4" />
                <span>Registrar un Expediente & Contrato</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('regiones')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorar las Memorias de Palmares</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('regiones')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-lg border border-slate-700 transition"
            >
              Ver Archivo de Personas
            </button>
          </div>
        </div>
      </div>

      {/* Proceso Explicativo en 4 Fases */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold font-serif text-slate-900">
            El Proceso de Preservación de la Fundación
          </h2>
          <p className="text-xs text-slate-500">
            Conozca cómo cada relato es tratado con el más alto rigor ético, legal y tecnológico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pasos.map(paso => (
            <div
              key={paso.numero}
              className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    {paso.icono}
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-200">
                    {paso.numero}
                  </span>
                </div>

                <h3 className="font-bold font-serif text-base text-slate-900 mb-1.5">
                  {paso.titulo}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {paso.descripcion}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{paso.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guía Ética para la Familia y Entrevistadores */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3">
        <h3 className="font-bold font-serif text-base text-slate-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-600" />
          <span>Recomendaciones para Entrevistar a una Persona Mayor</span>
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Espacio de confianza:</strong> Realice la conversación en su sillón preferido, con café o té, sin prisas ni interrupciones externas.
          </li>
          <li>
            <strong>Respete su léxico y modismos:</strong> No corrija las expresiones campesinas palmareñas; son parte viva del patrimonio lingüístico.
          </li>
          <li>
            <strong>Disparadores de memoria:</strong> Muestre fotografías viejas del parque central de Palmares, objetos de molienda o mencione a vecinos antiguos para despertar anécdotas espontáneas.
          </li>
          <li>
            <strong>Consentimiento explícito:</strong> Explíquele con cariño que sus relatos serán conservados para que sus bisnietos y la comunidad conozcan sus enseñanzas.
          </li>
        </ul>
      </div>

      {/* Llamado a la Acción Final */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 text-center space-y-3">
        <h4 className="font-bold text-slate-800 font-serif text-base">
          ¿Desea registrar una historia familiar o comunitaria?
        </h4>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Contacte al personal Digitalizador de la Fundación Legado Vivo o inicie el registro con contrato formal si cuenta con el rol autorizado.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('registro_contrato')}
            className="px-5 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-bold rounded shadow-xs transition inline-flex items-center gap-2"
          >
            <span>Iniciar Registro de Memoria & Contrato</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

