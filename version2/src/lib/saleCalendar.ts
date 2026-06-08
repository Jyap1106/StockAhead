import type { SaleDate } from '../types';
import { dateToKey, isAfter, isSameOrAfter, isSameOrBefore, parseDateKey, startOfDay } from './dateMath';

const SALE_MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function formatSaleLabel(date: Date, today: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const base = `${month}.${day}`;

  if (date.getFullYear() === today.getFullYear()) {
    return base;
  }

  return `${base} '${String(date.getFullYear()).slice(-2)}`;
}

export function generateDoubleDigitSaleDates(startYear: number, yearsToGenerate = 6): SaleDate[] {
  const dates: SaleDate[] = [];

  for (let year = startYear; year < startYear + yearsToGenerate; year += 1) {
    for (const month of SALE_MONTHS) {
      const date = new Date(year, month - 1, month);
      dates.push({
        date,
        key: dateToKey(date),
        label: formatSaleLabel(date),
        year,
        month
      });
    }
  }

  return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function generateSaleDatesThrough(deadline: Date, today: Date = new Date()): SaleDate[] {
  const currentYear = startOfDay(today).getFullYear();
  const deadlineYear = startOfDay(deadline).getFullYear();
  const yearsToGenerate = Math.max(6, deadlineYear - currentYear + 2);

  return generateDoubleDigitSaleDates(currentYear, yearsToGenerate).map((sale) => ({
    ...sale,
    label: formatSaleLabel(sale.date, today)
  }));
}

export function findLatestValidSaleDate(today: Date, safePurchaseDeadline: Date): SaleDate | null {
  const sales = generateSaleDatesThrough(safePurchaseDeadline, today);
  const validSales = sales.filter(
    (sale) => isSameOrAfter(sale.date, today) && isSameOrBefore(sale.date, safePurchaseDeadline)
  );

  return validSales.at(-1) ?? null;
}

export function findNextSaleOnOrAfter(today: Date): SaleDate {
  const sales = generateDoubleDigitSaleDates(today.getFullYear(), 7).map((sale) => ({
    ...sale,
    label: formatSaleLabel(sale.date, today)
  }));
  const nextSale = sales.find((sale) => isSameOrAfter(sale.date, today));
  const fallback = sales[0];

  if (nextSale) {
    return nextSale;
  }

  if (fallback) {
    return fallback;
  }

  throw new Error('Unable to generate double-digit sale dates.');
}

export function findNextSaleAfter(date: Date, today: Date = new Date()): SaleDate {
  const sales = generateDoubleDigitSaleDates(Math.min(date.getFullYear(), today.getFullYear()), 8).map((sale) => ({
    ...sale,
    label: formatSaleLabel(sale.date, today)
  }));
  const nextSale = sales.find((sale) => isAfter(sale.date, date));
  const fallback = sales[sales.length - 1];

  if (nextSale) {
    return nextSale;
  }

  if (fallback) {
    return fallback;
  }

  throw new Error('Unable to generate double-digit sale dates.');
}

export function saleDateFromKey(key: string | null | undefined, today: Date = new Date()): SaleDate | null {
  if (!key) {
    return null;
  }

  const date = parseDateKey(key);

  return {
    date,
    key: dateToKey(date),
    label: formatSaleLabel(date, today),
    year: date.getFullYear(),
    month: date.getMonth() + 1
  };
}

export function getUpcomingSaleEvents(today: Date, count: number): SaleDate[] {
  const sales = generateDoubleDigitSaleDates(today.getFullYear(), 7).map((sale) => ({
    ...sale,
    label: formatSaleLabel(sale.date, today)
  }));

  return sales.filter((sale) => isSameOrAfter(sale.date, today)).slice(0, count);
}
