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
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d8ccba] shadow-2xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#c05600] uppercase tracking-wider font-serif">
          <Building2 className="w-4 h-4" />
          <span>Búsqueda & Exploración Documental Transversal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#261b12] mt-1.5">
          Archivo Documental de Palmares
        </h1>
        <p className="text-sm sm:text-base text-[#442a17] mt-1 leading-relaxed">
          Localice vivencias, relatos agrícolas, tradiciones y entidades históricas con filtrado estricto de privacidad.
        </p>

        {/* Barra de búsqueda con objetivo táctil amplio */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#8c6239] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar personas, oficios, lugares o vivencias en Palmares..."
              className="w-full min-h-[48px] pl-11 pr-4 text-sm sm:text-base border border-[#d8ccba] rounded bg-white text-[#261b12] focus:border-[#c05600]"
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
          <span className="text-[#665546] font-bold font-serif mr-1">Términos frecuentes:</span>
          {quickPills.map(term => (
            <button
              key={term}
              onClick={() => {
                setSearchTerm(term);
                performSearch(term);
              }}
              className="px-3 py-1.5 rounded bg-[#fcf8f3] hover:bg-[#f4ede2] text-[#442a17] border border-[#d8ccba] font-medium transition"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Pestañas de Resultados */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#e3d9cb] pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('todos')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'todos' ? 'bg-[#c05600] text-white font-bold' : 'text-[#442a17] hover:bg-[#f4ede2]'
              }`}
            >
              Todos ({results.total})
            </button>
            <button
              onClick={() => setActiveTab('memorias')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'memorias' ? 'bg-[#c05600] text-white font-bold' : 'text-[#442a17] hover:bg-[#f4ede2]'
              }`}
            >
              Expedientes ({results.memorias.length})
            </button>
            <button
              onClick={() => setActiveTab('aportes')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'aportes' ? 'bg-[#c05600] text-white font-bold' : 'text-[#442a17] hover:bg-[#f4ede2]'
              }`}
            >
              Aportes Validados ({results.aportes.length})
            </button>
            <button
              onClick={() => setActiveTab('entidades')}
              className={`min-h-[40px] px-3.5 rounded transition ${
                activeTab === 'entidades' ? 'bg-[#c05600] text-white font-bold' : 'text-[#442a17] hover:bg-[#f4ede2]'
              }`}
            >
              Entidades ({results.entidades.length})
            </button>
          </div>

          {results.total === 0 ? (
            <div className="bg-white p-12 rounded border border-[#d8ccba] text-center text-[#665546]">
              <Search className="w-10 h-10 text-[#bfae97] mx-auto mb-2" />
              <h4 className="font-bold font-serif text-lg text-[#261b12]">Sin coincidencias</h4>
              <p className="text-sm text-[#665546] mt-1">
                No se encontraron registros autorizados para el término "{results.query}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sección Memorias */}
              {(activeTab === 'todos' || activeTab === 'memorias') && results.memorias.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#665546] font-serif flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#c05600]" />
                    <span>Expedientes de Memoria ({results.memorias.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.memorias.map(m => (
                      <div key={m.id} className="bg-white p-5 rounded border border-[#d8ccba] shadow-2xs hover:border-[#bfae97] transition space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold font-serif text-lg text-[#261b12]">
                            {m.titular} {m.alias && <span className="text-[#c05600] font-sans font-semibold">({m.alias})</span>}
                          </h4>
                          <span className="text-xs text-[#8c6239] font-serif">#{m.id}</span>
                        </div>
                        <div className="text-xs text-[#665546]">{m.lugar_origen}</div>
                        <p className="text-xs sm:text-sm text-[#442a17] line-clamp-2 leading-relaxed">{m.descripcion}</p>
                        <div className="pt-3 border-t border-[#f4ede2] flex items-center justify-between">
                          <span className="text-xs font-medium text-[#665546] capitalize">
                            Visibilidad: {m.visibilidad}
                          </span>
                          <button
                            onClick={() => {
                              setActiveMemoriaId(m.id);
                              onNavigate('persona_detalle', m.id);
                            }}
                            className="text-xs font-bold text-[#c05600] hover:underline flex items-center gap-1 font-serif"
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#665546] font-serif flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#1b6e39]" />
                    <span>Aportes Testimoniales Validados ({results.aportes.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.aportes.map(a => (
                      <div key={a.id} className="bg-white p-5 rounded border border-[#d8ccba] shadow-2xs hover:border-[#bfae97] transition space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold font-serif text-base text-[#261b12]">{a.titulo}</span>
                          <span className="capitalize px-2 py-0.5 rounded bg-[#fcf8f3] text-[#442a17] font-semibold border border-[#e3d9cb]">
                            {a.tipo}
                          </span>
                        </div>
                        <div className="text-xs text-[#665546]">
                          Por: {a.autor} {a.fecha && `• Fecha: ${a.fecha}`}
                        </div>
                        <p className="text-xs sm:text-sm text-[#261b12] italic bg-[#fcf8f3] p-3 rounded border border-[#e3d9cb] leading-relaxed font-serif">
                          "{a.fragmento_relevante}"
                        </p>
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="font-mono text-[#665546] text-[11px] truncate max-w-[280px]">
                            SHA-256: {a.archivo_hash}
                          </span>
                          <button
                            onClick={() => {
                              setActiveMemoriaId(a.memoria_id);
                              onNavigate('persona_detalle', a.memoria_id);
                            }}
                            className="font-bold text-[#c05600] hover:underline flex items-center gap-1 font-serif"
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#665546] font-serif flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#8c6239]" />
                    <span>Entidades Patrimoniales ({results.entidades.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {results.entidades.map(e => (
                      <div key={e.id} className="bg-white p-4 rounded border border-[#d8ccba] shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-[#261b12]">
                          <span className="font-serif text-sm">{e.nombre}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#fef6ee] text-[#c05600] rounded border border-[#ecdac7]">
                            {e.tipo}
                          </span>
                        </div>
                        {e.descripcion && (
                          <p className="text-xs text-[#665546] mt-1 line-clamp-2">{e.descripcion}</p>
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
