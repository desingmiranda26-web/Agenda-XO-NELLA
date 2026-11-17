import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  SERVICES,
  TIME_SLOTS,
  type Appointment,
  type GalleryItem,
  type PaymentMethod,
  type PaymentPlan,
  type PaymentRecord,
  type ReminderChannel,
  type ReminderLog,
  type StudioNotification,
  type StudioState,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'studio-db.json');

function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function computeReminderTimestamp(dateStr: string, timeStr: string): string {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  if (Number.isNaN(dt.getTime())) {
    return new Date().toISOString();
  }
  return new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString();
}

function buildSeedState(): StudioState {
  const now = new Date();
  const today = formatDateYMD(now);
  const tomorrow = formatDateYMD(addDays(now, 1));

  const appt1: Appointment = {
    id: 'appt-seed-1',
    clientName: 'Valeria Cruz',
    contact: '@valeria.baddie',
    phone: '+34 612 489 102',
    email: 'valeria.cruz@ejemplo.es',
    serviceId: 'sistema-polygel-acrilico',
    serviceName: 'Sistema de polygel y de acrílico',
    servicePrice: 18,
    date: today,
    time: '11:00',
    designNote: 'Almendradas rosa cat-eye con relieve chrome dorado',
    acceptedTerms: true,
    status: 'pending',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
    paymentPlan: 'deposit',
    paymentMethod: 'card',
    paymentStatus: 'deposit_paid',
    amountPaid: 9,
    remainingBalance: 9,
    transactionId: 'XON-PAY-841029',
    cardLast4: '4242',
    reminderChannel: 'both',
    reminderSent: true,
    reminderSentAt: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
    reminderScheduledFor: computeReminderTimestamp(today, '11:00'),
  };

  const appt2: Appointment = {
    id: 'appt-seed-2',
    clientName: 'Camila Mendoza',
    contact: '@cami.nailsx',
    phone: '+34 644 902 318',
    email: 'camila.m@ejemplo.es',
    serviceId: 'jelly-tips',
    serviceName: 'Jelly tips',
    servicePrice: 15,
    date: tomorrow,
    time: '16:00',
    designNote: 'Jelly morado translúcido efecto aura',
    acceptedTerms: true,
    status: 'pending',
    createdAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    paymentPlan: 'full',
    paymentMethod: 'bizum',
    paymentStatus: 'paid_full',
    amountPaid: 15,
    remainingBalance: 0,
    transactionId: 'XON-PAY-952104',
    reminderChannel: 'sms',
    reminderSent: false,
    reminderScheduledFor: computeReminderTimestamp(tomorrow, '16:00'),
  };

  const payment1: PaymentRecord = {
    id: 'pay-seed-1',
    transactionId: appt1.transactionId,
    appointmentId: appt1.id,
    clientName: appt1.clientName,
    serviceName: appt1.serviceName,
    servicePrice: appt1.servicePrice,
    paymentPlan: appt1.paymentPlan,
    paymentMethod: appt1.paymentMethod,
    amountPaid: appt1.amountPaid,
    remainingBalance: appt1.remainingBalance,
    status: appt1.paymentStatus,
    cardLast4: appt1.cardLast4,
    createdAt: appt1.createdAt,
  };

  const payment2: PaymentRecord = {
    id: 'pay-seed-2',
    transactionId: appt2.transactionId,
    appointmentId: appt2.id,
    clientName: appt2.clientName,
    serviceName: appt2.serviceName,
    servicePrice: appt2.servicePrice,
    paymentPlan: appt2.paymentPlan,
    paymentMethod: appt2.paymentMethod,
    amountPaid: appt2.amountPaid,
    remainingBalance: appt2.remainingBalance,
    status: appt2.paymentStatus,
    createdAt: appt2.createdAt,
  };

  const reminder1: ReminderLog = {
    id: 'rem-seed-1',
    appointmentId: appt1.id,
    clientName: appt1.clientName,
    recipient: `${appt1.phone} · ${appt1.email}`,
    channel: 'both',
    appointmentDate: appt1.date,
    appointmentTime: appt1.time,
    serviceName: appt1.serviceName,
    sentAt: appt1.reminderSentAt!,
    type: 'automated_24h',
    message: `Recordatorio XO NELLA: Hola ${appt1.clientName}, te esperamos mañana a las ${appt1.time} para tu ${appt1.serviceName}. Recuerda llegar puntual (máx. 10 min de tolerancia).`,
  };

  const gallery: GalleryItem[] = [
    {
      id: 'gal-seed-1',
      serviceId: 'sistema-polygel-acrilico',
      serviceName: 'Sistema de polygel y de acrílico',
      caption: 'Set almendrado cat-eye rosa con relieve chrome dorado — acabado espejo baddie.',
      imageUrl: '/assets/aistudio/IMG_20261117_093015_739_58222b81.jpg',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  const notifications: StudioNotification[] = [
    {
      id: 'notif-seed-1',
      audience: 'manicurist',
      kind: 'reminder',
      title: 'Recordatorio 24h enviado',
      message: `Se envió recordatorio SMS y Email a ${appt1.clientName} para su cita de las ${appt1.time}.`,
      createdAt: appt1.reminderSentAt!,
      read: false,
    },
    {
      id: 'notif-seed-2',
      audience: 'manicurist',
      kind: 'booking',
      title: 'Nueva cita confirmada',
      message: `${appt2.clientName} (${appt2.contact}) reservó ${appt2.serviceName} para mañana a las ${appt2.time} · Pago completo 15€.`,
      createdAt: appt2.createdAt,
      read: false,
    },
  ];

  return {
    appointments: [appt1, appt2],
    blockedSlots: {
      [today]: ['14:00'],
    },
    gallery,
    payments: [payment2, payment1],
    reminders: [reminder1],
    notifications,
  };
}

function loadState(): StudioState {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const seeded = buildSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf8');
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StudioState;
    return {
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      blockedSlots: parsed.blockedSlots && typeof parsed.blockedSlots === 'object' ? parsed.blockedSlots : {},
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    };
  } catch {
    const seeded = buildSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf8');
    return seeded;
  }
}

let state: StudioState = loadState();
const sseClients = new Set<express.Response>();

function saveAndBroadcast(eventName = 'state', extraPayload?: unknown) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  const payload = JSON.stringify({ state, eventName, extraPayload });
  for (const res of sseClients) {
    res.write(`data: ${payload}\n\n`);
  }
}

