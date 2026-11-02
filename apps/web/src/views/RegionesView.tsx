import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria } from '../types';
import { api } from '../services/api';
import {
  MapPin,
  Building2,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Layers,
  Compass
} from 'lucide-react';

interface RegionesViewProps {
  onSelectPersona: (memoriaId: number) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const RegionesView: React.FC<RegionesViewProps> = ({ onSelectPersona, onNavigate }) => {
  const { activeRole } = useAuth();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrito, setSelectedDistrito] = useState<string>('todos');
  const [selectedTema, setSelectedTema] = useState<string>('todos');

  useEffect(() => {
    setIsLoading(true);
    api.getMemorias()
      .then(data => setMemorias(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeRole]);

  const distritos = [
    { id: 'todos', nombre: 'Todo el Cantón' },
    { id: 'zaragoza', nombre: 'Zaragoza', icon: '🌱' },
    { id: 'rincon', nombre: 'Rincón de Zaragoza', icon: '🌿' },
    { id: 'centro', nombre: 'Palmares Centro', icon: '🏛️' },
    { id: 'granja', nombre: 'La Granja', icon: '🏡' }
  ];

  const temasCulturales = [
    { id: 'todos', label: 'Todas las tradiciones' },
    { id: 'trapiche', label: 'Trapiches de dulce y café' },
    { id: 'parteria', label: 'Salud y partería tradicional' },
    { id: 'templo', label: 'Construcción del Templo de Piedra' },
    { id: 'solidaridad', label: 'Solidaridad y Terremoto 1955' }
  ];

  const filteredPersonas = memorias.filter(m => {
    const textAll = `${m.titular} ${m.alias || ''} ${m.descripcion || ''} ${m.lugar_origen}`.toLowerCase();
    
    // Filtro distrito
    if (selectedDistrito === 'zaragoza' && !textAll.includes('zaragoza')) return false;
    if (selectedDistrito === 'rincon' && !textAll.includes('rincón') && !textAll.includes('rincon')) return false;
    if (selectedDistrito === 'centro' && !textAll.includes('centro') && !textAll.includes('mercedes')) return false;
    if (selectedDistrito === 'granja' && !textAll.includes('granja')) return false;

    // Filtro tema
    if (selectedTema === 'trapiche' && !textAll.includes('trapiche') && !textAll.includes('café') && !textAll.includes('cafe')) return false;
    if (selectedTema === 'parteria' && !textAll.includes('parto') && !textAll.includes('salud') && !textAll.includes('partera')) return false;
    if (selectedTema === 'templo' && !textAll.includes('templo') && !textAll.includes('piedra') && !textAll.includes('mercedes')) return false;
    if (selectedTema === 'solidaridad' && !textAll.includes('terremoto') && !textAll.includes('solidaridad')) return false;

    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Encabezado Territorial con Imagen Patrimonial de Palmares */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-[#1a2d47] bg-[#0c1a2d] text-white">
        {/* Banner Ilustrativo de la Región (Palmares, Costa Rica) */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
          {/* Fondo simulando el paisaje de colinas y templo de piedra de Palmares */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2d] via-slate-950/60 to-transparent"></div>

          {/* Sello y datos de la región */}
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-semibold mb-2 font-mono">
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Región 01 • Valle Central Occidental</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
                Cantón de Palmares
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
                Provincia de Alajuela, Costa Rica. Tierra de agricultores cafetaleros, moliendas tradicionales de trapiche en Zaragoza y cuna del Templo Parroquial edificado con piedra del Río Grande.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#112239]/90 border border-blue-900/60 p-3 rounded-lg text-xs backdrop-blur-sm">
              <div className="text-center px-2 border-r border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block font-mono">Fundación</span>
                <span className="font-bold text-white text-sm">1888</span>
              </div>
              <div className="text-center px-2 border-r border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block font-mono">Altitud</span>
                <span className="font-bold text-white text-sm">1.028 m</span>
              </div>
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 uppercase block font-mono">Expedientes</span>
                <span className="font-bold text-amber-400 text-sm">{memorias.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros Geográficos y Culturales */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0056b3]" />
              <span>Exploración por Distrito & Tradición Comunitaria</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtre los guardianes de la memoria según su comunidad de origen en Palmares.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold font-mono">
            {filteredPersonas.length} {filteredPersonas.length === 1 ? 'persona registrada' : 'personas registradas'}
          </div>
        </div>

        {/* Píldoras de Distritos */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase">Distrito:</span>
          {distritos.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrito(d.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                selectedDistrito === d.id
                  ? 'bg-[#0056b3] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {d.icon && <span>{d.icon}</span>}
              <span>{d.nombre}</span>
            </button>
          ))}
        </div>

        {/* Píldoras de Tradiciones */}
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase">Temática:</span>
          {temasCulturales.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTema(t.id)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedTema === t.id
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Catálogo de Personas y Guardianes de la Memoria en esta Región */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0056b3]" />
            <span>Guardianes de la Memoria de Palmares</span>
          </h3>

          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => onNavigate('registro_contrato')}
              className="text-xs font-bold text-[#0056b3] hover:underline flex items-center gap-1"
            >
              <span>+ Registrar nuevo informante</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white p-12 text-center text-slate-500 rounded-lg border border-slate-200">
            <div className="animate-spin w-8 h-8 border-4 border-[#0056b3] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm font-medium">Consultando registros históricos autorizados...</p>
          </div>
        ) : filteredPersonas.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-500 rounded-lg border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">Sin informantes para esta selección</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No existen testimonios validados en el distrito o temática seleccionada bajo los permisos actuales.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPersonas.map(persona => {
              const hasConsent = !!persona.consentimiento?.evidencia_hash;

              return (
                <div
                  key={persona.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    {/* Encabezado de la Tarjeta con Badges Institucionales */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 block mb-0.5">
                          Expediente #{persona.id} • {persona.tipo}
                        </span>
                        <h4 className="text-xl font-bold font-serif text-slate-900 leading-snug">
                          {persona.titular}
                        </h4>
                        {persona.alias && (
                          <span className="inline-block text-xs font-semibold text-[#0056b3] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-0.5">
                            Conocido popularmente como: {persona.alias}
                          </span>
                        )}
                      </div>

                      {/* Estado de Consentimiento Ético */}
                      {hasConsent ? (
                        <span
                          title="Consentimiento acreditado formalmente con hash SHA-256"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex-shrink-0"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Custodia Acreditada</span>
                        </span>
                      ) : (
                        <span
                          title="Sin consentimiento legal formal. No procesable."
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-800 text-[11px] font-bold border border-red-200 flex-shrink-0"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          <span>Sin Consentimiento</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{persona.lugar_origen}</span>
                      {persona.fecha_nacimiento && (
                        <>
                          <span>•</span>
                          <span>Nacido en: {persona.fecha_nacimiento}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {persona.descripcion || 'Sin semblanza registrada.'}
                    </p>

                    {/* Resumen de vivencias y testimonios */}
                    <div className="bg-slate-50 p-3 rounded border border-slate-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Aportes Validados:</span>
                      <span className="font-bold text-slate-800">
                        {persona.aportes_validados || 0} testimonios
                      </span>
                    </div>
                  </div>

                  {/* Pie de acción directa: "Ver Expediente y Vivencias" */}
                  <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium capitalize">
                      Visibilidad: {persona.visibilidad}
                    </span>

                    <button
                      onClick={() => onSelectPersona(persona.id)}
                      className="px-4 py-2 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-xs transition"
                    >
                      <span>Abrir Expediente & Vivencias</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

