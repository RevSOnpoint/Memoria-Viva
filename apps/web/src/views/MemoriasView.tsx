import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria, UserRole } from '../types';
import { api } from '../services/api';
import {
  BookOpen,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  FileCheck,
  UploadCloud,
  Bot,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  Lock,
  Globe,
  Users
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
      // Redirigir directamente a registrar consentimiento para cumplir la regla
      onNavigate('consentimiento', created.id);
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

  // Métricas para KPI Tiles Fiori
  const totalMemorias = memorias.length;
  const conConsentimiento = memorias.filter(m => m.consentimiento?.evidencia_hash).length;
  const totalAportesValidados = memorias.reduce((acc, m) => acc + (m.aportes_validados || 0), 0);

  return (
    <div className="space-y-6">
      {/* Encabezado y Toolbar SAP Fiori */}
      <div className="bg-white p-6 rounded-lg border border-sap-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-sap-blue uppercase tracking-wider">
            <span>Directorio Central Patrimonial</span>
            <span>•</span>
            <span>Fundación Legado Vivo</span>
          </div>
          <h1 className="text-2xl font-bold text-sap-text mt-1">P02 Mis Memorias & Expedientes</h1>
          <p className="text-sm text-sap-textMuted mt-0.5">
            Custodia inmutable y consulta controlada del acervo histórico de Palmares, Costa Rica.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center space-x-3">
          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="sap-btn sap-btn-primary flex items-center gap-2 shadow"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Nueva Memoria</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Tiles (SAP Fiori ObjectHeader KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sap-card p-5 border-l-4 border-l-sap-blue">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Expedientes en Custodia
          </div>
          <div className="text-3xl font-extrabold text-sap-text mt-1">{totalMemorias}</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-sap-blue" />
            <span>Filtrados según privacidad de rol '{activeRole}'</span>
          </div>
        </div>

        <div className="sap-card p-5 border-l-4 border-l-sap-success">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Con Consentimiento Válido
          </div>
          <div className="text-3xl font-extrabold text-sap-success mt-1">{conConsentimiento}</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sap-success" />
            <span>Acreditados con hash criptográfico SHA-256</span>
          </div>
        </div>

        <div className="sap-card p-5 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Aportes Validados en Base de Conocimiento
          </div>
          <div className="text-3xl font-extrabold text-amber-700 mt-1">{totalAportesValidados}</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Alimentan el Narrador interactivo con fuentes</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Fiori (FilterBar Mobile-First) */}
      <div className="sap-card p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 sm:gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por titular, alias, lugar o relato..."
              className="w-full h-11 pl-9 pr-4 text-xs sm:text-sm border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
            <select
              value={filterVisibilidad}
              onChange={e => setFilterVisibilidad(e.target.value)}
              className="h-11 px-3 text-xs sm:text-sm border border-sap-border rounded bg-white font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="todos">Todas las visibilidades</option>
              <option value="publico">Público</option>
              <option value="familiar">Familiar</option>
              <option value="privado">Privado</option>
            </select>
          </div>
        </div>

        {/* Selector de Vista (Cuadrícula / Tabla) */}
        <div className="flex items-center justify-end space-x-1 border border-sap-border rounded p-1 bg-slate-50 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs sm:text-sm flex items-center gap-1.5 font-semibold transition ${
              viewMode === 'grid' ? 'bg-white shadow text-sap-blue' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs sm:text-sm flex items-center gap-1.5 font-semibold transition ${
              viewMode === 'table' ? 'bg-white shadow text-sap-blue' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Tabla Fiori</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="sap-card p-12 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-sap-blue border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="font-medium">Consultando registros autorizados...</p>
        </div>
      ) : filteredMemorias.length === 0 ? (
        <div className="sap-card p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No se encontraron expedientes</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            No existen expedientes que coincidan con los filtros aplicados o no se cuenta con autorización para visualizarlos bajo el perfil actual.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMemorias.map(memoria => {
            const hasConsent = !!memoria.consentimiento?.evidencia_hash;
            const isSelected = activeMemoriaId === memoria.id;

            return (
              <div
                key={memoria.id}
                className={`sap-card p-6 transition-all hover:shadow-md relative ${
                  isSelected ? 'border-2 border-sap-blue ring-2 ring-blue-100' : 'border border-sap-border'
                }`}
              >
                {/* Badges de Estado Semántico SAP */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {hasConsent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sap-successBg text-sap-success text-xs font-bold border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Consentimiento Válido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sap-errorBg text-sap-error text-xs font-bold border border-red-200">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Sin Consentimiento
                      </span>
                    )}

                    {/* Visibilidad badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      memoria.visibilidad === 'publico'
                        ? 'bg-blue-50 text-sap-blue border border-blue-200'
                        : memoria.visibilidad === 'familiar'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {memoria.visibilidad === 'publico' && <Globe className="w-3 h-3" />}
                      {memoria.visibilidad === 'familiar' && <Users className="w-3 h-3" />}
                      {memoria.visibilidad === 'privado' && <Lock className="w-3 h-3" />}
                      <span className="capitalize">{memoria.visibilidad}</span>
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 font-mono">
                    ID #{memoria.id}
                  </span>
                </div>

                {/* Titular y Datos Fiori */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-sap-text leading-snug">
                    {memoria.titular}
                    {memoria.alias && (
                      <span className="text-sap-blue font-semibold ml-2 text-base">
                        ({memoria.alias})
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{memoria.lugar_origen}</span>
                    {memoria.fecha_nacimiento && (
                      <>
                        <span>•</span>
                        <span>Nacimiento: {memoria.fecha_nacimiento}</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mb-5 leading-relaxed">
                  {memoria.descripcion || 'Sin descripción detallada registrada.'}
                </p>

                {/* Resumen de aportes */}
                <div className="bg-slate-50 p-3 rounded border border-slate-100 flex items-center justify-between text-xs mb-5">
                  <div>
                    <span className="text-slate-500">Aportes Validados:</span>
                    <span className="font-bold text-slate-800 ml-1">
                      {memoria.aportes_validados || 0} / {memoria.total_aportes || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Estado:</span>
                    <span className="font-bold text-slate-800 ml-1">
                      {memoria.estado}
                    </span>
                  </div>
                </div>

                {/* Barra de Acciones por Rol */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                  {/* Abrir Expediente & Vivencias */}
                  <button
                    onClick={() => {
                      setActiveMemoriaId(memoria.id);
                      if (onSelectPersona) onSelectPersona(memoria.id);
                    }}
                    className="p-2 rounded text-xs font-bold bg-[#0056b3] text-white hover:bg-[#004494] flex items-center justify-center gap-1 transition shadow-xs col-span-2 sm:col-span-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Expediente</span>
                  </button>

                  {/* P07: Preguntar al Narrador */}
                  <button
                    onClick={() => {
                      setActiveMemoriaId(memoria.id);
                      if (onSelectPersona) {
                        onSelectPersona(memoria.id);
                      } else {
                        onNavigate('narrador', memoria.id);
                      }
                    }}
                    disabled={!hasConsent}
                    title={!hasConsent ? 'Requiere consentimiento registrado' : 'Interactuar con el narrador'}
                    className={`p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition ${
                      hasConsent
                        ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Narrador</span>
                  </button>

                  {/* P04: Cargar Relato */}
                  {['Digitalizador', 'Administrador'].includes(activeRole) && (
                    <button
                      onClick={() => {
                        setActiveMemoriaId(memoria.id);
                        onNavigate('carga', memoria.id);
                      }}
                      className="p-2 rounded text-xs font-bold bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 flex items-center justify-center gap-1 transition"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Cargar</span>
                    </button>
                  )}

                  {/* P03: Consentimiento */}
                  {['Digitalizador', 'Gestor de datos', 'Administrador'].includes(activeRole) && (
                    <button
                      onClick={() => {
                        setActiveMemoriaId(memoria.id);
                        onNavigate('consentimiento', memoria.id);
                      }}
                      className="p-2 rounded text-xs font-bold bg-blue-50 text-sap-blue hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1 transition"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Contrato</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista de Tabla Fiori Enterprise */
        <div className="sap-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-sap-border">
                <tr>
                  <th className="py-3 px-4">Titular & Expediente</th>
                  <th className="py-3 px-4">Lugar</th>
                  <th className="py-3 px-4">Consentimiento Legal</th>
                  <th className="py-3 px-4">Visibilidad</th>
                  <th className="py-3 px-4">Aportes Validados</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sap-border">
                {filteredMemorias.map(memoria => {
                  const hasConsent = !!memoria.consentimiento?.evidencia_hash;
                  return (
                    <tr key={memoria.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-sap-text">{memoria.titular}</div>
                        {memoria.alias && <div className="text-xs text-sap-blue">{memoria.alias}</div>}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{memoria.lugar_origen}</td>
                      <td className="py-3 px-4">
                        {hasConsent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-sap-success">
                            <ShieldCheck className="w-4 h-4" />
                            Acreditado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-sap-error">
                            <ShieldAlert className="w-4 h-4" />
                            Sin Consentimiento
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {memoria.visibilidad}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {memoria.aportes_validados || 0} / {memoria.total_aportes || 0}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setActiveMemoriaId(memoria.id);
                            onNavigate('narrador', memoria.id);
                          }}
                          disabled={!hasConsent}
                          className="px-2.5 py-1 text-xs font-bold rounded bg-teal-50 text-teal-800 hover:bg-teal-100 disabled:opacity-40"
                        >
                          Narrador
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

      {/* Modal: Registrar Nueva Memoria (SAP Object Creation Dialog) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="sap-card max-w-xl w-full p-5 sm:p-6 shadow-2xl border-t-4 border-t-sap-blue rounded-b-none sm:rounded-lg max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in duration-150">
            <h2 className="text-lg sm:text-xl font-bold text-sap-text mb-1">
              Apertura de Expediente de Memoria
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Fundación Legado Vivo — Todo nuevo expediente se inicia en modo "Privado" hasta el registro fehaciente de su consentimiento.
            </p>

            <form onSubmit={handleCreateMemoria} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Titular *
                </label>
                <input
                  type="text"
                  required
                  value={newTitular}
                  onChange={e => setNewTitular(e.target.value)}
                  placeholder="Ej: José Ángel González Chaves"
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alias o Nombre Popular
                  </label>
                  <input
                    type="text"
                    value={newAlias}
                    onChange={e => setNewAlias(e.target.value)}
                    placeholder="Ej: Don Chepe"
                    className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lugar de Origen
                  </label>
                  <input
                    type="text"
                    value={newLugar}
                    onChange={e => setNewLugar(e.target.value)}
                    placeholder="Ej: Zaragoza, Palmares"
                    className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha o Año de Nacimiento
                  </label>
                  <input
                    type="text"
                    value={newNacimiento}
                    onChange={e => setNewNacimiento(e.target.value)}
                    placeholder="Ej: 18 de marzo de 1924"
                    className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Visibilidad Inicial (Regla: Privado por defecto)
                  </label>
                  <select
                    value={newVisibilidad}
                    onChange={e => setNewVisibilidad(e.target.value as any)}
                    className="w-full h-11 px-3 border border-sap-border rounded bg-white"
                  >
                    <option value="privado">Privado (Recomendado)</option>
                    <option value="familiar">Familiar</option>
                    <option value="publico">Público</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resumen Biográfico o Contexto Patrimonial
                </label>
                <textarea
                  rows={3}
                  value={newDescripcion}
                  onChange={e => setNewDescripcion(e.target.value)}
                  placeholder="Describa la labor agrícola, comunitaria o artesanal de la persona en el cantón de Palmares..."
                  className="w-full p-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="sap-btn sap-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sap-btn sap-btn-primary"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear y Continuar a Consentimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
