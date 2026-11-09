import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, Consentimiento } from '../types';
import { api } from '../services/api';
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Hash,
  AlertCircle,
  Copy,
  Check,
  Building2,
  ArrowRight
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
            api.getConsentForMemoria(mem.id)
              .then(c => setConsentimiento(c))
              .catch(() => setConsentimiento(null));
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

  const handleMemoriaChange = (id: number) => {
    setActiveMemoriaId(id);
    const mem = memorias.find(m => m.id === id) || null;
    setSelectedMemoria(mem);
    setConsentimiento(null);
    setSuccessMessage(null);
    if (mem) {
      setTitular(mem.titular);
      setVisibilidadDeseada(mem.visibilidad);
      api.getConsentForMemoria(id)
        .then(c => setConsentimiento(c))
        .catch(() => setConsentimiento(null));
    }
  };

  const handleRegisterConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemoria) return;

    setIsSubmitting(true);
    try {
      const created = await api.registerConsent({
        memoria_id: selectedMemoria.id,
        titular,
        modalidad,
        evidencia_hash: liveHash,
        evidencia_url: `evidencias/consentimiento_${selectedMemoria.id}.pdf`,
        fecha_otorgamiento: fechaOtorgamiento,
        vigencia,
        alcance,
        notas: evidenciaTexto
      });

      if (selectedMemoria.visibilidad !== visibilidadDeseada) {
        await api.updateMemoria(selectedMemoria.id, {
          visibilidad: visibilidadDeseada,
          estado: 'Activa'
        });
      }

      setConsentimiento(created);
      setSuccessMessage('Consentimiento registrado y resguardado de forma segura.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al registrar consentimiento');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encabezado Institucional Cálido */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
            <Building2 className="w-4 h-4" />
            <span>Departamento Legal & Archivo de Consentimientos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1.5">
            Custodia de Consentimiento Informado
          </h1>
          <p className="text-sm sm:text-base text-[#344a43] mt-1 leading-relaxed">
            Sin consentimiento registrado, ninguna memoria puede ser consultada ni procesada.
          </p>
        </div>

        {/* Selector de Memoria */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <label className="text-xs font-bold text-[#344a43] uppercase font-serif">Expediente:</label>
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

      {/* Alerta de Éxito */}
      {successMessage && (
        <div className="p-4 bg-white rounded border-2 border-[#2c6e4f] text-[#2c6e4f] flex items-center justify-between shadow-2xs text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => onNavigate('carga', selectedMemoria?.id)}
            className="btn-primary text-xs px-3 min-h-[40px]"
          >
            Proceder a Carga de Relatos
          </button>
        </div>
      )}

      {/* Tarjeta de Estado Actual del Consentimiento */}
      {selectedMemoria && (
        <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eef1eb] gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5a6b64] font-serif">
                Titular del Expediente
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#1d2b28]">
                {selectedMemoria.titular}
                {selectedMemoria.alias && (
                  <span className="text-[#2f5d50] font-sans font-semibold ml-2">"{selectedMemoria.alias}"</span>
                )}
              </h2>
              <div className="text-xs text-[#5a6b64] mt-0.5">
                {selectedMemoria.lugar_origen} • Visibilidad: {selectedMemoria.visibilidad}
              </div>
            </div>

            <div>
              {consentimiento ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#eef6f0] text-[#2c6e4f] text-xs font-bold border border-[#c4ded0]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Consentimiento Acreditado</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#f9efed] text-[#a34a3d] text-xs font-bold border border-[#e7cbc5]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Sin Consentimiento Registrado</span>
                </div>
              )}
            </div>
          </div>

          {/* Si ya tiene consentimiento: Visor de Constancia Legal Inmutable */}
          {consentimiento ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-3 bg-[#fafaf7] rounded border border-[#dde3dc]">
                  <span className="text-[#5a6b64] block font-serif">Modalidad:</span>
                  <span className="font-bold text-[#1d2b28] text-sm">{consentimiento.modalidad}</span>
                </div>
                <div className="p-3 bg-[#fafaf7] rounded border border-[#dde3dc]">
                  <span className="text-[#5a6b64] block font-serif">Fecha de Otorgamiento:</span>
                  <span className="font-bold text-[#1d2b28] text-sm">{consentimiento.fecha_otorgamiento}</span>
                </div>
                <div className="p-3 bg-[#fafaf7] rounded border border-[#dde3dc]">
                  <span className="text-[#5a6b64] block font-serif">Vigencia:</span>
                  <span className="font-bold text-[#1d2b28] text-sm">{consentimiento.vigencia}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#fafaf7] rounded border border-[#dde3dc] text-xs sm:text-sm">
                <span className="text-[#5a6b64] block mb-1 font-serif">Alcance Autorizado:</span>
                <span className="text-[#1d2b28]">{consentimiento.alcance}</span>
              </div>

              {/* Código de verificación del consentimiento */}
              <div className="p-4 bg-[#fafaf7] rounded border border-[#d5ddd6] space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#344a43] text-xs font-serif uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-[#2f5d50]" />
                    Código de verificación del consentimiento:
                  </span>
                  <button
                    onClick={() => copyHash(consentimiento.evidencia_hash)}
                    className="text-xs text-[#2f5d50] hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="font-mono text-[#1d2b28] break-all bg-white p-2.5 rounded border border-[#dde3dc] text-xs">
                  {consentimiento.evidencia_hash}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#f9efed] border border-[#e7cbc5] rounded text-xs sm:text-sm text-[#853c31] flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#a34a3d]" />
              <div>
                <strong>Aviso Ético de Gobernanza:</strong> Este expediente no puede ser procesado por el narrador interactivo
                ni publicado en el portal patrimonial hasta que se formalice y certifique su respectivo consentimiento legal.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulario de Registro o Actualización de Consentimiento */}
      {['Digitalizador', 'Gestor de datos', 'Administrador'].includes(activeRole) && (
        <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs space-y-5">
          <div className="pb-3 border-b border-[#eef1eb]">
            <h3 className="text-xl font-bold font-serif text-[#1d2b28]">
              {consentimiento ? 'Actualizar o Refrendar Consentimiento' : 'Registro Formal de Consentimiento Informado'}
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b64] mt-0.5">
              Custodia digital de la Fundación Legado Vivo con estricto apego ético y legal.
            </p>
          </div>

          <form onSubmit={handleRegisterConsent} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                  Titular o Sujeto de Memoria *
                </label>
                <input
                  type="text"
                  required
                  value={titular}
                  onChange={e => setTitular(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                  Modalidad de Otorgamiento Legal *
                </label>
                <select
                  value={modalidad}
                  onChange={e => setModalidad(e.target.value as any)}
                  className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] font-medium"
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
                <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                  Fecha de Otorgamiento *
                </label>
                <input
                  type="date"
                  required
                  value={fechaOtorgamiento}
                  onChange={e => setFechaOtorgamiento(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                  Vigencia del Acuerdo
                </label>
                <input
                  type="text"
                  value={vigencia}
                  onChange={e => setVigencia(e.target.value)}
                  placeholder="Ej: Indefinida"
                  className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                  Nivel de Visibilidad en Plataforma
                </label>
                <select
                  value={visibilidadDeseada}
                  onChange={e => setVisibilidadDeseada(e.target.value as any)}
                  className="w-full min-h-[48px] px-3.5 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] font-medium"
                >
                  <option value="publico">Público (Consulta comunitaria y narrador)</option>
                  <option value="familiar">Familiar (Restringido a personas autorizadas)</option>
                  <option value="privado">Privado (Custodia restringida)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                Alcance y Fines Autorizados
              </label>
              <textarea
                rows={2}
                value={alcance}
                onChange={e => setAlcance(e.target.value)}
                className="w-full p-3.5 border border-[#d5ddd6] rounded text-sm text-[#1d2b28] focus:border-[#2f5d50]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1d2b28] mb-1.5 font-serif">
                Descripción de la Evidencia Probatoria en Custodia
              </label>
              <textarea
                rows={2}
                value={evidenciaTexto}
                onChange={e => setEvidenciaTexto(e.target.value)}
                placeholder="Indique tomo, folio, acta notarial o archivo digital en resguardo..."
                className="w-full p-3.5 border border-[#d5ddd6] rounded text-sm text-[#1d2b28] focus:border-[#2f5d50]"
              />
            </div>

            {/* Código de verificación en vivo */}
            <div className="p-4 bg-[#fafaf7] rounded border border-[#d5ddd6] space-y-1.5">
              <span className="text-xs font-bold text-[#344a43] block font-serif uppercase tracking-wider">
                Código de verificación del registro:
              </span>
              <div className="font-mono text-xs text-[#1d2b28] break-all bg-white p-2.5 rounded border border-[#dde3dc]">
                {liveHash}
              </div>
            </div>

            <div className="pt-3 border-t border-[#eef1eb] flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                <FileCheck2 className="w-5 h-5 mr-2" />
                <span>{isSubmitting ? 'Acreditando...' : 'Acreditar Consentimiento Legal'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
