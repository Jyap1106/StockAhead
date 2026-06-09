import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import BottomTabBar from '../components/BottomTabBar';
import BoughtModal from '../components/BoughtModal';
import ProductFormModal from '../components/ProductFormModal';
import {
  DEFAULT_APP_SETTINGS,
  loadAppSettings,
  loadInventoryEvents,
  loadProducts,
  loadPurchaseRecords,
  saveAppSettings,
  saveInventoryEvents,
  saveProducts,
  savePurchaseRecords
} from '../data/storage';
import { buildCalendarMarkers } from '../lib/calendarMarkers';
import { dateToKey, isAfter, parseDateKey, todayDate } from '../lib/dateMath';
import { formatDate } from '../lib/formatters';
import {
  analyzeProduct,
  buildSaleGroups,
  calculateCurrentStockUnits,
  getDismissKeyForAnalysis,
  productCurrentStockFormSnapshot,
  roundStockUnits,
  splitStockUnits,
  stockUnitsFromFullness
} from '../lib/inventoryMath';
import { findNextSaleAfter } from '../lib/saleCalendar';
import { colors } from '../theme/theme';
import type { AppSettings, AppTab, InventoryEvent, InventoryHealthSummary, Product, ProductAnalysis, ProductFormValues, PurchaseRecord } from '../types';
import CalendarScreen from './CalendarScreen';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import UnavailableScreen from './UnavailableScreen';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function confirmAction(title: string, message: string, onConfirm: () => void, destructive = false) {
  const browserConfirm = (globalThis as unknown as { confirm?: (message: string) => boolean }).confirm;

  if (Platform.OS === 'web' && browserConfirm) {
    if (browserConfirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: destructive ? 'destructive' : 'default', onPress: onConfirm }
  ]);
}

function showMessage(title: string, message: string) {
  Alert.alert(title, message);
}

function productFormValuesFromProduct(product: Product, today: Date): ProductFormValues {
  const snapshot = productCurrentStockFormSnapshot(product, today);

  return {
    name: product.name,
    category: product.category,
    usagePeriodMonths: product.usagePeriodMonths,
    fullnessLabel: snapshot.fullnessLabel,
    backupUnits: snapshot.backupUnits,
    normalPrice: product.normalPrice
  };
}

