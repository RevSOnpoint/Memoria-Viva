import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, UserRole } from '../types';
import { api } from '../services/api';
import { SafeImage } from '../components/SafeImage';
import { getPortrait } from '../data/portraits';
import {
  BookOpen,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  FileCheck,
  UploadCloud,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Lock,
  Globe,
  Users,
  Building2,
  ArrowRight
} from 'lucide-react';

interface MemoriasViewProps {
  onNavigate: (tab: string, memoriaId?: number) => void;
  onSelectPersona?: (memoriaId: number) => void;
}

export const MemoriasView: React.FC<MemoriasViewProps> = ({ onNavigate, onSelectPersona }) => {
  const { activeRole, activeMemoriaId, setActiveMemoriaId } = useAuth();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisibilidad, setFilterVisibilidad] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal para nueva memoria
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitular, setNewTitular] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newLugar, setNewLugar] = useState('Palmares, Costa Rica');
  const [newNacimiento, setNewNacimiento] = useState('');
  const [newVisibilidad, setNewVisibilidad] = useState<'privado' | 'familiar' | 'publico'>('privado');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMemorias = () => {
    setIsLoading(true);
    api.getMemorias()
      .then(data => {
        setMemorias(data);
        if (!activeMemoriaId && data.length > 0) {
          setActiveMemoriaId(data[0].id);
        }
      })
      .catch(err => {
        setError(err.message || 'Error al cargar memorias');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadMemorias();
  }, [activeRole]);

  const handleCreateMemoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitular.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await api.createMemoria({
        titular: newTitular,
        alias: newAlias || undefined,
        descripcion: newDescripcion || undefined,
        lugar_origen: newLugar,
        fecha_nacimiento: newNacimiento || undefined,
        visibilidad: newVisibilidad,
        tipo: 'Individual'
      });
      setShowCreateModal(false);
      setNewTitular('');
      setNewAlias('');
      setNewDescripcion('');
      loadMemorias();
      setActiveMemoriaId(created.id);
      onNavigate('registro_contrato');
    } catch (err: any) {
      alert(err.message || 'Error creando expediente de memoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMemorias = memorias.filter(m => {
    const matchesSearch =
      m.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.alias && m.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.lugar_origen.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVis = filterVisibilidad === 'todos' || m.visibilidad === filterVisibilidad;
    return matchesSearch && matchesVis;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado Institucional Cálido */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
            <Building2 className="w-4 h-4" />
            <span>Archivo General de Personas & Expedientes Históricos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1.5">
            Custodia del Acervo Humano Regional
          </h1>
          <p className="text-sm sm:text-base text-[#344a43] mt-1 leading-relaxed">
            Consulte las biografías de vida, relatos agrícolas y documentos preservados bajo consentimiento informado.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center space-x-3">
          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => onNavigate('registro_contrato')}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              <span>Registrar Nueva Persona & Contrato</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Accesible para Adultos Mayores */}
      <div className="bg-white p-4 rounded border border-[#d5ddd6] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#4f6b62] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, apodo, distrito o vivencia..."
              className="w-full min-h-[48px] pl-11 pr-4 text-sm sm:text-base border border-[#d5ddd6] rounded bg-[#ffffff] text-[#1d2b28] focus:border-[#2f5d50] focus:ring-1 focus:ring-[#2f5d50]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-[#4f6b62] hidden sm:block" />
            <select
              value={filterVisibilidad}
              onChange={e => setFilterVisibilidad(e.target.value)}
              className="min-h-[48px] px-3.5 text-sm font-medium border border-[#d5ddd6] rounded bg-white text-[#1d2b28] w-full sm:w-auto"
            >
              <option value="todos">Todas las visibilidades</option>
              <option value="publico">Público</option>
              <option value="familiar">Familiar</option>
              <option value="privado">Privado</option>
            </select>
          </div>
        </div>

        {/* Selector de Modo de Vista */}
        <div className="flex items-center justify-end space-x-1 border border-[#d5ddd6] rounded p-1 bg-[#fafaf7] self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`min-h-[40px] px-3 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'grid'
                ? 'bg-[#2f5d50] text-white shadow-xs'
                : 'text-[#344a43] hover:bg-[#eef1eb]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`min-h-[40px] px-3 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'table'
                ? 'bg-[#2f5d50] text-white shadow-xs'
                : 'text-[#344a43] hover:bg-[#eef1eb]'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Registro</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="bg-white p-12 rounded border border-[#d5ddd6] text-center text-[#5a6b64]">
          <div className="animate-spin w-8 h-8 border-3 border-[#2f5d50] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="font-serif text-base">Consultando expedientes autorizados...</p>
        </div>
      ) : filteredMemorias.length === 0 ? (
        <div className="bg-white p-12 rounded border border-[#d5ddd6] text-center text-[#5a6b64]">
          <BookOpen className="w-12 h-12 text-[#aebbb3] mx-auto mb-3" />
          <h3 className="text-xl font-bold font-serif text-[#1d2b28]">No se encontraron expedientes</h3>
          <p className="text-sm text-[#5a6b64] max-w-md mx-auto mt-1">
            No existen personas que coincidan con la búsqueda o no se cuenta con autorización para visualizarlas bajo el perfil actual.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMemorias.map(memoria => {
            const hasConsent = !!memoria.consentimiento?.evidencia_hash;
            const photoUrl = getPortrait(memoria.titular, memoria.alias);

            return (
              <div
                key={memoria.id}
                className="bg-white rounded border border-[#d5ddd6] shadow-2xs hover:border-[#aebbb3] transition flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Cabecera de la Tarjeta con Foto y Datos Principales */}
                  <div className="p-5 sm:p-6 flex items-start gap-4 border-b border-[#eef1eb]">
                    <SafeImage
                      src={photoUrl}
                      alt={memoria.titular}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded object-cover border-2 border-[#d5ddd6] flex-shrink-0 shadow-xs"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-[#4f6b62] font-serif font-bold uppercase tracking-wider">
                          Expediente #{memoria.id}
                        </span>
                        
                        <span className="text-xs text-[#5a6b64] font-medium bg-[#fafaf7] px-2 py-0.5 rounded border border-[#dde3dc] capitalize">
                          {memoria.visibilidad}
                        </span>
                      </div>

                        <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1d2b28] leading-tight line-clamp-2">
                        {memoria.titular}
                      </h3>

                      {memoria.alias && (
                        <div className="text-sm font-semibold text-[#2f5d50] mt-0.5">
                          "{memoria.alias}"
                        </div>
                      )}

                      <div className="text-xs text-[#5a6b64] mt-1 truncate">
                        {memoria.lugar_origen}
                      </div>
                    </div>
                  </div>

                  {/* Semblanza y Estado Ético */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <p className="text-xs sm:text-sm text-[#344a43] line-clamp-3 leading-relaxed">
                      {memoria.descripcion || 'Expediente histórico con vivencias orales y aportes documentales custodiados.'}
                    </p>

                    <div className="p-3 bg-[#fafaf7] rounded border border-[#dde3dc] flex items-center justify-between text-xs text-[#344a43]">
                      <div className="flex items-center gap-1.5">
                        {hasConsent ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-[#2c6e4f]" />
                            <span className="font-semibold text-[#2c6e4f]">Consentimiento Válido</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4 text-[#a34a3d]" />
                            <span className="font-semibold text-[#a34a3d]">Sin Consentimiento</span>
                          </>
                        )}
                      </div>

                      <div>
                        <span className="text-[#5a6b64]">Aportes validados:</span>
                        <strong className="ml-1 text-[#1d2b28]">
                          {memoria.aportes_validados || 0}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="p-4 bg-[#f7f7f3] border-t border-[#eef1eb] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveMemoriaId(memoria.id);
                      if (onSelectPersona) onSelectPersona(memoria.id);
                    }}
                    className="btn-primary flex-1 text-xs sm:text-sm"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Consultar Expediente & Vivencias</span>
                  </button>

                  {['Digitalizador', 'Administrador'].includes(activeRole) && (
                    <button
                      onClick={() => {
                        setActiveMemoriaId(memoria.id);
                        onNavigate('carga', memoria.id);
                      }}
                      className="btn-secondary text-xs sm:text-sm px-3"
                      title="Cargar nuevo testimonio"
                    >
                      <UploadCloud className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista de Registro en Tabla Cálida */
        <div className="bg-white rounded border border-[#d5ddd6] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1d2b28]">
              <thead className="bg-[#fafaf7] text-xs font-bold text-[#344a43] uppercase tracking-wider border-b border-[#d5ddd6] font-serif">
                <tr>
                  <th className="py-3.5 px-4">Titular de la Memoria</th>
                  <th className="py-3.5 px-4">Distrito / Lugar</th>
                  <th className="py-3.5 px-4">Consentimiento</th>
                  <th className="py-3.5 px-4">Visibilidad</th>
                  <th className="py-3.5 px-4">Aportes</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1eb]">
                {filteredMemorias.map(memoria => {
                  const hasConsent = !!memoria.consentimiento?.evidencia_hash;
                  return (
                    <tr key={memoria.id} className="hover:bg-[#fbfbf8] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold font-serif text-base text-[#1d2b28]">{memoria.titular}</div>
                        {memoria.alias && <div className="text-xs text-[#2f5d50] font-semibold">"{memoria.alias}"</div>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5a6b64]">{memoria.lugar_origen}</td>
                      <td className="py-3.5 px-4">
                        {hasConsent ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2c6e4f]">
                            <ShieldCheck className="w-4 h-4" />
                            Acreditado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a34a3d]">
                            <ShieldAlert className="w-4 h-4" />
                            Sin Consentimiento
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded bg-[#fafaf7] text-[#344a43] border border-[#dde3dc]">
                          {memoria.visibilidad}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold">
                        {memoria.aportes_validados || 0} validados
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveMemoriaId(memoria.id);
                            if (onSelectPersona) onSelectPersona(memoria.id);
                          }}
                          className="btn-secondary min-h-[38px] py-1 text-xs"
                        >
                          Ver Expediente
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
