import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  STUDIO_RULES,
  type NailService,
  type PaymentMethod,
  type PaymentPlan,
  type ReminderChannel,
} from '../types.ts';
import { formatReadableDate } from '../utils/dates.ts';

interface BookingCheckoutPanelProps {
  selectedService: NailService;
  selectedDate: string;
  selectedTime: string;
  designNote: string;
  onChangeDesignNote: (val: string) => void;
  onSubmitBooking: (payload: {
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
  }) => Promise<boolean>;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export const BookingCheckoutPanel: React.FC<BookingCheckoutPanelProps> = ({
  selectedService,
  selectedDate,
  selectedTime,
  designNote,
  onChangeDesignNote,
  onSubmitBooking,
}) => {
  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>('both');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const depositAmount = Number((selectedService.price * 0.5).toFixed(2));
  const amountDueNow = paymentPlan === 'full' ? selectedService.price : depositAmount;
  const remainingAtStudio = Number((selectedService.price - amountDueNow).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedTime) {
      setErrorMsg('Primero selecciona un bloque horario disponible en el calendario.');
      return;
    }
    if (!clientName.trim() || !contact.trim()) {
      setErrorMsg('Ingresa el nombre de la clienta y su teléfono o Instagram.');
      return;
    }
    if ((reminderChannel === 'sms' || reminderChannel === 'both') && !phone.trim() && !contact.trim()) {
      setErrorMsg('Agrega el teléfono SMS de la clienta para enviarle su recordatorio 24h antes.');
      return;
    }
    if ((reminderChannel === 'email' || reminderChannel === 'both') && !email.trim()) {
      setErrorMsg('Agrega el correo electrónico de la clienta para enviar el recordatorio por Email.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Confirma que se leyeron y aceptaron las normas del estudio antes de agendar.');
      return;
    }
    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length < 12 || cardExpiry.length < 5 || cardCvc.length < 3 || !cardHolder.trim()) {
        setErrorMsg('Completa los datos de la tarjeta para procesar el pago seguro.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const ok = await onSubmitBooking({
        clientName: clientName.trim(),
        contact: contact.trim(),
        phone: phone.trim(),
        email: email.trim(),
        designNote: designNote.trim(),
        acceptedTerms,
        paymentPlan,
        paymentMethod,
        cardNumber: paymentMethod === 'card' ? cardNumber : '0000000000000000',
        reminderChannel,
      });
      if (ok) {
        setClientName('');
        setContact('');
        setPhone('');
        setEmail('');
        onChangeDesignNote('');
        setCardHolder('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="reservar" className="py-10 border-t border-[#F5F2EB]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F2EB]">
            04. Normas, Registro y Pago Seguro
          </h2>
          <p className="mt-1 text-sm sm:text-base font-normal text-[#F5F2EB]/70">
            Revisa las condiciones del estudio con la clienta, registra sus datos y procesa su depósito o pago completo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Terms & Conditions (Prominent before confirming) */}
          <div id="normas" className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-[#2D0A4E] border border-[#F5F2EB]/15 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#D8B4FE] shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold text-[#F5F2EB]">
                  Términos y Condiciones del Estudio
                </h3>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-normal text-[#F5F2EB]/75">
                Lectura obligatoria antes de confirmar cualquier turno en XO NELLA:
              </p>

              <ol className="mt-5 space-y-4">
                {STUDIO_RULES.map((rule, index) => (
                  <li key={rule} className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#D8B4FE] tabular-nums shrink-0 mt-0.5">
                      0{index + 1}.
                    </span>
                    <span className="text-sm font-normal text-[#F5F2EB] leading-relaxed">
                      {rule}
                    </span>
                  </li>
                ))}
              </ol>

              <label className="mt-6 pt-5 border-t border-[#F5F2EB]/15 flex items-start gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-[#6A0DAD] rounded cursor-pointer shrink-0"
                />
                <span className="text-sm font-bold text-[#F5F2EB] leading-snug">
                  Confirmo que la clienta conoce y acepta estas normas del estudio.
                </span>
              </label>
            </div>

            {/* Live Booking Summary Card */}
            <div className="rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/12 p-6">
              <p className="text-xs font-normal text-[#F5F2EB]/60">Resumen del turno a agendar</p>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#F5F2EB]/75">Servicio</span>
                  <span className="font-bold text-[#F5F2EB] text-right">{selectedService.name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#F5F2EB]/75">Fecha y hora</span>
                  <span className="font-bold text-[#F5F2EB] tabular-nums">
                    {formatReadableDate(selectedDate)} · {selectedTime || 'Sin horario'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#F5F2EB]/75">Precio total del set</span>
                  <span className="font-bold text-[#F5F2EB] tabular-nums">{selectedService.price}€</span>
                </div>
                <div className="pt-2.5 border-t border-[#F5F2EB]/10 flex items-center justify-between gap-4">
                  <span className="text-[#F5F2EB]/75">
                    {paymentPlan === 'full' ? 'Pago completo hoy' : 'Depósito hoy (50%)'}
                  </span>
                  <span className="text-xl font-bold text-[#D8B4FE] tabular-nums">
                    {amountDueNow}€
                  </span>
                </div>
                {remainingAtStudio > 0 && (
                  <div className="flex items-center justify-between gap-4 text-xs text-[#F5F2EB]/65">
                    <span>Saldo pendiente en mesa</span>
                    <span className="tabular-nums font-bold">{remainingAtStudio}€</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Client Data + Automated 24h Reminder + Secure Payment */}
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="lg:col-span-7 rounded-3xl bg-[#1A1622] border border-[#F5F2EB]/12 p-6 sm:p-8 space-y-6"
          >
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F2EB]">
                Datos de la Clienta y Recordatorio 24h
              </h3>
              <p className="text-xs font-normal text-[#F5F2EB]/65 mt-1">
                Registra a la clienta para bloquear su horario y programar el aviso automático 24h antes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-[#F5F2EB]/80 mb-1.5">
                  Nombre de la clienta *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Sofía Ramírez"
                  className="w-full min-h-[46px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-4 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#F5F2EB]/80 mb-1.5">
                  Instagram o Teléfono principal *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="@usuario o +34 600 000 000"
                  className="w-full min-h-[46px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-4 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#F5F2EB]/80 mb-1.5">
                  Teléfono para SMS (recordatorio 24h)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 612 345 678"
                  className="w-full min-h-[46px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-4 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#F5F2EB]/80 mb-1.5">
                  Email para recordatorio y recibo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clienta@correo.com"
                  className="w-full min-h-[46px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-4 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#F5F2EB]/80 mb-1.5">
                Referencia de diseño (para agilizar tiempo en mesa)
              </label>
              <input
                type="text"
                value={designNote}
                onChange={(e) => onChangeDesignNote(e.target.value)}
                placeholder="Ej. Almendradas rosa cat-eye con líneas chrome dorado"
                className="w-full min-h-[46px] rounded-xl bg-[#121212] border border-[#F5F2EB]/20 px-4 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
              />
            </div>

            {/* Automated 24h Reminder Channel */}
            <div className="pt-2 border-t border-[#F5F2EB]/10">
              <div className="flex items-center gap-2 mb-3">
                <BellRing className="w-4 h-4 text-[#C084FC]" />
                <span className="text-sm font-bold text-[#F5F2EB]">
                  Recordatorio automático 24h antes
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'both' as const, label: 'SMS y Email', icon: BellRing },
                  { id: 'sms' as const, label: 'Solo SMS', icon: Smartphone },
                  { id: 'email' as const, label: 'Solo Email', icon: Mail },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = reminderChannel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReminderChannel(opt.id)}
                      className={`min-h-[44px] rounded-xl px-3 py-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#6A0DAD] border-[#6A0DAD] text-[#F5F2EB]'
                          : 'bg-[#121212] border-[#F5F2EB]/15 text-[#F5F2EB]/75 hover:text-[#F5F2EB]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secure Online Payment Section */}
            <div className="pt-4 border-t border-[#F5F2EB]/10 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C084FC]" />
                  <h4 className="text-sm sm:text-base font-bold text-[#F5F2EB]">
                    Pago Online Seguro
                  </h4>
                </div>
                <span className="text-xs font-normal text-[#F5F2EB]/60">
                  Cifrado TLS · Confirmación inmediata
                </span>
              </div>

              {/* Payment Plan: Deposit 50% vs Full Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentPlan('deposit')}
                  className={`min-h-[60px] rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                    paymentPlan === 'deposit'
                      ? 'bg-[#2D0A4E] border-2 border-[#6A0DAD]'
                      : 'bg-[#121212] border-[#F5F2EB]/15 hover:border-[#6A0DAD]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#F5F2EB]">Pagar Depósito (50%)</span>
                    <span className="text-base font-bold text-[#D8B4FE] tabular-nums">
                      {depositAmount}€
                    </span>
                  </div>
                  <p className="text-xs font-normal text-[#F5F2EB]/65 mt-1">
                    Aparta el turno hoy y liquida el resto en mesa.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentPlan('full')}
                  className={`min-h-[60px] rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                    paymentPlan === 'full'
                      ? 'bg-[#2D0A4E] border-2 border-[#6A0DAD]'
                      : 'bg-[#121212] border-[#F5F2EB]/15 hover:border-[#6A0DAD]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#F5F2EB]">Pago Completo (100%)</span>
                    <span className="text-base font-bold text-[#D8B4FE] tabular-nums">
                      {selectedService.price}€
                    </span>
                  </div>
                  <p className="text-xs font-normal text-[#F5F2EB]/65 mt-1">
                    Servicio totalmente pagado antes de llegar al estudio.
                  </p>
                </button>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'card' as const, label: 'Tarjeta' },
                  { id: 'bizum' as const, label: 'Bizum' },
                  { id: 'apple_pay' as const, label: 'Apple Pay' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`min-h-[44px] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[#6A0DAD] border-[#6A0DAD] text-[#F5F2EB]'
                        : 'bg-[#121212] border-[#F5F2EB]/15 text-[#F5F2EB]/75 hover:text-[#F5F2EB]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' ? (
                <div className="rounded-2xl bg-[#121212] border border-[#F5F2EB]/15 p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-normal text-[#F5F2EB]/75 mb-1">
                      Titular de la tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Nombre como aparece en la tarjeta"
                      className="w-full min-h-[42px] rounded-xl bg-[#1A1622] border border-[#F5F2EB]/15 px-3.5 text-sm text-[#F5F2EB] placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-normal text-[#F5F2EB]/75 mb-1">
                        Número de tarjeta
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          className="w-full min-h-[42px] rounded-xl bg-[#1A1622] border border-[#F5F2EB]/15 pl-3.5 pr-9 text-sm text-[#F5F2EB] tabular-nums placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                        />
                        <CreditCard className="w-4 h-4 text-[#F5F2EB]/45 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-normal text-[#F5F2EB]/75 mb-1">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/AA"
                        className="w-full min-h-[42px] rounded-xl bg-[#1A1622] border border-[#F5F2EB]/15 px-3.5 text-sm text-[#F5F2EB] tabular-nums placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-normal text-[#F5F2EB]/75 mb-1">
                        CVC
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full min-h-[42px] rounded-xl bg-[#1A1622] border border-[#F5F2EB]/15 px-3.5 text-sm text-[#F5F2EB] tabular-nums placeholder:text-[#F5F2EB]/35 focus:outline-none focus:border-[#6A0DAD]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#121212] border border-[#F5F2EB]/15 p-4 flex items-center gap-3 text-xs sm:text-sm text-[#F5F2EB]/85">
                  <CheckCircle2 className="w-5 h-5 text-[#C084FC] shrink-0" />
                  <span>
                    {paymentMethod === 'bizum'
                      ? `Se generará el cobro inmediato por Bizum de ${amountDueNow}€ al confirmar el turno.`
                      : `Autorización rápida Apple Pay por ${amountDueNow}€ al pulsar confirmar.`}
                  </span>
                </div>
              )}
            </div>

            {errorMsg && (
              <p role="alert" className="text-sm font-normal text-[#FCA5A5]">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full min-h-[54px] rounded-2xl bg-[#6A0DAD] hover:bg-[#7B18C8] active:scale-[0.99] disabled:opacity-60 px-6 py-3.5 text-base font-bold text-[#F5F2EB] shadow-xl shadow-[#6A0DAD]/30 transition-all cursor-pointer"
            >
              {isProcessing
                ? 'Procesando pago y agendando turno...'
                : `Agendar Turno y Cobrar ${amountDueNow}€`}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
