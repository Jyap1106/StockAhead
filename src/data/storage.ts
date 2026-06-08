import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Product, PurchaseRecord } from '../types';

const PRODUCTS_KEY = 'stockahead.products.v1';
const PURCHASE_RECORDS_KEY = 'stockahead.purchaseRecords.v1';

function normalizeProduct(rawProduct: Partial<Product>): Product | null {
  if (!rawProduct.id || !rawProduct.name) {
    return null;
  }

  const now = new Date().toISOString();

  const product: Product = {
    id: rawProduct.id,
    name: rawProduct.name,
    category: rawProduct.category ?? 'Essentials',
    usagePeriodMonths: Number(rawProduct.usagePeriodMonths ?? 1),
    stockUnitsAtUpdate: Number(rawProduct.stockUnitsAtUpdate ?? 0),
    stockUpdatedAt: rawProduct.stockUpdatedAt ?? now,
    normalPrice: Number(rawProduct.normalPrice ?? 0),
    estimatedSalePrice: Number(rawProduct.estimatedSalePrice ?? 0),
    defaultPurchaseQuantity: Number(rawProduct.defaultPurchaseQuantity ?? 1),
    postponedUntilSaleKey: rawProduct.postponedUntilSaleKey ?? null,
    dismissedSaleKeys: Array.isArray(rawProduct.dismissedSaleKeys) ? rawProduct.dismissedSaleKeys : [],
    createdAt: rawProduct.createdAt ?? now,
    updatedAt: rawProduct.updatedAt ?? now,
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
    purchaseDate: rawPurchase.purchaseDate ?? now,
    saleKey: rawPurchase.saleKey ?? null,
    quantity,
    unitPrice,
    totalPrice: Number(rawPurchase.totalPrice ?? quantity * unitPrice),
    createdAt: rawPurchase.createdAt ?? now
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
