import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from '../components/SafeImage';
import {
  BookOpen,
  FileSignature,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Heart,
  CheckCircle2,
  Mic,
  Camera,
  Coffee,
  Calendar
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
      icono: <Mic className="w-6 h-6 text-[#2f5d50]" />,
      detalle: 'Aceptamos relatos de texto escrito, audios testimoniales y fotos familiares.'
    },
    {
      numero: '02',
      titulo: 'Formalización del Contrato de Consentimiento',
      descripcion:
        'La ética es nuestro pilar fundamental. Toda memoria requiere un contrato de consentimiento informado (firma digital, acta escrita o testimonio grabado) donde se define la visibilidad (privado, familiar o público).',
      icono: <FileSignature className="w-6 h-6 text-[#4f6b62]" />,
      detalle: 'Sin consentimiento acreditado, ninguna memoria puede ser procesada ni consultada.'
    },
    {
      numero: '03',
      titulo: 'Custodia Segura y Verificación de Originales',
      descripcion:
        'El archivo original nunca es alterado. Al ingresar el material, el sistema genera una constancia de verificación que protege la autenticidad del testimonio y su custodia responsable.',
      icono: <ShieldCheck className="w-6 h-6 text-[#2c6e4f]" />,
      detalle: 'El documento original se mantiene idéntico a como fue entregado.'
    },
    {
      numero: '04',
      titulo: 'Curaduría Histórica y Transmisión Intergeneracional',
      descripcion:
        'El equipo de Gestores de Datos de la Fundación revisa los topónimos de Palmares y la coherencia histórica. Una vez validada, la memoria permite consultas fidedignas con citas directas de la fuente.',
      icono: <Sparkles className="w-6 h-6 text-[#2f5d50]" />,
      detalle: 'El narrador responde citando siempre la fuente original y nunca inventa datos.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Portada Cálida con Imagen Real de Memoria y Tradición */}
      <div className="bg-white border border-[#d5ddd6] rounded shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Imagen histórica evocadora de narración y tradición */}
          <div className="md:col-span-5 relative min-h-[260px] md:min-h-full">
            <SafeImage
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
              alt="Persona mayor compartiendo sus recuerdos y vivencias históricas"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#1f352f]/20" />
            <div className="absolute bottom-3 left-4 right-4 bg-[#1f352f]/85 text-[#f2f5f0] p-2.5 rounded text-xs border border-[#344a43]">
              <span className="font-serif font-bold">Don Chepe González</span>
              <span className="text-[#dde3dc] text-[11px] block">Guardián de relatos agrícolas en Zaragoza de Palmares</span>
            </div>
          </div>

          {/* Información Institucional Cálida y Accesible */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-[#fbfbf8]">
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
                Programa de Transmisión Intergeneracional
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] leading-tight">
                Guarda tus Memorias, Escribe tu Historia
              </h1>

              <p className="text-sm sm:text-base text-[#344a43] leading-relaxed">
                La <strong>Fundación Legado Vivo</strong> acompaña a las familias de Palmares en la dignificación, registro formal y custodia responsable de las vivencias, costumbres agrícolas, oficios y anécdotas de nuestras personas adultas mayores.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap gap-3">
              {['Digitalizador', 'Administrador'].includes(activeRole) ? (
                <button
                  onClick={() => onNavigate('registro_contrato')}
                  className="btn-primary"
                >
                  <FileSignature className="w-5 h-5 mr-2" />
                  <span>Registrar Expediente & Contrato</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('regiones')}
                  className="btn-primary"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span>Explorar Memorias de Palmares</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('memorias')}
                className="btn-secondary"
              >
                Ver Catálogo de Personas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proceso Explicativo en 4 Fases con Contornos Claros */}
      <div className="space-y-4">
        <div className="border-b border-[#dde3dc] pb-3">
          <h2 className="text-xl font-bold font-serif text-[#1d2b28]">
            El Proceso de Preservación en 4 Pasos
          </h2>
          <p className="text-sm text-[#5a6b64]">
            Un camino transparente y respetuoso para proteger la memoria de nuestras personas queridas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pasos.map(paso => (
            <div
              key={paso.numero}
              className="bg-white p-6 rounded border border-[#d5ddd6] shadow-2xs hover:border-[#aebbb3] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded bg-[#fafaf7] border border-[#dde3dc]">
                    {paso.icono}
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#aebbb3]">
                    {paso.numero}
                  </span>
                </div>

                <h3 className="font-bold font-serif text-lg text-[#1d2b28] mb-2">
                  {paso.titulo}
                </h3>

                <p className="text-sm text-[#344a43] leading-relaxed mb-4">
                  {paso.descripcion}
                </p>
              </div>

              <div className="pt-3 border-t border-[#eef1eb] text-xs text-[#5a6b64] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2c6e4f] flex-shrink-0" />
                <span>{paso.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guía Ética para la Familia y Entrevistadores */}
      <div className="bg-[#fafaf7] border-1.5 border-[#d5ddd6] rounded p-6 sm:p-7 space-y-4">
        <h3 className="font-bold font-serif text-lg text-[#1d2b28] flex items-center gap-2">
          <Coffee className="w-5 h-5 text-[#2f5d50]" />
          <span>Recomendaciones para Conversar con una Persona Adulta Mayor</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#344a43] leading-relaxed">
          <div className="p-4 bg-white rounded border border-[#dde3dc] space-y-1">
            <div className="font-bold text-[#1d2b28] font-serif">1. Entorno de calma y afecto</div>
            <p className="text-xs sm:text-sm text-[#5a6b64]">
              Realice la conversación en su rincón preferido de la casa, compartiendo un buen café chorreado y sin afanes ni apuros.
            </p>
          </div>

          <div className="p-4 bg-white rounded border border-[#dde3dc] space-y-1">
            <div className="font-bold text-[#1d2b28] font-serif">2. Respeto al léxico campesino</div>
            <p className="text-xs sm:text-sm text-[#5a6b64]">
              No corrija las palabras o modismos propios de la historia palmareña. Cada expresión es un tesoro del patrimonio lingüístico.
            </p>
          </div>

          <div className="p-4 bg-white rounded border border-[#dde3dc] space-y-1">
            <div className="font-bold text-[#1d2b28] font-serif">3. Disparadores visuales</div>
            <p className="text-xs sm:text-sm text-[#5a6b64]">
              Tenga a mano fotos viejas del templo de las Mercedes, objetos de labranza o mencione a antiguos vecinos para activar recuerdos felices.
            </p>
          </div>

          <div className="p-4 bg-white rounded border border-[#dde3dc] space-y-1">
            <div className="font-bold text-[#1d2b28] font-serif">4. Consentimiento cariñoso y claro</div>
            <p className="text-xs sm:text-sm text-[#5a6b64]">
              Explíquele con claridad que sus vivencias servirán de inspiración y aprendizaje para sus hijos, nietos y toda la comunidad.
            </p>
          </div>
        </div>
      </div>

      {/* Llamado a la Acción Final */}
      <div className="bg-white p-7 rounded border border-[#d5ddd6] text-center space-y-3">
        <h4 className="font-bold text-[#1d2b28] font-serif text-xl">
          ¿Desea registrar una historia familiar o de su comunidad?
        </h4>
        <p className="text-sm text-[#5a6b64] max-w-xl mx-auto leading-relaxed">
          El equipo Digitalizador de la Fundación Legado Vivo está a su entera disposición para orientarle en cada paso del proceso.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('registro_contrato')}
            className="btn-primary"
          >
            <span>Iniciar Registro de Memoria & Contrato</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
