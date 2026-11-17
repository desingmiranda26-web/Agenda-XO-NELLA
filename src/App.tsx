import { useCallback, useEffect, useState } from 'react';
import { BookingCheckoutPanel } from './components/BookingCheckoutPanel.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ManicuristWorkspace } from './components/ManicuristWorkspace.tsx';
import { NotificationToast, type ToastItem } from './components/NotificationToast.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { ScheduleSelector } from './components/ScheduleSelector.tsx';
import { ServicesMenu } from './components/ServicesMenu.tsx';
import { TopBar } from './components/TopBar.tsx';
import {
  SERVICES,
  TIME_SLOTS,
  type GalleryItem,
  type NailService,
  type PaymentMethod,
  type PaymentPlan,
  type ReminderChannel,
  type StudioState,
} from './types.ts';
import { formatReadableDate, getTodayYMD } from './utils/dates.ts';
import { playStudioChime, triggerBrowserNotification } from './utils/sound.ts';

const EMPTY_STATE: StudioState = {
  appointments: [],
  blockedSlots: {},
  gallery: [],
  payments: [],
  reminders: [],
  notifications: [],
};

export default function App() {
  const [studioState, setStudioState] = useState<StudioState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'client' | 'manicurist'>('client');

  const [selectedService, setSelectedService] = useState<NailService>(SERVICES[0]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayYMD);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [designNote, setDesignNote] = useState<string>('');
  const [isBlockMode, setIsBlockMode] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [availabilityBanner, setAvailabilityBanner] = useState<{
    status: 'available' | 'unavailable';
    time: string;
    message: string;
    nextFreeSlot: string | null;
  } | null>(null);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 4));
      if (soundEnabled) {
        playStudioChime(toast.variant);
      }
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6500);
    },
    [soundEnabled]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load initial studio state and subscribe to real-time SSE updates
  useEffect(() => {
    let active = true;

    fetch('/api/state')
      .then((r) => r.json())
      .then((data: StudioState) => {
        if (active) {
          setStudioState(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) setIsLoading(false);
      });

    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          state?: StudioState;
          eventName?: string;
          extraPayload?: { appointment?: { clientName: string; serviceName: string; date: string; time: string } };
        };
        if (parsed.state && active) {
          setStudioState(parsed.state);
        }
      } catch {
        // Ignore malformed SSE ping
      }
    };

    return () => {
      active = false;
      es.close();
    };
  }, []);

  const handleJumpTo = (sectionId: string) => {
    window.setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  const handleSwitchMode = (nextMode: 'client' | 'manicurist') => {
    setMode(nextMode);
    if (nextMode === 'manicurist') {
      handleJumpTo('agenda');
    }
  };

  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        triggerBrowserNotification(
          'XO NELLA · Avisos activados',
          'Recibirás alertas inmediatas cuando se agende una cita o se envíen recordatorios.'
        );
      }
    } catch {
      // Ignore permission prompt errors
    }
  };

  const handleAttemptSelectSlot = (
    time: string,
    isOccupied: boolean,
    nextFreeSlot: string | null
  ) => {
    if (isOccupied) {
      setSelectedTime('');
      const msg = nextFreeSlot
        ? `El turno de las ${time} del ${formatReadableDate(selectedDate)} ya está ocupado. El siguiente horario disponible es a las ${nextFreeSlot}.`
        : `El turno de las ${time} del ${formatReadableDate(selectedDate)} ya está ocupado y no quedan más bloques libres ese día.`;
      setAvailabilityBanner({
        status: 'unavailable',
        time,
        message: msg,
        nextFreeSlot,
      });
      pushToast({
        variant: 'unavailable',
        title: `Horario ${time} no disponible`,
        message: msg,
      });
      return;
    }

    setSelectedTime(time);
    const okMsg = `El bloque de las ${time} del ${formatReadableDate(selectedDate)} está disponible para ${selectedService.name}.`;
    setAvailabilityBanner({
      status: 'available',
      time,
      message: okMsg,
      nextFreeSlot: null,
    });
    pushToast({
      variant: 'available',
      title: `Horario ${time} disponible`,
      message: okMsg,
    });
  };

  const handleToggleSlotBlock = async (date: string, time: string) => {
    const res = await fetch('/api/slots/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time }),
    });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
      if (selectedTime === time && (data.state.blockedSlots[date] ?? []).includes(time)) {
        setSelectedTime('');
      }
    }
  };

  const handleSubmitBooking = async (payload: {
    clientName: string;
    contact: string;
    phone: string;
    email: string;
    designNote: string;
    acceptedTerms: boolean;
    paymentPlan: PaymentPlan;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    reminderChannel: ReminderChannel;
  }): Promise<boolean> => {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
      }),
    });

    const data = (await res.json()) as {
      error?: string;
      state?: StudioState;
      appointment?: {
        clientName: string;
        serviceName: string;
        date: string;
        time: string;
        amountPaid: number;
      };
    };

    if (!res.ok) {
      pushToast({
        variant: 'unavailable',
        title: 'No se pudo confirmar la cita',
        message: data.error ?? 'Verifica los datos o elige otro horario.',
      });
      return false;
    }

    if (data.state) {
      setStudioState(data.state);
    }

    const appt = data.appointment;
    if (appt) {
      const notifTitle = `Cita agendada · ${appt.time}`;
      const notifBody = `${appt.clientName} — ${appt.serviceName} (${formatReadableDate(appt.date)}). Pago registrado: ${appt.amountPaid}€.`;

      pushToast({
        variant: 'booking',
        title: notifTitle,
        message: `${notifBody} Aviso de confirmación listo para la clienta.`,
      });

      triggerBrowserNotification(`XO NELLA · ${notifTitle}`, notifBody);
    }

    setSelectedTime('');
    setAvailabilityBanner(null);
    return true;
  };

  const handleToggleAttended = async (id: string, nextStatus: 'pending' | 'attended') => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
    }
  };

  const handleSettleBalance = async (id: string) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settleBalance: true }),
    });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
      pushToast({
        variant: 'booking',
        title: 'Saldo liquidado',
        message: 'Se actualizó el historial de pagos como liquidado al 100%.',
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
    }
  };

  const handleDeleteAllAttended = async () => {
    const res = await fetch('/api/appointments/attended', { method: 'DELETE' });
    if (res.ok) {
      const data = (await res.json()) as { removedCount: number; state: StudioState };
      setStudioState(data.state);
      pushToast({
        variant: 'available',
        title: 'Agenda depurada',
        message: `Se eliminaron ${data.removedCount} citas ya atendidas.`,
      });
    }
  };

  const handleSendReminderNow = async (appointmentId: string) => {
    const res = await fetch(`/api/reminders/${appointmentId}/send`, { method: 'POST' });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
      pushToast({
        variant: 'booking',
        title: 'Recordatorio 24h enviado',
        message: 'El aviso por SMS/Email quedó registrado en la agenda.',
      });
    }
  };

  const handleUploadGalleryItem = async (payload: {
    serviceId: string;
    caption: string;
    imageUrl: string;
  }) => {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Error al subir foto');
    }
    const data = (await res.json()) as { state: StudioState };
    setStudioState(data.state);
    pushToast({
      variant: 'available',
      title: 'Trabajo publicado',
      message: 'El diseño ya aparece en la galería por categoría.',
    });
  };

  const handleDeleteGalleryItem = async (id: string) => {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
    }
  };

  const handleBookStyleFromGallery = (item: GalleryItem) => {
    const match = SERVICES.find((s) => s.id === item.serviceId);
    if (match) {
      setSelectedService(match);
    }
    setDesignNote(item.caption);
    setMode('client');
    handleJumpTo('horarios');
    pushToast({
      variant: 'available',
      title: 'Referencia cargada',
      message: `Se seleccionó ${item.serviceName} con la referencia elegida.`,
    });
  };

  const handleMarkNotificationsRead = async () => {
    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
    }
  };

  const handleClearNotifications = async () => {
    const res = await fetch('/api/notifications', { method: 'DELETE' });
    if (res.ok) {
      const data = (await res.json()) as { state: StudioState };
      setStudioState(data.state);
    }
  };

  const today = getTodayYMD();
  const todayAppointments = studioState.appointments.filter((a) => a.date === today);
  const blockedToday = studioState.blockedSlots[today] ?? [];
  const freeTodayCount = TIME_SLOTS.filter(
    (slot) => !todayAppointments.some((a) => a.time === slot) && !blockedToday.includes(slot)
  ).length;
  const unreadNotifications = studioState.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F2EB] pb-24 md:pb-12">
      <TopBar
        mode={mode}
        onSwitchMode={handleSwitchMode}
        onJumpTo={handleJumpTo}
        unreadCount={unreadNotifications}
      />

      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      <OfflineIndicator />

      <main>
        <HeroSection
          mode={mode}
          onSwitchMode={handleSwitchMode}
          todayCount={todayAppointments.length}
          freeTodayCount={freeTodayCount}
          unreadNotifications={unreadNotifications}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((s) => !s)}
          notificationPermission={notificationPermission}
          onRequestNotifications={() => void handleRequestNotifications()}
          onJumpToBooking={() => {
            setMode('client');
            handleJumpTo('servicios');
          }}
        />

        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-[#F5F2EB]/65">
            Cargando agenda de XO NELLA...
          </div>
        ) : (
          <>
            {mode === 'client' && (
              <>
                <ServicesMenu
                  selectedServiceId={selectedService.id}
                  onSelectService={(srv) => setSelectedService(srv)}
                />

                <GallerySection
                  items={studioState.gallery}
                  isManicurist={true}
                  onUploadItem={handleUploadGalleryItem}
                  onDeleteItem={handleDeleteGalleryItem}
                  onBookStyle={handleBookStyleFromGallery}
                />

                <ScheduleSelector
                  selectedDate={selectedDate}
                  onSelectDate={(dt) => {
                    setSelectedDate(dt);
                    setSelectedTime('');
                    setAvailabilityBanner(null);
                  }}
                  selectedTime={selectedTime}
                  onAttemptSelectSlot={handleAttemptSelectSlot}
                  appointments={studioState.appointments}
                  blockedSlots={studioState.blockedSlots}
                  isBlockMode={isBlockMode}
                  onToggleBlockMode={() => setIsBlockMode((b) => !b)}
                  onToggleSlotBlock={handleToggleSlotBlock}
                  availabilityBanner={availabilityBanner}
                />

                <BookingCheckoutPanel
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  designNote={designNote}
                  onChangeDesignNote={setDesignNote}
                  onSubmitBooking={handleSubmitBooking}
                />
              </>
            )}

            <ManicuristWorkspace
              appointments={studioState.appointments}
              payments={studioState.payments}
              reminders={studioState.reminders}
              notifications={studioState.notifications}
              selectedDate={selectedDate}
              onToggleAttended={handleToggleAttended}
              onDeleteAppointment={handleDeleteAppointment}
              onDeleteAllAttended={handleDeleteAllAttended}
              onSettleBalance={handleSettleBalance}
              onSendReminderNow={handleSendReminderNow}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              onClearNotifications={handleClearNotifications}
            />
          </>
        )}
      </main>

      <footer className="mt-12 border-t border-[#F5F2EB]/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F2EB]/55">
          <p className="font-bold text-[#F5F2EB]/80">XO NELLA · Nail Studio</p>
          <p>Agenda independiente, recordatorios 24h y gestión de pagos</p>
        </div>
      </footer>
    </div>
  );
}
