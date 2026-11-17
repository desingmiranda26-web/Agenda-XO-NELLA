export interface NailService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export type ReminderChannel = 'sms' | 'email' | 'both' | 'none';

export type PaymentPlan = 'deposit' | 'full';

export type PaymentMethod = 'card' | 'bizum' | 'apple_pay';

export type PaymentStatus = 'deposit_paid' | 'paid_full' | 'refunded';

export type AppointmentStatus = 'pending' | 'attended';

export interface Appointment {
  id: string;
  clientName: string;
  contact: string; // Instagram handle or phone
  phone?: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  designNote?: string;
  acceptedTerms: boolean;
  status: AppointmentStatus;
  createdAt: string;
  // Payment fields
  paymentPlan: PaymentPlan;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  remainingBalance: number;
  transactionId: string;
  cardLast4?: string;
  // Automated 24h Reminder fields
  reminderChannel: ReminderChannel;
  reminderSent: boolean;
  reminderSentAt?: string;
  reminderScheduledFor: string; // ISO string 24h prior to appointment
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  servicePrice: number;
  paymentPlan: PaymentPlan;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  remainingBalance: number;
  status: PaymentStatus;
  cardLast4?: string;
  createdAt: string;
  settledAt?: string;
}

export interface ReminderLog {
  id: string;
  appointmentId: string;
  clientName: string;
  recipient: string;
  channel: ReminderChannel;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  sentAt: string;
  type: 'automated_24h' | 'manual';
  message: string;
}

export interface GalleryItem {
  id: string;
  serviceId: string;
  serviceName: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
}

export interface StudioNotification {
  id: string;
  audience: 'manicurist' | 'client' | 'all';
  kind: 'booking' | 'reminder' | 'payment' | 'availability';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface StudioState {
  appointments: Appointment[];
  blockedSlots: Record<string, string[]>; // date -> array of HH:mm
  gallery: GalleryItem[];
  payments: PaymentRecord[];
  reminders: ReminderLog[];
  notifications: StudioNotification[];
}

export const SERVICES: NailService[] = [
  {
    id: 'semi-permanente',
    name: 'Semi permanente',
    price: 9,
    durationMinutes: 45,
    description: 'Esmaltado en gel de alto brillo, preparación de cutícula y sellado duradero.',
  },
  {
    id: 'pedicura',
    name: 'Pedicura',
    price: 9,
    durationMinutes: 45,
    description: 'Limpieza profunda, perfilado impecable, hidratación y esmaltado semipermanente.',
  },
  {
    id: 'dipping-acrilico',
    name: 'Dipping de acrílico',
    price: 13,
    durationMinutes: 60,
    description: 'Baño en polvo acrílico ultrafino para aportar dureza sin sensación pesada.',
  },
  {
    id: 'base-rubber',
    name: 'Base rubber',
    price: 13,
    durationMinutes: 60,
    description: 'Nivelación flexible correctiva ideal para fortalecer uñas naturales frágiles.',
  },
  {
    id: 'jelly-tips',
    name: 'Jelly tips',
    price: 15,
    durationMinutes: 75,
    description: 'Extensión suave de cobertura total con acabado estilizado y ligero.',
  },
  {
    id: 'kapping',
    name: 'Kapping (en gel, polygel y acrílico)',
    price: 15,
    durationMinutes: 75,
    description: 'Capa protectora estructural sobre tu largo natural para evitar quiebres.',
  },
  {
    id: 'sistema-polygel-acrilico',
    name: 'Sistema de polygel y de acrílico',
    price: 18,
    durationMinutes: 90,
    description: 'Esculpido arquitectónico personalizado con máxima resistencia y acabado baddie.',
  },
];

export const TIME_SLOTS: string[] = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export const STUDIO_RULES: string[] = [
  'Ser puntual con la cita.',
  'Solo se esperará un lapso de 10 min, si no se cederá el turno a otra persona.',
  'Sin niños o acompañantes (esto para evitar distracciones y reducir tiempo en mesa).',
  'Enviar la referencia del diseño que se quieran hacer (esto también para reducir tiempo en mesa).',
];
