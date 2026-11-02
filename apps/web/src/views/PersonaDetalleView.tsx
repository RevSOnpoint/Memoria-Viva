import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, Aporte, FuenteCita } from '../types';
import { api } from '../services/api';
import {
  Users,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Mic,
  Image as ImageIcon,
  Hash,
  Bot,
  Volume2,
  VolumeX,
  Send,
  ExternalLink,
  ChevronLeft,
  BookOpen,
  FileSignature,
  Check,
  Copy,
  HelpCircle,
  X
} from 'lucide-react';

interface PersonaDetalleViewProps {
  memoriaId: number;
  onBack: () => void;
  onNavigateCarga: (memoriaId: number) => void;
}

interface MensajeChat {
  id: string;
  sender: 'usuario' | 'ia';
  texto: string;
  fuentes?: FuenteCita[];
  encontrado?: boolean;
  hora: string;
}

const PORTRAIT_MAP: Record<string, string> = {
  'José Ángel González Chaves': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'Don Chepe': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'Carmen María Rojas Vargas': 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=600&q=80',
  'Doña Carmen': 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_PORTRAIT = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80';

export const PersonaDetalleView: React.FC<PersonaDetalleViewProps> = ({
  memoriaId,
  onBack,
  onNavigateCarga
}) => {
  const { activeRole } = useAuth();
  const [memoria, setMemoria] = useState<Memoria | null>(null);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [activeTab, setActiveTab] = useState<'vivencias' | 'narrador' | 'contrato'>('vivencias');
  const [isLoading, setIsLoading] = useState(true);

  // Estados del Narrador de memoria
  const [inputPregunta, setInputPregunta] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [modalFuente, setModalFuente] = useState<FuenteCita | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getMemoria(memoriaId),
      api.getAportesByMemoria(memoriaId).catch(() => [])
    ])
      .then(([mem, aps]) => {
        setMemoria(mem);
        setAportes(aps);

        const titular = mem.titular;
        const alias = mem.alias ? ` ("${mem.alias}")` : '';
        setMensajes([
          {
            id: 'welcome',
            sender: 'ia',
            texto:
              `Saludos. Esta voz testimonial comparte las vivencias y memorias de ${titular}${alias}. ` +
              `Cada respuesta proviene estrictamente de los relatos orales y documentos verificados en su custodia. ` +
              `Si me consulta sobre algo que no se encuentra en sus vivencias, se lo indicaré con sinceridad sin inventar.`,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [memoriaId, activeRole]);

  const handlePreguntar = async (preguntaTexto?: string) => {
    const q = (preguntaTexto || inputPregunta).trim();
    if (!q || !memoria || isNarrating) return;

    const userMsg: MensajeChat = {
      id: `u-${Date.now()}`,
      sender: 'usuario',
      texto: q,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes(prev => [...prev, userMsg]);
    setInputPregunta('');
    setIsNarrating(true);

    try {
      const res = await api.preguntarNarrador(memoria.id, q);

      const iaMsg: MensajeChat = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        texto: res.respuesta,
        fuentes: res.fuentes,
        encontrado: res.encontrado,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMensajes(prev => [...prev, iaMsg]);
    } catch (err: any) {
      setMensajes(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ia',
          texto: `Aviso del archivo: ${err.message || 'No fue posible consultar al narrador.'}`,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsNarrating(false);
    }
  };

  const hablar = (texto: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = texto.replace(/\[Aporte.*?\]/g, '').replace(/https?:\/\/\S+/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'es-CR';
    utter.rate = 0.85; // Muy pausado y claro para adultos mayores
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const hasConsent = !!memoria?.consentimiento?.evidencia_hash;
  const portraitImg = memoria ? (PORTRAIT_MAP[memoria.titular] || PORTRAIT_MAP[memoria.alias || ''] || DEFAULT_PORTRAIT) : DEFAULT_PORTRAIT;

  const sugerencias = memoria?.alias === 'Don Chepe'
    ? [
        '¿Cómo era el trapiche de bueyes en Zaragoza?',
        '¿Cómo se construyó el Templo de Nuestra Señora de las Mercedes?',
        '¿A qué año viajó en nave a Marte? (Prueba no invención)'
      ]
    : memoria?.alias === 'Doña Carmen'
    ? [
        '¿Cómo atendía los partos de noche con candil?',
        '¿Qué ocurrió durante el terremoto de 1955 y la olla de carne?',
        '¿Cuál era su postre favorito en París? (Prueba no invención)'
      ]
    : [
        '¿Cuáles son sus principales memorias de infancia en Palmares?',
        '¿Cómo era el trabajo comunitario tradicional?'
      ];

  if (isLoading) {
    return (
      <div className="bg-white p-12 text-center text-[#7d6854] rounded border border-[#e3d9cb]">
        <div className="animate-spin w-8 h-8 border-4 border-[#c05600] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium">Abriendo expediente patrimonial...</p>
      </div>
    );
  }

  if (!memoria) {
    return (
      <div className="bg-white p-8 text-center text-[#2a1a0f] rounded border border-[#e3d9cb]">
        <p>No se encontró el expediente solicitado o el usuario no cuenta con autorización para visualizarlo.</p>
        <button onClick={onBack} className="mt-4 btn-secondary text-xs">
          Regresar al Directorio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Botón de Retorno Limpio */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-bold text-[#c05600] hover:text-[#9f4600] transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Directorio de Regiones y Personas</span>
        </button>

        <span className="text-[#8c745f]">
          Expediente Histórico #{memoria.id}
        </span>
      </div>

      {/* Ficha Principal de la Persona (Retrato Real y Semblanza Cálida) */}
      <div className="bg-white border border-[#d8ccba] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Fotografía de época real */}
          <div className="w-28 h-36 sm:w-32 sm:h-40 rounded overflow-hidden border-2 border-[#8c6239] shadow-xs flex-shrink-0 bg-[#f4ede2]">
            <img
              src={portraitImg}
              alt={memoria.titular}
              className="w-full h-full object-cover sepia-[0.15] contrast-105"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[#8c745f]">
                {memoria.lugar_origen}
              </span>

              {hasConsent ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1b6e39]">
                  <ShieldCheck className="w-4 h-4 text-[#1b6e39]" />
                  <span>Consentimiento firmado</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#a81c1c]">
                  <ShieldAlert className="w-4 h-4 text-[#a81c1c]" />
                  <span>Sin consentimiento registrado</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2a1a0f] leading-snug">
              {memoria.titular}
            </h1>

            {memoria.alias && (
              <div className="text-sm font-semibold text-[#c05600] mt-0.5">
                "{memoria.alias}"
              </div>
            )}

            {memoria.fecha_nacimiento && (
              <div className="text-xs text-[#7d6854] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8c745f]" />
                <span>Nacido en: {memoria.fecha_nacimiento}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#442a17] leading-relaxed mt-3.5 font-sans">
              {memoria.descripcion || 'Sin semblanza registrada en la custodia inicial.'}
            </p>
          </div>

          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <div className="self-start sm:self-auto">
              <button
                onClick={() => onNavigateCarga(memoria.id)}
                className="btn-secondary text-xs"
              >
                + Agregar Relato
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pestañas Cálidas y Accesibles */}
      <div className="border-b border-[#d8ccba] flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('vivencias')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vivencias'
              ? 'border-[#c05600] text-[#c05600] font-bold'
              : 'border-transparent text-[#665546] hover:text-[#2a1a0f]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Vivencias & Testimonios ({aportes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('narrador')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'narrador'
              ? 'border-[#c05600] text-[#c05600] font-bold'
              : 'border-transparent text-[#665546] hover:text-[#2a1a0f]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Consultar al Narrador de la Memoria</span>
        </button>

        <button
          onClick={() => setActiveTab('contrato')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contrato'
              ? 'border-[#c05600] text-[#c05600] font-bold'
              : 'border-transparent text-[#665546] hover:text-[#2a1a0f]'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>Contrato de Consentimiento Legal</span>
        </button>
      </div>

      {/* PESTAÑA 1: VIVENCIAS Y APORTES ORIGINALES (CON FOTOGRAFÍAS DE ÉPOCA) */}
      {activeTab === 'vivencias' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-[#7d6854]">
            <span>Relatos orales y documentales en custodia</span>
            <span>Total: {aportes.length} testimonios</span>
          </div>

          {aportes.length === 0 ? (
            <div className="bg-white p-12 text-center text-[#7d6854] rounded border border-[#e3d9cb]">
              <BookOpen className="w-10 h-10 text-[#cbb9a3] mx-auto mb-2" />
              <p className="text-sm">Aún no se han registrado aportes para este expediente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {aportes.map(aporte => {
                const isValidated = aporte.estado === 'validado';
                const displayText = aporte.procesamiento?.version_validada || aporte.contenido_original || '';

                // Imágenes evocadoras de Palmares según el tipo de aporte
                const ilustracion = aporte.tipo === 'foto'
                  ? 'https://images.unsplash.com/photo-1548625361-16a73c1d9168?auto=format&fit=crop&w=700&q=80'
                  : aporte.tipo === 'audio'
                  ? 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=700&q=80'
                  : null;

                return (
                  <div
                    key={aporte.id}
                    className="bg-white p-6 rounded border border-[#d8ccba] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eee4d6]">
                      <div className="flex items-center space-x-2.5">
                        {aporte.tipo === 'texto' && <FileText className="w-5 h-5 text-[#8c745f]" />}
                        {aporte.tipo === 'audio' && <Mic className="w-5 h-5 text-[#c05600]" />}
                        {aporte.tipo === 'foto' && <ImageIcon className="w-5 h-5 text-[#8c6239]" />}
                        <h4 className="font-bold font-serif text-[#2a1a0f] text-base sm:text-lg">
                          {aporte.titulo}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        {isValidated ? (
                          <span className="font-semibold text-[#1b6e39]">
                            ✓ Validado por Curaduría
                          </span>
                        ) : (
                          <span className="font-semibold text-[#c05600]">
                            En proceso de revisión
                          </span>
                        )}
                        <span>•</span>
                        <span className="capitalize text-[#7d6854] font-medium">
                          {aporte.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#7d6854] flex items-center gap-3">
                      <span>Por: <strong>{aporte.autor}</strong></span>
                      {aporte.fecha_hecho_historico && (
                        <span>• Época: {aporte.fecha_hecho_historico}</span>
                      )}
                    </div>

                    {/* Contenido con imagen si aplica */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {ilustracion && (
                        <div className="md:col-span-4 rounded overflow-hidden border border-[#d8ccba] h-44 bg-[#f4ede2]">
                          <img
                            src={ilustracion}
                            alt={aporte.titulo}
                            className="w-full h-full object-cover sepia-[0.1]"
                          />
                        </div>
                      )}

                      <div className={`${ilustracion ? 'md:col-span-8' : 'md:col-span-12'} p-4 bg-[#fbf9f5] border border-[#eee4d6] rounded font-serif text-xs sm:text-sm text-[#2a1a0f] leading-relaxed italic`}>
                        "{displayText}"
                      </div>
                    </div>

                    {/* Hash criptográfico inmutable */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#7d6854]">
                      <div className="truncate max-w-md">
                        <span className="font-bold">Hash SHA-256 inmutable: </span>
                        <span className="font-mono">{aporte.archivo_hash_sha256}</span>
                      </div>

                      <span className="text-[10px]">
                        Registrado el {new Date(aporte.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: NARRADOR DIGITAL DE LA MEMORIA (HUMANO Y SIN ETIQUETAS ROBÓTICAS) */}
      {activeTab === 'narrador' && (
        <div className="space-y-4">
          {!hasConsent ? (
            <div className="p-5 bg-[#fdf2f2] border border-[#f5c2c2] text-[#a81c1c] rounded flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#a81c1c] flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Atención:</strong> El narrador de la memoria no puede activarse porque este expediente no cuenta con un consentimiento formal firmado.
              </div>
            </div>
          ) : (
            <div className="bg-white rounded border border-[#d8ccba] shadow-xs overflow-hidden flex flex-col h-[600px]">
              {/* Cabecera del Narrador */}
              <div className="p-4 bg-[#2e1c0e] text-white flex items-center justify-between border-b border-[#442a17]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded bg-[#c05600] text-white flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5 text-[#fef6ee]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base font-serif">
                      Voz Testimonial de {memoria.titular}
                    </div>
                    <div className="text-xs text-[#d6c7b5]">
                      Respuestas basadas exclusivamente en los relatos validados de esta persona
                    </div>
                  </div>
                </div>

                <div>
                  {isSpeaking ? (
                    <button
                      onClick={() => {
                        window.speechSynthesis?.cancel();
                        setIsSpeaking(false);
                      }}
                      className="px-3 py-1.5 rounded bg-[#a81c1c] text-white text-xs font-bold flex items-center gap-1"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>Detener voz</span>
                    </button>
                  ) : (
                    <div className="text-xs text-[#d6c7b5] flex items-center gap-1">
                      <Volume2 className="w-4 h-4 text-[#e89b52]" />
                      <span className="hidden sm:inline">Lectura con voz activa</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Flujo de mensajes con estilo cálido y legible */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#faf7f2]">
                {mensajes.map(m => {
                  const isUser = m.sender === 'usuario';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[11px] text-[#7d6854] mb-1 px-1">
                        {isUser ? 'Pregunta' : 'Respuesta testimonial'} • {m.hora}
                      </div>

                      <div
                        className={`p-4 rounded max-w-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-[#c05600] text-white'
                            : 'bg-white text-[#2a1a0f] border border-[#d8ccba]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.texto}</p>

                        {/* Cita de fuente primaria en tono editorial */}
                        {!isUser && m.fuentes && m.fuentes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#eee4d6] space-y-2">
                            <span className="text-xs font-bold text-[#442a17] block font-serif">
                              Fuente primaria consultada:
                            </span>
                            {m.fuentes.map((f, i) => (
                              <div
                                key={i}
                                className="p-3 bg-[#fdfaf5] rounded border border-[#e3d9cb] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="text-xs font-bold text-[#2a1a0f]">
                                    {f.cita}
                                  </div>
                                  <div className="text-xs text-[#5c493a]">
                                    {f.titulo}
                                  </div>
                                </div>

                                <button
                                  onClick={() => setModalFuente(f)}
                                  className="btn-secondary text-xs py-1 px-3 h-auto whitespace-nowrap self-start sm:self-auto"
                                >
                                  Ver documento original
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isUser && (
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => hablar(m.texto)}
                              className="text-xs text-[#8c6239] hover:text-[#c05600] flex items-center gap-1 font-semibold"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Escuchar este relato</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isNarrating && (
                  <div className="flex items-center space-x-2 text-xs text-[#7d6854] bg-white p-3 rounded border border-[#d8ccba] w-fit">
                    <div className="animate-spin w-4 h-4 border-2 border-[#c05600] border-t-transparent rounded-full" />
                    <span>Consultando los testimonios de {memoria.titular}...</span>
                  </div>
                )}
              </div>

              {/* Preguntas sugeridas */}
              <div className="px-4 py-2.5 bg-[#f4ede2] border-t border-[#d8ccba] flex items-center overflow-x-auto gap-2 scrollbar-none text-xs flex-nowrap">
                <span className="text-[#665546] font-semibold text-xs flex-shrink-0 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#c05600]" />
                  <span>Sugerencias:</span>
                </span>
                {sugerencias.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handlePreguntar(sug)}
                    disabled={isNarrating}
                    className="px-3 py-1.5 rounded bg-white hover:bg-[#ede5d8] text-[#2a1a0f] border border-[#d8ccba] text-xs whitespace-nowrap transition disabled:opacity-50"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Barra de entrada accesible */}
              <div className="p-3.5 bg-white border-t border-[#d8ccba]">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handlePreguntar();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputPregunta}
                    onChange={e => setInputPregunta(e.target.value)}
                    placeholder={`Pregúntele a ${memoria.alias || memoria.titular} sobre sus recuerdos...`}
                    className="flex-1 h-12 px-4 text-xs sm:text-sm border border-[#c4b59f] rounded focus:border-[#c05600] focus:ring-1 focus:ring-[#c05600]"
                  />
                  <button
                    type="submit"
                    disabled={isNarrating || !inputPregunta.trim()}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Preguntar</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: CONTRATO DE CONSENTIMIENTO FORMAL */}
      {activeTab === 'contrato' && (
        <div className="bg-white rounded border border-[#d8ccba] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eee4d6] gap-2">
            <div>
              <div className="text-xs font-semibold uppercase text-[#8c745f]">
                Documento Notarial y Ético
              </div>
              <h3 className="text-xl font-bold font-serif text-[#2a1a0f]">
                Contrato de Consentimiento Informado & Custodia Histórica
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#f0f8f2] text-[#1b6e39] text-xs font-bold border border-[#b2d9bc]">
              <ShieldCheck className="w-4 h-4 text-[#1b6e39]" />
              <span>Contrato Acreditado</span>
            </div>
          </div>

          {memoria.consentimiento ? (
            <div className="space-y-4 text-xs sm:text-sm text-[#2a1a0f]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#fbf9f5] rounded border border-[#eee4d6]">
                  <span className="text-[#8c745f] block text-xs">Modalidad:</span>
                  <strong className="text-sm font-serif">{memoria.consentimiento.modalidad}</strong>
                </div>
                <div className="p-3 bg-[#fbf9f5] rounded border border-[#eee4d6]">
                  <span className="text-[#8c745f] block text-xs">Fecha del Acuerdo:</span>
                  <strong className="text-sm font-serif">{memoria.consentimiento.fecha_otorgamiento}</strong>
                </div>
                <div className="p-3 bg-[#fbf9f5] rounded border border-[#eee4d6]">
                  <span className="text-[#8c745f] block text-xs">Vigencia:</span>
                  <strong className="text-sm font-serif">{memoria.consentimiento.vigencia}</strong>
                </div>
              </div>

              <div className="p-4 bg-[#fbf9f5] rounded border border-[#eee4d6] space-y-2 font-serif leading-relaxed">
                <strong className="block text-xs uppercase font-sans text-[#7d6854]">
                  Cláusula de Autorización y Transmisión Cultural:
                </strong>
                <p>{memoria.consentimiento.alcance}</p>
                {memoria.consentimiento.notas && (
                  <p className="text-xs text-[#7d6854] pt-2 border-t border-[#eee4d6]">
                    Evidencia física: {memoria.consentimiento.notas}
                  </p>
                )}
              </div>

              {/* Hash SHA-256 */}
              <div className="p-4 bg-[#fdf5eb] rounded border border-[#ecd0b3]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#8e3e00] text-xs flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-[#c05600]" />
                    <span>Firma Criptográfica SHA-256 Inmutable:</span>
                  </span>
                  <button
                    onClick={() => copyHash(memoria.consentimiento?.evidencia_hash || '')}
                    className="text-xs font-bold text-[#c05600] hover:underline flex items-center gap-1"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
                  </button>
                </div>
                <div className="font-mono text-[#442a17] break-all bg-white p-2.5 rounded border border-[#e5dcce] text-xs">
                  {memoria.consentimiento.evidencia_hash}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#fdf2f2] text-[#a81c1c] text-xs rounded border border-[#f5c2c2]">
              No se ha registrado contrato formal para este expediente.
            </div>
          )}
        </div>
      )}

      {/* Modal: Visor de Fuente Primaria Inmutable */}
      {modalFuente && (
        <div className="fixed inset-0 z-50 bg-[#26170d]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded border border-[#8c6239] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee4d6]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#c05600]" />
                <h3 className="font-bold font-serif text-[#2a1a0f] text-lg">
                  Fuente Primaria Inalterada: {modalFuente.cita}
                </h3>
              </div>
              <button
                onClick={() => setModalFuente(null)}
                className="p-1 rounded text-[#7d6854] hover:text-[#2a1a0f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#2a1a0f]">
              <div>
                <span className="text-[#8c745f] block text-xs">Título del Relato:</span>
                <strong className="text-sm font-serif">{modalFuente.titulo}</strong>
              </div>

              <div>
                <span className="text-[#8c745f] block text-xs">Autor y Época:</span>
                <span>{modalFuente.autor} • {modalFuente.fecha}</span>
              </div>

              <div>
                <span className="text-[#8c745f] block text-xs mb-1">Texto Original en Custodia:</span>
                <div className="p-4 bg-[#fbf9f5] border border-[#eee4d6] rounded font-serif text-sm leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap italic">
                  {modalFuente.contenido_original || modalFuente.texto_validado}
                </div>
              </div>

              <div className="p-3 bg-[#fdf5eb] rounded border border-[#ecd0b3]">
                <span className="font-bold text-[#8e3e00] block text-xs mb-1">
                  Certificado SHA-256 Inmutable:
                </span>
                <div className="font-mono text-[#442a17] break-all bg-white p-2 rounded border border-[#e5dcce] text-xs">
                  {modalFuente.archivo_hash_sha256}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#eee4d6] flex justify-end">
              <button
                onClick={() => setModalFuente(null)}
                className="btn-secondary text-xs"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
