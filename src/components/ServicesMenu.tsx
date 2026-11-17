import React from 'react';
import { Check } from 'lucide-react';
import { SERVICES, type NailService } from '../types.ts';

interface ServicesMenuProps {
  selectedServiceId: string;
  onSelectService: (service: NailService) => void;
}

export const ServicesMenu: React.FC<ServicesMenuProps> = ({
  selectedServiceId,
  onSelectService,
}) => {
  return (
    <section id="servicios" className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
              01. Menú de Servicios
            </h2>
            <p className="mt-1 text-sm sm:text-base font-normal text-[#F5F2EB]/70">
              Selecciona el servicio que deseas agendar hoy. Precios transparentes por set.
            </p>
          </div>
          <p className="text-xs sm:text-sm font-normal text-[#F5F2EB]/60">
            7 servicios disponibles · Depósito 50% o pago completo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service) => {
            const isSelected = service.id === selectedServiceId;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service)}
                aria-pressed={isSelected}
                className={`text-left rounded-2xl p-5 transition-all cursor-pointer min-h-[124px] flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB] ${
                  isSelected
                    ? 'bg-[#2D0A4E] border-2 border-[#6A0DAD] shadow-lg shadow-[#6A0DAD]/25'
                    : 'bg-[#1A1622] border border-[#F5F2EB]/10 hover:border-[#6A0DAD]/60 hover:bg-[#221632]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#F5F2EB] leading-snug">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-xs font-normal text-[#F5F2EB]/60 tabular-nums">
                      Duración estimada · {service.durationMinutes} min
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold text-[#F5F2EB] tabular-nums">
                      {service.price}€
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D8B4FE]">
                        <Check className="w-3.5 h-3.5" />
                        Elegido
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-normal text-[#F5F2EB]/75 leading-relaxed">
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
