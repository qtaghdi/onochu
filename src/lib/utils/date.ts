import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function getTodayId(date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const value = typeof date === 'string' ? parseISO(date) : date;
  return format(value, 'M월 d일 EEEE', { locale: ko });
}

export function formatCompletedAt(value?: string): string {
  if (!value) return '';
  return format(parseISO(value), 'yyyy.MM.dd HH:mm', { locale: ko });
}
