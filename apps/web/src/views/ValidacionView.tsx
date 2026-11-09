import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AportePendiente } from '../types';
import { api } from '../services/api';
import {
  CheckSquare,
  ShieldCheck,
  Hash,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Mic,
  Image,
  Tag,
  Copy,
  Check,
  Building2,
  Clock,
  Layers
} from 'lucide-react';

interface ValidacionViewProps {
  onNavigate: (tab: string, memoriaId?: number) => void;
}

export const ValidacionView: React.FC<ValidacionViewProps> = ({ onNavigate }) => {
  const { activeRole } = useAuth();
  const [pendientes, setPendientes] = useState<AportePendiente[]>([]);
  const [selectedItem, setSelectedItem] = useState<AportePendiente | null>(null);
  const [curatedText, setCuratedText] = useState('');
  const [notasValidacion, setNotasValidacion] = useState('');
  const [entidadesList, setEntidadesList] = useState<Array<{ nombre: string; tipo: string; fragmento: string }>>([]);
  const [newEntidadNombre, setNewEntidadNombre] = useState('');
  const [newEntidadTipo, setNewEntidadTipo] = useState('Lugar');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Selector de pestaña para móvil (Mobile-First Split View)
  const [mobileActiveTab, setMobileActiveTab] = useState<'original' | 'curacion'>('curacion');

  const loadPendientes = () => {
    setIsLoading(true);
    api.getPendientesValidacion()
      .then(data => {
        setPendientes(data);
        if (data.length > 0) {
          selectItem(data[0]);
        } else {
          setSelectedItem(null);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPendientes();
  }, [activeRole]);

  const selectItem = (item: AportePendiente) => {
    setSelectedItem(item);
    setCuratedText(item.texto_extraido || item.contenido_original || '');
    setNotasValidacion('Cotejado con archivos históricos de Palmares. Datos fidedignos.');
    setEntidadesList(item.entidades_detectadas || []);
    setSuccessMsg(null);
  };

  const handleAprobar = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      await api.aprobarAporte({
        aporte_id: selectedItem.aporte_id,
        estado: 'validado',
        version_validada: curatedText,
        notas_validacion: notasValidacion,
        entidades_aprobadas: entidadesList
      });

      setSuccessMsg(`Aporte #${selectedItem.aporte_id} validado exitosamente e incorporado a la base de conocimiento de ${selectedItem.memoria_titular}.`);
      loadPendientes();
    } catch (err: any) {
      alert(err.message || 'Error al validar aporte');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedItem) return;
    const razon = prompt('Ingrese el motivo del rechazo del aporte:');
    if (!razon) return;

    setIsProcessing(true);
    try {
      await api.rechazarAporte({
        aporte_id: selectedItem.aporte_id,
        estado: 'rechazado',
        version_validada: selectedItem.contenido_original || '',
        notas_validacion: razon
      });

      setSuccessMsg(`Aporte #${selectedItem.aporte_id} rechazado.`);
      loadPendientes();
    } catch (err: any) {
      alert(err.message || 'Error al rechazar aporte');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddEntidad = () => {
    if (!newEntidadNombre.trim()) return;
    setEntidadesList([
      ...entidadesList,
      { nombre: newEntidadNombre.trim(), tipo: newEntidadTipo, fragmento: '' }
    ]);
    setNewEntidadNombre('');
  };

  const handleRemoveEntidad = (index: number) => {
    setEntidadesList(entidadesList.filter((_, i) => i !== index));
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Institucional Cálido */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
            <Building2 className="w-4 h-4" />
            <span>Mesa de Curaduría & Verificación Histórica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1.5">
            Validación Documental (Human-in-the-Loop)
          </h1>
          <p className="text-sm sm:text-base text-[#344a43] mt-1 leading-relaxed">
            Revisión rigurosa de toponimia palmareña, fechas y testimonios antes de alimentar el motor de conocimiento.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-1.5 rounded bg-[#fafaf7] text-[#344a43] border border-[#d5ddd6] text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#2f5d50]" />
            <span>Pendientes: <strong>{pendientes.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Mensaje de Éxito */}
      {successMsg && (
        <div className="p-4 bg-white rounded border-2 border-[#2c6e4f] text-[#2c6e4f] flex items-center gap-3 shadow-2xs text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="bg-white p-12 rounded border border-[#d5ddd6] text-center text-[#5a6b64]">
          <div className="animate-spin w-8 h-8 border-3 border-[#2f5d50] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="font-serif text-base">Cargando cola de curaduría...</p>
        </div>
      ) : pendientes.length === 0 ? (
        <div className="bg-white p-12 rounded border border-[#d5ddd6] text-center text-[#5a6b64]">
          <CheckCircle2 className="w-12 h-12 text-[#2c6e4f] mx-auto mb-3" />
          <h3 className="text-xl font-bold font-serif text-[#1d2b28]">Mesa de Curaduría al Día</h3>
          <p className="text-sm text-[#5a6b64] max-w-md mx-auto mt-1">
            No existen aportes pendientes de validación en este momento. Todos los testimonios han sido revisados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selector lateral de pendientes (Col 3) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-xs font-bold text-[#5a6b64] uppercase tracking-wider px-1 font-serif">
              Cola de Revisión ({pendientes.length})
            </div>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none max-h-[700px] lg:overflow-y-auto">
              {pendientes.map(item => {
                const isSelected = selectedItem?.aporte_id === item.aporte_id;
                return (
                  <button
                    key={item.aporte_id}
                    onClick={() => selectItem(item)}
                    className={`min-w-[220px] lg:min-w-0 w-full text-left p-3.5 rounded border transition flex-shrink-0 lg:flex-shrink ${
                      isSelected
                        ? 'bg-[#f2f5f0] border-[#2f5d50] shadow-xs ring-1 ring-[#2f5d50]'
                        : 'bg-white border-[#d5ddd6] hover:bg-[#f7f7f3]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold font-serif text-[#1d2b28] truncate max-w-[130px]">
                        {item.memoria_titular}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded bg-[#eef1eb] text-[#344a43] font-semibold text-[11px] border border-[#dde3dc]">
                        {item.tipo}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#344a43] line-clamp-1">
                      {item.titulo}
                    </div>
                    <div className="text-[11px] text-[#5a6b64] mt-1">
                      Por: {item.autor}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interfaz Master-Detail Split Screen (Col 9) */}
          {selectedItem && (
            <div className="lg:col-span-9 space-y-4 sm:space-y-6">
              {/* Selector de Pestañas Móvil */}
              <div className="flex md:hidden bg-[#eef1eb] p-1 rounded border border-[#d5ddd6] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('original')}
                  className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1.5 transition ${
                    mobileActiveTab === 'original'
                      ? 'bg-white text-[#1d2b28] shadow-xs'
                      : 'text-[#5a6b64]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#4f6b62]" />
                  <span>1. Material Original</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('curacion')}
                  className={`flex-1 py-2.5 rounded flex items-center justify-center gap-1.5 transition ${
                    mobileActiveTab === 'curacion'
                      ? 'bg-[#2f5d50] text-white shadow-xs'
                      : 'text-[#5a6b64]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>2. Curación del Gestor</span>
                </button>
              </div>

              {/* Contenedor Split Screen Responsivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel Izquierdo: Material Original */}
                <div
                  className={`bg-[#fbfbf8] p-5 rounded border border-[#d5ddd6] flex flex-col justify-between ${
                    mobileActiveTab === 'original' ? 'block' : 'hidden md:flex'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#dde3dc] mb-3">
                      <div className="flex items-center space-x-2">
                        {selectedItem.tipo === 'texto' && <FileText className="w-5 h-5 text-[#4f6b62]" />}
                        {selectedItem.tipo === 'audio' && <Mic className="w-5 h-5 text-[#2f5d50]" />}
                        {selectedItem.tipo === 'foto' && <Image className="w-5 h-5 text-[#4f6b62]" />}
                        <span className="font-bold font-serif text-base text-[#1d2b28]">1. Material Original</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-[#eef1eb] text-[#344a43] rounded border border-[#dde3dc]">
                        Solo Lectura
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-[#5a6b64] block font-serif">Título y Autor:</span>
                        <div className="font-bold text-[#1d2b28] text-base">{selectedItem.titulo}</div>
                        <div className="text-[#344a43]">Narrado por: {selectedItem.autor}</div>
                      </div>

                      {selectedItem.fecha_hecho_historico && (
                        <div>
                          <span className="text-[#5a6b64] block font-serif">Fecha del Hecho:</span>
                          <div className="font-semibold text-[#1d2b28]">{selectedItem.fecha_hecho_historico}</div>
                        </div>
                      )}

                      <div>
                        <span className="text-[#5a6b64] block mb-1 font-serif">Contenido Textual Original:</span>
                        <div className="p-3 bg-white border border-[#d5ddd6] rounded font-serif text-xs sm:text-sm leading-relaxed text-[#1d2b28] max-h-64 overflow-y-auto whitespace-pre-wrap select-all">
                          {selectedItem.contenido_original || 'Sin contenido de texto original.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Código de verificación del original */}
                  <div className="mt-4 pt-3 border-t border-[#dde3dc] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#344a43] flex items-center gap-1 font-serif">
                        <Hash className="w-4 h-4 text-[#2f5d50]" />
                        Código de verificación:
                      </span>
                      <button
                        onClick={() => copyHash(selectedItem.archivo_hash_sha256)}
                        className="text-[#2f5d50] hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#2f5d50]" />}
                        <span>{copiedHash ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[#1d2b28] break-all bg-white p-2.5 rounded border border-[#dde3dc] text-[11px]">
                      {selectedItem.archivo_hash_sha256}
                    </div>
                  </div>
                </div>

                {/* Panel Derecho: Texto Procesado por IA y Editor de Curaduría */}
                <div
                  className={`bg-white p-5 rounded border border-[#d5ddd6] shadow-2xs flex flex-col justify-between ${
                    mobileActiveTab === 'curacion' ? 'block' : 'hidden md:flex'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#eef1eb] mb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-[#2f5d50]" />
                        <span className="font-bold font-serif text-base text-[#1d2b28]">2. Curación del Gestor</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-[#f2f5f0] text-[#2f5d50] rounded border border-[#e4e9e2]">
                        Extracción IA: {Math.round(selectedItem.confianza_ia * 100)}%
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1d2b28] mb-1 font-serif">
                          Versión Revisada y Homologada para Conocimiento *
                        </label>
                        <textarea
                          rows={6}
                          value={curatedText}
                          onChange={e => setCuratedText(e.target.value)}
                          className="w-full p-3.5 border border-[#d5ddd6] rounded text-sm text-[#1d2b28] focus:border-[#2f5d50] leading-relaxed"
                          placeholder="Ajuste la toponimia palmareña o precisión histórica..."
                        />
                      </div>

                      {/* Entidades Detectadas */}
                      <div>
                        <label className="block text-xs font-bold text-[#1d2b28] mb-1.5 font-serif">
                          Entidades Patrimoniales Asociadas
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {entidadesList.map((ent, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fafaf7] text-[#344a43] text-xs font-medium border border-[#d5ddd6]"
                            >
                              <Tag className="w-3 h-3 text-[#2f5d50]" />
                              <span>{ent.nombre}</span>
                              <span className="text-[10px] text-[#4f6b62] font-serif">({ent.tipo})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEntidad(i)}
                                className="text-[#a34a3d] hover:font-bold ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Agregar entidad */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newEntidadNombre}
                            onChange={e => setNewEntidadNombre(e.target.value)}
                            placeholder="Nueva entidad (ej: Trapiche Zaragoza)"
                            className="flex-1 min-h-[40px] px-3 text-xs border border-[#d5ddd6] rounded text-[#1d2b28]"
                          />
                          <select
                            value={newEntidadTipo}
                            onChange={e => setNewEntidadTipo(e.target.value)}
                            className="min-h-[40px] px-2 text-xs border border-[#d5ddd6] rounded bg-white text-[#1d2b28]"
                          >
                            <option value="Lugar">Lugar</option>
                            <option value="Persona">Persona</option>
                            <option value="Época">Época</option>
                            <option value="Oficio">Oficio</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAddEntidad}
                            className="min-h-[40px] px-3 bg-[#344a43] hover:bg-[#1d2b28] text-white text-xs font-bold rounded"
                          >
                            Añadir
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1d2b28] mb-1 font-serif">
                          Notas de Validación Técnica
                        </label>
                        <input
                          type="text"
                          value={notasValidacion}
                          onChange={e => setNotasValidacion(e.target.value)}
                          placeholder="Comentarios de verificación histórica..."
                          className="w-full min-h-[40px] px-3 text-xs border border-[#d5ddd6] rounded text-[#1d2b28]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Validación */}
                  <div className="mt-5 pt-4 border-t border-[#eef1eb] flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleRechazar}
                      disabled={isProcessing}
                      className="btn-secondary text-[#a34a3d] border-[#a34a3d] hover:bg-[#f9efed] w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      <span>Rechazar Aporte</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAprobar}
                      disabled={isProcessing}
                      className="btn-primary w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-1.5" />
                      <span>{isProcessing ? 'Procesando...' : 'Aprobar e Incorporar al Conocimiento'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
