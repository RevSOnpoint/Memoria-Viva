import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, FuenteCita } from '../types';
import { api } from '../services/api';
import {
  Bot,
  Volume2,
  VolumeX,
  Send,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Sparkles,
  BookOpen,
  HelpCircle,
  X,
  FileText
} from 'lucide-react';

interface NarradorViewProps {
  onNavigate: (tab: string, memoriaId?: number) => void;
}

interface MensajeChat {
  id: string;
  sender: 'usuario' | 'ia';
  texto: string;
  fuentes?: FuenteCita[];
  encontrado?: boolean;
  hora: string;
}

export const NarradorView: React.FC<NarradorViewProps> = ({ onNavigate }) => {
  const { activeMemoriaId, setActiveMemoriaId, activeRole } = useAuth();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [selectedMemoria, setSelectedMemoria] = useState<Memoria | null>(null);
  const [inputPregunta, setInputPregunta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [modalFuente, setModalFuente] = useState<FuenteCita | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cargar memorias
  useEffect(() => {
    api.getMemorias()
      .then(list => {
        setMemorias(list);
        const targetId = activeMemoriaId || (list.length > 0 ? list[0].id : null);
        if (targetId) {
          const m = list.find(x => x.id === targetId) || null;
          setSelectedMemoria(m);
        }
      })
      .catch(console.error);
  }, [activeMemoriaId, activeRole]);

  // Mensaje de bienvenida inicial al cambiar de memoria
  useEffect(() => {
    if (selectedMemoria) {
      const titular = selectedMemoria.titular;
      const alias = selectedMemoria.alias ? ` (${selectedMemoria.alias})` : '';
      setMensajes([
        {
          id: 'welcome',
          sender: 'ia',
          texto:
            `Soy el asistente de inteligencia artificial de Memoria Viva para la memoria de ${titular}${alias}. ` +
            `Mis respuestas se basan estrictamente en los testimonios validados en su base de conocimiento. ` +
            `Si no cuento con información suficiente, se lo indicaré con total honestidad sin inventar.`,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedMemoria?.id]);

  const handleMemoriaChange = (id: number) => {
    setActiveMemoriaId(id);
    const m = memorias.find(x => x.id === id) || null;
    setSelectedMemoria(m);
  };

  const handleEnviarPregunta = async (preguntaTexto?: string) => {
    const q = (preguntaTexto || inputPregunta).trim();
    if (!q || !selectedMemoria || isLoading) return;

    const userMsg: MensajeChat = {
      id: `user-${Date.now()}`,
      sender: 'usuario',
      texto: q,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes(prev => [...prev, userMsg]);
    setInputPregunta('');
    setIsLoading(true);

    try {
      const res = await api.preguntarNarrador(selectedMemoria.id, q);

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
      const errorMsg: MensajeChat = {
        id: `err-${Date.now()}`,
        sender: 'ia',
        texto: `Aviso del sistema: ${err.message || 'No fue posible consultar al narrador.'}`,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMensajes(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Síntesis de voz del navegador (Web Speech API)
  const hablarTexto = (texto: string) => {
    if (!('speechSynthesis' in window)) {
      alert('La síntesis de voz no está disponible en este navegador.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = texto.replace(/\[Aporte.*?\]/g, '').replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-CR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const detenerVoz = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const hasConsent = !!selectedMemoria?.consentimiento?.evidencia_hash;

  const sugerencias = selectedMemoria?.alias === 'Don Chepe'
    ? [
        '¿Cómo era el trapiche de bueyes en Zaragoza?',
        '¿Cómo se construyó el Templo de Nuestra Señora de las Mercedes?',
        '¿A qué año viajó a Marte? (Prueba no invención)'
      ]
    : selectedMemoria?.alias === 'Doña Carmen'
    ? [
        '¿Cómo atendía los partos de noche en Rincón de Zaragoza?',
        '¿Qué ocurrió durante el terremoto de 1955 y la olla comunal?',
        '¿Cuál era su postre favorito en París? (Prueba no invención)'
      ]
    : [
        '¿Cuáles son sus principales vivencias en Palmares?',
        '¿Cómo era el trabajo comunitario y las fiestas locales?'
      ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Encabezado Fiori Adaptativo */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-sap-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-teal-800 uppercase tracking-wider">
            <span>Asistente Digital Patrimonial</span>
            <span>•</span>
            <span>IA con Fuentes Primarias</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-sap-text mt-1">P07 Narrador Interactivo</h1>
          <p className="text-xs sm:text-sm text-sap-textMuted mt-0.5">
            Respuestas estrictamente acotadas a la base de conocimiento validada de esta memoria.
          </p>
        </div>

        {/* Selector de Memoria */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase flex-shrink-0">Memoria:</label>
          <select
            value={selectedMemoria?.id || ''}
            onChange={e => handleMemoriaChange(Number(e.target.value))}
            className="h-10 sm:h-11 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold border border-sap-border rounded bg-white text-slate-800 shadow-sm flex-1 md:flex-none"
          >
            {memorias.map(m => (
              <option key={m.id} value={m.id}>
                #{m.id} - {m.titular} ({m.alias || m.lugar_origen})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta si no tiene consentimiento */}
      {selectedMemoria && !hasConsent && (
        <div className="p-3.5 sm:p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
            <span>
              El narrador interactivo no puede activarse en este expediente porque no cuenta con consentimiento legal registrado.
            </span>
          </div>
          <button
            onClick={() => onNavigate('consentimiento', selectedMemoria.id)}
            className="sap-btn sap-btn-danger text-xs self-start sm:self-auto py-1.5 h-auto"
          >
            Acreditar en P03
          </button>
        </div>
      )}

      {/* Contenedor Conversacional SAP Horizon Adaptativo */}
      <div className="sap-card overflow-hidden flex flex-col h-[75vh] min-h-[460px] max-h-[750px] shadow-lg border-t-4 border-t-teal-600">
        {/* Cabecera del chat con indicador de IA */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40 flex-shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <span className="truncate max-w-[150px] sm:max-w-none">
                  {selectedMemoria?.titular || 'Memoria Activa'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-900 text-teal-200 border border-teal-700">
                  IA Oficial
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                Aportes Validados: {selectedMemoria?.aportes_validados || 0}
              </div>
            </div>
          </div>

          {/* Control de voz */}
          <div>
            {isSpeaking ? (
              <button
                onClick={detenerVoz}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Detener</span>
              </button>
            ) : (
              <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Voz Síntesis</span>
              </div>
            )}
          </div>
        </div>

        {/* Flujo de mensajes con scroll */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {mensajes.map(m => {
            const isUser = m.sender === 'usuario';

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] sm:text-[11px] text-slate-500">
                  <span className="font-semibold">
                    {isUser ? 'Usted' : 'Narrador IA'}
                  </span>
                  <span>•</span>
                  <span>{m.hora}</span>
                </div>

                <div
                  className={`p-3 sm:p-4 rounded-xl max-w-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-sap-blue text-white rounded-br-none'
                      : 'bg-white text-sap-text border border-sap-border rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.texto}</p>

                  {/* Citas y Botón "Ver fuente primaria" */}
                  {!isUser && m.fuentes && m.fuentes.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                        <span>Fuentes Primarias Consultadas:</span>
                      </div>

                      {m.fuentes.map((f, i) => (
                        <div
                          key={i}
                          className="p-2.5 sm:p-3 bg-teal-50/70 rounded-lg border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-[11px] sm:text-xs text-teal-950 font-mono">
                              {f.cita}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-teal-800 truncate max-w-xs">
                              {f.titulo}
                            </div>
                          </div>

                          <button
                            onClick={() => setModalFuente(f)}
                            className="sap-btn sap-btn-primary text-xs py-1.5 px-3 h-auto whitespace-nowrap bg-teal-800 hover:bg-teal-900 border-teal-950 flex items-center justify-center gap-1 shadow-sm self-stretch sm:self-auto"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Ver fuente primaria</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón de reproducción de voz */}
                  {!isUser && (
                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        onClick={() => hablarTexto(m.texto)}
                        className="text-[11px] sm:text-xs font-semibold text-slate-600 hover:text-teal-800 flex items-center gap-1 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar relato</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-lg border border-sap-border w-fit shadow-sm">
              <div className="animate-spin w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
              <span>Consultando testimonios validados...</span>
            </div>
          )}
        </div>

        {/* Píldoras de Preguntas Sugeridas (Scroll horizontal táctil fluido) */}
        <div className="px-3 py-2 bg-slate-100 border-t border-sap-border flex items-center overflow-x-auto gap-2 text-xs scrollbar-none flex-nowrap flex-shrink-0">
          <span className="text-slate-500 font-semibold flex items-center gap-1 flex-shrink-0 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Sugerencias:</span>
          </span>
          {sugerencias.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleEnviarPregunta(sug)}
              disabled={isLoading || !hasConsent}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium transition disabled:opacity-50 flex-shrink-0 text-[11px] sm:text-xs whitespace-nowrap shadow-xs"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Barra de entrada de texto Fiori */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-sap-border flex-shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleEnviarPregunta();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              disabled={!hasConsent || isLoading}
              value={inputPregunta}
              onChange={e => setInputPregunta(e.target.value)}
              placeholder={
                hasConsent
                  ? `Pregúntele al narrador sobre ${selectedMemoria?.alias || 'esta memoria'}...`
                  : 'Requiere consentimiento para consultar.'
              }
              className="flex-1 h-11 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm border border-sap-border rounded focus:border-sap-blue focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={!hasConsent || isLoading || !inputPregunta.trim()}
              className="sap-btn sap-btn-primary px-3 sm:px-4 min-w-[48px] sm:min-w-[110px]"
              aria-label="Enviar pregunta"
            >
              <Send className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Preguntar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Modal / Drawer: "Ver Fuente Primaria" (Mobile Responsive) */}
      {modalFuente && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="sap-card max-w-2xl w-full p-5 sm:p-6 shadow-2xl border-t-4 border-t-teal-700 max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-lg animate-in slide-in-from-bottom sm:zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-sap-border">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-700 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-sap-text truncate">
                  Fuente Primaria: {modalFuente.cita}
                </h3>
              </div>
              <button
                onClick={() => setModalFuente(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Título del Aporte:</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{modalFuente.titulo || 'Testimonio'}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Autor y Fecha Histórica:</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {modalFuente.autor} • {modalFuente.fecha}
                  </span>
                </div>
              </div>

              {/* Contenido original verbatim */}
              <div>
                <span className="text-slate-700 font-bold block mb-1">
                  Texto Original Inalterado en Custodia:
                </span>
                <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded font-serif text-xs sm:text-sm leading-relaxed text-slate-800 max-h-52 overflow-y-auto whitespace-pre-wrap">
                  {modalFuente.contenido_original || modalFuente.texto_validado}
                </div>
              </div>

              {/* Hash SHA-256 */}
              <div className="p-3 bg-blue-50/70 rounded border border-blue-200">
                <div className="flex items-center gap-1 font-bold text-blue-900 mb-1">
                  <Hash className="w-3.5 h-3.5 text-sap-blue flex-shrink-0" />
                  <span>Criptografía SHA-256 Verificada:</span>
                </div>
                <div className="font-mono text-slate-700 break-all bg-white p-2 rounded border border-blue-100 text-[10px] sm:text-xs">
                  {modalFuente.archivo_hash_sha256 || 'Certificado por Fundación Legado Vivo'}
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  Constancia: Este documento se mantiene intacto y su integridad está respaldada por la Fundación Legado Vivo.
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sap-border flex justify-end">
              <button
                type="button"
                onClick={() => setModalFuente(null)}
                className="sap-btn sap-btn-secondary text-xs w-full sm:w-auto"
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
