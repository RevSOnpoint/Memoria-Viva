import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, Consentimiento } from '../types';
import { api } from '../services/api';
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Calendar,
  FileText,
  Lock,
  Globe,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface ConsentimientoViewProps {
  onNavigate: (tab: string, memoriaId?: number) => void;
}

export const ConsentimientoView: React.FC<ConsentimientoViewProps> = ({ onNavigate }) => {
  const { activeMemoriaId, setActiveMemoriaId, activeRole } = useAuth();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [selectedMemoria, setSelectedMemoria] = useState<Memoria | null>(null);
  const [consentimiento, setConsentimiento] = useState<Consentimiento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  // Formulario
  const [titular, setTitular] = useState('');
  const [modalidad, setModalidad] = useState<'Escrita' | 'Grabada' | 'Firma digital' | 'Representante legal'>('Firma digital');
  const [fechaOtorgamiento, setFechaOtorgamiento] = useState(new Date().toISOString().split('T')[0]);
  const [vigencia, setVigencia] = useState('Indefinida');
  const [alcance, setAlcance] = useState('Preservación del patrimonio oral, archivo comunitario y narración interactiva asistida por IA.');
  const [evidenciaTexto, setEvidenciaTexto] = useState('Acta de consentimiento formal refrendada y archivada en la sede de la Fundación Legado Vivo, Palmares.');
  const [liveHash, setLiveHash] = useState('');
  const [visibilidadDeseada, setVisibilidadDeseada] = useState<'privado' | 'familiar' | 'publico'>('publico');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calcular SHA-256 en tiempo real para la evidencia
  useEffect(() => {
    async function calculateSHA256(text: string) {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setLiveHash(hashHex);
    }
    calculateSHA256(`${titular}-${modalidad}-${fechaOtorgamiento}-${evidenciaTexto}`);
  }, [titular, modalidad, fechaOtorgamiento, evidenciaTexto]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await api.getMemorias();
      setMemorias(list);

      const targetId = activeMemoriaId || (list.length > 0 ? list[0].id : null);
      if (targetId) {
        const mem = list.find(m => m.id === targetId) || null;
        setSelectedMemoria(mem);
        if (mem) {
          setTitular(mem.titular);
          setVisibilidadDeseada(mem.visibilidad);
          if (mem.consentimiento) {
            setConsentimiento(mem.consentimiento);
          } else {
            setConsentimiento(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeMemoriaId, activeRole]);

  const handleSelectMemoriaChange = (id: number) => {
    setActiveMemoriaId(id);
    const found = memorias.find(m => m.id === id) || null;
    setSelectedMemoria(found);
    if (found) {
      setTitular(found.titular);
      setVisibilidadDeseada(found.visibilidad);
      setConsentimiento(found.consentimiento || null);
    }
  };

  const handleRegisterConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemoria) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const newConsent = await api.registerConsent({
        memoria_id: selectedMemoria.id,
        titular: titular || selectedMemoria.titular,
        modalidad,
        evidencia_hash: liveHash,
        evidencia_url: `evidencias/consentimiento_${selectedMemoria.id}.pdf`,
        fecha_otorgamiento: fechaOtorgamiento,
        vigencia,
        alcance,
        notas: evidenciaTexto
      });

      // Si el usuario solicitó visibilidad pública o familiar, actualizar la memoria
      if (selectedMemoria.visibilidad !== visibilidadDeseada) {
        await api.updateMemoria(selectedMemoria.id, {
          visibilidad: visibilidadDeseada,
          estado: 'Activa'
        });
      }

      setConsentimiento(newConsent);
      setSuccessMessage('Consentimiento legal registrado exitosamente. La memoria ha sido acreditada e incorporada formalmente.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error registrando consentimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado Fiori */}
      <div className="bg-white p-6 rounded-lg border border-sap-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-sap-blue uppercase tracking-wider">
            <span>Módulo de Privacidad y Cumplimiento Legal</span>
            <span>•</span>
            <span>Fundación Legado Vivo</span>
          </div>
          <h1 className="text-2xl font-bold text-sap-text mt-1">P03 Consentimiento & Privacidad</h1>
          <p className="text-sm text-sap-textMuted mt-0.5">
            Regla de oro: Sin consentimiento fehaciente no se procesa, publica ni narra ninguna memoria.
          </p>
        </div>

        {/* Selector de Memoria */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Expediente:</label>
          <select
            value={selectedMemoria?.id || ''}
            onChange={e => handleSelectMemoriaChange(Number(e.target.value))}
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

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-sm">{successMessage}</span>
          </div>
          <button
            onClick={() => onNavigate('carga', selectedMemoria?.id)}
            className="sap-btn sap-btn-primary text-xs"
          >
            Proceder a Carga de Relatos (P04)
          </button>
        </div>
      )}

      {/* Tarjeta de Estado Actual del Consentimiento */}
      {selectedMemoria && (
        <div className="sap-card p-6 border-t-4 border-t-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sap-border gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Titular del Expediente
              </span>
              <h2 className="text-xl font-extrabold text-sap-text">
                {selectedMemoria.titular}
                {selectedMemoria.alias && (
                  <span className="text-sap-blue font-semibold ml-2">({selectedMemoria.alias})</span>
                )}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {selectedMemoria.lugar_origen} • Estado: {selectedMemoria.estado}
              </div>
            </div>

            <div>
              {consentimiento ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sap-successBg text-sap-success text-xs font-bold border border-emerald-300 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Consentimiento Acreditado</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sap-errorBg text-sap-error text-xs font-bold border border-red-300 shadow-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Sin Consentimiento Registrado</span>
                </div>
              )}
            </div>
          </div>

          {/* Si ya tiene consentimiento: Visor de Constancia Legal Inmutable */}
          {consentimiento ? (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Modalidad Acreditada:</span>
                  <span className="font-bold text-slate-800 text-sm">{consentimiento.modalidad}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Fecha de Otorgamiento:</span>
                  <span className="font-bold text-slate-800 text-sm">{consentimiento.fecha_otorgamiento}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Vigencia del Acuerdo:</span>
                  <span className="font-bold text-slate-800 text-sm">{consentimiento.vigencia}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-1">Alcance Autorizado:</span>
                <span className="text-slate-800 font-medium">{consentimiento.alcance}</span>
              </div>

              {/* Hash Criptográfico Inmutable SHA-256 */}
              <div className="p-3.5 bg-blue-50/60 rounded border border-blue-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-900 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-sap-blue" />
                    Hash SHA-256 de Evidencia Probatoria (Inmutable):
                  </span>
                  <button
                    onClick={() => copyHash(consentimiento.evidencia_hash)}
                    className="text-xs text-sap-blue hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
                  </button>
                </div>
                <div className="font-mono text-slate-700 break-all bg-white p-2 rounded border border-blue-100">
                  {consentimiento.evidencia_hash}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Aviso de Gobernanza:</strong> Este expediente no puede ser procesado por el motor de IA,
                publicado en el portal patrimonial ni consultado en el narrador interactivo hasta que se complete y firme el formulario inferior.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulario de Registro o Actualización de Consentimiento */}
      {['Digitalizador', 'Gestor de datos', 'Administrador'].includes(activeRole) && (
        <div className="sap-card p-6">
          <div className="mb-5 pb-3 border-b border-sap-border">
            <h3 className="text-lg font-bold text-sap-text">
              {consentimiento ? 'Actualizar o Refrendar Consentimiento' : 'Registro Formal de Consentimiento Informado'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Custodia digital de la Fundación Legado Vivo con estricto apego ético y legal.
            </p>
          </div>

          <form onSubmit={handleRegisterConsent} className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Titular o Sujeto de Memoria *
                </label>
                <input
                  type="text"
                  required
                  value={titular}
                  onChange={e => setTitular(e.target.value)}
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalidad de Otorgamiento Legal *
                </label>
                <select
                  value={modalidad}
                  onChange={e => setModalidad(e.target.value as any)}
                  className="w-full h-11 px-3 border border-sap-border rounded bg-white font-medium"
                >
                  <option value="Firma digital">Firma digital o Huella dactilar</option>
                  <option value="Escrita">Documento notarial / Acta física firmada</option>
                  <option value="Grabada">Testimonio audiovisual grabado de consentimiento</option>
                  <option value="Representante legal">Representante legal o familiar tutor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha de Otorgamiento *
                </label>
                <input
                  type="date"
                  required
                  value={fechaOtorgamiento}
                  onChange={e => setFechaOtorgamiento(e.target.value)}
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vigencia del Acuerdo
                </label>
                <input
                  type="text"
                  value={vigencia}
                  onChange={e => setVigencia(e.target.value)}
                  placeholder="Ej: Indefinida"
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nivel de Visibilidad en Plataforma
                </label>
                <select
                  value={visibilidadDeseada}
                  onChange={e => setVisibilidadDeseada(e.target.value as any)}
                  className="w-full h-11 px-3 border border-sap-border rounded bg-white font-medium"
                >
                  <option value="publico">Público (Consulta comunitaria y narrador)</option>
                  <option value="familiar">Familiar (Restringido a personas autorizadas)</option>
                  <option value="privado">Privado (Custodia restringida)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alcance y Fines Autorizados
              </label>
              <textarea
                rows={2}
                value={alcance}
                onChange={e => setAlcance(e.target.value)}
                className="w-full p-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Descripción de la Evidencia Probatoria en Custodia
              </label>
              <textarea
                rows={2}
                value={evidenciaTexto}
                onChange={e => setEvidenciaTexto(e.target.value)}
                placeholder="Indique tomo, folio, acta notarial o archivo digital en resguardo..."
                className="w-full p-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
              />
            </div>

            {/* Cálculo en vivo de Hash Criptográfico */}
            <div className="p-3 bg-slate-100 rounded border border-slate-200">
              <span className="text-xs font-bold text-slate-600 block mb-1">
                Hash SHA-256 Calculado para Registro Inmutable:
              </span>
              <div className="font-mono text-xs text-slate-800 break-all bg-white p-2 rounded border border-slate-300">
                {liveHash}
              </div>
            </div>

            <div className="pt-3 border-t border-sap-border flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="sap-btn sap-btn-primary flex items-center gap-2 shadow"
              >
                <FileCheck2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Acreditando...' : 'Acreditar Consentimiento Legal'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

