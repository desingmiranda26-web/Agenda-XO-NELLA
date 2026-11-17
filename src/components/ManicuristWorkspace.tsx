import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  Send,
  Smartphone,
  Trash2,
} from 'lucide-react';
import type { Appointment, PaymentRecord, ReminderLog, StudioNotification } from '../types.ts';
import { formatReadableDate, formatTimeAgoOrClock } from '../utils/dates.ts';

interface ManicuristWorkspaceProps {
  appointments: Appointment[];
  payments: PaymentRecord[];
  reminders: ReminderLog[];
  notifications: StudioNotification[];
  selectedDate: string;
  onToggleAttended: (id: string, nextStatus: 'pending' | 'attended') => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  onDeleteAllAttended: () => Promise<void>;
  onSettleBalance: (id: string) => Promise<void>;
  onSendReminderNow: (appointmentId: string) => Promise<void>;
  onMarkNotificationsRead: () => Promise<void>;
  onClearNotifications: () => Promise<void>;
}

export const ManicuristWorkspace: React.FC<ManicuristWorkspaceProps> = ({
  appointments,
  payments,
  reminders,
  notifications,
  selectedDate,
  onToggleAttended,
  onDeleteAppointment,
  onDeleteAllAttended,
  onSettleBalance,
  onSendReminderNow,
  onMarkNotificationsRead,
  onClearNotifications,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'payments' | 'notifications'>('agenda');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'attended'>('all');
  const [dateScope, setDateScope] = useState<'selected' | 'all'>('all');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const scopedAppointments = appointments
    .filter((a) => (dateScope === 'selected' ? a.date === selectedDate : true))
    .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const attendedCount = appointments.filter((a) => a.status === 'attended').length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPendingBalance = payments.reduce((sum, p) => sum + p.remainingBalance, 0);
  const remindersSentCount = appointments.filter((a) => a.reminderSent).length;

  const handleManualReminder = async (id: string) => {
    setSendingId(id);
    try {
      await onSendReminderNow(id);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <section id="agenda" className="py-12 border-t border-[#F5F2EB]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
              05. Agenda Independiente de la Manicurista
            </h2>
            <p className="mt-1 text-sm sm:text-base font-normal text-[#F5F2EB]/70">
              Gestiona tus citas del día, recordatorios 24h enviados, pagos recibidos y alertas en tiempo real.
            </p>
          </div>

          {/* Workspace Tabs */}
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#1A1622] border border-[#F5F2EB]/12 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
            >
              Citas ({appointments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
            >
              Historial de Pagos ({payments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
            >
              Notificaciones y Recordatorios{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </div>
        </div>

        {/* TAB 1: AGENDA DEL DÍA */}
        {activeTab === 'agenda' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#1A1622] border border-[#F5F2EB]/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#121212]">
                  {(['all', 'pending', 'attended'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        statusFilter === f
                          ? 'bg-[#6A0DAD] text-[#F5F2EB]'
                          : 'text-[#F5F2EB]/65 hover:text-[#F5F2EB]'
                      }`}
                    >
                      {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Atendidas'}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#121212]">
                  <button
                    type="button"
                    onClick={() => setDateScope('all')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      dateScope === 'all'
                        ? 'bg-[#2D0A4E] text-[#F5F2EB] border border-[#6A0DAD]'
                        : 'text-[#F5F2EB]/65 hover:text-[#F5F2EB]'
                    }`}
                  >
                    Todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateScope('selected')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      dateScope === 'selected'
                        ? 'bg-[#2D0A4E] text-[#F5F2EB] border border-[#6A0DAD]'
                        : 'text-[#F5F2EB]/65 hover:text-[#F5F2EB]'
                    }`}
                  >
                    Solo {formatReadableDate(selectedDate)}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={attendedCount === 0}
                onClick={() => void onDeleteAllAttended()}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D0A4E] border border-[#6A0DAD] hover:bg-[#6A0DAD] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs sm:text-sm font-bold text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar citas atendidas ({attendedCount})
              </button>
            </div>

            {scopedAppointments.length === 0 ? (
              <div className="rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/10 p-10 text-center">
                <p className="text-base font-bold text-[#F5F2EB]">
                  No hay citas en esta vista
                </p>
                <p className="mt-1 text-sm font-normal text-[#F5F2EB]/65">
                  Selecciona un servicio y horario arriba para agendar un turno nuevo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scopedAppointments.map((appt) => {
                  const isAttended = appt.status === 'attended';
                  return (
                    <article
                      key={appt.id}
                      className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between gap-4 ${
                        isAttended
                          ? 'bg-[#17151C] border-[#F5F2EB]/10 opacity-85'
                          : 'bg-[#2D0A4E]/75 border-[#6A0DAD]/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#D8B4FE]">
                            <span className="font-bold tabular-nums">
                              {formatReadableDate(appt.date)} · {appt.time}
                            </span>
                            <span aria-hidden="true">/</span>
                            <span className="font-bold">
                              {isAttended ? 'Atendida' : 'Pendiente'}
                            </span>
                          </div>

                          <h3 className="mt-1.5 text-lg font-bold text-[#F5F2EB]">
                            {appt.clientName}
                          </h3>
                          <p className="text-xs sm:text-sm font-normal text-[#F5F2EB]/75">
                            {appt.contact}
                            {appt.phone ? ` · ${appt.phone}` : ''}
                            {appt.email ? ` · ${appt.email}` : ''}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-[#F5F2EB] tabular-nums">
                            {appt.servicePrice}€
                          </p>
                          <p className="text-xs font-normal text-[#F5F2EB]/70">
                            {appt.paymentStatus === 'paid_full'
                              ? 'Pagado completo'
                              : `Depósito ${appt.amountPaid}€`}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm font-normal text-[#F5F2EB]/90 space-y-1">
                        <p className="font-bold text-[#F5F2EB]">{appt.serviceName}</p>
                        {appt.designNote && (
                          <p className="text-xs text-[#F5F2EB]/75">
                            Diseño: {appt.designNote}
                          </p>
                        )}
                      </div>

                      {/* 24h Reminder & Payment Status Strip */}
                      <div className="pt-3 border-t border-[#F5F2EB]/12 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="inline-flex items-center gap-1.5 text-[#F5F2EB]/85">
                          {appt.reminderSent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-[#D8B4FE]" />
                              <span>
                                Recordatorio 24h enviado (
                                {appt.reminderChannel === 'both'
                                  ? 'SMS + Email'
                                  : appt.reminderChannel.toUpperCase()}
                                {appt.reminderSentAt
                                  ? ` · ${formatTimeAgoOrClock(appt.reminderSentAt)}`
                                  : ''}
                                )
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-[#F5F2EB]/60" />
                              <span>
                                Recordatorio programado 24h antes (
                                {appt.reminderChannel === 'both'
                                  ? 'SMS + Email'
                                  : appt.reminderChannel.toUpperCase()}
                                )
                              </span>
                            </>
                          )}
                        </div>

                        {appt.remainingBalance > 0 && (
                          <span className="font-bold text-[#FDE68A] tabular-nums">
                            Resta en mesa: {appt.remainingBalance}€
                          </span>
                        )}
                      </div>

                      {/* Manicurist Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            void onToggleAttended(
                              appt.id,
                              isAttended ? 'pending' : 'attended'
                            )
                          }
                          className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isAttended
                              ? 'bg-[#121212] border border-[#F5F2EB]/20 text-[#F5F2EB]'
                              : 'bg-[#6A0DAD] hover:bg-[#7B18C8] text-[#F5F2EB]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isAttended ? 'Marcar pendiente' : 'Marcar atendida'}
                        </button>

                        <button
                          type="button"
                          disabled={sendingId === appt.id}
                          onClick={() => void handleManualReminder(appt.id)}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#121212] border border-[#F5F2EB]/15 hover:border-[#6A0DAD] text-xs font-bold text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-[#C084FC]" />
                          {sendingId === appt.id
                            ? 'Enviando...'
                            : appt.reminderSent
                              ? 'Reenviar aviso'
                              : 'Enviar recordatorio'}
                        </button>

                        {appt.remainingBalance > 0 && (
                          <button
                            type="button"
                            onClick={() => void onSettleBalance(appt.id)}
                            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#121212] border border-[#F5F2EB]/15 hover:border-[#6A0DAD] text-xs font-bold text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-[#D8B4FE]" />
                            Cobrar {appt.remainingBalance}€
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void onDeleteAppointment(appt.id)}
                          aria-label={`Eliminar cita de ${appt.clientName}`}
                          className="ml-auto min-h-[42px] px-3 py-2 rounded-xl bg-[#121212] border border-[#F5F2EB]/15 hover:border-[#FCA5A5]/60 text-xs font-bold text-[#F5F2EB]/75 hover:text-[#FCA5A5] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORIAL DE PAGOS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#2D0A4E] border border-[#F5F2EB]/15 p-5">
                <p className="text-xs font-normal text-[#F5F2EB]/70">Total cobrado online y estudio</p>
                <p className="mt-1.5 text-3xl font-bold text-[#F5F2EB] tabular-nums">
                  {totalCollected.toFixed(2)}€
                </p>
              </div>
              <div className="rounded-2xl bg-[#1A1622] border border-[#F5F2EB]/12 p-5">
                <p className="text-xs font-normal text-[#F5F2EB]/70">Saldo pendiente por cobrar en mesa</p>
                <p className="mt-1.5 text-3xl font-bold text-[#D8B4FE] tabular-nums">
                  {totalPendingBalance.toFixed(2)}€
                </p>
              </div>
              <div className="rounded-2xl bg-[#1A1622] border border-[#F5F2EB]/12 p-5">
                <p className="text-xs font-normal text-[#F5F2EB]/70">Transacciones procesadas</p>
                <p className="mt-1.5 text-3xl font-bold text-[#F5F2EB] tabular-nums">
                  {payments.length}
                </p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/10 p-10 text-center">
                <p className="text-base font-bold text-[#F5F2EB]">Sin transacciones registradas</p>
              </div>
            ) : (
              <div className="rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#F5F2EB]/10 text-xs font-normal text-[#F5F2EB]/60">
                        <th className="py-3.5 px-4">ID Transacción</th>
                        <th className="py-3.5 px-4">Clienta</th>
                        <th className="py-3.5 px-4">Servicio</th>
                        <th className="py-3.5 px-4">Modalidad</th>
                        <th className="py-3.5 px-4">Método</th>
                        <th className="py-3.5 px-4 text-right">Cobrado</th>
                        <th className="py-3.5 px-4 text-right">Restante</th>
                        <th className="py-3.5 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F2EB]/10 text-sm">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-[#2D0A4E]/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#D8B4FE] tabular-nums whitespace-nowrap">
                            {pay.transactionId}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#F5F2EB] whitespace-nowrap">
                            {pay.clientName}
                          </td>
                          <td className="py-3.5 px-4 text-[#F5F2EB]/85">
                            {pay.serviceName}
                          </td>
                          <td className="py-3.5 px-4 text-[#F5F2EB]/80 whitespace-nowrap">
                            {pay.paymentPlan === 'full' ? 'Pago completo' : 'Depósito 50%'}
                          </td>
                          <td className="py-3.5 px-4 text-[#F5F2EB]/80 whitespace-nowrap">
                            {pay.paymentMethod === 'card'
                              ? `Tarjeta ···${pay.cardLast4 ?? '4242'}`
                              : pay.paymentMethod === 'bizum'
                                ? 'Bizum'
                                : 'Apple Pay'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#F5F2EB] tabular-nums whitespace-nowrap">
                            {pay.amountPaid.toFixed(2)}€
                          </td>
                          <td className="py-3.5 px-4 text-right text-[#F5F2EB]/75 tabular-nums whitespace-nowrap">
                            {pay.remainingBalance.toFixed(2)}€
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {pay.status === 'paid_full' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D8B4FE]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Liquidado
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void onSettleBalance(pay.appointmentId)}
                                className="min-h-[34px] px-3 py-1 rounded-lg bg-[#6A0DAD] hover:bg-[#7B18C8] text-xs font-bold text-[#F5F2EB] cursor-pointer"
                              >
                                Cobrar saldo
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTIFICACIONES Y RECORDATORIOS 24H */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Manicurist Agenda Notification Center */}
            <div className="lg:col-span-6 rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#C084FC]" />
                  <h3 className="text-lg font-bold text-[#F5F2EB]">
                    Alertas de Agenda ({notifications.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void onMarkNotificationsRead()}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#121212] border border-[#F5F2EB]/15 text-xs font-bold text-[#F5F2EB]/80 hover:text-[#F5F2EB] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar leídas
                  </button>
                  <button
                    type="button"
                    onClick={() => void onClearNotifications()}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#121212] border border-[#F5F2EB]/15 text-xs font-bold text-[#F5F2EB]/70 hover:text-[#FCA5A5] cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <p className="text-sm font-normal text-[#F5F2EB]/60 py-6 text-center">
                  No hay notificaciones recientes en la agenda.
                </p>
              ) : (
                <ul className="divide-y divide-[#F5F2EB]/10">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`py-3.5 ${n.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-[#F5F2EB]">
                          {!n.read ? 'Nueva · ' : ''}
                          {n.title}
                        </p>
                        <span className="text-xs font-normal text-[#F5F2EB]/55 tabular-nums">
                          {formatTimeAgoOrClock(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm font-normal text-[#F5F2EB]/80">
                        {n.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: 24h Automated SMS/Email Reminder Dispatch Log */}
            <div className="lg:col-span-6 rounded-3xl bg-[#2D0A4E]/60 border border-[#F5F2EB]/15 p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#F5F2EB]">
                    Registro de Recordatorios 24h
                  </h3>
                  <p className="text-xs font-normal text-[#F5F2EB]/70 mt-0.5 tabular-nums">
                    {remindersSentCount} de {appointments.length} citas ya recibieron aviso automático
                  </p>
                </div>
              </div>

              {reminders.length === 0 ? (
                <p className="text-sm font-normal text-[#F5F2EB]/65 py-6 text-center">
                  Los recordatorios automáticos se disparan 24h antes de cada cita o al pulsar &ldquo;Enviar recordatorio&rdquo;.
                </p>
              ) : (
                <ul className="divide-y divide-[#F5F2EB]/12">
                  {reminders.map((rem) => (
                    <li key={rem.id} className="py-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F2EB]">
                          {rem.channel === 'email' ? (
                            <Mail className="w-4 h-4 text-[#D8B4FE]" />
                          ) : (
                            <Smartphone className="w-4 h-4 text-[#D8B4FE]" />
                          )}
                          <span>{rem.clientName}</span>
                        </div>
                        <span className="text-xs font-normal text-[#D8B4FE] tabular-nums">
                          Enviado {formatTimeAgoOrClock(rem.sentAt)}
                        </span>
                      </div>
                      <p className="text-xs font-normal text-[#F5F2EB]/75">
                        Destino: {rem.recipient} · Cita {formatReadableDate(rem.appointmentDate)} {rem.appointmentTime}
                      </p>
                      <p className="text-xs font-normal text-[#F5F2EB]/65 leading-relaxed">
                        {rem.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
