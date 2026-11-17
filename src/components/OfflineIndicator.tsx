import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#2D0A4E] border border-[#6A0DAD] px-4 py-2.5 text-xs font-bold text-[#F5F2EB] shadow-xl"
    >
      <WifiOff className="w-4 h-4 text-[#C084FC]" />
      <span>Modo sin conexión — Mostrando datos guardados</span>
    </div>
  );
};
