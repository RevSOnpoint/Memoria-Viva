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
  ArrowRight,
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
    setNotasValidacion('Cotejado con archivos históricos de Palmares. Datos coherentes.');
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
        version_validada: curatedText,
        notas_validacion: razon
      });

      setSuccessMsg(`Aporte #${selectedItem.aporte_id} rechazado.`);
      loadPendientes();
    } catch (err: any) {
      alert(err.message || 'Error al rechazar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddEntidad = () => {
    if (!newEntidadNombre.trim()) return;
    setEntidadesList(prev => [
      ...prev,
      { nombre: newEntidadNombre.trim(), tipo: newEntidadTipo, fragmento: newEntidadNombre.trim() }
    ]);
    setNewEntidadNombre('');
  };

  const handleRemoveEntidad = (index: number) => {
    setEntidadesList(prev => prev.filter((_, i) => i !== index));
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Fiori */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-sap-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <span>Mesa de Curaduría y Validación</span>
            <span>•</span>
            <span>Rol: Gestor de Datos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-sap-text mt-1">
            P05 Revisión & Validación
          </h1>
          <p className="text-xs sm:text-sm text-sap-textMuted mt-0.5">
            El material original nunca se modifica (hash inmutable). Solo el texto curado por el Gestor alimenta la base de conocimiento.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded bg-amber-50 text-amber-900 border border-amber-200 self-start md:self-auto">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{pendientes.length} Aportes Pendientes</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => onNavigate('narrador')}
            className="sap-btn sap-btn-primary text-xs self-start sm:self-auto"
          >
            Probar en Narrador IA (P07)
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="sap-card p-12 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-sap-blue border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="font-medium text-sm">Cargando cola de validación...</p>
        </div>
      ) : pendientes.length === 0 ? (
        <div className="sap-card p-8 sm:p-12 text-center text-slate-500">
          <CheckSquare className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Cola de Validación al Día</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            No existen aportes pendientes de revisión. Todos los testimonios han sido auditados o no se han cargado nuevos elementos.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => onNavigate('carga')}
              className="sap-btn sap-btn-secondary text-xs"
            >
              Cargar Nuevo Relato (P04)
            </button>
            <button
              onClick={() => onNavigate('narrador')}
              className="sap-btn sap-btn-primary text-xs"
            >
              Consultar Narrador (P07)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selector lateral de pendientes (Col 3) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Cola de Revisión ({pendientes.length})
            </div>
            {/* Horizontal scroll on mobile, vertical stack on desktop */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none max-h-[700px] lg:overflow-y-auto">
              {pendientes.map(item => {
                const isSelected = selectedItem?.aporte_id === item.aporte_id;
                return (
                  <button
                    key={item.aporte_id}
                    onClick={() => selectItem(item)}
                    className={`min-w-[200px] lg:min-w-0 w-full text-left p-3 rounded-lg border transition flex-shrink-0 lg:flex-shrink ${
                      isSelected
                        ? 'bg-blue-50/90 border-sap-blue shadow-sm ring-1 ring-sap-blue'
                        : 'bg-white border-sap-border hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate max-w-[120px]">
                        {item.memoria_titular}
                      </span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {item.tipo}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 line-clamp-1">
                      {item.titulo}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
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
              {/* Selector de Pestañas Móvil (Solo visible en pantallas pequeñas < md) */}
              <div className="flex md:hidden bg-slate-100 p-1 rounded-lg border border-sap-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('original')}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition ${
                    mobileActiveTab === 'original'
                      ? 'bg-white text-slate-800 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>1. Original Inmutable</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('curacion')}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition ${
                    mobileActiveTab === 'curacion'
                      ? 'bg-sap-blue text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Curación del Gestor</span>
                </button>
              </div>

              {/* Contenedor Split Screen Responsivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel Izquierdo: Material Original Inmutable */}
                <div
                  className={`sap-card p-4 sm:p-5 border-t-4 border-t-slate-700 bg-slate-50/50 flex flex-col justify-between ${
                    mobileActiveTab === 'original' ? 'block' : 'hidden md:flex'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-sap-border mb-3">
                      <div className="flex items-center space-x-2">
                        {selectedItem.tipo === 'texto' && <FileText className="w-5 h-5 text-slate-600" />}
                        {selectedItem.tipo === 'audio' && <Mic className="w-5 h-5 text-cyan-600" />}
                        {selectedItem.tipo === 'foto' && <Image className="w-5 h-5 text-amber-600" />}
                        <span className="font-bold text-sm text-slate-800">1. Original Inmutable</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                        Solo Lectura
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Título y Autor del Relato:</span>
                        <div className="font-bold text-slate-800 text-sm">{selectedItem.titulo}</div>
                        <div className="text-slate-600">Narrado por: {selectedItem.autor}</div>
                      </div>

                      {selectedItem.fecha_hecho_historico && (
                        <div>
                          <span className="text-slate-500 block">Fecha del Hecho Histórico:</span>
                          <div className="font-semibold text-slate-800">{selectedItem.fecha_hecho_historico}</div>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-500 block mb-1">Contenido Textual Original:</span>
                        <div className="p-3 bg-white border border-slate-200 rounded font-serif text-xs sm:text-sm leading-relaxed text-slate-800 max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
                          {selectedItem.contenido_original || 'Sin contenido de texto original.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hash SHA-256 Inmutable */}
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-slate-500" />
                        Hash SHA-256 (Inmutable):
                      </span>
                      <button
                        onClick={() => copyHash(selectedItem.archivo_hash_sha256)}
                        className="text-sap-blue hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-slate-600 break-all bg-white p-2 rounded border border-slate-200 text-[10px] sm:text-xs">
                      {selectedItem.archivo_hash_sha256}
                    </div>
                  </div>
                </div>

                {/* Panel Derecho: Texto Procesado por IA y Editor de Curaduría */}
                <div
                  className={`sap-card p-4 sm:p-5 border-t-4 border-t-sap-blue flex flex-col justify-between ${
                    mobileActiveTab === 'curacion' ? 'block' : 'hidden md:flex'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-sap-border mb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-sap-blue" />
                        <span className="font-bold text-sm text-sap-text">2. Curación del Gestor</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-sap-blue rounded">
                        IA Confianza: {Math.round(selectedItem.confianza_ia * 100)}%
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Texto Validado (Alimenta la Base de Conocimiento) *
                        </label>
                        <textarea
                          rows={6}
                          value={curatedText}
                          onChange={e => setCuratedText(e.target.value)}
                          className="w-full p-2.5 sm:p-3 border border-sap-border rounded text-xs sm:text-sm focus:border-sap-blue focus:ring-1 focus:ring-sap-blue leading-relaxed font-sans"
                          placeholder="Edite o corrija ortografía, nombres propios de Palmares o puntuación..."
                        />
                        <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-1">
                          Este texto es el que utilizará el narrador IA para citar y responder.
                        </span>
                      </div>

                      {/* Entidades Detectadas e Incorporadas */}
                      <div>
                        <span className="block font-bold text-slate-700 mb-1">
                          Entidades Patrimoniales Asociadas:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {entidadesList.map((ent, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] sm:text-xs border border-slate-300 font-medium"
                            >
                              <Tag className="w-3 h-3 text-sap-blue" />
                              <span>{ent.nombre}</span>
                              <span className="text-[10px] text-slate-500 font-normal">({ent.tipo})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEntidad(idx)}
                                className="text-slate-400 hover:text-red-600 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Agregar entidad responsivo */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
                          <input
                            type="text"
                            value={newEntidadNombre}
                            onChange={e => setNewEntidadNombre(e.target.value)}
                            placeholder="Nueva entidad (ej: Trapiche de Zaragoza)"
                            className="h-9 px-2 text-xs border border-sap-border rounded flex-1"
                          />
                          <div className="flex items-center gap-1.5">
                            <select
                              value={newEntidadTipo}
                              onChange={e => setNewEntidadTipo(e.target.value)}
                              className="h-9 px-2 text-xs border border-sap-border rounded bg-white flex-1 sm:flex-none"
                            >
                              <option value="Lugar">Lugar</option>
                              <option value="Persona">Persona</option>
                              <option value="Tradición">Tradición</option>
                              <option value="Oficio">Oficio</option>
                              <option value="Evento">Evento</option>
                            </select>
                            <button
                              type="button"
                              onClick={handleAddEntidad}
                              className="h-9 px-3 text-xs font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Notas de Auditoría y Validación:
                        </label>
                        <input
                          type="text"
                          value={notasValidacion}
                          onChange={e => setNotasValidacion(e.target.value)}
                          className="w-full h-9 px-2.5 text-xs border border-sap-border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Acciones Fiori en el Pie (Mobile-First Stacking) */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-sap-border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleRechazar}
                  disabled={isProcessing}
                  className="sap-btn sap-btn-danger flex items-center justify-center gap-1.5 text-xs sm:text-sm order-2 sm:order-1"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Rechazar con Observaciones</span>
                </button>

                <button
                  type="button"
                  onClick={handleAprobar}
                  disabled={isProcessing}
                  className="sap-btn sap-btn-success flex items-center justify-center gap-1.5 shadow text-xs sm:text-sm order-1 sm:order-2"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isProcessing ? 'Validando...' : 'Aprobar e Incorporar a Base de Conocimiento'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
