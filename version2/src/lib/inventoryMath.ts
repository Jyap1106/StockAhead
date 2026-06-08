import type { FullnessLabel, Product, ProductAnalysis, SaleGroup } from '../types';
import { addDays, addDecimalMonths, dateToKey, elapsedMonthsSince, isAfter, isBefore, isSameOrBefore, parseDateKey, startOfDay } from './dateMath';
import { findLatestValidSaleDate, formatSaleLabel, saleDateFromKey } from './saleCalendar';

export const DEFAULT_BUFFER_DAYS = 5;

export const fullnessFractionMap: Record<FullnessLabel, number> = {
  Full: 1,
  '3/4': 0.75,
  '2/4': 0.5,
  '1/4': 0.25,
  '0': 0
};

export function stockUnitsFromFullness(fullnessLabel: FullnessLabel, backupUnits: number): number {
  if (fullnessLabel === '0') {
    return 0;
  }

  return roundStockUnits(fullnessFractionMap[fullnessLabel] + Math.max(0, backupUnits));
}

export function roundStockUnits(value: number): number {
  return Math.max(0, Math.round(value * 1000) / 1000);
}

export function calculateCurrentStockUnits(product: Product, today: Date = new Date()): number {
  if (product.usagePeriodMonths <= 0) {
    return Math.max(0, product.stockUnitsAtUpdate);
  }

  const elapsedMonths = elapsedMonthsSince(product.stockUpdatedAt, today);
  const consumedUnits = elapsedMonths / product.usagePeriodMonths;

  return roundStockUnits(product.stockUnitsAtUpdate - consumedUnits);
}

export function calculateCoverageMonths(usagePeriodMonths: number, totalStockUnits: number): number {
  return Math.max(0, usagePeriodMonths) * Math.max(0, totalStockUnits);
}

export function splitStockUnits(totalStockUnits: number): { openedFraction: number; unopenedUnitsEstimate: number } {
  const safeTotal = roundStockUnits(totalStockUnits);

  if (safeTotal <= 0) {
    return { openedFraction: 0, unopenedUnitsEstimate: 0 };
  }

  const wholeUnits = Math.floor(safeTotal);
  const fractionalPart = roundStockUnits(safeTotal - wholeUnits);

  if (fractionalPart === 0) {
    return {
      openedFraction: 1,
      unopenedUnitsEstimate: Math.max(0, wholeUnits - 1)
    };
  }

  return {
    openedFraction: fractionalPart,
    unopenedUnitsEstimate: wholeUnits
  };
}

export function nearestFullnessLabel(openedFraction: number): FullnessLabel {
  if (openedFraction <= 0) {
    return '0';
  }

  const entries = Object.entries(fullnessFractionMap).filter(([label]) => label !== '0') as Array<[FullnessLabel, number]>;
  const safeFraction = Math.max(0.25, Math.min(1, openedFraction));

  return entries.reduce<FullnessLabel>((bestLabel, [label, value]) => {
    const bestDistance = Math.abs(fullnessFractionMap[bestLabel] - safeFraction);
    const distance = Math.abs(value - safeFraction);
    return distance < bestDistance ? label : bestLabel;
  }, 'Full');
}

