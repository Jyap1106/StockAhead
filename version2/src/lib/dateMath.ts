const AVERAGE_DAYS_PER_MONTH = 30.4375;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function todayDate(): Date {
  return startOfDay(new Date());
}

export function dateToKey(date: Date): string {
  const normalized = startOfDay(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [yearPart, monthPart, dayPart] = key.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return todayDate();
  }

  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const normalized = startOfDay(date);
  normalized.setDate(normalized.getDate() + days);
  return normalized;
}

export function daysBetween(from: Date, to: Date): number {
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return Math.max(0, (end - start) / MS_PER_DAY);
}

export function addCalendarMonths(date: Date, monthsToAdd: number): Date {
  const normalized = startOfDay(date);
  const targetMonthIndex = normalized.getMonth() + monthsToAdd;
  const targetYear = normalized.getFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(normalized.getDate(), lastDayOfTargetMonth);

  return new Date(targetYear, targetMonth, targetDay);
}

export function addDecimalMonths(date: Date, decimalMonths: number): Date {
  const safeMonths = Math.max(0, decimalMonths);
  const wholeMonths = Math.floor(safeMonths);
  const fractionalMonths = safeMonths - wholeMonths;
  const afterWholeMonths = addCalendarMonths(date, wholeMonths);
  const extraDays = Math.round(fractionalMonths * AVERAGE_DAYS_PER_MONTH);

  return addDays(afterWholeMonths, extraDays);
}

export function elapsedMonthsSince(fromDateKey: string, toDate: Date): number {
  const fromDate = parseDateKey(fromDateKey);
  return daysBetween(fromDate, toDate) / AVERAGE_DAYS_PER_MONTH;
}

export function isBefore(date: Date, compareTo: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(compareTo).getTime();
}

export function isAfter(date: Date, compareTo: Date): boolean {
  return startOfDay(date).getTime() > startOfDay(compareTo).getTime();
}

export function isSameOrBefore(date: Date, compareTo: Date): boolean {
  return startOfDay(date).getTime() <= startOfDay(compareTo).getTime();
}

export function isSameOrAfter(date: Date, compareTo: Date): boolean {
  return startOfDay(date).getTime() >= startOfDay(compareTo).getTime();
}
