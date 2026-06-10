import { format, formatDistanceToNow, differenceInDays, isToday, isTomorrow, isPast, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Convert Firestore Timestamp or Date string to Date
 */
export function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate(); // Firestore Timestamp
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isValid(d) ? d : null;
}

/**
 * Format date as "dd/MM/yyyy"
 */
export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return format(date, 'dd/MM/yyyy');
}

/**
 * Format date as "dd Thg MM, yyyy"
 */
export function formatDateLong(value) {
  const date = toDate(value);
  if (!date) return '—';
  return format(date, 'dd MMM, yyyy', { locale: vi });
}

/**
 * Format date relative to now (e.g. "2 ngày trước")
 */
export function formatRelative(value) {
  const date = toDate(value);
  if (!date) return '—';
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

/**
 * Get days remaining until a date
 */
export function daysRemaining(value) {
  const date = toDate(value);
  if (!date) return null;
  return differenceInDays(date, new Date());
}

/**
 * Get a deadline label with urgency
 */
export function getDeadlineLabel(value) {
  const date = toDate(value);
  if (!date) return { text: 'Không có hạn', urgent: false };

  const days = differenceInDays(date, new Date());

  if (isPast(date) && !isToday(date)) {
    return { text: `Quá hạn ${Math.abs(days)} ngày`, urgent: true };
  }
  if (isToday(date)) {
    return { text: 'Hôm nay', urgent: true };
  }
  if (isTomorrow(date)) {
    return { text: 'Ngày mai', urgent: true };
  }
  if (days <= 7) {
    return { text: `Còn ${days} ngày`, urgent: days <= 2 };
  }
  return { text: formatDate(value), urgent: false };
}

/**
 * Format date for HTML date input (yyyy-MM-dd)
 */
export function toInputDate(value) {
  const date = toDate(value);
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get all dates in a month for calendar
 */
export function getMonthDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOfWeek = firstDay.getDay(); // 0 = Sunday

  const dates = [];

  // Previous month dates
  for (let i = startOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    dates.push({ date: d, isCurrentMonth: false });
  }

  // Current month dates
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    dates.push({ date: d, isCurrentMonth: true });
  }

  // Next month dates (fill to 42 cells = 6 rows)
  const remaining = 42 - dates.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    dates.push({ date: d, isCurrentMonth: false });
  }

  return dates;
}

/**
 * Get month name in Vietnamese
 */
export function getMonthName(month) {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return months[month];
}