export function analyzeProduct(product: Product, today: Date = new Date()): ProductAnalysis {
  const todayStart = startOfDay(today);
  const totalStockUnits = calculateCurrentStockUnits(product, todayStart);
  const coverageMonths = calculateCoverageMonths(product.usagePeriodMonths, totalStockUnits);
  const runOutDateObject = addDecimalMonths(todayStart, coverageMonths);
  const bufferDays = product.bufferDays ?? DEFAULT_BUFFER_DAYS;
  const safePurchaseDeadlineObject = addDays(runOutDateObject, -bufferDays);
  const estimatedUnitPrice = Number.isFinite(product.estimatedSalePrice) && product.estimatedSalePrice > 0 ? product.estimatedSalePrice : product.normalPrice;
  const plannedQuantity = Number.isFinite(product.defaultPurchaseQuantity) && product.defaultPurchaseQuantity > 0 ? product.defaultPurchaseQuantity : 1;
  const estimatedSpend = estimatedUnitPrice * plannedQuantity;
  const split = splitStockUnits(totalStockUnits);

  let status: ProductAnalysis['status'] = 'scheduled';
  let recommendedSaleDate: string | null = null;
  let saleKey: string | null = null;
  let saleLabel = 'Buy Now';

  const isOutOrUnsafe =
    totalStockUnits <= 0 ||
    isSameOrBefore(runOutDateObject, todayStart) ||
    isBefore(safePurchaseDeadlineObject, todayStart);

  if (!isOutOrUnsafe) {
    const naturalSale = findLatestValidSaleDate(todayStart, safePurchaseDeadlineObject);

    if (naturalSale) {
      recommendedSaleDate = dateToKey(naturalSale.date);
      saleKey = naturalSale.key;
      saleLabel = naturalSale.label;
      status = 'scheduled';
    } else {
      status = 'urgent';
    }
  } else {
    status = 'urgent';
  }

  const postponedSale = saleDateFromKey(product.postponedUntilSaleKey, todayStart);
  if (postponedSale) {
    recommendedSaleDate = postponedSale.key;
    saleKey = postponedSale.key;
    saleLabel = postponedSale.label;

    if (isBefore(postponedSale.date, todayStart)) {
      status = 'overdue';
      saleLabel = 'Buy Now';
    } else if (isAfter(postponedSale.date, safePurchaseDeadlineObject)) {
      status = 'risky';
    } else {
      status = 'scheduled';
    }
  }

  const dismissalKey = saleKey ?? `buy-now:${dateToKey(todayStart)}`;
  if (product.dismissedSaleKeys.includes(dismissalKey)) {
    status = 'dismissed';
  }

  return {
    productId: product.id,
    totalStockUnits,
    openedFraction: split.openedFraction,
    unopenedUnitsEstimate: split.unopenedUnitsEstimate,
    coverageMonths,
    runOutDate: dateToKey(runOutDateObject),
    safePurchaseDeadline: dateToKey(safePurchaseDeadlineObject),
    recommendedSaleDate,
    saleKey,
    saleLabel,
    status,
    estimatedSpend
  };
}

export function buildSaleGroups(products: Product[], today: Date = new Date()): SaleGroup[] {
  const activeAnalyses = products
    .filter((product) => !product.archived)
    .map((product) => ({ product, analysis: analyzeProduct(product, today) }))
    .filter(({ analysis }) => analysis.status !== 'dismissed');

  const urgentProducts = activeAnalyses.filter(({ analysis }) => analysis.status === 'urgent' || analysis.status === 'overdue');
  const scheduledProducts = activeAnalyses.filter(({ analysis }) => analysis.status !== 'urgent' && analysis.status !== 'overdue');

  const groupsByKey = new Map<string, SaleGroup>();

  if (urgentProducts.length > 0) {
    groupsByKey.set('buy-now', {
      key: 'buy-now',
      label: 'Buy Now',
      date: null,
      products: urgentProducts,
      totalSpend: urgentProducts.reduce((sum, item) => sum + item.analysis.estimatedSpend, 0)
    });
  }

  for (const item of scheduledProducts) {
    const key = item.analysis.saleKey ?? 'buy-now';
    const label = item.analysis.saleLabel;
    const existing = groupsByKey.get(key);

    if (existing) {
      existing.products.push(item);
      existing.totalSpend += item.analysis.estimatedSpend;
      continue;
    }

    groupsByKey.set(key, {
      key,
      label,
      date: item.analysis.recommendedSaleDate,
      products: [item],
      totalSpend: item.analysis.estimatedSpend
    });
  }

  return Array.from(groupsByKey.values()).sort((a, b) => {
    if (a.key === 'buy-now') return -1;
    if (b.key === 'buy-now') return 1;
    if (!a.date || !b.date) return 0;
    return parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime();
  });
}

export function productCurrentStockFormSnapshot(product: Product, today: Date = new Date()) {
  const totalStockUnits = calculateCurrentStockUnits(product, today);
  const split = splitStockUnits(totalStockUnits);

  return {
    fullnessLabel: nearestFullnessLabel(split.openedFraction),
    backupUnits: split.unopenedUnitsEstimate
  };
}

export function getDismissKeyForAnalysis(analysis: ProductAnalysis, today: Date = new Date()): string {
  return analysis.saleKey ?? `buy-now:${dateToKey(today)}`;
}

export function saleLabelFromKey(key: string | null | undefined, today: Date = new Date()): string {
  if (!key) {
    return 'Buy Now';
  }

  return formatSaleLabel(parseDateKey(key), today);
}
