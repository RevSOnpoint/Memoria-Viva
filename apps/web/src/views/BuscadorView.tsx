import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Search,
  BookOpen,
  FileText,
  Tag,
  Building2,
  ArrowRight
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
      {/* Encabezado Institucional Cálido */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
          <Building2 className="w-4 h-4" />
          <span>Búsqueda & Exploración Documental Transversal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1.5">
          Archivo Documental de Palmares
        </h1>
        <p className="text-sm sm:text-base text-[#344a43] mt-1 leading-relaxed">
          Localice vivencias, relatos agrícolas, tradiciones y entidades históricas con filtrado estricto de privacidad.
        </p>

        {/* Barra de búsqueda con objetivo táctil amplio */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#4f6b62] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar personas, oficios, lugares o vivencias en Palmares..."
              className="w-full min-h-[48px] pl-11 pr-4 text-sm sm:text-base border border-[#d5ddd6] rounded bg-white text-[#1d2b28] focus:border-[#2f5d50]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary min-w-[140px]"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Píldoras de búsqueda rápida */}
        <div className="mt-4 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-[#5a6b64] font-bold font-serif mr-1">Términos frecuentes:</span>
          {quickPills.map(term => (
            <button
              key={term}
              onClick={() => {
                setSearchTerm(term);
                performSearch(term);
              }}
              className="px-3 py-1.5 rounded bg-[#fafaf7] hover:bg-[#eef1eb] text-[#344a43] border border-[#d5ddd6] font-medium transition"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Pestañas de Resultados */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#dde3dc] pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('todos')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'todos' ? 'bg-[#2f5d50] text-white font-bold' : 'text-[#344a43] hover:bg-[#eef1eb]'
              }`}
            >
              Todos ({results.total})
            </button>
            <button
              onClick={() => setActiveTab('memorias')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'memorias' ? 'bg-[#2f5d50] text-white font-bold' : 'text-[#344a43] hover:bg-[#eef1eb]'
              }`}
            >
              Expedientes ({results.memorias.length})
            </button>
            <button
              onClick={() => setActiveTab('aportes')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'aportes' ? 'bg-[#2f5d50] text-white font-bold' : 'text-[#344a43] hover:bg-[#eef1eb]'
              }`}
            >
              Aportes Validados ({results.aportes.length})
            </button>
            <button
              onClick={() => setActiveTab('entidades')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'entidades' ? 'bg-[#2f5d50] text-white font-bold' : 'text-[#344a43] hover:bg-[#eef1eb]'
              }`}
            >
              Entidades ({results.entidades.length})
            </button>
          </div>

          {results.total === 0 ? (
            <div className="bg-white p-12 rounded border border-[#d5ddd6] text-center text-[#5a6b64]">
              <Search className="w-10 h-10 text-[#aebbb3] mx-auto mb-2" />
              <h4 className="font-bold font-serif text-lg text-[#1d2b28]">Sin coincidencias</h4>
              <p className="text-sm text-[#5a6b64] mt-1">
                No se encontraron registros autorizados para el término "{results.query}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sección Memorias */}
              {(activeTab === 'todos' || activeTab === 'memorias') && results.memorias.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5a6b64] font-serif flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#2f5d50]" />
                    <span>Expedientes de Memoria ({results.memorias.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.memorias.map(m => (
                      <div key={m.id} className="bg-white p-5 rounded border border-[#d5ddd6] shadow-2xs hover:border-[#aebbb3] transition space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold font-serif text-lg text-[#1d2b28]">
                            {m.titular} {m.alias && <span className="text-[#2f5d50] font-sans font-semibold">({m.alias})</span>}
                          </h4>
                          <span className="text-xs text-[#4f6b62] font-serif">#{m.id}</span>
                        </div>
                        <div className="text-xs text-[#5a6b64]">{m.lugar_origen}</div>
                        <p className="text-xs sm:text-sm text-[#344a43] line-clamp-2 leading-relaxed">{m.descripcion}</p>
                        <div className="pt-3 border-t border-[#eef1eb] flex items-center justify-between">
                          <span className="text-xs font-medium text-[#5a6b64] capitalize">
                            Visibilidad: {m.visibilidad}
                          </span>
                          <button
                            onClick={() => {
                              setActiveMemoriaId(m.id);
                              onNavigate('persona_detalle', m.id);
                            }}
                            className="text-xs font-bold text-[#2f5d50] hover:underline flex items-center gap-1 font-serif"
                          >
                            <span>Ver Expediente</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5a6b64] font-serif flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#2c6e4f]" />
                    <span>Aportes Testimoniales Validados ({results.aportes.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.aportes.map(a => (
                      <div key={a.id} className="bg-white p-5 rounded border border-[#d5ddd6] shadow-2xs hover:border-[#aebbb3] transition space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold font-serif text-base text-[#1d2b28]">{a.titulo}</span>
                          <span className="capitalize px-2 py-0.5 rounded bg-[#fafaf7] text-[#344a43] font-semibold border border-[#dde3dc]">
                            {a.tipo}
                          </span>
                        </div>
                        <div className="text-xs text-[#5a6b64]">
                          Por: {a.autor} {a.fecha && `• Fecha: ${a.fecha}`}
                        </div>
                        <p className="text-xs sm:text-sm text-[#1d2b28] italic bg-[#fafaf7] p-3 rounded border border-[#dde3dc] leading-relaxed font-serif">
                          "{a.fragmento_relevante}"
                        </p>
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="font-mono text-[#5a6b64] text-[11px] truncate max-w-[280px]">
                            Código: {a.archivo_hash}
                          </span>
                          <button
                            onClick={() => {
                              setActiveMemoriaId(a.memoria_id);
                              onNavigate('persona_detalle', a.memoria_id);
                            }}
                            className="font-bold text-[#2f5d50] hover:underline flex items-center gap-1 font-serif"
                          >
                            <span>Consultar en Memoria #{a.memoria_id}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5a6b64] font-serif flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#4f6b62]" />
                    <span>Entidades Patrimoniales ({results.entidades.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {results.entidades.map(e => (
                      <div key={e.id} className="bg-white p-4 rounded border border-[#d5ddd6] shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1d2b28]">
                          <span className="font-serif text-sm">{e.nombre}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#f2f5f0] text-[#2f5d50] rounded border border-[#e4e9e2]">
                            {e.tipo}
                          </span>
                        </div>
                        {e.descripcion && (
                          <p className="text-xs text-[#5a6b64] mt-1 line-clamp-2">{e.descripcion}</p>
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
