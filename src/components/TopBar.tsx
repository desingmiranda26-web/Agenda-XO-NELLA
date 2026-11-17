import React from 'react';
import { Calendar, Image as ImageIcon, Scissors, Sparkles } from 'lucide-react';

interface TopBarProps {
  mode: 'client' | 'manicurist';
  onSwitchMode: (mode: 'client' | 'manicurist') => void;
  onJumpTo: (sectionId: string) => void;
  unreadCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onSwitchMode,
  onJumpTo,
  unreadCount,
}) => {
  return (
    <>
      <header className="sticky top-0 z-30 bg-[#121212]/90 backdrop-blur-md border-b border-[#F5F2EB]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              onJumpTo('inicio');
            }}
            className="text-lg font-bold tracking-tight text-[#F5F2EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A0DAD] rounded"
          >
            XO NELLA
          </a>

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-normal text-[#F5F2EB]/75"
          >
            <a
              href="#servicios"
              onClick={(e) => {
                e.preventDefault();
                onSwitchMode('client');
                onJumpTo('servicios');
              }}
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Servicios
            </a>
            <a
              href="#galeria"
              onClick={(e) => {
                e.preventDefault();
                onSwitchMode('client');
                onJumpTo('galeria');
              }}
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Galería
            </a>
            <a
              href="#horarios"
              onClick={(e) => {
                e.preventDefault();
                onSwitchMode('client');
                onJumpTo('horarios');
              }}
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Horarios
            </a>
            <a
              href="#agenda"
              onClick={(e) => {
                e.preventDefault();
                onSwitchMode('manicurist');
                onJumpTo('agenda');
              }}
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Agenda{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (mode === 'manicurist') {
                  onSwitchMode('client');
                  onJumpTo('reservar');
                } else {
                  onJumpTo('reservar');
                }
              }}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold text-[#F5F2EB] bg-[#6A0DAD] hover:bg-[#7B18C8] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB]"
            >
              Agendar Turno
            </button>
          </div>
        </div>
      </header>

      {/* Mobile thumb-zone bottom bar (hidden on md+) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#121212]/95 backdrop-blur-md border-t border-[#F5F2EB]/12 px-2 grid grid-cols-4 items-center"
      >
        <button
          type="button"
          onClick={() => {
            onSwitchMode('client');
            onJumpTo('servicios');
          }}
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#F5F2EB]/75 hover:text-[#F5F2EB] cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px] font-normal whitespace-nowrap">Servicios</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSwitchMode('client');
            onJumpTo('galeria');
          }}
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#F5F2EB]/75 hover:text-[#F5F2EB] cursor-pointer"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[11px] font-normal whitespace-nowrap">Galería</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSwitchMode('client');
            onJumpTo('horarios');
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            mode === 'client' ? 'text-[#F5F2EB] font-bold' : 'text-[#F5F2EB]/75'
          }`}
        >
          <Calendar className={`w-5 h-5 ${mode === 'client' ? 'text-[#A855F7]' : ''}`} />
          <span className="text-[11px] whitespace-nowrap">Reservar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSwitchMode('manicurist');
            onJumpTo('agenda');
          }}
          className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            mode === 'manicurist' ? 'text-[#F5F2EB] font-bold' : 'text-[#F5F2EB]/75'
          }`}
        >
          <Scissors className={`w-5 h-5 ${mode === 'manicurist' ? 'text-[#A855F7]' : ''}`} />
          <span className="text-[11px] whitespace-nowrap">
            Agenda{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </span>
        </button>
      </nav>
    </>
  );
};
