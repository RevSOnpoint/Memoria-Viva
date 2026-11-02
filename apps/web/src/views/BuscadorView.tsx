import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Search,
  BookOpen,
  FileText,
  Tag,
  Hash,
  Bot,
  ExternalLink,
  Filter,
  Sparkles
} from 'lucide-react';

interface BuscadorViewProps {
  onNavigate: (tab: string, memoriaId?: number) => void;
}

export const BuscadorView: React.FC<BuscadorViewProps> = ({ onNavigate }) => {
  const { setActiveMemoriaId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('trapiche');
  const [activeTab, setActiveTab] = useState<'todos' | 'memorias' | 'aportes' | 'entidades'>('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    query: string;
    total: number;
    memorias: any[];
    aportes: any[];
    entidades: any[];
  } | null>(null);

  const performSearch = (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    api.search(query)
      .then(res => setResults(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    performSearch(searchTerm);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const quickPills = [
    'trapiche',
    'Zaragoza',
    'templo',
    'partera',
    'terremoto 1955',
    'café',
    'bueyes'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado Fiori */}
      <div className="bg-white p-6 rounded-lg border border-sap-border shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold text-sap-blue uppercase tracking-wider">
          <span>Búsqueda y Exploración Patrimonial</span>
          <span>•</span>
          <span>Fundación Legado Vivo</span>
        </div>
        <h1 className="text-2xl font-bold text-sap-text mt-1">P06 Buscador de Memorias & Aportes</h1>
        <p className="text-sm text-sap-textMuted mt-0.5">
          Consultas transversales sobre relatos y entidades validadas con filtrado estricto de privacidad.
        </p>

        {/* Barra de búsqueda SAP Fiori Enterprise */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar personas, oficios, lugares o memorias en Palmares..."
              className="w-full h-12 pl-11 pr-4 text-base border border-sap-border rounded focus:border-sap-blue focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="sap-btn sap-btn-primary min-w-[130px]"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Píldoras de búsqueda rápida */}
        <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Términos frecuentes:</span>
          {quickPills.map(term => (
            <button
              key={term}
              onClick={() => {
                setSearchTerm(term);
                performSearch(term);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Pestañas de Resultados */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-sap-border pb-2 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'todos' ? 'bg-sap-blue text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos ({results.total})
            </button>
            <button
              onClick={() => setActiveTab('memorias')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'memorias' ? 'bg-sap-blue text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Memorias ({results.memorias.length})
            </button>
            <button
              onClick={() => setActiveTab('aportes')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'aportes' ? 'bg-sap-blue text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Aportes Validados ({results.aportes.length})
            </button>
            <button
              onClick={() => setActiveTab('entidades')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'entidades' ? 'bg-sap-blue text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Entidades Históricas ({results.entidades.length})
            </button>
          </div>

          {results.total === 0 ? (
            <div className="sap-card p-12 text-center text-slate-500">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700">Sin coincidencias</h4>
              <p className="text-xs text-slate-500 mt-1">
                No se encontraron registros autorizados para el término "{results.query}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sección Memorias */}
              {(activeTab === 'todos' || activeTab === 'memorias') && results.memorias.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sap-blue" />
                    <span>Expedientes de Memoria ({results.memorias.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.memorias.map(m => (
                      <div key={m.id} className="sap-card p-4 hover:border-sap-blue transition">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sap-text text-base">
                            {m.titular} {m.alias && <span className="text-sap-blue font-semibold">({m.alias})</span>}
                          </h4>
                          <span className="text-xs text-slate-500 font-mono">ID #{m.id}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{m.lugar_origen}</div>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{m.descripcion}</p>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500 capitalize">
                            Visibilidad: {m.visibilidad}
                          </span>
                          <button
                            onClick={() => {
                              setActiveMemoriaId(m.id);
                              onNavigate('narrador', m.id);
                            }}
                            className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Preguntar al Narrador</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección Aportes Validados */}
              {(activeTab === 'todos' || activeTab === 'aportes') && results.aportes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Aportes Testimoniales Validados ({results.aportes.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.aportes.map(a => (
                      <div key={a.id} className="sap-card p-4 hover:border-emerald-300 transition">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 text-sm">{a.titulo}</span>
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {a.tipo}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Por: {a.autor} {a.fecha && `• Fecha: ${a.fecha}`}
                        </div>
                        <p className="text-xs text-slate-700 mt-2 italic bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed font-serif">
                          "{a.fragmento_relevante}"
                        </p>
                        <div className="mt-2.5 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-500 truncate max-w-[300px]">
                            SHA-256: {a.archivo_hash}
                          </span>
                          <button
                            onClick={() => {
                              setActiveMemoriaId(a.memoria_id);
                              onNavigate('narrador', a.memoria_id);
                            }}
                            className="font-bold text-sap-blue hover:underline flex items-center gap-1"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Ver en Memoria #{a.memoria_id}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección Entidades */}
              {(activeTab === 'todos' || activeTab === 'entidades') && results.entidades.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span>Entidades Patrimoniales ({results.entidades.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {results.entidades.map(e => (
                      <div key={e.id} className="sap-card p-3 bg-purple-50/30 border-purple-100">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{e.nombre}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                            {e.tipo}
                          </span>
                        </div>
                        {e.descripcion && (
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{e.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
