import React from 'react';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { TIME_SLOTS, type Appointment } from '../types.ts';
import { formatReadableDate, getUpcomingDays } from '../utils/dates.ts';

interface ScheduleSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedTime: string;
  onAttemptSelectSlot: (time: string, isOccupied: boolean, nextFreeSlot: string | null) => void;
  appointments: Appointment[];
  blockedSlots: Record<string, string[]>;
  isBlockMode: boolean;
  onToggleBlockMode: () => void;
  onToggleSlotBlock: (date: string, time: string) => Promise<void>;
  availabilityBanner: {
    status: 'available' | 'unavailable';
    time: string;
    message: string;
    nextFreeSlot: string | null;
  } | null;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  selectedDate,
  onSelectDate,
  selectedTime,
  onAttemptSelectSlot,
  appointments,
  blockedSlots,
  isBlockMode,
  onToggleBlockMode,
  onToggleSlotBlock,
  availabilityBanner,
}) => {
  const days = getUpcomingDays(10);
  const blockedForDay = blockedSlots[selectedDate] ?? [];
  const bookedForDay = appointments.filter((a) => a.date === selectedDate);

  const getSlotStatus = (slot: string) => {
    const bookedAppt = bookedForDay.find((a) => a.time === slot);
    const manuallyBlocked = blockedForDay.includes(slot);
    return {
      bookedAppt,
      manuallyBlocked,
      isOccupied: Boolean(bookedAppt) || manuallyBlocked,
    };
  };

  const freeSlots = TIME_SLOTS.filter((slot) => !getSlotStatus(slot).isOccupied);

  return (
    <section id="horarios" className="py-10 border-t border-[#F5F2EB]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
              03. Fecha y Horarios Disponibles
            </h2>
            <p className="mt-1 text-sm sm:text-base font-normal text-[#F5F2EB]/70">
              Selecciona el día y pulsa un bloque horario para apartar o verificar disponibilidad para la clienta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#1A1622] border border-[#F5F2EB]/15 px-3.5 py-2 text-xs sm:text-sm text-[#F5F2EB]">
              <CalendarIcon className="w-4 h-4 text-[#C084FC]" />
              <span className="sr-only">Elegir fecha exacta</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                className="bg-transparent text-sm text-[#F5F2EB] focus:outline-none tabular-nums"
              />
            </label>

            <button
              type="button"
              onClick={onToggleBlockMode}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isBlockMode
                  ? 'bg-[#6A0DAD] border-[#6A0DAD] text-[#F5F2EB]'
                  : 'bg-[#1A1622] border-[#F5F2EB]/15 text-[#F5F2EB]/85 hover:border-[#6A0DAD]'
              }`}
            >
              {isBlockMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isBlockMode ? 'Listo · Modo bloqueo activo' : 'Bloquear / Liberar horas'}
            </button>
          </div>
        </div>

        {/* Horizontal Day Scroller */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6">
          {days.map((day) => {
            const active = day.ymd === selectedDate;
            const dayBookedCount = appointments.filter((a) => a.date === day.ymd).length;
            return (
              <button
                key={day.ymd}
                type="button"
                onClick={() => onSelectDate(day.ymd)}
                className={`min-h-[68px] min-w-[78px] px-3.5 py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB] ${
                  active
                    ? 'bg-[#6A0DAD] text-[#F5F2EB] shadow-lg shadow-[#6A0DAD]/30'
                    : 'bg-[#1A1622] text-[#F5F2EB]/80 border border-[#F5F2EB]/10 hover:border-[#6A0DAD]/60'
                }`}
              >
                <span className="text-[11px] font-normal opacity-80">
                  {day.isToday ? 'Hoy' : day.weekdayShort}
                </span>
                <span className="text-lg font-bold tabular-nums leading-tight mt-0.5">
                  {day.dayNum} {day.monthShort}
                </span>
                <span className="text-[11px] font-normal opacity-75 tabular-nums mt-0.5">
                  {dayBookedCount} {dayBookedCount === 1 ? 'cita' : 'citas'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time Slot Grid */}
        <div className="rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F5F2EB]">
                Horarios para {formatReadableDate(selectedDate)}
              </h3>
              <p className="text-xs font-normal text-[#F5F2EB]/65 mt-0.5 tabular-nums">
                {freeSlots.length} disponibles · {TIME_SLOTS.length - freeSlots.length} ocupados
                {isBlockMode ? ' — Toca cualquier bloque para marcarlo ocupado o liberarlo' : ''}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-normal text-[#F5F2EB]/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#121212] border border-[#F5F2EB]/25 inline-block" />
                Libre
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#6A0DAD] inline-block" />
                Seleccionado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#2D0A4E]/60 border border-[#F5F2EB]/10 inline-block" />
                Ocupado
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {TIME_SLOTS.map((slot) => {
              const { bookedAppt, manuallyBlocked, isOccupied } = getSlotStatus(slot);
              const isSelected = selectedTime === slot && !isOccupied && !isBlockMode;

              if (isBlockMode) {
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={Boolean(bookedAppt)}
                    onClick={() => void onToggleSlotBlock(selectedDate, slot)}
                    className={`min-h-[60px] rounded-2xl px-3 py-2.5 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                      bookedAppt
                        ? 'bg-[#2D0A4E]/50 border-[#F5F2EB]/10 text-[#F5F2EB]/45 cursor-not-allowed'
                        : manuallyBlocked
                          ? 'bg-[#2D0A4E] border-[#F5F2EB]/25 text-[#F5F2EB]'
                          : 'bg-[#121212] border-[#F5F2EB]/15 text-[#F5F2EB] hover:border-[#6A0DAD]'
                    }`}
                  >
                    <span className="text-base font-bold tabular-nums">{slot}</span>
                    <span className="text-[11px] font-normal">
                      {bookedAppt
                        ? `Reservado (${bookedAppt.clientName.split(' ')[0]})`
                        : manuallyBlocked
                          ? 'Bloqueado (Liberar)'
                          : 'Libre (Bloquear)'}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    const nextFree = freeSlots.find((s) => s !== slot) ?? null;
                    onAttemptSelectSlot(slot, isOccupied, nextFree);
                  }}
                  aria-pressed={isSelected}
                  className={`min-h-[62px] rounded-2xl px-3 py-2.5 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB] ${
                    isSelected
                      ? 'bg-[#6A0DAD] text-[#F5F2EB] border-2 border-[#D8B4FE] shadow-lg shadow-[#6A0DAD]/40 scale-[1.01]'
                      : isOccupied
                        ? 'bg-[#2D0A4E]/45 text-[#F5F2EB]/50 border border-[#F5F2EB]/10 hover:border-[#F5F2EB]/25'
                        : 'bg-[#121212] text-[#F5F2EB] border border-[#F5F2EB]/15 hover:bg-[#6A0DAD]/25 hover:border-[#6A0DAD]'
                  }`}
                >
                  <span
                    className={`text-base font-bold tabular-nums ${
                      isOccupied ? 'line-through decoration-[#F5F2EB]/40' : ''
                    }`}
                  >
                    {slot}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-normal">
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Seleccionado
                      </>
                    ) : isOccupied ? (
                      <>
                        <Lock className="w-3 h-3" />
                        {bookedAppt ? 'Ocupado' : 'No disponible'}
                      </>
                    ) : (
                      'Disponible'
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Client Availability Notification Alert */}
          {availabilityBanner && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                availabilityBanner.status === 'available'
                  ? 'bg-[#2D0A4E] border-[#6A0DAD] text-[#F5F2EB]'
                  : 'bg-[#121212] border-[#FCA5A5]/40 text-[#F5F2EB]'
              }`}
            >
              <div className="flex items-start gap-3">
                {availabilityBanner.status === 'available' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#D8B4FE] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#FCA5A5] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {availabilityBanner.status === 'available'
                      ? `Aviso para clienta: Horario ${availabilityBanner.time} disponible`
                      : `Aviso para clienta: Horario ${availabilityBanner.time} no disponible`}
                  </p>
                  <p className="text-xs font-normal text-[#F5F2EB]/80 mt-0.5">
                    {availabilityBanner.message}
                  </p>
                </div>
              </div>

              {availabilityBanner.status === 'unavailable' && availabilityBanner.nextFreeSlot && (
                <button
                  type="button"
                  onClick={() =>
                    onAttemptSelectSlot(availabilityBanner.nextFreeSlot!, false, null)
                  }
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6A0DAD] hover:bg-[#7B18C8] text-xs font-bold text-[#F5F2EB] shrink-0 cursor-pointer"
                >
                  Elegir {availabilityBanner.nextFreeSlot}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
