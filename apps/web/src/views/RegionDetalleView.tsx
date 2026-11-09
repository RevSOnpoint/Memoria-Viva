import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memoria } from '../types';
import { api } from '../services/api';
import { SafeImage } from '../components/SafeImage';
import { REGIONS, getRegionForPlace, matchesKeywords } from '../data/regions';
import { getPortrait } from '../data/portraits';
import { ArrowRight, ChevronLeft, MapPin, Users } from 'lucide-react';

interface RegionDetalleViewProps {
  regionId: string;
  onBack: () => void;
  onSelectPersona: (memoriaId: number) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const RegionDetalleView: React.FC<RegionDetalleViewProps> = ({
  regionId,
  onBack,
  onSelectPersona,
  onNavigate
}) => {
  const { activeRole } = useAuth();
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrito, setSelectedDistrito] = useState<string>('todos');
  const [selectedTema, setSelectedTema] = useState<string>('todos');

  const region = REGIONS.find(item => item.id === regionId) || REGIONS[0];

  useEffect(() => {
    setIsLoading(true);
    setSelectedDistrito('todos');
    setSelectedTema('todos');
    api.getMemorias()
      .then(data => setMemorias(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [regionId, activeRole]);

  const regionMemorias = useMemo(
    () => memorias.filter(m => getRegionForPlace(m.lugar_origen)?.id === region.id),
    [memorias, region.id]
  );

  const filteredPersonas = useMemo(() => {
    const distrito = region.distritos.find(d => d.id === selectedDistrito);
    const tema = region.temas.find(t => t.id === selectedTema);

    return regionMemorias.filter(persona => {
      const text = `${persona.titular} ${persona.alias || ''} ${persona.descripcion || ''} ${persona.lugar_origen}`;
      return (
        matchesKeywords(text, distrito?.keywords || []) &&
        matchesKeywords(text, tema?.keywords || [])
      );
    });
  }, [region, regionMemorias, selectedDistrito, selectedTema]);

  const canRegister = ['Digitalizador', 'Administrador'].includes(activeRole);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Volver a todas las regiones</span>
      </button>

      <div className="bg-white border border-[#dde3dc] rounded shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-4 h-48 lg:h-auto bg-[#eef1eb]">
            <SafeImage
              src={region.imagen}
              alt={`Paisaje de ${region.canton}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-center gap-4">
            <div>
              <div className="text-[11px] font-bold text-[#2f5d50] uppercase tracking-wider">
                {region.provincia}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1">
                {region.nombre}
              </h1>
              <div className="text-xs text-[#7a8b84] mt-1">
                {region.canton} · Fundado en {region.fundacion} · {region.altitud}
              </div>
              <p className="text-sm text-[#4f625b] mt-3 leading-relaxed">
                {region.descripcion}
              </p>
            </div>

            {canRegister && (
              <div>
                <button
                  onClick={() => onNavigate('registro_contrato')}
                  className="btn-secondary text-xs"
                >
                  Registrar persona
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 border border-[#dde3dc] rounded shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-[#4f625b]">
            Comunidad
            <select
              value={selectedDistrito}
              onChange={e => setSelectedDistrito(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-3 text-sm border border-[#d5ddd6] rounded bg-white text-[#1d2b28]"
            >
              {region.distritos.map(distrito => (
                <option key={distrito.id} value={distrito.id}>{distrito.nombre}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-[#4f625b]">
            Tradición
            <select
              value={selectedTema}
              onChange={e => setSelectedTema(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-3 text-sm border border-[#d5ddd6] rounded bg-white text-[#1d2b28]"
            >
              {region.temas.map(tema => (
                <option key={tema.id} value={tema.id}>{tema.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <h2 className="text-lg font-bold font-serif text-[#1d2b28]">
        Personas de {region.nombre}
      </h2>

      {isLoading ? (
        <div className="bg-white p-12 text-center text-[#6b7c75] rounded border border-[#dde3dc]">
          <div className="animate-spin w-8 h-8 border-4 border-[#2f5d50] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Consultando registros históricos...</p>
        </div>
      ) : filteredPersonas.length === 0 ? (
        <div className="bg-white p-12 text-center text-[#6b7c75] rounded border border-[#dde3dc]">
          <Users className="w-10 h-10 text-[#bac6bf] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1d2b28]">
            {regionMemorias.length === 0
              ? `Aún no hay expedientes en ${region.nombre}`
              : 'No hay personas con este filtro'}
          </h3>
          <p className="text-xs text-[#6b7c75] mt-1">
            {regionMemorias.length === 0
              ? 'El equipo de digitalización trabaja en ampliar la red regional.'
              : 'Pruebe con otra comunidad o tradición.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPersonas.map(persona => (
            <article
              key={persona.id}
              className="bg-white rounded border border-[#dde3dc] hover:border-[#aebbb3] shadow-2xs hover:shadow-sm transition overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-[#eef1eb] overflow-hidden">
                <SafeImage
                  src={getPortrait(persona.titular, persona.alias)}
                  alt={persona.titular}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex-1">
                <h3 className="font-serif font-bold text-base text-[#1d2b28] leading-snug truncate">
                  {persona.titular}
                </h3>
                {persona.alias && (
                  <div className="text-xs text-[#2f5d50] mt-0.5">"{persona.alias}"</div>
                )}
                <div className="flex items-center gap-1 text-[11px] text-[#7a8b84] mt-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{persona.lugar_origen}</span>
                </div>
                <p className="text-xs text-[#4f625b] leading-relaxed mt-2 line-clamp-2">
                  {persona.descripcion || 'Sin semblanza registrada.'}
                </p>
              </div>

              <div className="px-4 py-3 border-t border-[#e8ede7]">
                <button
                  onClick={() => onSelectPersona(persona.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition"
                >
                  <span>Abrir expediente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
