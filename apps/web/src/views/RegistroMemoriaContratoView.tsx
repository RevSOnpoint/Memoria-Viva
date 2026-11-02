import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FileSignature,
  Building2,
  ShieldCheck,
  Hash,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  MapPin,
  Calendar,
  Lock,
  Globe,
  Users
} from 'lucide-react';

interface RegistroMemoriaContratoViewProps {
  onSuccessNavigate: (memoriaId: number) => void;
  onNavigateCarga: (memoriaId: number) => void;
}

export const RegistroMemoriaContratoView: React.FC<RegistroMemoriaContratoViewProps> = ({
  onSuccessNavigate,
  onNavigateCarga
}) => {
  const { activeRole } = useAuth();

  // Paso 1: Datos de la Persona
  const [titular, setTitular] = useState('');
  const [alias, setAlias] = useState('');
  const [distrito, setDistrito] = useState('Zaragoza, Palmares, Costa Rica');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Paso 2: Contrato de Consentimiento
  const [modalidad, setModalidad] = useState<'Firma digital' | 'Escrita' | 'Grabada' | 'Representante legal'>('Firma digital');
  const [fechaOtorgamiento, setFechaOtorgamiento] = useState(new Date().toISOString().split('T')[0]);
  const [visibilidad, setVisibilidad] = useState<'privado' | 'familiar' | 'publico'>('publico');
  const [notasContrato, setNotasContrato] = useState('Acta de consentimiento libre e informado celebrada ante la Fundación Legado Vivo, Palmares.');
  const [liveHash, setLiveHash] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ memoriaId: number; titular: string; hash: string } | null>(null);

  // Calcular en tiempo real el Hash SHA-256 del contrato formal
  useEffect(() => {
    async function calcHash() {
      const payload = `CONTRATO-LEGADO-VIVO-${titular}-${modalidad}-${fechaOtorgamiento}-${visibilidad}-${distrito}`;
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setLiveHash(hashHex);
    }
    calcHash();
  }, [titular, modalidad, fechaOtorgamiento, visibilidad, distrito]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titular.trim()) {
      alert('Por favor ingrese el nombre del titular de la memoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Crear el expediente de memoria
      const memoria = await api.createMemoria({
        titular,
        alias: alias || undefined,
        descripcion: descripcion || undefined,
        lugar_origen: distrito,
        fecha_nacimiento: fechaNacimiento || undefined,
        visibilidad,
        tipo: 'Individual'
      });

      // 2. Registrar el Contrato de Consentimiento inmediatamente enlazado
      const alcanceTexto =
        'Preservación patrimonial comunitaria, custodia inmutable de testimonios orales y consulta controlada a través del sistema interactivo de la Fundación Legado Vivo.';

      await api.registerConsent({
        memoria_id: memoria.id,
        titular,
        modalidad,
        evidencia_hash: liveHash,
        evidencia_url: `evidencias/contrato_consentimiento_${memoria.id}.pdf`,
        fecha_otorgamiento: fechaOtorgamiento,
        vigencia: 'Indefinida',
        alcance: alcanceTexto,
        notas: notasContrato
      });

      // Si la visibilidad seleccionada es pública, actualizar estado a Activa
      if (visibilidad !== 'privado') {
        await api.updateMemoria(memoria.id, {
          visibilidad,
          estado: 'Activa'
        });
      }

      setCreatedResult({
        memoriaId: memoria.id,
        titular: memoria.titular,
        hash: liveHash
      });
    } catch (err: any) {
      alert(err.message || 'Error en el proceso de registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encabezado Formal Institucional */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#0056b3] uppercase tracking-wider font-mono">
          <Building2 className="w-4 h-4" />
          <span>Fundación Legado Vivo • Departamento de Registro y Custodia</span>
        </div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">
          Apertura de Expediente & Contrato de Consentimiento
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Todo registro de una persona o de sus vivencias se formaliza mediante un contrato legal que garantiza la custodia ética y la no alteración del patrimonio histórico.
        </p>
      </div>

      {createdResult ? (
        /* Constancia de Registro Exitoso */
        <div className="bg-white rounded-xl border-2 border-emerald-500 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center space-x-3 text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Expediente #{createdResult.memoriaId} Formalizado con Éxito
              </h2>
              <p className="text-xs text-slate-600">
                La persona <strong>{createdResult.titular}</strong> y su contrato de consentimiento informado han quedado debidamente acreditados en la base de datos institucional.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="font-mono text-slate-500 uppercase text-[10px]">
              Firma Criptográfica SHA-256 de Custodia:
            </div>
            <div className="font-mono text-xs text-slate-800 break-all bg-white p-2.5 rounded border border-slate-200">
              {createdResult.hash}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => onSuccessNavigate(createdResult.memoriaId)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded transition"
            >
              Ver Expediente de {createdResult.titular}
            </button>
            <button
              onClick={() => onNavigateCarga(createdResult.memoriaId)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-xs rounded flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <span>Proceder a Carga de Relatos (P04)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Formulario Unificado: Persona + Contrato */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: DATOS DE LA PERSONA / INFORMANTE */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold font-serif text-base text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0056b3]" />
                <span>1. Datos de Identificación del Titular</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Paso 1 de 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Informante / Adulto Mayor *
                </label>
                <input
                  type="text"
                  required
                  value={titular}
                  onChange={e => setTitular(e.target.value)}
                  placeholder="Ej: José Ángel González Chaves"
                  className="w-full h-11 px-3 border border-slate-300 rounded focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alias o Nombre Popular en la Comunidad
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={e => setAlias(e.target.value)}
                  placeholder="Ej: Don Chepe"
                  className="w-full h-11 px-3 border border-slate-300 rounded focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Distrito o Comunidad de Palmares *
                </label>
                <select
                  value={distrito}
                  onChange={e => setDistrito(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="Zaragoza, Palmares, Costa Rica">Zaragoza (Café y trapiches)</option>
                  <option value="Rincón de Zaragoza, Palmares, Costa Rica">Rincón de Zaragoza (Partería y salud)</option>
                  <option value="Palmares Centro, Costa Rica">Palmares Centro (Parroquia y comercio)</option>
                  <option value="La Granja, Palmares, Costa Rica">La Granja</option>
                  <option value="Buenos Aires, Palmares, Costa Rica">Buenos Aires</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Año o Fecha de Nacimiento
                </label>
                <input
                  type="text"
                  value={fechaNacimiento}
                  onChange={e => setFechaNacimiento(e.target.value)}
                  placeholder="Ej: 18 de marzo de 1924"
                  className="w-full h-11 px-3 border border-slate-300 rounded focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs sm:text-sm">
                Semblanza Biográfica o Contexto Patrimonial
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Describa brevemente la labor agrícola, comunitaria, culinaria o artesanal de la persona..."
                className="w-full p-3 border border-slate-300 rounded text-xs sm:text-sm focus:border-[#0056b3] focus:ring-1 focus:ring-[#0056b3]"
              />
            </div>
          </div>

          {/* SECCIÓN 2: CONTRATO DE CONSENTIMIENTO INFORMADO */}
          <div className="bg-white p-6 rounded-lg border-t-4 border-t-amber-600 border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold font-serif text-base text-slate-900 flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-amber-600" />
                <span>2. Cláusulas del Contrato de Consentimiento & Cesión Ética</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Paso 2 de 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalidad de Otorgamiento *
                </label>
                <select
                  value={modalidad}
                  onChange={e => setModalidad(e.target.value as any)}
                  className="w-full h-11 px-3 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="Firma digital">Firma Digital / Huella dactilar</option>
                  <option value="Escrita">Documento Físico Notarial Firmado</option>
                  <option value="Grabada">Testimonio Audiovisual Grabado</option>
                  <option value="Representante legal">Representante Legal / Familiar Tutor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha del Acuerdo *
                </label>
                <input
                  type="date"
                  required
                  value={fechaOtorgamiento}
                  onChange={e => setFechaOtorgamiento(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded focus:border-[#0056b3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nivel de Visibilidad Inicial *
                </label>
                <select
                  value={visibilidad}
                  onChange={e => setVisibilidad(e.target.value as any)}
                  className="w-full h-11 px-3 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="publico">Público (Consulta comunitaria y narrador)</option>
                  <option value="familiar">Familiar (Restringido a personas autorizadas)</option>
                  <option value="privado">Privado (Solo custodia interna)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs sm:text-sm">
                Evidencia Probatoria en Custodia
              </label>
              <input
                type="text"
                value={notasContrato}
                onChange={e => setNotasContrato(e.target.value)}
                placeholder="Indique tomo notarial, folio, o registro físico en sede de la Fundación..."
                className="w-full h-11 px-3 border border-slate-300 rounded text-xs sm:text-sm"
              />
            </div>

            {/* Visualización del Hash Criptográfico del Contrato en Vivo */}
            <div className="p-3 bg-amber-50/70 rounded border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1 font-mono">
                <Hash className="w-3.5 h-3.5 text-amber-700" />
                <span>Hash Criptográfico SHA-256 del Contrato (Se certificará inmutablemente):</span>
              </div>
              <div className="font-mono text-slate-800 break-all bg-white p-2 rounded border border-amber-100 text-[11px]">
                {liveHash}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
              Al presionar <strong>"Formalizar Contrato y Crear Expediente"</strong>, se creará el expediente de memoria y se ligará de forma indisoluble a este consentimiento. Sin este paso, el motor de IA y el archivo histórico mantendrán bloqueado el procesamiento.
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <FileSignature className="w-4 h-4" />
              <span>{isSubmitting ? 'Formalizando contrato...' : 'Formalizar Contrato & Crear Expediente'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

