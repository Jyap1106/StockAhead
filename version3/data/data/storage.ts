import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppSettings, InventoryEvent, Product, PurchaseRecord } from '../types';

const PRODUCTS_KEY = 'stockahead.products.v1';
const PURCHASE_RECORDS_KEY = 'stockahead.purchaseRecords.v1';
const INVENTORY_EVENTS_KEY = 'stockahead.inventoryEvents.v2';
const APP_SETTINGS_KEY = 'stockahead.appSettings.v3';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  allowMultipleMonthView: false
};

function normalizeDateLike(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

function normalizeProduct(rawProduct: Partial<Product>): Product | null {
  if (!rawProduct.id || !rawProduct.name) {
    return null;
  }

  const now = new Date().toISOString();
  const normalPrice = Number(rawProduct.normalPrice ?? 0);
  const estimatedSalePrice = Number(rawProduct.estimatedSalePrice ?? normalPrice);
  const defaultPurchaseQuantity = Number(rawProduct.defaultPurchaseQuantity ?? 1);

  const product: Product = {
    id: rawProduct.id,
    name: rawProduct.name,
    category: rawProduct.category ?? 'Essentials',
    usagePeriodMonths: Number(rawProduct.usagePeriodMonths ?? 1),
    stockUnitsAtUpdate: Number(rawProduct.stockUnitsAtUpdate ?? 0),
    stockUpdatedAt: normalizeDateLike(rawProduct.stockUpdatedAt, now),
    normalPrice,
    estimatedSalePrice,
    defaultPurchaseQuantity,
    postponedUntilSaleKey: rawProduct.postponedUntilSaleKey ?? null,
    dismissedSaleKeys: Array.isArray(rawProduct.dismissedSaleKeys) ? rawProduct.dismissedSaleKeys : [],
    createdAt: normalizeDateLike(rawProduct.createdAt, now),
    updatedAt: normalizeDateLike(rawProduct.updatedAt, now),
    archived: rawProduct.archived ?? false
  };

  if (rawProduct.bufferDays !== undefined) {
    product.bufferDays = rawProduct.bufferDays;
  }

  return product;
}

function normalizePurchase(rawPurchase: Partial<PurchaseRecord>): PurchaseRecord | null {
  if (!rawPurchase.id || !rawPurchase.productId) {
    return null;
  }

  const quantity = Number(rawPurchase.quantity ?? 0);
  const unitPrice = Number(rawPurchase.unitPrice ?? 0);
  const now = new Date().toISOString();

  return {
    id: rawPurchase.id,
    productId: rawPurchase.productId,
    purchaseDate: normalizeDateLike(rawPurchase.purchaseDate, now),
    saleKey: rawPurchase.saleKey ?? null,
    quantity,
    unitPrice,
    totalPrice: Number(rawPurchase.totalPrice ?? quantity * unitPrice),
    createdAt: normalizeDateLike(rawPurchase.createdAt, now)
  };
}

function normalizeInventoryEvent(rawEvent: Partial<InventoryEvent>): InventoryEvent | null {
  if (!rawEvent.id || !rawEvent.productId || !rawEvent.type) {
    return null;
  }

  const now = new Date().toISOString();
  const event: InventoryEvent = {
    id: rawEvent.id,
    productId: rawEvent.productId,
    type: rawEvent.type,
    createdAt: normalizeDateLike(rawEvent.createdAt, now)
  };

  if (rawEvent.quantityChange !== undefined) {
    event.quantityChange = Number(rawEvent.quantityChange);
  }

  if (rawEvent.note !== undefined) {
    event.note = rawEvent.note;
  }

  return event;
}

function normalizeAppSettings(rawSettings: Partial<AppSettings> | null): AppSettings {
  return {
    allowMultipleMonthView: Boolean(rawSettings?.allowMultipleMonthView ?? DEFAULT_APP_SETTINGS.allowMultipleMonthView)
  };
}

async function loadJsonArray<T>(key: string): Promise<T[]> {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.warn(`Unable to load ${key}`, error);
    return [];
  }
}

export async function loadProducts(): Promise<Product[]> {
  const rawProducts = await loadJsonArray<Partial<Product>>(PRODUCTS_KEY);
  return rawProducts.map(normalizeProduct).filter((product): product is Product => Boolean(product));
}

export async function saveProducts(products: Product[]): Promise<void> {
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export async function loadPurchaseRecords(): Promise<PurchaseRecord[]> {
  const rawPurchases = await loadJsonArray<Partial<PurchaseRecord>>(PURCHASE_RECORDS_KEY);
  return rawPurchases.map(normalizePurchase).filter((purchase): purchase is PurchaseRecord => Boolean(purchase));
}

export async function savePurchaseRecords(purchases: PurchaseRecord[]): Promise<void> {
  await AsyncStorage.setItem(PURCHASE_RECORDS_KEY, JSON.stringify(purchases));
}

export async function loadInventoryEvents(): Promise<InventoryEvent[]> {
  const rawEvents = await loadJsonArray<Partial<InventoryEvent>>(INVENTORY_EVENTS_KEY);
  return rawEvents.map(normalizeInventoryEvent).filter((event): event is InventoryEvent => Boolean(event));
}

export async function saveInventoryEvents(events: InventoryEvent[]): Promise<void> {
  await AsyncStorage.setItem(INVENTORY_EVENTS_KEY, JSON.stringify(events));
}

export async function loadAppSettings(): Promise<AppSettings> {
  try {
    const rawValue = await AsyncStorage.getItem(APP_SETTINGS_KEY);
    if (!rawValue) {
      return DEFAULT_APP_SETTINGS;
    }

    return normalizeAppSettings(JSON.parse(rawValue));
  } catch (error) {
    console.warn('Unable to load app settings', error);
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(normalizeAppSettings(settings)));
}
