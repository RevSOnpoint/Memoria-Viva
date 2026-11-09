import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from '../components/SafeImage';
import { REGIONS } from '../data/regions';
import { ArrowRight } from 'lucide-react';

interface RegionesViewProps {
  onSelectRegion: (regionId: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const RegionesView: React.FC<RegionesViewProps> = ({ onSelectRegion, onNavigate }) => {
  const { activeRole } = useAuth();
  const canRegister = ['Digitalizador', 'Administrador'].includes(activeRole);

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28]">
            Regiones y Territorios
          </h1>
          <p className="text-sm sm:text-base text-[#5a6b64] mt-1 leading-relaxed max-w-2xl">
            Seleccione un cantón para conocer las personas, oficios y tradiciones que custodian su memoria.
          </p>
        </div>

        {canRegister && (
          <button
            onClick={() => onNavigate('registro_contrato')}
            className="btn-primary text-xs self-start sm:self-auto"
          >
            Registrar persona
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {REGIONS.map(regionItem => (
          <button
            key={regionItem.id}
            onClick={() => onSelectRegion(regionItem.id)}
            className="group text-left bg-white rounded border border-[#dde3dc] hover:border-[#aebbb3] shadow-2xs hover:shadow-sm transition overflow-hidden"
          >
            <div className="h-40 bg-[#eef1eb] overflow-hidden">
              <SafeImage
                src={regionItem.imagen}
                alt={`Paisaje de ${regionItem.canton}`}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>

            <div className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-lg text-[#1d2b28] leading-tight">
                  {regionItem.nombre}
                </h2>
                <div className="text-xs text-[#7a8b84] mt-0.5">{regionItem.canton}</div>
                <p className="text-xs text-[#4f625b] leading-relaxed mt-2 line-clamp-2">
                  {regionItem.descripcion}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#2f5d50] flex-shrink-0 mt-1 transition group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