async function dispatchReminderToProviders(appt: Appointment, log: ReminderLog) {
  const webhookUrl = process.env.REMINDER_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studio: 'XO NELLA',
          channel: log.channel,
          phone: appt.phone,
          email: appt.email,
          clientName: appt.clientName,
          date: appt.date,
          time: appt.time,
          serviceName: appt.serviceName,
          message: log.message,
        }),
      });
    } catch (err) {
      console.error('Webhook reminder dispatch error:', err);
    }
  }
}

async function sendReminderForAppointment(appt: Appointment, type: 'automated_24h' | 'manual'): Promise<ReminderLog> {
  const nowIso = new Date().toISOString();
  const recipientParts: string[] = [];
  if ((appt.reminderChannel === 'sms' || appt.reminderChannel === 'both') && appt.phone) {
    recipientParts.push(appt.phone);
  }
  if ((appt.reminderChannel === 'email' || appt.reminderChannel === 'both') && appt.email) {
    recipientParts.push(appt.email);
  }
  if (recipientParts.length === 0) {
    recipientParts.push(appt.contact);
  }

  const channelLabel =
    appt.reminderChannel === 'both'
      ? 'SMS y Email'
      : appt.reminderChannel === 'email'
        ? 'Email'
        : 'SMS';

  const log: ReminderLog = {
    id: `rem-${crypto.randomUUID().slice(0, 8)}`,
    appointmentId: appt.id,
    clientName: appt.clientName,
    recipient: recipientParts.join(' · '),
    channel: appt.reminderChannel === 'none' ? 'sms' : appt.reminderChannel,
    appointmentDate: appt.date,
    appointmentTime: appt.time,
    serviceName: appt.serviceName,
    sentAt: nowIso,
    type,
    message: `Recordatorio XO NELLA (${channelLabel}): Hola ${appt.clientName}, te recordamos tu cita de ${appt.serviceName} el ${appt.date} a las ${appt.time}. Tolerancia máxima de 10 min.`,
  };

  appt.reminderSent = true;
  appt.reminderSentAt = nowIso;

  state.reminders.unshift(log);
  state.notifications.unshift({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    audience: 'manicurist',
    kind: 'reminder',
    title: type === 'automated_24h' ? 'Recordatorio automático 24h enviado' : 'Recordatorio enviado a clienta',
    message: `${channelLabel} enviado a ${appt.clientName} (${log.recipient}) para el ${appt.date} a las ${appt.time}.`,
    createdAt: nowIso,
    read: false,
  });

  await dispatchReminderToProviders(appt, log);
  return log;
}