function sortProductCards(items: Array<{ product: Product; analysis: ProductAnalysis }>) {
  const priority = {
    urgent: 0,
    overdue: 0,
    risky: 1,
    scheduled: 2,
    safe: 3,
    dismissed: 4
  } satisfies Record<ProductAnalysis['status'], number>;

  return [...items].sort((a, b) => {
    const priorityDiff = priority[a.analysis.status] - priority[b.analysis.status];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aDate = a.analysis.recommendedSaleDate ? parseDateKey(a.analysis.recommendedSaleDate).getTime() : 0;
    const bDate = b.analysis.recommendedSaleDate ? parseDateKey(b.analysis.recommendedSaleDate).getTime() : 0;
    return aDate - bDate;
  });
}

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [inventoryEvents, setInventoryEvents] = useState<InventoryEvent[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductFormVisible, setProductFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);

  const today = todayDate();
  const todayKey = dateToKey(today);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const [loadedProducts, loadedPurchaseRecords, loadedInventoryEvents, loadedAppSettings] = await Promise.all([
        loadProducts(),
        loadPurchaseRecords(),
        loadInventoryEvents(),
        loadAppSettings()
      ]);

      if (!isMounted) {
        return;
      }

      setProducts(loadedProducts);
      setPurchaseRecords(loadedPurchaseRecords);
      setInventoryEvents(loadedInventoryEvents);
      setAppSettings(loadedAppSettings);
      setIsLoading(false);
    }

    hydrate().catch((error) => {
      console.warn('Unable to hydrate StockAhead data', error);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeProducts = useMemo(() => products.filter((product) => !product.archived), [products]);

  const analyzedProducts = useMemo(
    () => activeProducts.map((product) => ({ product, analysis: analyzeProduct(product, today) })),
    [activeProducts, todayKey]
  );

  const visibleAnalyzedProducts = useMemo(() => sortProductCards(analyzedProducts), [analyzedProducts]);

  const saleGroups = useMemo(() => buildSaleGroups(products, today), [products, todayKey]);

  const healthSummary = useMemo<InventoryHealthSummary>(() => {
    const lowStockCount = analyzedProducts.filter((item) => item.analysis.totalStockUnits <= 0.5).length;
    const buySoonCount = analyzedProducts.filter((item) =>
      ['urgent', 'overdue', 'risky', 'scheduled'].includes(item.analysis.status)
    ).length;

    return {
      trackedProducts: analyzedProducts.length,
      totalTrackedStock: analyzedProducts.reduce((sum, item) => sum + item.analysis.totalStockUnits, 0),
      lowStockCount,
      buySoonCount
    };
  }, [analyzedProducts]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(activeProducts.map((product) => product.category).filter(Boolean))),
    [activeProducts]
  );

  const calendarMarkers = useMemo(
    () => buildCalendarMarkers(products, purchaseRecords, inventoryEvents),
    [inventoryEvents, products, purchaseRecords]
  );

  function persistProducts(nextProducts: Product[]) {
    setProducts(nextProducts);
    saveProducts(nextProducts).catch((error) => {
      console.warn('Unable to save products', error);
      showMessage('Save failed', 'StockAhead could not save your latest product update.');
    });
  }

  function persistPurchaseRecords(nextRecords: PurchaseRecord[]) {
    setPurchaseRecords(nextRecords);
    savePurchaseRecords(nextRecords).catch((error) => {
      console.warn('Unable to save purchase records', error);
      showMessage('Save failed', 'StockAhead could not save the purchase record.');
    });
  }

  function persistInventoryEvents(nextEvents: InventoryEvent[]) {
    setInventoryEvents(nextEvents);
    saveInventoryEvents(nextEvents).catch((error) => {
      console.warn('Unable to save inventory events', error);
      showMessage('Save failed', 'StockAhead could not save the calendar event.');
    });
  }


  function persistAppSettings(nextSettings: AppSettings) {
    setAppSettings(nextSettings);
    saveAppSettings(nextSettings).catch((error) => {
      console.warn('Unable to save app settings', error);
      showMessage('Save failed', 'StockAhead could not save your settings.');
    });
  }

  function addInventoryEvent(productId: string, type: InventoryEvent['type'], note?: string, quantityChange?: number) {
    const event: InventoryEvent = {
      id: createId('event'),
      productId,
      type,
      createdAt: new Date().toISOString()
    };

    if (note) {
      event.note = note;
    }

    if (quantityChange !== undefined) {
      event.quantityChange = quantityChange;
    }

    persistInventoryEvents([event, ...inventoryEvents]);
  }

  function openAddProduct() {
    setEditingProduct(null);
    setProductFormVisible(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setProductFormVisible(true);
  }

  function closeProductForm() {
    setProductFormVisible(false);
    setEditingProduct(null);
  }

  function handleSaveProduct(values: ProductFormValues) {
    const nowIso = new Date().toISOString();
    const stockUnits = stockUnitsFromFullness(values.fullnessLabel, values.backupUnits);

    if (editingProduct) {
      const nextProducts = products.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: values.name,
              category: values.category,
              usagePeriodMonths: values.usagePeriodMonths,
              stockUnitsAtUpdate: stockUnits,
              stockUpdatedAt: todayKey,
              normalPrice: values.normalPrice,
              estimatedSalePrice: values.normalPrice,
              defaultPurchaseQuantity: 1,
              postponedUntilSaleKey: null,
              dismissedSaleKeys: [],
              updatedAt: nowIso
            }
          : product
      );
      persistProducts(nextProducts);
      closeProductForm();
      return;
    }

    const newProduct: Product = {
      id: createId('product'),
      name: values.name,
      category: values.category,
      usagePeriodMonths: values.usagePeriodMonths,
      stockUnitsAtUpdate: stockUnits,
      stockUpdatedAt: todayKey,
      normalPrice: values.normalPrice,
      estimatedSalePrice: values.normalPrice,
      defaultPurchaseQuantity: 1,
      bufferDays: 5,
      postponedUntilSaleKey: null,
      dismissedSaleKeys: [],
      createdAt: nowIso,
      updatedAt: nowIso,
      archived: false
    };

    persistProducts([newProduct, ...products]);
    closeProductForm();
  }

  function updateProduct(productId: string, updater: (product: Product) => Product) {
    const nextProducts = products.map((product) => (product.id === productId ? updater(product) : product));
    persistProducts(nextProducts);
  }

  function handleBought(product: Product, quantity: number, unitPrice: number) {
    const currentStockUnits = calculateCurrentStockUnits(product, today);
    const updatedStockUnits = roundStockUnits(currentStockUnits + quantity);
    const nowIso = new Date().toISOString();
    const currentAnalysis = analyzeProduct(product, today);

    updateProduct(product.id, (existing) => ({
      ...existing,
      stockUnitsAtUpdate: updatedStockUnits,
      stockUpdatedAt: todayKey,
      estimatedSalePrice: unitPrice,
      defaultPurchaseQuantity: quantity,
      postponedUntilSaleKey: null,
      dismissedSaleKeys: [],
      updatedAt: nowIso
    }));

    const purchaseRecord: PurchaseRecord = {
      id: createId('purchase'),
      productId: product.id,
      purchaseDate: todayKey,
      saleKey: currentAnalysis.saleKey,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      createdAt: nowIso
    };

    persistPurchaseRecords([purchaseRecord, ...purchaseRecords]);
    setBuyingProduct(null);
  }

  function handlePostpone(product: Product) {
    const analysis = analyzeProduct(product, today);
    const baseDate = analysis.recommendedSaleDate ? parseDateKey(analysis.recommendedSaleDate) : today;
    const nextSale = findNextSaleAfter(baseDate, today);
    const safeDeadline = parseDateKey(analysis.safePurchaseDeadline);
    const risky = isAfter(nextSale.date, safeDeadline);

    const applyPostpone = () => {
      updateProduct(product.id, (existing) => ({
        ...existing,
        postponedUntilSaleKey: nextSale.key,
        dismissedSaleKeys: existing.dismissedSaleKeys.filter((key) => key !== nextSale.key),
        updatedAt: new Date().toISOString()
      }));
      addInventoryEvent(product.id, 'postponed', `Postponed to ${nextSale.label}`);
    };

    if (risky) {
      confirmAction(
        'Risky postponement',
        `${nextSale.label} is after the safe purchase deadline (${formatDate(analysis.safePurchaseDeadline)}).\nYou can still postpone, but this product may run out first.`,
        applyPostpone
      );
      return;
    }

    applyPostpone();
  }

  function handleDismiss(product: Product) {
    const analysis = analyzeProduct(product, today);
    const dismissKey = getDismissKeyForAnalysis(analysis, today);

    updateProduct(product.id, (existing) => ({
      ...existing,
      dismissedSaleKeys: existing.dismissedSaleKeys.includes(dismissKey)
        ? existing.dismissedSaleKeys
        : [...existing.dismissedSaleKeys, dismissKey],
      updatedAt: new Date().toISOString()
    }));
  }

  function handleDiscardCurrent(product: Product) {
    confirmAction(
      'Discard current opened stock?',
      'This removes the remaining opened fraction and recalculates the next sale recommendation.',
      () => {
        const currentStockUnits = calculateCurrentStockUnits(product, today);
        const split = splitStockUnits(currentStockUnits);
        const nextStockUnits = roundStockUnits(currentStockUnits - split.openedFraction);

        updateProduct(product.id, (existing) => ({
          ...existing,
          stockUnitsAtUpdate: nextStockUnits,
          stockUpdatedAt: todayKey,
          postponedUntilSaleKey: null,
          dismissedSaleKeys: [],
          updatedAt: new Date().toISOString()
        }));
      },
      true
    );
  }

  function handleDiscardBackup(product: Product) {
    const currentStockUnits = calculateCurrentStockUnits(product, today);
    const split = splitStockUnits(currentStockUnits);

    if (split.unopenedUnitsEstimate < 1) {
      showMessage('No backup stock', 'This product has no unopened backup unit to discard.');
      return;
    }

    confirmAction(
      'Discard one backup unit?',
      'This removes 1 unopened backup unit and adds a red calendar marker.',
      () => {
        const nextStockUnits = roundStockUnits(currentStockUnits - 1);

        updateProduct(product.id, (existing) => ({
          ...existing,
          stockUnitsAtUpdate: nextStockUnits,
          stockUpdatedAt: todayKey,
          postponedUntilSaleKey: null,
          dismissedSaleKeys: [],
          updatedAt: new Date().toISOString()
        }));
        addInventoryEvent(product.id, 'discard_backup', 'Discarded one backup unit', -1);
      },
      true
    );
  }

  function handleOpenNew(product: Product) {
    const currentStockUnits = calculateCurrentStockUnits(product, today);
    const split = splitStockUnits(currentStockUnits);

    if (split.unopenedUnitsEstimate < 1) {
      showMessage('No backup stock', 'Open New requires at least 1 unopened backup unit.');
      return;
    }

    confirmAction(
      'Open a new unit early?',
      'This discards the remaining current opened fraction and treats one backup as the new full opened unit.',
      () => {
        const nextStockUnits = roundStockUnits(currentStockUnits - split.openedFraction);

        updateProduct(product.id, (existing) => ({
          ...existing,
          stockUnitsAtUpdate: nextStockUnits,
          stockUpdatedAt: todayKey,
          postponedUntilSaleKey: null,
          dismissedSaleKeys: [],
          updatedAt: new Date().toISOString()
        }));
      }
    );
  }

  function handleDelete(product: Product) {
    confirmAction(
      'Delete product?',
      `${product.name} will be removed from the dashboard.\nThis cannot be undone in the MVP.`,
      () => {
        updateProduct(product.id, (existing) => ({
          ...existing,
          archived: true,
          updatedAt: new Date().toISOString()
        }));
      },
      true
    );
  }

  const editingInitialValues = editingProduct ? productFormValuesFromProduct(editingProduct, today) : null;

  function renderActiveScreen() {
    if (activeTab === 'finance') {
      return <UnavailableScreen title="Finance" subtitle="Budget charts and spending analysis will be added after the product tracking flow is stable." icon="RM" />;
    }

    if (activeTab === 'calendar') {
      return <CalendarScreen markers={calendarMarkers} />;
    }

    if (activeTab === 'settings') {
      return <SettingsScreen settings={appSettings} onChangeSettings={persistAppSettings} />;
    }

    return (
      <HomeScreen
        isLoading={isLoading}
        saleGroups={saleGroups}
        analyzedProducts={visibleAnalyzedProducts}
        healthSummary={healthSummary}
        allowMultipleMonthView={appSettings.allowMultipleMonthView}
        onBought={setBuyingProduct}
        onPostpone={handlePostpone}
        onDismiss={handleDismiss}
        onEdit={openEditProduct}
        onDiscardCurrent={handleDiscardCurrent}
        onDiscardBackup={handleDiscardBackup}
        onOpenNew={handleOpenNew}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>{renderActiveScreen()}</View>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} onAddPress={openAddProduct} />

      <ProductFormModal
        visible={isProductFormVisible}
        mode={editingProduct ? 'edit' : 'add'}
        initialValues={editingInitialValues}
        categoryOptions={categoryOptions}
        onClose={closeProductForm}
        onSave={handleSaveProduct}
      />

      <BoughtModal
        visible={Boolean(buyingProduct)}
        product={buyingProduct}
        onClose={() => setBuyingProduct(null)}
        onConfirm={(quantity, unitPrice) => {
          if (buyingProduct) {
            handleBought(buyingProduct, quantity, unitPrice);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundStart
  },
  content: {
    flex: 1,
    backgroundColor: colors.backgroundStart
  }
});
