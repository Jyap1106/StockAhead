import { parseDateKey } from './dateMath';

export function formatCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `RM ${safeValue.toFixed(2)}`;
}

export function formatDate(dateKey: string | null | undefined): string {
  if (!dateKey) {
    return 'Not scheduled';
  }

  const date = parseDateKey(dateKey);

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCoverageMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) {
    return '0 months';
  }

  if (months < 1) {
    const days = Math.max(1, Math.round(months * 30.4375));
    return `${days} day${days === 1 ? '' : 's'}`;
  }

  if (months < 12) {
    return `${months.toFixed(months % 1 === 0 ? 0 : 1)} month${months === 1 ? '' : 's'}`;
  }

  const years = months / 12;
  return `${years.toFixed(years % 1 === 0 ? 0 : 1)} year${years === 1 ? '' : 's'}`;
}

export function formatOpenedFraction(fraction: number): string {
  if (fraction <= 0) {
    return 'None';
  }

  if (fraction >= 0.875) {
    return 'Full';
  }

  if (fraction >= 0.625) {
    return '3/4';
  }

  if (fraction >= 0.375) {
    return '2/4';
  }

  return '1/4';
}

export function formatUnits(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)} unit${rounded === 1 ? '' : 's'}`;
}
