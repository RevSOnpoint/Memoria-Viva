import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, Aporte, FuenteCita, NarratorVoiceConfig } from '../types';
import { api } from '../services/api';
import { SafeImage } from '../components/SafeImage';
import { getPortrait } from '../data/portraits';
import { getRegionForPlace } from '../data/regions';
import {
  loadSpanishVoices,
  loadVoicePreference,
  pickBestSpanishVoice,
  saveVoicePreference,
  speakNarrator,
  cancelNarration
} from '../utils/narratorVoice';
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
  SlidersHorizontal,
  RotateCcw,
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
  const [activeTab, setActiveTab] = useState<'vivencias' | 'narrador' | 'contrato'>('vivencias');
  const [isLoading, setIsLoading] = useState(true);

  // Estados del Narrador de memoria
  const [inputPregunta, setInputPregunta] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [modalFuente, setModalFuente] = useState<FuenteCita | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState<NarratorVoiceConfig | null>(null);
  const [vocesDisponibles, setVocesDisponibles] = useState<SpeechSynthesisVoice[]>([]);
  const [vozSeleccionada, setVozSeleccionada] = useState<string>(
    () => loadVoicePreference()?.voiceURI || ''
  );
  const [velocidadVoz, setVelocidadVoz] = useState<number>(
    () => loadVoicePreference()?.rate || 0
  );
  const [mostrarAjustesVoz, setMostrarAjustesVoz] = useState(false);

  useEffect(() => {
    let active = true;
    loadSpanishVoices().then(voices => {
      if (active) setVocesDisponibles(voices);
    });

    return () => {
      active = false;
      cancelNarration();
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setVoiceConfig(null);
    setMostrarAjustesVoz(false);
    cancelNarration();
    setIsSpeaking(false);
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
              `Le doy la bienvenida a la memoria de ${titular}${alias}. ` +
              `Soy la voz de inteligencia artificial que la acompaña y conversa con usted a partir de sus relatos validados. ` +
              `Puede preguntarme con confianza por su niñez, su familia, su oficio o las tradiciones de su comunidad. ` +
              `Si algo no quedó registrado, se lo diré con toda sinceridad, sin inventar.`,
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

      if (res.voice_config) setVoiceConfig(res.voice_config);

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

  const tasaVozEfectiva = velocidadVoz > 0 ? velocidadVoz : voiceConfig?.rate || 0.88;
  const vozActiva =
    vocesDisponibles.find(voz => voz.voiceURI === vozSeleccionada) ||
    pickBestSpanishVoice(vocesDisponibles, voiceConfig);

  const guardarPreferenciaVoz = (voiceURI: string, rate: number) => {
    saveVoicePreference({ voiceURI, rate });
  };

  const cambiarVoz = (voiceURI: string) => {
    setVozSeleccionada(voiceURI);
    guardarPreferenciaVoz(voiceURI, velocidadVoz);
  };

  const cambiarVelocidadVoz = (rate: number) => {
    setVelocidadVoz(rate);
    guardarPreferenciaVoz(vozSeleccionada, rate);
  };

  const restablecerVoz = () => {
    setVozSeleccionada('');
    setVelocidadVoz(0);
    saveVoicePreference({ voiceURI: '', rate: 0 });
  };

  const hablar = (texto: string) => {
    if (isSpeaking) {
      cancelNarration();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const started = speakNarrator(texto, {
      config: voiceConfig,
      preferredVoiceURI: vozSeleccionada || undefined,
      rate: velocidadVoz || undefined,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });

    if (!started) setIsSpeaking(false);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const hasConsent = !!memoria?.consentimiento?.evidencia_hash;
  const portraitImg = getPortrait(memoria?.titular, memoria?.alias);
  const region = memoria ? getRegionForPlace(memoria.lugar_origen) : undefined;

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
        `¿Cuáles son sus primeros recuerdos en ${region?.nombre || 'su comunidad'}?`,
        '¿Cómo era el trabajo comunitario tradicional?',
        '¿Qué oficio o tradición aprendió de su familia?'
      ];

  if (isLoading) {
    return (
      <div className="bg-white p-12 text-center text-[#6b7c75] rounded border border-[#dde3dc]">
        <div className="animate-spin w-8 h-8 border-4 border-[#2f5d50] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium">Abriendo expediente patrimonial...</p>
      </div>
    );
  }

  if (!memoria) {
    return (
      <div className="bg-white p-8 text-center text-[#1d2b28] rounded border border-[#dde3dc]">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-bold text-[#2f5d50] hover:text-[#254a40] transition self-start"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al archivo</span>
        </button>

        <span className="text-[#7a8b84]">
          Expediente histórico #{memoria.id}
        </span>
      </div>

      {/* Ficha Principal de la Persona (Retrato Real y Semblanza Cálida) */}
      <div className="bg-white border border-[#d5ddd6] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Fotografía de época real */}
          <div className="w-28 h-36 sm:w-32 sm:h-40 rounded overflow-hidden border-2 border-[#4f6b62] shadow-xs flex-shrink-0 bg-[#eef1eb]">
            <SafeImage
              src={portraitImg}
              alt={memoria.titular}
              className="w-full h-full object-cover sepia-[0.15] contrast-105"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[#7a8b84]">
                {memoria.lugar_origen}
              </span>

              {hasConsent ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2c6e4f]">
                  <ShieldCheck className="w-4 h-4 text-[#2c6e4f]" />
                  <span>Consentimiento firmado</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#a34a3d]">
                  <ShieldAlert className="w-4 h-4 text-[#a34a3d]" />
                  <span>Sin consentimiento registrado</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] leading-snug">
              {memoria.titular}
            </h1>

            {memoria.alias && (
              <div className="text-sm font-semibold text-[#2f5d50] mt-0.5">
                "{memoria.alias}"
              </div>
            )}

            {memoria.fecha_nacimiento && (
              <div className="text-xs text-[#6b7c75] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7a8b84]" />
                <span>Nacido en: {memoria.fecha_nacimiento}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#344a43] leading-relaxed mt-3.5 font-sans">
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
      <div className="border-b border-[#d5ddd6] flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('vivencias')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vivencias'
              ? 'border-[#2f5d50] text-[#2f5d50] font-bold'
              : 'border-transparent text-[#5a6b64] hover:text-[#1d2b28]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Vivencias & Testimonios ({aportes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('narrador')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'narrador'
              ? 'border-[#2f5d50] text-[#2f5d50] font-bold'
              : 'border-transparent text-[#5a6b64] hover:text-[#1d2b28]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Consultar al Narrador de la Memoria</span>
        </button>

        <button
          onClick={() => setActiveTab('contrato')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contrato'
              ? 'border-[#2f5d50] text-[#2f5d50] font-bold'
              : 'border-transparent text-[#5a6b64] hover:text-[#1d2b28]'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>Contrato de Consentimiento Legal</span>
        </button>
      </div>

      {/* PESTAÑA 1: VIVENCIAS Y APORTES ORIGINALES (CON FOTOGRAFÍAS DE ÉPOCA) */}
      {activeTab === 'vivencias' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-[#6b7c75]">
            <span>Relatos orales y documentales en custodia</span>
            <span>Total: {aportes.length} testimonios</span>
          </div>

          {aportes.length === 0 ? (
            <div className="bg-white p-12 text-center text-[#6b7c75] rounded border border-[#dde3dc]">
              <BookOpen className="w-10 h-10 text-[#bac6bf] mx-auto mb-2" />
              <p className="text-sm">Aún no se han registrado aportes para este expediente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {aportes.map(aporte => {
                const isValidated = aporte.estado === 'validado';
                const displayText = aporte.procesamiento?.version_validada || aporte.contenido_original || '';

                // Imagen evocadora de la región según el tipo de aporte
                const ilustracion = aporte.tipo === 'foto'
                  ? region?.imagen || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=700&q=80'
                  : aporte.tipo === 'audio'
                  ? 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=700&q=80'
                  : null;

                return (
                  <div
                    key={aporte.id}
                    className="bg-white p-6 rounded border border-[#d5ddd6] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e9ede6]">
                      <div className="flex items-center space-x-2.5">
                        {aporte.tipo === 'texto' && <FileText className="w-5 h-5 text-[#7a8b84]" />}
                        {aporte.tipo === 'audio' && <Mic className="w-5 h-5 text-[#2f5d50]" />}
                        {aporte.tipo === 'foto' && <ImageIcon className="w-5 h-5 text-[#4f6b62]" />}
                        <h4 className="font-bold font-serif text-[#1d2b28] text-base sm:text-lg">
                          {aporte.titulo}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        {isValidated ? (
                          <span className="font-semibold text-[#2c6e4f]">
                            ✓ Validado por Curaduría
                          </span>
                        ) : (
                          <span className="font-semibold text-[#2f5d50]">
                            En proceso de revisión
                          </span>
                        )}
                        <span>•</span>
                        <span className="capitalize text-[#6b7c75] font-medium">
                          {aporte.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#6b7c75] flex items-center gap-3">
                      <span>Por: <strong>{aporte.autor}</strong></span>
                      {aporte.fecha_hecho_historico && (
                        <span>• Época: {aporte.fecha_hecho_historico}</span>
                      )}
                    </div>

                    {/* Contenido con imagen si aplica */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {ilustracion && (
                        <div className="md:col-span-4 rounded overflow-hidden border border-[#d5ddd6] h-44 bg-[#eef1eb]">
                          <SafeImage
                            src={ilustracion}
                            alt={aporte.titulo}
                            className="w-full h-full object-cover sepia-[0.1]"
                          />
                        </div>
                      )}

                      <div className={`${ilustracion ? 'md:col-span-8' : 'md:col-span-12'} p-4 bg-[#fbfbf8] border border-[#e9ede6] rounded font-serif text-xs sm:text-sm text-[#1d2b28] leading-relaxed italic`}>
                        "{displayText}"
                      </div>
                    </div>

                    {/* Código de verificación del aporte */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#6b7c75]">
                      <div className="truncate max-w-md">
                        <span className="font-bold">Código de verificación: </span>
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
            <div className="p-5 bg-[#f9efed] border border-[#e7cbc5] text-[#a34a3d] rounded flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#a34a3d] flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong>Atención:</strong> El narrador de la memoria no puede activarse porque este expediente no cuenta con un consentimiento formal firmado.
              </div>
            </div>
          ) : (
            <div className="bg-white rounded border border-[#d5ddd6] shadow-xs overflow-hidden flex flex-col h-[600px]">
              {/* Cabecera del Narrador */}
              <div className="p-4 bg-[#1f352f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#344a43]">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded bg-[#2f5d50] text-white flex items-center justify-center font-bold flex-shrink-0">
                    <Bot className="w-5 h-5 text-[#f2f5f0]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base font-serif truncate">
                      Voz Testimonial de {memoria.titular}
                    </div>
                    <div className="text-xs text-[#c7d3cd]">
                      {voiceConfig?.profile_label ? `${voiceConfig.profile_label} · ` : ''}
                      Respuestas basadas en los relatos validados de esta persona
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                  {isSpeaking ? (
                    <button
                      onClick={() => {
                        cancelNarration();
                        setIsSpeaking(false);
                      }}
                      className="px-3 py-1.5 rounded bg-[#a34a3d] text-white text-xs font-bold flex items-center gap-1"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>Detener voz</span>
                    </button>
                  ) : (
                    <div className="text-xs text-[#c7d3cd] flex items-center gap-1">
                      <Volume2 className="w-4 h-4 text-[#a8c5b8]" />
                      <span className="hidden md:inline">
                        {vozActiva ? `Voz: ${vozActiva.name}` : 'Voz automática'}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setMostrarAjustesVoz(prev => !prev)}
                    className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1 transition ${
                      mostrarAjustesVoz
                        ? 'bg-[#eef1eb] text-[#1f352f] border-[#eef1eb]'
                        : 'border-[#5a7a6f] text-[#dde6e0] hover:bg-white/10'
                    }`}
                    aria-expanded={mostrarAjustesVoz}
                    aria-controls="ajustes-voz-narrador"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Ajustes de voz</span>
                  </button>
                </div>
              </div>

              {mostrarAjustesVoz && (
                <div id="ajustes-voz-narrador" className="px-4 py-4 bg-[#eef1eb] border-b border-[#d5ddd6] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#2f5d50]">
                        Voz del narrador
                      </div>
                      <p className="text-xs text-[#5a6b64] mt-1 leading-relaxed">
                        {voiceConfig?.style ||
                          'Elija una voz y un ritmo cómodos para escuchar los relatos.'}
                      </p>
                    </div>
                    <button
                      onClick={restablecerVoz}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#aebbb3] bg-white text-[11px] font-semibold text-[#344a43] hover:bg-[#f7f7f3] transition whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restablecer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-[11px] font-semibold text-[#344a43] mb-1">
                        Voz
                      </span>
                      <select
                        value={vozSeleccionada}
                        onChange={event => cambiarVoz(event.target.value)}
                        className="w-full min-h-[42px] px-3 rounded border border-[#aebbb3] bg-white text-xs text-[#1d2b28]"
                      >
                        <option value="">Automática (recomendada)</option>
                        {vocesDisponibles.map(voz => (
                          <option key={voz.voiceURI} value={voz.voiceURI}>
                            {voz.name} · {voz.lang}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-[11px] font-semibold text-[#344a43] mb-1">
                        Ritmo de lectura · {Math.round(tasaVozEfectiva * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.7"
                        max="1.15"
                        step="0.05"
                        value={tasaVozEfectiva}
                        onChange={event => cambiarVelocidadVoz(Number(event.target.value))}
                        className="w-full h-10 accent-[#2f5d50]"
                        aria-label="Ritmo de lectura de la voz"
                      />
                    </label>
                  </div>

                  {vocesDisponibles.length === 0 && (
                    <p className="text-[11px] text-[#5a6b64]">
                      El navegador no ha expuesto voces en español. Se usará la voz predeterminada del sistema.
                    </p>
                  )}

                  <p className="text-[11px] text-[#5a6b64] leading-relaxed">
                    La lectura es sintética y sirve de apoyo. El testimonio original y su fuente primaria
                    siempre prevalecen.
                  </p>
                </div>
              )}

              {/* Flujo de mensajes con estilo cálido y legible */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#f7f7f3]">
                {mensajes.map(m => {
                  const isUser = m.sender === 'usuario';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[11px] text-[#6b7c75] mb-1 px-1">
                        {isUser ? 'Pregunta' : 'Respuesta testimonial'} • {m.hora}
                      </div>

                      <div
                        className={`p-4 rounded max-w-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-[#2f5d50] text-white'
                            : 'bg-white text-[#1d2b28] border border-[#d5ddd6]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.texto}</p>

                        {/* Cita de fuente primaria en tono editorial */}
                        {!isUser && m.fuentes && m.fuentes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#e9ede6] space-y-2">
                            <span className="text-xs font-bold text-[#344a43] block font-serif">
                              Fuente primaria consultada:
                            </span>
                            {m.fuentes.map((f, i) => (
                              <div
                                key={i}
                                className="p-3 bg-[#fbfbf8] rounded border border-[#dde3dc] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="text-xs font-bold text-[#1d2b28]">
                                    {f.cita}
                                  </div>
                                  <div className="text-xs text-[#4f625b]">
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
                              className="text-xs text-[#4f6b62] hover:text-[#2f5d50] flex items-center gap-1 font-semibold"
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
                  <div className="flex items-center space-x-2 text-xs text-[#6b7c75] bg-white p-3 rounded border border-[#d5ddd6] w-fit">
                    <div className="animate-spin w-4 h-4 border-2 border-[#2f5d50] border-t-transparent rounded-full" />
                    <span>Consultando los testimonios de {memoria.titular}...</span>
                  </div>
                )}
              </div>

              {/* Preguntas sugeridas */}
              <div className="px-4 py-2.5 bg-[#eef1eb] border-t border-[#d5ddd6] flex items-center overflow-x-auto gap-2 scrollbar-none text-xs flex-nowrap">
                <span className="text-[#5a6b64] font-semibold text-xs flex-shrink-0 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#2f5d50]" />
                  <span>Sugerencias:</span>
                </span>
                {sugerencias.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handlePreguntar(sug)}
                    disabled={isNarrating}
                    className="px-3 py-1.5 rounded bg-white hover:bg-[#e9ede6] text-[#1d2b28] border border-[#d5ddd6] text-xs whitespace-nowrap transition disabled:opacity-50"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Barra de entrada accesible */}
              <div className="p-3.5 bg-white border-t border-[#d5ddd6]">
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
                    className="flex-1 h-12 px-4 text-xs sm:text-sm border border-[#d5ddd6] rounded focus:border-[#2f5d50] focus:ring-1 focus:ring-[#2f5d50]"
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
        <div className="bg-white rounded border border-[#d5ddd6] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e9ede6] gap-2">
            <div>
              <div className="text-xs font-semibold uppercase text-[#7a8b84]">
                Documento Notarial y Ético
              </div>
              <h3 className="text-xl font-bold font-serif text-[#1d2b28]">
                Contrato de Consentimiento Informado & Custodia Histórica
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#eef6f0] text-[#2c6e4f] text-xs font-bold border border-[#c4ded0]">
              <ShieldCheck className="w-4 h-4 text-[#2c6e4f]" />
              <span>Contrato Acreditado</span>
            </div>
          </div>

          {memoria.consentimiento ? (
            <div className="space-y-4 text-xs sm:text-sm text-[#1d2b28]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#fbfbf8] rounded border border-[#e9ede6]">
                  <span className="text-[#7a8b84] block text-xs">Modalidad:</span>
                  <strong className="text-sm font-serif">{memoria.consentimiento.modalidad}</strong>
                </div>
                <div className="p-3 bg-[#fbfbf8] rounded border border-[#e9ede6]">
                  <span className="text-[#7a8b84] block text-xs">Fecha del Acuerdo:</span>
                  <strong className="text-sm font-serif">{memoria.consentimiento.fecha_otorgamiento}</strong>
                </div>
                <div className="p-3 bg-[#fbfbf8] rounded border border-[#e9ede6]">
                  <span className="text-[#7a8b84] block text-xs">Vigencia:</span>
                  <strong className="text-sm font-serif">{memoria.consentimiento.vigencia}</strong>
                </div>
              </div>

              <div className="p-4 bg-[#fbfbf8] rounded border border-[#e9ede6] space-y-2 font-serif leading-relaxed">
                <strong className="block text-xs uppercase font-sans text-[#6b7c75]">
                  Cláusula de Autorización y Transmisión Cultural:
                </strong>
                <p>{memoria.consentimiento.alcance}</p>
                {memoria.consentimiento.notas && (
                  <p className="text-xs text-[#6b7c75] pt-2 border-t border-[#e9ede6]">
                    Evidencia física: {memoria.consentimiento.notas}
                  </p>
                )}
              </div>

              {/* Código de verificación del contrato */}
              <div className="p-4 bg-[#f4f6f2] rounded border border-[#e4e9e2]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1f3f36] text-xs flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-[#2f5d50]" />
                    <span>Código de verificación del contrato:</span>
                  </span>
                  <button
                    onClick={() => copyHash(memoria.consentimiento?.evidencia_hash || '')}
                    className="text-xs font-bold text-[#2f5d50] hover:underline flex items-center gap-1"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copiado' : 'Copiar código'}</span>
                  </button>
                </div>
                <div className="font-mono text-[#344a43] break-all bg-white p-2.5 rounded border border-[#e2e8e1] text-xs">
                  {memoria.consentimiento.evidencia_hash}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#f9efed] text-[#a34a3d] text-xs rounded border border-[#e7cbc5]">
              No se ha registrado contrato formal para este expediente.
            </div>
          )}
        </div>
      )}

      {/* Modal: Visor de Fuente Primaria */}
      {modalFuente && (
        <div className="fixed inset-0 z-50 bg-[#1f352f]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded border border-[#4f6b62] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e9ede6]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#2f5d50]" />
                <h3 className="font-bold font-serif text-[#1d2b28] text-lg">
                  Fuente Primaria: {modalFuente.cita}
                </h3>
              </div>
              <button
                onClick={() => setModalFuente(null)}
                className="p-1 rounded text-[#6b7c75] hover:text-[#1d2b28]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#1d2b28]">
              <div>
                <span className="text-[#7a8b84] block text-xs">Título del Relato:</span>
                <strong className="text-sm font-serif">{modalFuente.titulo}</strong>
              </div>

              <div>
                <span className="text-[#7a8b84] block text-xs">Autor y Época:</span>
                <span>{modalFuente.autor} • {modalFuente.fecha}</span>
              </div>

              <div>
                <span className="text-[#7a8b84] block text-xs mb-1">Texto Original en Custodia:</span>
                <div className="p-4 bg-[#fbfbf8] border border-[#e9ede6] rounded font-serif text-sm leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap italic">
                  {modalFuente.contenido_original || modalFuente.texto_validado}
                </div>
              </div>

              <div className="p-3 bg-[#f4f6f2] rounded border border-[#e4e9e2]">
                <span className="font-bold text-[#1f3f36] block text-xs mb-1">
                  Código de verificación del original:
                </span>
                <div className="font-mono text-[#344a43] break-all bg-white p-2 rounded border border-[#e2e8e1] text-xs">
                  {modalFuente.archivo_hash_sha256}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#e9ede6] flex justify-end">
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