async function runAutomatedReminderSweep() {
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  let updated = false;

  for (const appt of state.appointments) {
    if (appt.status !== 'pending' || appt.reminderSent || appt.reminderChannel === 'none') {
      continue;
    }
    const apptTime = new Date(`${appt.date}T${appt.time}:00`).getTime();
    if (Number.isNaN(apptTime)) continue;
    const msUntilAppt = apptTime - now;
    // Send if appointment is within the next 24h and not more than 1 hour in the past
    if (msUntilAppt <= twentyFourHoursMs && msUntilAppt >= -60 * 60 * 1000) {
      await sendReminderForAppointment(appt, 'automated_24h');
      updated = true;
    }
  }

  if (updated) {
    saveAndBroadcast('reminder_sweep');
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // SSE stream for live manicurist & client synchronization
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`data: ${JSON.stringify({ state, eventName: 'connected' })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  app.get('/api/state', (_req, res) => {
    res.json(state);
  });

  // Create appointment + process payment + schedule 24h reminder
  app.post('/api/appointments', async (req, res) => {
    try {
      const {
        clientName,
        contact,
        phone,
        email,
        serviceId,
        date,
        time,
        designNote,
        acceptedTerms,
        paymentPlan,
        paymentMethod,
        cardNumber,
        reminderChannel,
      } = req.body as {
        clientName?: string;
        contact?: string;
        phone?: string;
        email?: string;
        serviceId?: string;
        date?: string;
        time?: string;
        designNote?: string;
        acceptedTerms?: boolean;
        paymentPlan?: PaymentPlan;
        paymentMethod?: PaymentMethod;
        cardNumber?: string;
        reminderChannel?: ReminderChannel;
      };

      if (!clientName?.trim() || !contact?.trim() || !serviceId || !date || !time) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para agendar la cita.' });
      }
      if (!acceptedTerms) {
        return res.status(400).json({ error: 'Debes aceptar los términos y condiciones del estudio.' });
      }
      if (!TIME_SLOTS.includes(time)) {
        return res.status(400).json({ error: 'El bloque horario seleccionado no es válido.' });
      }

      const service = SERVICES.find((s) => s.id === serviceId);
      if (!service) {
        return res.status(400).json({ error: 'Servicio no encontrado.' });
      }

      const blockedForDay = state.blockedSlots[date] ?? [];
      const alreadyBooked = state.appointments.some(
        (a) => a.date === date && a.time === time
      );
      if (blockedForDay.includes(time) || alreadyBooked) {
        return res.status(409).json({
          error: `El horario de las ${time} ya no está disponible. Por favor elige otro bloque.`,
        });
      }

      const chosenPlan: PaymentPlan = paymentPlan === 'full' ? 'full' : 'deposit';
      const chosenMethod: PaymentMethod =
        paymentMethod === 'bizum' || paymentMethod === 'apple_pay' ? paymentMethod : 'card';

      const digitsOnly = (cardNumber ?? '').replace(/\D/g, '');
      if (chosenMethod === 'card' && digitsOnly.length < 12) {
        return res.status(400).json({ error: 'Introduce un número de tarjeta válido para procesar el pago.' });
      }

      const depositAmount = Number((service.price * 0.5).toFixed(2));
      const amountPaid = chosenPlan === 'full' ? service.price : depositAmount;
      const remainingBalance = Number((service.price - amountPaid).toFixed(2));
      const paymentStatus = chosenPlan === 'full' ? 'paid_full' : 'deposit_paid';
      const transactionId = `XON-PAY-${crypto.randomInt(100000, 999999)}`;
      const cardLast4 = chosenMethod === 'card' ? digitsOnly.slice(-4) : undefined;
      const nowIso = new Date().toISOString();

      const validChannel: ReminderChannel =
        reminderChannel === 'sms' || reminderChannel === 'email' || reminderChannel === 'both' || reminderChannel === 'none'
          ? reminderChannel
          : phone?.trim() && email?.trim()
            ? 'both'
            : email?.trim()
              ? 'email'
              : 'sms';

      const newAppointment: Appointment = {
        id: `appt-${crypto.randomUUID().slice(0, 8)}`,
        clientName: clientName.trim(),
        contact: contact.trim(),
        phone: phone?.trim() || undefined,
        email: email?.trim() || undefined,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        date,
        time,
        designNote: designNote?.trim() || undefined,
        acceptedTerms: true,
        status: 'pending',
        createdAt: nowIso,
        paymentPlan: chosenPlan,
        paymentMethod: chosenMethod,
        paymentStatus,
        amountPaid,
        remainingBalance,
        transactionId,
        cardLast4,
        reminderChannel: validChannel,
        reminderSent: false,
        reminderScheduledFor: computeReminderTimestamp(date, time),
      };

      const newPayment: PaymentRecord = {
        id: `pay-${crypto.randomUUID().slice(0, 8)}`,
        transactionId,
        appointmentId: newAppointment.id,
        clientName: newAppointment.clientName,
        serviceName: newAppointment.serviceName,
        servicePrice: newAppointment.servicePrice,
        paymentPlan: chosenPlan,
        paymentMethod: chosenMethod,
        amountPaid,
        remainingBalance,
        status: paymentStatus,
        cardLast4,
        createdAt: nowIso,
      };

      state.appointments.push(newAppointment);
      state.payments.unshift(newPayment);

      const planLabel = chosenPlan === 'full' ? `Pago completo (${amountPaid}€)` : `Depósito 50% (${amountPaid}€)`;
      state.notifications.unshift({
        id: `notif-${crypto.randomUUID().slice(0, 8)}`,
        audience: 'manicurist',
        kind: 'booking',
        title: 'Nueva cita agendada',
        message: `${newAppointment.clientName} (${newAppointment.contact}) reservó ${newAppointment.serviceName} el ${newAppointment.date} a las ${newAppointment.time} · ${planLabel}.`,
        createdAt: nowIso,
        read: false,
      });

      // Check immediately if appointment is already within 24 hours
      const apptMs = new Date(`${date}T${time}:00`).getTime();
      if (!Number.isNaN(apptMs) && apptMs - Date.now() <= 24 * 60 * 60 * 1000 && validChannel !== 'none') {
        await sendReminderForAppointment(newAppointment, 'automated_24h');
      }

      saveAndBroadcast('appointment_created', { appointment: newAppointment });
      return res.status(201).json({ appointment: newAppointment, payment: newPayment, state });
    } catch (err) {
      console.error('Error creating appointment:', err);
      return res.status(500).json({ error: 'No se pudo registrar la cita.' });
    }
  });

  // Bulk delete all attended appointments (must precede /:id)
  app.delete('/api/appointments/attended', (_req, res) => {
    const before = state.appointments.length;
    state.appointments = state.appointments.filter((a) => a.status !== 'attended');
    const removedCount = before - state.appointments.length;
    saveAndBroadcast('attended_cleared', { removedCount });
    res.json({ removedCount, state });
  });

  // Update appointment status or settle remaining payment balance
  app.patch('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const appt = state.appointments.find((a) => a.id === id);
    if (!appt) {
      return res.status(404).json({ error: 'Cita no encontrada.' });
    }

    const { status, settleBalance } = req.body as {
      status?: 'pending' | 'attended';
      settleBalance?: boolean;
    };

    if (status === 'pending' || status === 'attended') {
      appt.status = status;
    }

    if (settleBalance && appt.remainingBalance > 0) {
      const nowIso = new Date().toISOString();
      const extraPaid = appt.remainingBalance;
      appt.amountPaid = appt.servicePrice;
      appt.remainingBalance = 0;
      appt.paymentStatus = 'paid_full';

      const payRec = state.payments.find((p) => p.appointmentId === appt.id);
      if (payRec) {
        payRec.amountPaid = appt.servicePrice;
        payRec.remainingBalance = 0;
        payRec.status = 'paid_full';
        payRec.settledAt = nowIso;
      }

      state.notifications.unshift({
        id: `notif-${crypto.randomUUID().slice(0, 8)}`,
        audience: 'manicurist',
        kind: 'payment',
        title: 'Saldo liquidado en estudio',
        message: `${appt.clientName} completó el saldo restante de ${extraPaid}€ por ${appt.serviceName}.`,
        createdAt: nowIso,
        read: false,
      });
    }

    saveAndBroadcast('appointment_updated', { appointment: appt });
    res.json({ appointment: appt, state });
  });

  app.delete('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const exists = state.appointments.some((a) => a.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Cita no encontrada.' });
    }
    state.appointments = state.appointments.filter((a) => a.id !== id);
    saveAndBroadcast('appointment_deleted', { id });
    res.json({ state });
  });

  // Toggle occupied/available slot manually by manicurist
  app.post('/api/slots/toggle', (req, res) => {
    const { date, time } = req.body as { date?: string; time?: string };
    if (!date || !time || !TIME_SLOTS.includes(time)) {
      return res.status(400).json({ error: 'Fecha u horario inválido.' });
    }
    const list = state.blockedSlots[date] ?? [];
    if (list.includes(time)) {
      state.blockedSlots[date] = list.filter((t) => t !== time);
    } else {
      state.blockedSlots[date] = [...list, time];
    }
    saveAndBroadcast('slot_toggled', { date, time });
    res.json({ state });
  });

  // Trigger manual 24h reminder send
  app.post('/api/reminders/:appointmentId/send', async (req, res) => {
    const { appointmentId } = req.params;
    const appt = state.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: 'Cita no encontrada.' });
    }
    const log = await sendReminderForAppointment(appt, 'manual');
    saveAndBroadcast('reminder_sent', { log });
    res.json({ log, state });
  });

  // Gallery endpoints
  app.post('/api/gallery', (req, res) => {
    const { serviceId, caption, imageUrl } = req.body as {
      serviceId?: string;
      caption?: string;
      imageUrl?: string;
    };
    const service = SERVICES.find((s) => s.id === serviceId);
    if (!service || !caption?.trim() || !imageUrl?.trim()) {
      return res.status(400).json({ error: 'Completa la categoría, descripción y foto.' });
    }
    const item: GalleryItem = {
      id: `gal-${crypto.randomUUID().slice(0, 8)}`,
      serviceId: service.id,
      serviceName: service.name,
      caption: caption.trim(),
      imageUrl: imageUrl.trim(),
      createdAt: new Date().toISOString(),
    };
    state.gallery.unshift(item);
    saveAndBroadcast('gallery_added', { item });
    res.status(201).json({ item, state });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    state.gallery = state.gallery.filter((g) => g.id !== id);
    saveAndBroadcast('gallery_deleted', { id });
    res.json({ state });
  });

  // Notifications read/clear
  app.post('/api/notifications/read-all', (_req, res) => {
    for (const n of state.notifications) {
      n.read = true;
    }
    saveAndBroadcast('notifications_read');
    res.json({ state });
  });

  app.delete('/api/notifications', (_req, res) => {
    state.notifications = [];
    saveAndBroadcast('notifications_cleared');
    res.json({ state });
  });

  // Run 24h reminder sweep every 60 seconds
  setInterval(() => {
    void runAutomatedReminderSweep();
  }, 60 * 1000);
  void runAutomatedReminderSweep();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`XO NELLA Studio server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
