import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import BoughtModal from '../components/BoughtModal';
import ProductCard from '../components/ProductCard';
import ProductFormModal from '../components/ProductFormModal';
import { loadProducts, loadPurchaseRecords, saveProducts, savePurchaseRecords } from '../data/storage';
import { dateToKey, isAfter, parseDateKey, todayDate } from '../lib/dateMath';
import { formatCurrency, formatDate, formatUnits } from '../lib/formatters';
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
import { findNextSaleAfter, findNextSaleOnOrAfter, getUpcomingSaleEvents } from '../lib/saleCalendar';
import { colors, radii, spacing, typography } from '../theme/theme';
import type { Product, ProductAnalysis, ProductFormValues, PurchaseRecord, SaleGroup } from '../types';

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

type SummaryCardProps = {
  label: string;
  value: string;
  helper?: string;
};

function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      {helper ? <Text style={styles.summaryHelper}>{helper}</Text> : null}
    </View>
  );
}

type SaleGroupCardProps = {
  group: SaleGroup;
};

function SaleGroupCard({ group }: SaleGroupCardProps) {
  return (
    <View style={styles.saleGroupCard}>
      <View style={styles.saleGroupHeader}>
        <View>
          <Text style={styles.saleGroupEyebrow}>Priority sale</Text>
          <Text style={styles.saleGroupTitle}>{group.label}</Text>
        </View>
        <Text style={styles.saleGroupSpend}>{formatCurrency(group.totalSpend)}</Text>
      </View>
      <Text style={styles.saleGroupMeta}>
        {group.products.length} product{group.products.length === 1 ? '' : 's'} to prepare
      </Text>
      <View style={styles.saleGroupList}>
        {group.products.slice(0, 4).map(({ product, analysis }) => (
          <View key={product.id} style={styles.saleGroupItem}>
            <Text style={styles.saleGroupProduct}>{product.name}</Text>
            <Text style={styles.saleGroupProductMeta}>Run-out: {formatDate(analysis.runOutDate)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type ForecastRowProps = {
  label: string;
  dateKey: string;
  productCount: number;
  spend: number;
};

function ForecastRow({ label, dateKey, productCount, spend }: ForecastRowProps) {
  return (
    <View style={styles.forecastRow}>
      <View>
        <Text style={styles.forecastLabel}>{label}</Text>
        <Text style={styles.forecastDate}>{formatDate(dateKey)}</Text>
      </View>
      <View style={styles.forecastRight}>
        <Text style={styles.forecastSpend}>{formatCurrency(spend)}</Text>
        <Text style={styles.forecastItems}>
          {productCount} item{productCount === 1 ? '' : 's'}
        </Text>
      </View>
    </View>
  );
}

function productFormValuesFromProduct(product: Product, today: Date): ProductFormValues {
  const snapshot = productCurrentStockFormSnapshot(product, today);

  return {
    name: product.name,
    category: product.category,
    usagePeriodMonths: product.usagePeriodMonths,
    fullnessLabel: snapshot.fullnessLabel,
    backupUnits: snapshot.backupUnits,
    normalPrice: product.normalPrice,
    estimatedSalePrice: product.estimatedSalePrice,
    defaultPurchaseQuantity: product.defaultPurchaseQuantity
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
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductFormVisible, setProductFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);

  const today = todayDate();
  const todayKey = dateToKey(today);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const [loadedProducts, loadedPurchaseRecords] = await Promise.all([loadProducts(), loadPurchaseRecords()]);

      if (!isMounted) {
        return;
      }

      setProducts(loadedProducts);
      setPurchaseRecords(loadedPurchaseRecords);
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

  const visibleAnalyzedProducts = useMemo(
    () => sortProductCards(analyzedProducts),
    [analyzedProducts]
  );

  const saleGroups = useMemo(() => buildSaleGroups(products, today), [products, todayKey]);
  const priorityGroup = saleGroups[0] ?? null;
  const nextSale = findNextSaleOnOrAfter(today);
  const nextSaleItems = analyzedProducts.filter(
    ({ analysis }) => analysis.status !== 'dismissed' && analysis.saleKey === nextSale.key
  );
  const urgentItems = analyzedProducts.filter(
    ({ analysis }) => analysis.status === 'urgent' || analysis.status === 'overdue'
  );
  const nextSaleBudget = nextSaleItems.reduce((sum, item) => sum + item.analysis.estimatedSpend, 0);
  const upcomingSales = getUpcomingSaleEvents(today, 4);
  const forecastRows = upcomingSales.map((sale) => {
    const items = analyzedProducts.filter(({ analysis }) => analysis.status !== 'dismissed' && analysis.saleKey === sale.key);
    return {
      sale,
      spend: items.reduce((sum, item) => sum + item.analysis.estimatedSpend, 0),
      productCount: items.length
    };
  });
  const totalTrackedStock = analyzedProducts.reduce((sum, item) => sum + item.analysis.totalStockUnits, 0);

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
              estimatedSalePrice: values.estimatedSalePrice,
              defaultPurchaseQuantity: values.defaultPurchaseQuantity,
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
      estimatedSalePrice: values.estimatedSalePrice,
      defaultPurchaseQuantity: values.defaultPurchaseQuantity,
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
    };

    if (risky) {
      confirmAction(
        'Risky postponement',
        `${nextSale.label} is after the safe purchase deadline (${formatDate(analysis.safePurchaseDeadline)}). You can still postpone, but this product may run out first.`,
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
      'This removes 1 unopened backup unit and recalculates the recommendation.',
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
      `${product.name} will be removed from the dashboard. This cannot be undone in the MVP.`,
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

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <Text style={styles.kicker}>StockAhead</Text>
          <Text style={styles.heroTitle}>Buy essentials before you run out.</Text>
          <Text style={styles.heroSubtitle}>
            Track stock coverage, match replenishment to double-digit sales, and prepare each sale budget.
          </Text>
          <AppButton label="Add product" onPress={openAddProduct} variant="primary" style={styles.addButton} />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Next sale" value={nextSale.label} helper={formatDate(nextSale.key)} />
          <SummaryCard label="Next budget" value={formatCurrency(nextSaleBudget)} helper={`${nextSaleItems.length} product${nextSaleItems.length === 1 ? '' : 's'}`} />
          <SummaryCard label="Buy now" value={`${urgentItems.length}`} helper="Urgent or overdue" />
          <SummaryCard label="Tracked stock" value={formatUnits(totalTrackedStock)} helper="Total unit estimate" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next event summary</Text>
          <Text style={styles.sectionHint}>Dashboard reminders are shown in-app for the MVP.</Text>
        </View>

        <View style={styles.nextEventCard}>
          <View>
            <Text style={styles.nextEventEyebrow}>Upcoming double-digit sale</Text>
            <Text style={styles.nextEventTitle}>{nextSale.label}</Text>
            <Text style={styles.nextEventDate}>{formatDate(nextSale.key)}</Text>
          </View>
          <View style={styles.nextEventBudgetPill}>
            <Text style={styles.nextEventBudgetLabel}>Prepare</Text>
            <Text style={styles.nextEventBudget}>{formatCurrency(nextSaleBudget)}</Text>
          </View>
        </View>

        {priorityGroup ? (
          <SaleGroupCard group={priorityGroup} />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No sale reminders yet</Text>
            <Text style={styles.emptyText}>Add your first product to see the best sale date and monthly budget forecast.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming sale forecast</Text>
          <Text style={styles.sectionHint}>Next 4 sale events grouped by recommendation.</Text>
        </View>

        <View style={styles.forecastCard}>
          {forecastRows.map(({ sale, productCount, spend }) => (
            <ForecastRow key={sale.key} label={sale.label} dateKey={sale.key} productCount={productCount} spend={spend} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product cards</Text>
          <Text style={styles.sectionHint}>Urgent items stay above future sale items.</Text>
        </View>

        {isLoading ? <Text style={styles.loadingText}>Loading local StockAhead data...</Text> : null}

        {!isLoading && visibleAnalyzedProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Start with one daily-use product</Text>
            <Text style={styles.emptyText}>
              Example: cleanser, toothpaste, shampoo, detergent, moisturizer, or any item that runs out on a cycle.
            </Text>
            <AppButton label="Add your first product" onPress={openAddProduct} variant="primary" />
          </View>
        ) : null}

        <View style={styles.cardsList}>
          {visibleAnalyzedProducts.map(({ product, analysis }) => (
            <ProductCard
              key={product.id}
              product={product}
              analysis={analysis}
              onBought={() => setBuyingProduct(product)}
              onPostpone={() => handlePostpone(product)}
              onDismiss={() => handleDismiss(product)}
              onEdit={() => openEditProduct(product)}
              onDiscardCurrent={() => handleDiscardCurrent(product)}
              onDiscardBackup={() => handleDiscardBackup(product)}
              onOpenNew={() => handleOpenNew(product)}
              onDelete={() => handleDelete(product)}
            />
          ))}
        </View>
      </ScrollView>

      <ProductFormModal
        visible={isProductFormVisible}
        mode={editingProduct ? 'edit' : 'add'}
        initialValues={editingInitialValues}
        onSave={handleSaveProduct}
        onClose={closeProductForm}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center'
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.backgroundMiddle,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md
  },
  heroGlowOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(76,168,255,0.20)',
    top: -80,
    right: -70
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(124,203,255,0.12)',
    bottom: -90,
    left: -70
  },
  kicker: {
    color: colors.softAccent,
    fontSize: typography.small,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.title,
    lineHeight: 40,
    fontWeight: '900',
    maxWidth: 560
  },
  heroSubtitle: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 24,
    maxWidth: 620
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    minWidth: 160
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs
  },
  summaryLabel: {
    color: colors.veryMutedText,
    fontSize: typography.tiny,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  summaryValue: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900'
  },
  summaryHelper: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  sectionHeader: {
    gap: spacing.xs
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900'
  },
  sectionHint: {
    color: colors.mutedText,
    fontSize: typography.small,
    lineHeight: 20
  },
  nextEventCard: {
    backgroundColor: colors.softCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  nextEventEyebrow: {
    color: colors.softAccent,
    fontSize: typography.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  nextEventTitle: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    marginTop: spacing.xs
  },
  nextEventDate: {
    color: colors.mutedText,
    fontSize: typography.body,
    fontWeight: '700'
  },
  nextEventBudgetPill: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minWidth: 180,
    gap: spacing.xs
  },
  nextEventBudgetLabel: {
    color: colors.veryMutedText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '900',
    fontSize: typography.tiny
  },
  nextEventBudget: {
    color: colors.success,
    fontWeight: '900',
    fontSize: typography.sectionTitle
  },
  saleGroupCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  saleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap'
  },
  saleGroupEyebrow: {
    color: colors.warning,
    fontSize: typography.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  saleGroupTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    marginTop: spacing.xs
  },
  saleGroupSpend: {
    color: colors.success,
    fontSize: typography.sectionTitle,
    fontWeight: '900'
  },
  saleGroupMeta: {
    color: colors.mutedText,
    fontSize: typography.body,
    fontWeight: '700'
  },
  saleGroupList: {
    gap: spacing.sm
  },
  saleGroupItem: {
    backgroundColor: colors.softCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  saleGroupProduct: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800'
  },
  saleGroupProductMeta: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  forecastCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  forecastLabel: {
    color: colors.text,
    fontWeight: '900',
    fontSize: typography.cardTitle
  },
  forecastDate: {
    color: colors.mutedText,
    fontSize: typography.small,
    marginTop: spacing.xs,
    fontWeight: '700'
  },
  forecastRight: {
    alignItems: 'flex-end'
  },
  forecastSpend: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: '900'
  },
  forecastItems: {
    color: colors.mutedText,
    fontSize: typography.small,
    marginTop: spacing.xs,
    fontWeight: '700'
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 24
  },
  loadingText: {
    color: colors.mutedText,
    textAlign: 'center',
    fontWeight: '700'
  },
  cardsList: {
    gap: spacing.lg
  }
});
