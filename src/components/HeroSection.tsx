import React, { useState } from 'react';
import { Bell, BellRing, Volume2, VolumeX } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeroSectionProps {
  mode: 'client' | 'manicurist';
  onSwitchMode: (mode: 'client' | 'manicurist') => void;
  todayCount: number;
  freeTodayCount: number;
  unreadNotifications: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotifications: () => void;
  onJumpToBooking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  mode,
  onSwitchMode,
  todayCount,
  freeTodayCount,
  unreadNotifications,
  soundEnabled,
  onToggleSound,
  notificationPermission,
  onRequestNotifications,
  onJumpToBooking,
}) => {
  const [heroImgError, setHeroImgError] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);

  return (
    <section id="inicio" className="pt-8 pb-6 sm:pt-12 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm font-normal text-[#F5F2EB]/70 tracking-wide">
                App Independiente de Reservas · Nail Studio Baddie &amp; Urbano
              </p>

              <h1
                className="mt-3 font-bold text-[#F5F2EB] leading-[1.06]"
                style={{
                  fontSize: 'clamp(2.5rem, 4.8vw, 4.25rem)',
                  textWrap: 'balance',
                }}
              >
                XO NELLA
              </h1>

              <p className="mt-4 max-w-xl text-base sm:text-lg font-normal text-[#F5F2EB]/80 leading-relaxed">
                Agenda independiente para tu estudio de uñas. Registra directamente cada cita de tus
                clientas, verifica disponibilidad al instante, cobra depósito o pago completo y envía
                recordatorios automáticos 24h antes.
              </p>
            </div>

            {/* Workspace Mode & Standalone App Controls */}
            <div className="flex flex-col gap-4">
              <div className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#1A1622] border border-[#F5F2EB]/12 self-start">
                <button
                  type="button"
                  onClick={() => onSwitchMode('client')}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'client'
                      ? 'bg-[#6A0DAD] text-[#F5F2EB] shadow-md shadow-[#6A0DAD]/30'
                      : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
                  }`}
                >
                  Agendar Nueva Cita
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchMode('manicurist')}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    mode === 'manicurist'
                      ? 'bg-[#6A0DAD] text-[#F5F2EB] shadow-md shadow-[#6A0DAD]/30'
                      : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
                  }`}
                >
                  Mi Agenda y Pagos
                  {unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onJumpToBooking}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6A0DAD] hover:bg-[#7B18C8] text-sm font-bold text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Elegir Servicio y Horario
                </button>

                <PWAInstallButton />

                {notificationPermission !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={onRequestNotifications}
                    className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-normal border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      notificationPermission === 'granted'
                        ? 'bg-[#2D0A4E] border-[#6A0DAD] text-[#F5F2EB]'
                        : 'bg-[#1A1622] border-[#F5F2EB]/15 text-[#F5F2EB]/80 hover:text-[#F5F2EB]'
                    }`}
                  >
                    {notificationPermission === 'granted' ? (
                      <BellRing className="w-4 h-4 text-[#C084FC]" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    {notificationPermission === 'granted'
                      ? 'Avisos activos'
                      : 'Activar avisos'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-label={soundEnabled ? 'Silenciar alertas' : 'Activar sonido de alertas'}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-[#1A1622] border border-[#F5F2EB]/15 text-[#F5F2EB]/80 hover:text-[#F5F2EB] transition-colors cursor-pointer"
                  title={soundEnabled ? 'Sonido de alertas activo' : 'Sonido silenciado'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C084FC]" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase Column */}
          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[300px] sm:min-h-[340px] rounded-3xl overflow-hidden bg-[#2D0A4E] border border-[#F5F2EB]/12 shadow-2xl">
              {!heroImgError ? (
                <img
                  src="/assets/aistudio/IMG_20261117_093015_739_58222b81.jpg"
                  alt="Set de uñas rosa cat-eye con relieve chrome dorado de XO NELLA"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover lg:h-full"
                />
              ) : (
                <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-[#2D0A4E] via-[#1A1622] to-[#121212] flex items-center justify-center p-8">
                  <span className="text-3xl font-bold text-[#F5F2EB]">XO NELLA</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/25 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-normal text-[#F5F2EB]/75">
                    Signature Studio Set
                  </p>
                  <p className="text-base font-bold text-[#F5F2EB]">
                    Cat-Eye Chrome &amp; Polygel
                  </p>
                </div>

                {!logoImgError && (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#F5F2EB]/20 bg-[#121212] shrink-0 shadow-lg">
                    <img
                      src="/assets/aistudio/IMG_20261117_093015_993_ed344b60.jpg"
                      alt="Logotipo cromado XO NELLA"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column studio summary strip */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-b border-[#F5F2EB]/10 py-5">
          <div>
            <p className="text-xs font-normal text-[#F5F2EB]/60">Citas de hoy</p>
            <p className="mt-1 text-2xl font-bold text-[#F5F2EB] tabular-nums">{todayCount}</p>
          </div>
          <div>
            <p className="text-xs font-normal text-[#F5F2EB]/60">Bloques libres hoy</p>
            <p className="mt-1 text-2xl font-bold text-[#F5F2EB] tabular-nums">{freeTodayCount}</p>
          </div>
          <div>
            <p className="text-xs font-normal text-[#F5F2EB]/60">Recordatorio 24h</p>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#F5F2EB]">SMS y Email</p>
          </div>
          <div>
            <p className="text-xs font-normal text-[#F5F2EB]/60">Reserva Segura</p>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#F5F2EB]">Depósito 50% / Total</p>
          </div>
        </div>
      </div>
    </section>
  );
};
