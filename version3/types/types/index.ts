export const FULLNESS_OPTIONS = ['Full', '3/4', '2/4', '1/4', '0'] as const;

export type FullnessLabel = (typeof FULLNESS_OPTIONS)[number];

export type ProductStatus = 'safe' | 'scheduled' | 'urgent' | 'overdue' | 'risky' | 'dismissed';

export type Product = {
  id: string;
  name: string;
  category: string;
  usagePeriodMonths: number;
  stockUnitsAtUpdate: number;
  stockUpdatedAt: string;
  normalPrice: number;
  estimatedSalePrice: number;
  defaultPurchaseQuantity: number;
  bufferDays?: number;
  postponedUntilSaleKey?: string | null;
  dismissedSaleKeys: string[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
};

export type PurchaseRecord = {
  id: string;
  productId: string;
  purchaseDate: string;
  saleKey?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
};

export type InventoryEventType =
  | 'created'
  | 'edited'
  | 'bought'
  | 'discard_current'
  | 'discard_backup'
  | 'open_new_early'
  | 'postponed'
  | 'dismissed';

export type InventoryEvent = {
  id: string;
  productId: string;
  type: InventoryEventType;
  quantityChange?: number;
  note?: string;
  createdAt: string;
};

export type CalendarMarkerType = 'entry' | 'bought' | 'postponed' | 'discarded_backup';

export type CalendarMarker = {
  id: string;
  dateKey: string;
  type: CalendarMarkerType;
  label: string;
  productName?: string;
};

export type ProductAnalysis = {
  productId: string;
  totalStockUnits: number;
  openedFraction: number;
  unopenedUnitsEstimate: number;
  coverageMonths: number;
  runOutDate: string;
  safePurchaseDeadline: string;
  recommendedSaleDate: string | null;
  saleKey: string | null;
  saleLabel: string;
  status: ProductStatus;
  estimatedSpend: number;
};

export type ProductFormValues = {
  name: string;
  category: string;
  usagePeriodMonths: number;
  fullnessLabel: FullnessLabel;
  backupUnits: number;
  normalPrice: number;
};

export type SaleDate = {
  date: Date;
  key: string;
  label: string;
  year: number;
  month: number;
};

export type SaleGroup = {
  key: string;
  label: string;
  date: string | null;
  products: Array<{
    product: Product;
    analysis: ProductAnalysis;
  }>;
  totalSpend: number;
};

export type AppSettings = {
  allowMultipleMonthView: boolean;
};

export type InventoryHealthSummary = {
  trackedProducts: number;
  totalTrackedStock: number;
  lowStockCount: number;
  buySoonCount: number;
};

export type AppTab = 'home' | 'finance' | 'calendar' | 'settings';
