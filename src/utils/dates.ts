export function getTodayYMD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface DayOption {
  ymd: string;
  weekdayShort: string;
  dayNum: string;
  monthShort: string;
  isToday: boolean;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function getUpcomingDays(count = 10): DayOption[] {
  const base = new Date();
  const todayStr = getTodayYMD();
  const list: DayOption[] = [];

  for (let i = 0; i < count; i++) {
    const dt = new Date(base);
    dt.setDate(base.getDate() + i);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const ymd = `${y}-${m}-${d}`;

    list.push({
      ymd,
      weekdayShort: WEEKDAYS[dt.getDay()],
      dayNum: String(dt.getDate()),
      monthShort: MONTHS[dt.getMonth()],
      isToday: ymd === todayStr,
    });
  }
  return list;
}

export function formatReadableDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return ymd;
  const dt = new Date(y, m - 1, d);
  const wd = WEEKDAYS[dt.getDay()];
  const mo = MONTHS[dt.getMonth()];
  return `${wd} ${d} ${mo}`;
}

export function formatTimeAgoOrClock(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
