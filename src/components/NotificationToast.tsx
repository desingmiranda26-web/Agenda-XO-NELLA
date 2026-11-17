import React from 'react';
import { AlertTriangle, BellRing, CheckCircle2, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  variant: 'booking' | 'available' | 'unavailable';
  title: string;
  message: string;
}

interface NotificationToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-16 right-4 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
            toast.variant === 'unavailable'
              ? 'bg-[#1A1622]/95 border-[#FCA5A5]/45 text-[#F5F2EB]'
              : toast.variant === 'available'
                ? 'bg-[#2D0A4E]/95 border-[#6A0DAD] text-[#F5F2EB]'
                : 'bg-[#6A0DAD]/95 border-[#D8B4FE]/60 text-[#F5F2EB]'
          }`}
        >
          {toast.variant === 'unavailable' ? (
            <AlertTriangle className="w-5 h-5 text-[#FCA5A5] shrink-0 mt-0.5" />
          ) : toast.variant === 'available' ? (
            <CheckCircle2 className="w-5 h-5 text-[#D8B4FE] shrink-0 mt-0.5" />
          ) : (
            <BellRing className="w-5 h-5 text-[#F5F2EB] shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-snug">{toast.title}</p>
            <p className="mt-0.5 text-xs font-normal text-[#F5F2EB]/90 leading-relaxed">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#F5F2EB]/75 hover:text-[#F5F2EB] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
