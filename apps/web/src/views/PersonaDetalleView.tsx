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
  Image,
  Hash,
  Bot,
  Volume2,
  VolumeX,
  Send,
  ExternalLink,
  ChevronLeft,
  BookOpen,
  FileSignature,
  Tag,
  Check,
  Copy,
  Clock,
  Sparkles,
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

export const PersonaDetalleView: React.FC<PersonaDetalleViewProps> = ({
  memoriaId,
  onBack,
  onNavigateCarga
}) => {
  const { activeRole } = useAuth();
  const [memoria, setMemoria] = useState<Memoria | null>(null);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [activeTab, setActiveTab] = useState<'vivencias' | 'narrador' | 'contrato' | 'entidades'>('vivencias');
  const [isLoading, setIsLoading] = useState(true);

  // Estados del Narrador IA integrado a la memoria
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

        // Inicializar mensaje de bienvenida del narrador para este personaje
        const titular = mem.titular;
        const alias = mem.alias ? ` (${mem.alias})` : '';
        setMensajes([
          {
            id: 'welcome',
            sender: 'ia',
            texto:
              `Soy el asistente de memoria oral de ${titular}${alias}. ` +
              `Mis respuestas provienen exclusivamente de los testimonios y vivencias validadas en su expediente. ` +
              `Si me consulta sobre algo que no se encuentra en sus registros, se lo indicaré con total veracidad sin inventar.`,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [memoriaId, activeRole]);

  // Enviar pregunta al narrador
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

  // Síntesis de voz
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
    utter.rate = 0.9;
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

  // Preguntas sugeridas contextuales
  const sugerencias = memoria?.alias === 'Don Chepe'
    ? [
        '¿Cómo era el trapiche de bueyes en Zaragoza?',
        '¿Cómo se construyó el Templo de Nuestra Señora de las Mercedes?',
        '¿A qué año viajó a París en 1920? (Prueba no invención)'
      ]
    : memoria?.alias === 'Doña Carmen'
    ? [
        '¿Cómo atendía los partos de noche con candil?',
        '¿Qué ocurrió durante el terremoto de 1955 y la olla comunal?',
        '¿Cuál era su postre favorito en Tokio? (Prueba no invención)'
      ]
    : [
        '¿Cuáles son sus principales memorias de infancia en Palmares?',
        '¿Cómo era el trabajo comunitario tradicional?'
      ];

  if (isLoading) {
    return (
      <div className="bg-white p-12 text-center text-slate-500 rounded-lg border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-[#0056b3] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm font-medium">Abriendo expediente patrimonial...</p>
      </div>
    );
  }

  if (!memoria) {
    return (
      <div className="bg-white p-8 text-center text-slate-700 rounded-lg border border-slate-200">
        <p>No se encontró el expediente solicitado o el usuario no cuenta con autorización para visualizarlo.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded text-xs">
          Regresar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Botón de Retorno y Migas de Pan */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#0056b3] transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Directorio de Regiones y Personas</span>
        </button>

        <span className="font-mono text-slate-400">
          Expediente Histórico #{memoria.id}
        </span>
      </div>

      {/* Ficha Principal del Informante (Dossier Header) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            {/* Emblema o Retrato */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-[#0c1a2d] to-[#1a3861] text-amber-200 flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md border border-blue-900/40 flex-shrink-0">
              {memoria.titular[0]}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {memoria.lugar_origen}
                </span>

                {hasConsent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Consentimiento Legal Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-50 text-red-800 text-[11px] font-bold border border-red-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Sin Consentimiento
                  </span>
                )}

                <span className="text-[11px] font-semibold text-slate-500 capitalize px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                  Visibilidad: {memoria.visibilidad}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 leading-tight">
                {memoria.titular}
              </h1>

              {memoria.alias && (
                <div className="text-sm font-semibold text-[#0056b3] mt-0.5">
                  Conocido como "{memoria.alias}"
                </div>
              )}

              {memoria.fecha_nacimiento && (
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nacimiento: {memoria.fecha_nacimiento}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones de Edición o Carga para Digitalizadores */}
          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <div className="flex items-center gap-2 self-start">
              <button
                onClick={() => onNavigateCarga(memoria.id)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition"
              >
                <span>+ Agregar Aporte</span>
              </button>
            </div>
          )}
        </div>

        {/* Semblanza biográfica */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>{memoria.descripcion || 'Sin semblanza registrada en la custodia inicial.'}</p>
        </div>
      </div>

      {/* Pestañas de Exploración del Expediente */}
      <div className="border-b border-slate-200 flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('vivencias')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vivencias'
              ? 'border-[#0056b3] text-[#0056b3] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Vivencias & Aportes Originales ({aportes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('narrador')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'narrador'
              ? 'border-[#0056b3] text-[#0056b3] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-teal-600" />
          <span>Consultar al Narrador de la Memoria</span>
        </button>

        <button
          onClick={() => setActiveTab('contrato')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contrato'
              ? 'border-[#0056b3] text-[#0056b3] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSignature className="w-4 h-4 text-amber-600" />
          <span>Contrato de Consentimiento Legal</span>
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑA 1: VIVENCIAS Y APORTES ORIGINALES */}
      {activeTab === 'vivencias' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Testimonios orales y documentales en custodia</span>
            <span>Total: {aportes.length}</span>
          </div>

          {aportes.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 rounded-lg border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">Aún no se han registrado aportes para este expediente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {aportes.map(aporte => {
                const isValidated = aporte.estado === 'validado';
                const displayText = aporte.procesamiento?.version_validada || aporte.contenido_original || '';

                return (
                  <div
                    key={aporte.id}
                    className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        {aporte.tipo === 'texto' && <FileText className="w-4 h-4 text-slate-600" />}
                        {aporte.tipo === 'audio' && <Mic className="w-4 h-4 text-cyan-600" />}
                        {aporte.tipo === 'foto' && <Image className="w-4 h-4 text-amber-600" />}
                        <h4 className="font-bold font-serif text-slate-900 text-base">
                          {aporte.titulo}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isValidated ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Validado para Base de Conocimiento
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Pendiente de Revisión
                          </span>
                        )}
                        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {aporte.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Por: {aporte.autor}</span>
                      {aporte.fecha_hecho_historico && (
                        <span>• Fecha histórica: {aporte.fecha_hecho_historico}</span>
                      )}
                    </div>

                    {/* Texto testimonial */}
                    <div className="p-3.5 bg-slate-50 rounded border border-slate-100 font-serif text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                      "{displayText}"
                    </div>

                    {/* Hash criptográfico SHA-256 */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                      <div className="truncate max-w-lg">
                        <span className="font-bold text-slate-600">Hash SHA-256: </span>
                        <span>{aporte.archivo_hash_sha256}</span>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        Custodiado el {new Date(aporte.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 2: NARRADOR DIGITAL DE LA MEMORIA (IA CONTEXTUALIZADA) */}
      {activeTab === 'narrador' && (
        <div className="space-y-4">
          {!hasConsent ? (
            <div className="p-5 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong>Bloqueo Ético:</strong> El narrador digital no puede activarse porque esta persona no cuenta con consentimiento legal registrado.
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Cabecera del Narrador */}
              <div className="p-4 bg-[#0c1a2d] text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>Voz Testimonial de {memoria.titular}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-900 text-teal-200 border border-teal-700 font-mono">
                        RAG Estricto
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Citas formales obligatorias • Cero alucinación
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSpeaking ? (
                    <button
                      onClick={() => {
                        window.speechSynthesis?.cancel();
                        setIsSpeaking(false);
                      }}
                      className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Detener Voz</span>
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                      <span className="hidden sm:inline">Web Speech API</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">
                {mensajes.map(m => {
                  const isUser = m.sender === 'usuario';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-1 px-1 font-mono">
                        {isUser ? 'Consultante' : 'Narrador Oficial'} • {m.hora}
                      </div>

                      <div
                        className={`p-4 rounded-xl max-w-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-[#0056b3] text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.texto}</p>

                        {/* Citas del aporte primario */}
                        {!isUser && m.fuentes && m.fuentes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block font-mono">
                              Cita y Fuente Primaria Acreditada:
                            </span>
                            {m.fuentes.map((f, i) => (
                              <div
                                key={i}
                                className="p-2.5 bg-teal-50/80 rounded border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="font-mono text-xs font-bold text-teal-950">
                                    {f.cita}
                                  </div>
                                  <div className="text-[11px] text-teal-800">
                                    {f.titulo}
                                  </div>
                                </div>

                                <button
                                  onClick={() => setModalFuente(f)}
                                  className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded flex items-center gap-1 shadow-xs whitespace-nowrap self-start sm:self-auto"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Ver original</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isUser && (
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => hablar(m.texto)}
                              className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 font-semibold"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Escuchar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isNarrating && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded border border-slate-200 w-fit">
                    <div className="animate-spin w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                    <span>Consultando la memoria de {memoria.titular}...</span>
                  </div>
                )}
              </div>

              {/* Preguntas Sugeridas */}
              <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center overflow-x-auto gap-2 scrollbar-none text-xs flex-nowrap">
                <span className="text-slate-500 font-semibold text-[11px] flex-shrink-0 flex items-center gap-1 font-mono">
                  <HelpCircle className="w-3 h-3 text-teal-700" />
                  <span>Sugerencias:</span>
                </span>
                {sugerencias.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handlePreguntar(sug)}
                    disabled={isNarrating}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] whitespace-nowrap transition disabled:opacity-50"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Barra de Entrada */}
              <div className="p-3 bg-white border-t border-slate-200">
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
                    placeholder={`Consulte a ${memoria.alias || memoria.titular} sobre sus vivencias...`}
                    className="flex-1 h-11 px-3.5 text-xs sm:text-sm border border-slate-300 rounded focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]"
                  />
                  <button
                    type="submit"
                    disabled={isNarrating || !inputPregunta.trim()}
                    className="px-4 h-11 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-xs disabled:opacity-50"
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

      {/* CONTENIDO DE PESTAÑA 3: CONTRATO DE CONSENTIMIENTO FORMAL */}
      {activeTab === 'contrato' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Protocolo Notarial y Ético de Custodia
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900">
                Contrato de Consentimiento Informado & Cesión Patrimonial
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contrato Activo y Registrado</span>
            </div>
          </div>

          {memoria.consentimiento ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Modalidad del Acuerdo:</span>
                  <span className="font-bold text-slate-800 text-sm">{memoria.consentimiento.modalidad}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Fecha de Formalización:</span>
                  <span className="font-bold text-slate-800 text-sm">{memoria.consentimiento.fecha_otorgamiento}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Vigencia:</span>
                  <span className="font-bold text-slate-800 text-sm">{memoria.consentimiento.vigencia}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block font-mono">
                  Cláusula de Alcance y Fines Autorizados:
                </span>
                <p className="text-slate-700 leading-relaxed font-serif">
                  {memoria.consentimiento.alcance}
                </p>
                {memoria.consentimiento.notas && (
                  <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-200">
                    Constancia de custodia: {memoria.consentimiento.notas}
                  </p>
                )}
              </div>

              {/* Hash Criptográfico Inmutable */}
              <div className="p-4 bg-blue-50/70 rounded border border-blue-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-blue-900 font-mono text-xs flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-[#0056b3]" />
                    <span>Firma Criptográfica SHA-256 (Garantía de Inmutabilidad):</span>
                  </span>
                  <button
                    onClick={() => copyHash(memoria.consentimiento?.evidencia_hash || '')}
                    className="text-xs font-semibold text-[#0056b3] hover:underline flex items-center gap-1"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
                  </button>
                </div>
                <div className="font-mono text-slate-800 break-all bg-white p-2.5 rounded border border-blue-200 text-xs">
                  {memoria.consentimiento.evidencia_hash}
                </div>
              </div>

              <div className="text-slate-500 text-[11px] flex items-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Este documento certifica que los relatos y testimonios de {memoria.titular} son custodiados bajo las normas éticas de la Fundación Legado Vivo.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              No se ha vinculado un contrato de consentimiento formal para este expediente.
            </div>
          )}
        </div>
      )}

      {/* Modal: Visor de Fuente Primaria Inmutable */}
      {modalFuente && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-lg shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-800" />
                <h3 className="font-bold font-serif text-slate-900 text-lg">
                  Fuente Primaria Inmutable: {modalFuente.cita}
                </h3>
              </div>
              <button
                onClick={() => setModalFuente(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block font-mono">Título del Testimonio:</span>
                <span className="font-bold text-slate-800 text-sm">{modalFuente.titulo}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-mono">Autor y Fecha Histórica:</span>
                <span className="font-semibold text-slate-800">{modalFuente.autor} • {modalFuente.fecha}</span>
              </div>

              <div>
                <span className="text-slate-700 font-bold block mb-1 font-mono">Contenido Original Verbatim:</span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded font-serif text-sm leading-relaxed text-slate-800 max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {modalFuente.contenido_original || modalFuente.texto_validado}
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded border border-blue-200">
                <span className="font-bold text-blue-900 block font-mono text-[11px] mb-1">
                  Hash SHA-256 Inmutable Certificado:
                </span>
                <div className="font-mono text-slate-700 break-all bg-white p-2 rounded border border-blue-100 text-xs">
                  {modalFuente.archivo_hash_sha256}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalFuente(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded"
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

