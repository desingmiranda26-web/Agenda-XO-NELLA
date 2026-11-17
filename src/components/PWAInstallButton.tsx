import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#2D0A4E] border border-[#6A0DAD] px-4 py-2 text-sm font-bold text-[#F5F2EB] hover:bg-[#6A0DAD] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Instalar App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#2D0A4E] border border-[#F5F2EB]/20 px-4 py-2 text-sm font-bold text-[#F5F2EB] hover:border-[#6A0DAD] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          Instalar en iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#2D0A4E] border border-[#F5F2EB]/15 p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-[#F5F2EB]">Instalar XO NELLA</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#F5F2EB]/75 hover:text-[#F5F2EB]"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-[#F5F2EB]/85 leading-relaxed">
                Para usar la agenda como app independiente en iPhone o iPad:
              </p>
              <ol className="mt-3 space-y-2 text-sm text-[#F5F2EB]/90">
                <li>1. Toca el botón Compartir en Safari.</li>
                <li>2. Selecciona Agregar a pantalla de inicio.</li>
                <li>3. Confirma con Agregar para abrir XO NELLA sin navegador.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-[#6A0DAD] text-sm font-bold text-[#F5F2EB] hover:bg-[#7B18C8] transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
