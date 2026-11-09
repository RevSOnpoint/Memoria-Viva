import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria } from '../types';
import { api } from '../services/api';
import {
  UploadCloud,
  FileText,
  Mic,
  Image,
  Hash,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar
} from 'lucide-react';

interface CargaRelatosViewProps {
  onNavigate: (tab: string, memoriaId?: number) => void;
}

export const CargaRelatosView: React.FC<CargaRelatosViewProps> = ({ onNavigate }) => {
  const { activeMemoriaId, setActiveMemoriaId, activeRole } = useAuth();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [selectedMemoria, setSelectedMemoria] = useState<Memoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tipo de relato
  const [tipo, setTipo] = useState<'texto' | 'audio' | 'foto'>('texto');
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [fechaHecho, setFechaHecho] = useState('');
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [archivoNombre, setArchivoNombre] = useState('');
  const [liveHash, setLiveHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultadoAporte, setResultadoAporte] = useState<any | null>(null);

  // Cargar memorias
  useEffect(() => {
    setIsLoading(true);
    api.getMemorias()
      .then(list => {
        setMemorias(list);
        const targetId = activeMemoriaId || (list.length > 0 ? list[0].id : null);
        if (targetId) {
          const m = list.find(x => x.id === targetId) || null;
          setSelectedMemoria(m);
          if (m) setAutor(m.titular);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeMemoriaId, activeRole]);

  // Cambiar memoria seleccionada
  const handleMemoriaChange = (id: number) => {
    setActiveMemoriaId(id);
    const m = memorias.find(x => x.id === id) || null;
    setSelectedMemoria(m);
    if (m) setAutor(m.titular);
  };

  // Plantillas de ejemplo para demostración rápida en Palmares
  const applyPreset = (presetType: 'texto' | 'audio' | 'foto') => {
    setTipo(presetType);
    if (!selectedMemoria) return;

    if (presetType === 'texto') {
      setTitulo(`Vivencias agrícolas en ${selectedMemoria.lugar_origen}`);
      setFechaHecho('Cosecha de 1956');
      setArchivoNombre('relato_agricola_1956.txt');
      setContenidoTexto(
        `En las tierras altas de Palmares sembrábamos frijol y café. Cuando caían las aguas de mayo, ` +
        `todos los peones de la zona nos reuníamos en la pulpería para coordinar los jornales. Nadie faltaba a su palabra.`
      );
    } else if (presetType === 'audio') {
      setTitulo(`Audio testimonial: Costumbres de trapiche y carretas`);
      setFechaHecho('Mayo de 1958');
      setArchivoNombre('audio_trapiche_zaragoza.mp3');
      setContenidoTexto(
        `Grabación sonora testimonial de 4 minutos sobre la preparación del atado de dulce y las rutas de bueyes ` +
        `hacia los mercados de Palmares y San Ramón.`
      );
    } else {
      setTitulo(`Fotografía histórica: Fiesta patronal frente al templo parroquial`);
      setFechaHecho('Septiembre de 1950');
      setArchivoNombre('foto_templo_mercedes_1950.jpg');
      setContenidoTexto(
        `Placa fotográfica en blanco y negro mostrando a las familias reunidas en el atrio parroquial ` +
        `de Nuestra Señora de las Mercedes en Palmares durante la celebración de las fiestas patronales.`
      );
    }
  };

  // Cálculo en vivo de SHA-256 inmutable
  useEffect(() => {
    async function calculateSHA256(str: string) {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setLiveHash(hashHex);
    }
    calculateSHA256(`${titulo}-${autor}-${contenidoTexto}`);
  }, [titulo, autor, contenidoTexto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemoria) return;

    setIsSubmitting(true);
    try {
      const res = await api.createAporte({
        memoria_id: selectedMemoria.id,
        tipo,
        titulo,
        autor,
        fecha_hecho_historico: fechaHecho || undefined,
        contenido_original: contenidoTexto,
        archivo_nombre: archivoNombre || `${tipo}_testimonio.dat`,
        archivo_hash_sha256: liveHash
      });

      setResultadoAporte(res);
      setTitulo('');
      setContenidoTexto('');
    } catch (err: any) {
      alert(err.message || 'Error al cargar el relato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasConsent = !!selectedMemoria?.consentimiento?.evidencia_hash;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encabezado Institucional Cálido */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
            <Building2 className="w-4 h-4" />
            <span>Departamento de Digitalización & Ingesta Patrimonial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1.5">
            Carga de Relatos & Testimonios Orales
          </h1>
          <p className="text-sm sm:text-base text-[#344a43] mt-1 leading-relaxed">
            Registro cuidadoso y verificación del material original antes del procesamiento asistido.
          </p>
        </div>

        {/* Selector de Memoria */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <label className="text-xs font-bold text-[#344a43] uppercase font-serif">Expediente Destino:</label>
          <select
            value={selectedMemoria?.id || ''}
            onChange={e => handleMemoriaChange(Number(e.target.value))}
            className="min-h-[48px] px-3.5 text-sm font-semibold border border-[#d5ddd6] rounded bg-white text-[#1d2b28] shadow-2xs"
          >
            {memorias.map(m => (
              <option key={m.id} value={m.id}>
                #{m.id} - {m.titular} ({m.alias || m.lugar_origen})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta de Consentimiento Obligatorio */}
      {selectedMemoria && !hasConsent && (
        <div className="p-5 bg-[#f9efed] border border-[#e7cbc5] text-[#a34a3d] rounded flex flex-col sm:flex-row items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-[#a34a3d] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold font-serif text-base text-[#a34a3d]">Bloqueo Ético de Procesamiento</h4>
              <p className="text-xs sm:text-sm text-[#853c31] mt-1 leading-relaxed">
                El expediente de <strong>{selectedMemoria.titular}</strong> no cuenta con contrato de consentimiento informado acreditado.
                Nuestros principios éticos prohíben estrictamente almacenar y procesar relatos sin respaldo de fe jurada.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('registro_contrato')}
            className="btn-secondary text-xs sm:text-sm whitespace-nowrap self-end sm:self-center"
          >
            Formalizar Contrato
          </button>
        </div>
      )}

      {/* Confirmación de Carga Exitosa */}
      {resultadoAporte && (
        <div className="bg-white p-6 rounded border-2 border-[#2c6e4f] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#2c6e4f] font-bold font-serif text-lg">
            <CheckCircle2 className="w-6 h-6 text-[#2c6e4f]" />
            <span>Aporte cargado y preprocesado por el simulador asistido</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-[#fafaf7] rounded border border-[#dde3dc]">
              <span className="text-[#5a6b64] block font-serif">Título y Autor:</span>
              <span className="font-bold text-[#1d2b28] text-sm">{resultadoAporte.titulo}</span>
              <span className="text-[#344a43] block mt-0.5">Por: {resultadoAporte.autor}</span>
            </div>
            <div className="p-3 bg-[#fafaf7] rounded border border-[#dde3dc]">
              <span className="text-[#5a6b64] block font-serif">Código de verificación:</span>
              <span className="font-mono text-[#1d2b28] break-all">{resultadoAporte.archivo_hash_sha256}</span>
            </div>
          </div>

          {resultadoAporte.procesamiento && (
            <div className="p-4 bg-[#fafaf7] rounded border border-[#dde3dc] text-xs sm:text-sm">
              <div className="font-bold text-[#344a43] font-serif flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-[#2f5d50]" />
                <span>Texto Extraído para Curaduría:</span>
              </div>
              <p className="text-[#1d2b28] italic leading-relaxed">
                "{resultadoAporte.procesamiento.texto_extraido}"
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#dde3dc] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#5a6b64]">
              Paso siguiente: El Gestor de Datos revisará y validará este testimonio en la Mesa de Curaduría.
            </span>
            <button
              onClick={() => onNavigate('validacion', selectedMemoria?.id)}
              className="btn-primary text-xs sm:text-sm w-full sm:w-auto"
            >
              <span>Ir a Mesa de Curaduría</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* Formulario Principal de Carga */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs space-y-5">
        {/* Selector de Tipo de Aporte */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eef1eb] gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('texto')}
              className={`min-h-[44px] px-4 rounded text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                tipo === 'texto'
                  ? 'bg-[#2f5d50] text-white shadow-xs'
                  : 'bg-[#fafaf7] text-[#344a43] hover:bg-[#eef1eb] border border-[#d5ddd6]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relato en Texto</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('audio')}
              className={`min-h-[44px] px-4 rounded text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                tipo === 'audio'
                  ? 'bg-[#2f5d50] text-white shadow-xs'
                  : 'bg-[#fafaf7] text-[#344a43] hover:bg-[#eef1eb] border border-[#d5ddd6]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Grabación de Audio</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('foto')}
              className={`min-h-[44px] px-4 rounded text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                tipo === 'foto'
                  ? 'bg-[#2f5d50] text-white shadow-xs'
                  : 'bg-[#fafaf7] text-[#344a43] hover:bg-[#eef1eb] border border-[#d5ddd6]'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Fotografía Histórica</span>
            </button>
          </div>

          <span className="text-xs text-[#4f6b62] font-serif font-bold">
            Plantillas de testimonios locales
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                Título Descriptivo del Aporte *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Las carretas y la molienda de dulce en Zaragoza"
                className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                Autor o Narrador del Testimonio *
              </label>
              <input
                type="text"
                required
                value={autor}
                onChange={e => setAutor(e.target.value)}
                placeholder="Nombre del informante"
                className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                Fecha o Época del Hecho Histórico
              </label>
              <input
                type="text"
                value={fechaHecho}
                onChange={e => setFechaHecho(e.target.value)}
                placeholder="Ej: Cosecha de 1952 o Años 1950"
                className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                Nombre de Archivo Original
              </label>
              <input
                type="text"
                value={archivoNombre}
                onChange={e => setArchivoNombre(e.target.value)}
                placeholder={`archivo_${tipo}.dat`}
                className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
              {tipo === 'texto'
                ? 'Contenido Textual del Relato (Original) *'
                : tipo === 'audio'
                ? 'Transcripción o Notas del Registro Sonoro Original *'
                : 'Descripción y Procedencia del Documento Visual Fotográfico *'}
            </label>
            <textarea
              required
              rows={5}
              value={contenidoTexto}
              onChange={e => setContenidoTexto(e.target.value)}
              placeholder="Escriba el testimonio o relato tal como fue narrado originalmente sin alteraciones..."
              className="w-full p-3.5 border border-[#d5ddd6] rounded text-sm text-[#1d2b28] focus:border-[#2f5d50]"
            />
          </div>

          {/* Código de verificación en vivo */}
          <div className="p-4 bg-[#fafaf7] rounded border border-[#d5ddd6] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold font-serif text-[#344a43] uppercase tracking-wider">
              <Hash className="w-4 h-4 text-[#2f5d50]" />
              <span>Código de verificación del relato:</span>
            </div>
            <div className="font-mono text-xs text-[#1d2b28] break-all bg-white p-3 rounded border border-[#dde3dc]">
              {liveHash}
            </div>
          </div>

          <div className="pt-3 border-t border-[#eef1eb] flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !hasConsent}
              className="btn-primary"
            >
              <UploadCloud className="w-5 h-5 mr-2" />
              <span>{isSubmitting ? 'Cargando y Procesando...' : 'Cargar Aporte para Curaduría'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
