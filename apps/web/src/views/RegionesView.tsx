import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria } from '../types';
import { api } from '../services/api';
import {
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Calendar,
  Compass
} from 'lucide-react';

interface RegionesViewProps {
  onSelectPersona: (memoriaId: number) => void;
  onNavigate: (view: string, params?: any) => void;
}

// Fotografías auténticas para cada informante y tradición
const PORTRAIT_MAP: Record<string, string> = {
  'José Ángel González Chaves': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'Don Chepe': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'Carmen María Rojas Vargas': 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=600&q=80',
  'Doña Carmen': 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_PORTRAIT = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80';

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
    { id: 'zaragoza', nombre: 'Zaragoza' },
    { id: 'rincon', nombre: 'Rincón de Zaragoza' },
    { id: 'centro', nombre: 'Palmares Centro' },
    { id: 'granja', nombre: 'La Granja' }
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
    
    if (selectedDistrito === 'zaragoza' && !textAll.includes('zaragoza')) return false;
    if (selectedDistrito === 'rincon' && !textAll.includes('rincón') && !textAll.includes('rincon')) return false;
    if (selectedDistrito === 'centro' && !textAll.includes('centro') && !textAll.includes('mercedes')) return false;
    if (selectedDistrito === 'granja' && !textAll.includes('granja')) return false;

    if (selectedTema === 'trapiche' && !textAll.includes('trapiche') && !textAll.includes('café') && !textAll.includes('cafe')) return false;
    if (selectedTema === 'parteria' && !textAll.includes('parto') && !textAll.includes('salud') && !textAll.includes('partera')) return false;
    if (selectedTema === 'templo' && !textAll.includes('templo') && !textAll.includes('piedra') && !textAll.includes('mercedes')) return false;
    if (selectedTema === 'solidaridad' && !textAll.includes('terremoto') && !textAll.includes('solidaridad')) return false;

    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Encabezado Territorial con Fotografía Real de Paisaje Palmareño */}
      <div className="border border-[#d8ccba] bg-white rounded shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Imagen real soleada de colinas y cafetales de Palmares */}
          <div className="md:col-span-5 relative h-56 md:h-auto min-h-[240px]">
            <img
              src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=900&q=80"
              alt="Paisaje de cafetales y colinas soleadas en Palmares, Costa Rica"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
            <div className="absolute bottom-2 left-3 text-white text-xs font-medium md:hidden">
              Palmares de Alajuela, Costa Rica
            </div>
          </div>

          {/* Información Institucional Cálida y Limpia */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-[#fbf9f5]">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#c05600] uppercase tracking-wider mb-2 font-serif">
                <span>Territorio Patrimonial 01</span>
                <span>•</span>
                <span>Alajuela, Costa Rica</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2a1a0f] leading-snug">
                Cantón de Palmares
              </h1>

              <p className="text-sm text-[#5c493a] mt-2.5 leading-relaxed font-sans">
                Tierra cálida de agricultores de café, moliendas tradicionales de trapiche en Zaragoza y cuna del Templo Parroquial de Nuestra Señora de las Mercedes, edificado con piedra del Río Grande gracias a la unión comunitaria.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#e5dcce] flex flex-wrap items-center gap-6 text-xs text-[#5c493a]">
              <div>
                <span className="text-[#8c745f] block">Fundación:</span>
                <strong className="text-[#2a1a0f] text-sm">1888</strong>
              </div>
              <div>
                <span className="text-[#8c745f] block">Altitud:</span>
                <strong className="text-[#2a1a0f] text-sm">1.028 m.s.n.m.</strong>
              </div>
              <div>
                <span className="text-[#8c745f] block">Expedientes activos:</span>
                <strong className="text-[#c05600] text-sm font-bold">{memorias.length} personas</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros Geográficos y Tradiciones */}
      <div className="bg-white p-5 sm:p-6 border border-[#e3d9cb] rounded shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eee4d6]">
          <div>
            <h2 className="text-base font-bold text-[#2a1a0f] font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#c05600]" />
              <span>Explorar por Comunidad de Palmares</span>
            </h2>
            <p className="text-xs text-[#665546] mt-0.5">
              Seleccione un distrito o una temática para conocer a las personas y sus vivencias.
            </p>
          </div>

          <div className="text-xs text-[#7d6854] font-medium">
            Mostrando {filteredPersonas.length} {filteredPersonas.length === 1 ? 'persona' : 'personas'}
          </div>
        </div>

        {/* Botones de distritos con estilo cálido y limpio */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-[#7d6854] font-semibold mr-1">Distrito:</span>
          {distritos.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrito(d.id)}
              className={`px-3.5 py-2 rounded text-xs font-semibold transition border ${
                selectedDistrito === d.id
                  ? 'bg-[#c05600] text-white border-[#9f4600] shadow-xs'
                  : 'bg-[#f8f5ee] text-[#442a17] hover:bg-[#ede3d4] border-[#ded2c1]'
              }`}
            >
              {d.nombre}
            </button>
          ))}
        </div>

        {/* Botones de tradiciones */}
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          <span className="text-[#7d6854] font-semibold mr-1">Tradición:</span>
          {temasCulturales.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTema(t.id)}
              className={`px-3 py-1.5 rounded text-xs transition border ${
                selectedTema === t.id
                  ? 'bg-[#442a17] text-white border-[#2a1a0f] font-semibold'
                  : 'bg-[#ffffff] text-[#5c493a] hover:bg-[#f8f5ee] border-[#ded2c1]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Catálogo de Guardianes de la Memoria con Retratos Reales */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-serif text-[#2a1a0f] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c05600]" />
            <span>Guardianes de la Memoria en esta Región</span>
          </h3>

          {['Digitalizador', 'Administrador'].includes(activeRole) && (
            <button
              onClick={() => onNavigate('registro_contrato')}
              className="text-xs font-bold text-[#c05600] hover:text-[#9f4600] hover:underline"
            >
              + Registrar una nueva persona
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white p-12 text-center text-[#7d6854] rounded border border-[#e3d9cb]">
            <div className="animate-spin w-8 h-8 border-4 border-[#c05600] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-medium">Consultando registros históricos...</p>
          </div>
        ) : filteredPersonas.length === 0 ? (
          <div className="bg-white p-12 text-center text-[#7d6854] rounded border border-[#e3d9cb]">
            <Users className="w-12 h-12 text-[#cbb9a3] mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#2a1a0f]">No se encontraron personas con este filtro</h4>
            <p className="text-xs text-[#7d6854] mt-1 max-w-md mx-auto">
              Pruebe seleccionando "Todo el Cantón" para visualizar el catálogo completo de vivencias.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPersonas.map(persona => {
              const hasConsent = !!persona.consentimiento?.evidencia_hash;
              const portraitImg = PORTRAIT_MAP[persona.titular] || PORTRAIT_MAP[persona.alias || ''] || DEFAULT_PORTRAIT;

              return (
                <div
                  key={persona.id}
                  className="bg-white rounded border border-[#d8ccba] hover:border-[#8c6239] shadow-xs hover:shadow-sm transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* Retrato y Datos Principales */}
                    <div className="flex items-start space-x-4">
                      {/* Fotografía de época real del informante */}
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded overflow-hidden border border-[#c4b59f] shadow-xs flex-shrink-0 bg-[#f4ede2]">
                        <img
                          src={portraitImg}
                          alt={persona.titular}
                          className="w-full h-full object-cover sepia-[0.15] contrast-105"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-semibold text-[#8c745f]">
                            {persona.lugar_origen}
                          </span>
                          <span className="text-xs font-mono text-[#8c745f]">
                            #{persona.id}
                          </span>
                        </div>

                        <h4 className="text-lg sm:text-xl font-bold font-serif text-[#2a1a0f] leading-snug truncate">
                          {persona.titular}
                        </h4>

                        {persona.alias && (
                          <div className="text-xs font-semibold text-[#c05600] mt-0.5">
                            "{persona.alias}"
                          </div>
                        )}

                        {persona.fecha_nacimiento && (
                          <div className="text-xs text-[#7d6854] mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#8c745f]" />
                            <span>Nacido en: {persona.fecha_nacimiento}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Semblanza en tipografía amplia y legible */}
                    <p className="text-xs sm:text-sm text-[#442a17] line-clamp-3 leading-relaxed mt-4 font-sans">
                      {persona.descripcion || 'Sin semblanza registrada en la custodia inicial.'}
                    </p>

                    {/* Estado de consentimiento expresado en texto claro */}
                    <div className="mt-4 pt-3 border-t border-[#f0e7d9] flex items-center justify-between text-xs text-[#7d6854]">
                      <div className="flex items-center gap-1.5">
                        {hasConsent ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-[#1b6e39]" />
                            <span className="font-semibold text-[#1b6e39]">Consentimiento firmado</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4 text-[#a81c1c]" />
                            <span className="font-semibold text-[#a81c1c]">Sin consentimiento</span>
                          </>
                        )}
                      </div>

                      <span>
                        <strong>{persona.aportes_validados || 0}</strong> relatos validados
                      </span>
                    </div>
                  </div>

                  {/* Botón de Acción Táctil Claro (>= 48px) */}
                  <div className="bg-[#faf7f2] px-5 py-3 border-t border-[#e5dcce] flex items-center justify-between">
                    <span className="text-xs text-[#7d6854] capitalize">
                      Visibilidad: {persona.visibilidad}
                    </span>

                    <button
                      onClick={() => onSelectPersona(persona.id)}
                      className="btn-primary text-xs flex items-center gap-2"
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
