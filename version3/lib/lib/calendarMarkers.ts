import type { CalendarMarker, InventoryEvent, Product, PurchaseRecord } from '../types';
import { dateToKey } from './dateMath';

function dateKeyFromStoredDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateToKey(new Date());
  }

  return dateToKey(parsedDate);
}

export function buildCalendarMarkers(
  products: Product[],
  purchases: PurchaseRecord[],
  inventoryEvents: InventoryEvent[]
): CalendarMarker[] {
  const productNameById = new Map(products.map((product) => [product.id, product.name]));
  const markers: CalendarMarker[] = [];

  for (const product of products) {
    if (product.archived) {
      continue;
    }

    markers.push({
      id: `entry-${product.id}`,
      dateKey: dateKeyFromStoredDate(product.createdAt),
      type: 'entry',
      label: `Added ${product.name}`,
      productName: product.name
    });
  }

  for (const purchase of purchases) {
    const productName = productNameById.get(purchase.productId) ?? 'Product';

    markers.push({
      id: `bought-${purchase.id}`,
      dateKey: dateKeyFromStoredDate(purchase.purchaseDate),
      type: 'bought',
      label: `Bought ${productName}`,
      productName
    });
  }

  for (const event of inventoryEvents) {
    const productName = productNameById.get(event.productId) ?? 'Product';

    if (event.type === 'postponed') {
      markers.push({
        id: `postponed-${event.id}`,
        dateKey: dateKeyFromStoredDate(event.createdAt),
        type: 'postponed',
        label: `Postponed ${productName}`,
        productName
      });
    }

    if (event.type === 'discard_backup') {
      markers.push({
        id: `discard-backup-${event.id}`,
        dateKey: dateKeyFromStoredDate(event.createdAt),
        type: 'discarded_backup',
        label: `Discarded backup for ${productName}`,
        productName
      });
    }
  }

  return markers.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}
