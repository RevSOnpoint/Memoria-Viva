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
  AlertCircle,
  FileCheck,
  Sparkles,
  ArrowRight
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
    const raw = `${titulo}-${autor}-${tipo}-${contenidoTexto}-${archivoNombre}`;
    calculateSHA256(raw);
  }, [titulo, autor, tipo, contenidoTexto, archivoNombre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemoria) return;

    // Regla de dominio: comprobar consentimiento
    if (!selectedMemoria.consentimiento?.evidencia_hash) {
      alert('Bloqueado por gobernanza: Esta memoria no cuenta con consentimiento registrado. Diríjase a P03.');
      return;
    }

    setIsSubmitting(true);
    setResultadoAporte(null);
    try {
      const result = await api.createAporte({
        memoria_id: selectedMemoria.id,
        autor: autor || selectedMemoria.titular,
        titulo,
        tipo,
        contenido_original: contenidoTexto,
        archivo_nombre: archivoNombre || `aporte_${tipo}_${Date.now()}.dat`,
        archivo_hash_sha256: liveHash,
        fecha_hecho_historico: fechaHecho
      });

      setResultadoAporte(result);
    } catch (err: any) {
      alert(err.message || 'Error cargando aporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasConsent = !!selectedMemoria?.consentimiento?.evidencia_hash;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado Fiori */}
      <div className="bg-white p-6 rounded-lg border border-sap-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
            <span>Ingesta de Acervo Oral y Documental</span>
            <span>•</span>
            <span>Fundación Legado Vivo</span>
          </div>
          <h1 className="text-2xl font-bold text-sap-text mt-1">P04 Carga de Relatos Testimoniales</h1>
          <p className="text-sm text-sap-textMuted mt-0.5">
            Preservación inmutable con cálculo de hash criptográfico SHA-256 antes del procesamiento asistido por IA.
          </p>
        </div>

        {/* Selector de Memoria */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Destino:</label>
          <select
            value={selectedMemoria?.id || ''}
            onChange={e => handleMemoriaChange(Number(e.target.value))}
            className="h-11 px-3 text-sm font-semibold border border-sap-border rounded bg-white text-slate-800 shadow-sm"
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
        <div className="p-5 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Bloqueo Ético y Legal de Procesamiento</h4>
              <p className="text-xs text-red-700 mt-1">
                El expediente de <strong>{selectedMemoria.titular}</strong> no cuenta con consentimiento informado acreditado.
                Las reglas del dominio prohíben estrictamente almacenar y procesar relatos sin respaldo probatorio.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('consentimiento', selectedMemoria.id)}
            className="sap-btn sap-btn-danger text-xs whitespace-nowrap"
          >
            Acreditar en P03
          </button>
        </div>
      )}

      {/* Confirmación de Carga Exitosa */}
      {resultadoAporte && (
        <div className="sap-card p-6 border-l-4 border-l-cyan-600 bg-cyan-50/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-cyan-900 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-cyan-600" />
              <span>Aporte cargado y preprocesado por el simulador de IA</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">
              Estado: Pendiente de Validación
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded border border-cyan-100">
              <span className="text-slate-500 block">Título y Autor:</span>
              <span className="font-bold text-slate-800 text-sm">{resultadoAporte.titulo}</span>
              <span className="text-slate-600 block mt-0.5">Por: {resultadoAporte.autor}</span>
            </div>
            <div className="p-3 bg-white rounded border border-cyan-100">
              <span className="text-slate-500 block">Hash SHA-256 Inmutable:</span>
              <span className="font-mono text-slate-700 break-all">{resultadoAporte.archivo_hash_sha256}</span>
            </div>
          </div>

          {resultadoAporte.procesamiento && (
            <div className="mt-3 p-3.5 bg-white rounded border border-cyan-100 text-xs">
              <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Texto Extraído por IA (Simulado):</span>
              </div>
              <p className="text-slate-600 italic">
                "{resultadoAporte.procesamiento.texto_extraido}"
              </p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-cyan-200 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Paso siguiente: El Gestor de datos debe revisar y validar este aporte en P05.
            </span>
            <button
              onClick={() => onNavigate('validacion', selectedMemoria?.id)}
              className="sap-btn sap-btn-primary text-xs flex items-center gap-1"
            >
              <span>Ir a Revisión y Validación (P05)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Formulario Principal de Carga */}
      <div className="sap-card p-6">
        {/* Selector de Tipo de Aporte (Pills Fiori Mobile-First) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sap-border mb-6 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('texto')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 transition ${
                tipo === 'texto'
                  ? 'bg-sap-blue text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relato en Texto</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('audio')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 transition ${
                tipo === 'audio'
                  ? 'bg-sap-blue text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Grabación de Audio</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('foto')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 transition ${
                tipo === 'foto'
                  ? 'bg-sap-blue text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Fotografía Histórica</span>
            </button>
          </div>

          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Plantillas de demostración en Palmares
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Título Descriptivo del Aporte *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Las carretas y la molienda de dulce en Zaragoza"
                className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Autor o Narrador del Testimonio *
              </label>
              <input
                type="text"
                required
                value={autor}
                onChange={e => setAutor(e.target.value)}
                placeholder="Nombre del informante"
                className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha o Época del Hecho Histórico
              </label>
              <input
                type="text"
                value={fechaHecho}
                onChange={e => setFechaHecho(e.target.value)}
                placeholder="Ej: Cosecha de 1952 o Años 1950"
                className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre de Archivo Original
              </label>
              <input
                type="text"
                value={archivoNombre}
                onChange={e => setArchivoNombre(e.target.value)}
                placeholder={`archivo_${tipo}.dat`}
                className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {tipo === 'texto'
                ? 'Contenido Textual del Relato (Original Inmutable) *'
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
              className="w-full p-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
            />
          </div>

          {/* Cálculo de Hash Criptográfico Inmutable en Vivo */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <Hash className="w-3.5 h-3.5 text-sap-blue" />
              <span>Garantía de Inmutabilidad SHA-256 (Se almacena de forma inalterable):</span>
            </div>
            <div className="font-mono text-xs text-slate-800 break-all bg-white p-2 rounded border border-slate-300">
              {liveHash}
            </div>
          </div>

          <div className="pt-3 border-t border-sap-border flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !hasConsent}
              className={`sap-btn ${
                hasConsent ? 'sap-btn-primary shadow' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <UploadCloud className="w-5 h-5 mr-2" />
              <span>{isSubmitting ? 'Cargando y Procesando...' : 'Cargar Aporte e Iniciar IA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
