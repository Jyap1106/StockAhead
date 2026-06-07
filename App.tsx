import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const STORAGE_KEY = '@stockahead/products-v1';
const DEFAULT_BUFFER_DAYS = 5;
const AVG_DAYS_PER_MONTH = 30.4375;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const theme = {
  bgStart: '#050720',
  bgMid: '#101A55',
  bgEnd: '#1F55A5',
  card: '#121536',
  cardSoft: '#191E4A',
  cardLight: '#232A62',
  accent: '#4CA8FF',
  accentSoft: '#7CCBFF',
  text: '#F7F8FF',
  muted: '#98A7C8',
  muted2: '#657397',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(124,203,255,0.32)',
  success: '#65E6A3',
  warning: '#FFB85C',
  danger: '#FF6B8A',
};

type Fullness = 1 | 0.75 | 0.5 | 0.25;

type Product = {
  id: string;
  name: string;
  category: string;
  usageMonths: number;
  stockUnitsAtUpdate: number;
  stockUpdatedAt: string;
  normalPrice: number;
  salePrice: number;
  plannedQty: number;
  postponedUntil?: string | null;
  dismissedSaleKeys?: string[];
  createdAt: string;
};

type ProductAnalysis = {
  product: Product;
  unitsRemaining: number;
  openedFraction: number;
  unopenedEstimate: number;
  coverageMonths: number;
  daysLeft: number;
  runOutDate: Date;
  safeDeadlineDate: Date;
  recommendedDate: Date | null;
  saleKey: string;
  saleLabel: string;
  status: 'urgent' | 'scheduled';
  isRisky: boolean;
  isDismissed: boolean;
  estimatedSpend: number;
};

type DraftProduct = {
  name: string;
  category: string;
  usageMonths: string;
  fullness: string;
  unopened: string;
  normalPrice: string;
  salePrice: string;
  plannedQty: string;
};

const fullnessOptions: Array<{ label: string; value: Fullness }> = [
  { label: 'Full', value: 1 },
  { label: '3/4', value: 0.75 },
  { label: '2/4', value: 0.5 },
  { label: '1/4', value: 0.25 },
];

const emptyDraft: DraftProduct = {
  name: '',
  category: '',
  usageMonths: '3',
  fullness: '1',
  unopened: '0',
  normalPrice: '',
  salePrice: '',
  plannedQty: '1',
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function getSaleKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseSaleKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function generateSaleDates(today: Date, yearsAhead = 5): Date[] {
  const startYear = today.getFullYear();
  const dates: Date[] = [];

  for (let year = startYear; year <= startYear + yearsAhead; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      dates.push(new Date(year, month - 1, month));
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function formatSaleDate(date: Date, today = new Date()): string {
  const month = date.getMonth() + 1;
  const yearSuffix =
    date.getFullYear() !== today.getFullYear()
      ? ` '${String(date.getFullYear()).slice(2)}`
      : '';

  return `${month}.${month}${yearSuffix}`;
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString(undefined, options);
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return 'RM0';

  return `RM${Math.max(0, value).toFixed(0)}`;
}

function formatMonths(months: number): string {
  if (months <= 0) return '0 days';

  if (months < 1) {
    return `${Math.max(1, Math.round(months * AVG_DAYS_PER_MONTH))} days`;
  }

  if (months < 12) {
    return `${months < 3 ? months.toFixed(1) : months.toFixed(0)} mo`;
  }

  return `${(months / 12).toFixed(1)} yr`;
}

function parseNumber(value: string, fallback = 0): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSeedProducts(): Product[] {
  const now = new Date().toISOString();

  return [
    {
      id: createId(),
      name: 'Face cleanser',
      category: 'Skincare',
      usageMonths: 3,
      stockUnitsAtUpdate: 1,
      stockUpdatedAt: now,
      normalPrice: 60,
      salePrice: 45,
      plannedQty: 1,
      postponedUntil: null,
      dismissedSaleKeys: [],
      createdAt: now,
    },
    {
      id: createId(),
      name: 'Toothpaste',
      category: 'Bathroom',
      usageMonths: 2,
      stockUnitsAtUpdate: 1.25,
      stockUpdatedAt: now,
      normalPrice: 18,
      salePrice: 13,
      plannedQty: 2,
      postponedUntil: null,
      dismissedSaleKeys: [],
      createdAt: now,
    },
  ];
}

function getCurrentUnits(product: Product, today: Date): number {
  const usageDays = Math.max(product.usageMonths * AVG_DAYS_PER_MONTH, 1);
  const lastUpdated = new Date(product.stockUpdatedAt);
  const elapsedDays = Math.max(0, (today.getTime() - lastUpdated.getTime()) / MS_PER_DAY);

  return Math.max(0, product.stockUnitsAtUpdate - elapsedDays / usageDays);
}

function getOpenedFraction(unitsRemaining: number): number {
  if (unitsRemaining <= 0) return 0;

  const remainder = unitsRemaining - Math.floor(unitsRemaining);

  if (remainder < 0.01) return 1;

  return remainder;
}

function getUnopenedEstimate(unitsRemaining: number): number {
  if (unitsRemaining <= 0) return 0;

  return Math.max(0, Math.ceil(unitsRemaining - 0.0001) - 1);
}

function getNearestFullness(value: number): Fullness {
  if (value >= 0.875) return 1;
  if (value >= 0.625) return 0.75;
  if (value >= 0.375) return 0.5;
  return 0.25;
}

function openedLabel(value: number): string {
  if (value <= 0) return 'Empty';
  if (value >= 0.875) return 'Full';
  if (value >= 0.625) return '3/4';
  if (value >= 0.375) return '2/4';
  return '1/4';
}

function findLatestSaleBefore(deadline: Date, today: Date): Date | null {
  const saleDates = generateSaleDates(today);
  const start = startOfDay(today).getTime();
  const end = startOfDay(deadline).getTime();

  const candidates = saleDates.filter((date) => {
    const time = startOfDay(date).getTime();
    return time >= start && time <= end;
  });

  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
}

function findNextSaleAfter(date: Date, today: Date): Date | null {
  const saleDates = generateSaleDates(today);
  const after = startOfDay(addDays(date, 1)).getTime();

  return saleDates.find((saleDate) => startOfDay(saleDate).getTime() >= after) ?? null;
}

function analyzeProduct(product: Product, today: Date): ProductAnalysis {
  const unitsRemaining = getCurrentUnits(product, today);
  const usageDays = Math.max(product.usageMonths * AVG_DAYS_PER_MONTH, 1);
  const coverageDays = unitsRemaining * usageDays;
  const coverageMonths = coverageDays / AVG_DAYS_PER_MONTH;
  const runOutDate = addDays(today, coverageDays);
  const safeDeadlineDate = addDays(runOutDate, -DEFAULT_BUFFER_DAYS);
  const organicSaleDate = findLatestSaleBefore(safeDeadlineDate, today);

  let recommendedDate: Date | null = organicSaleDate;
  let status: ProductAnalysis['status'] = organicSaleDate ? 'scheduled' : 'urgent';
  let isRisky = false;

  if (unitsRemaining <= 0) {
    recommendedDate = null;
    status = 'urgent';
  }

  if (recommendedDate && product.postponedUntil) {
    const postponedDate = parseSaleKey(product.postponedUntil);

    if (
      startOfDay(postponedDate).getTime() >= startOfDay(today).getTime() &&
      startOfDay(postponedDate).getTime() > startOfDay(recommendedDate).getTime()
    ) {
      recommendedDate = postponedDate;
      isRisky = startOfDay(postponedDate).getTime() > startOfDay(safeDeadlineDate).getTime();
    }
  }

  const saleKey = recommendedDate ? getSaleKey(recommendedDate) : 'urgent';
  const saleLabel = recommendedDate ? formatSaleDate(recommendedDate, today) : 'Buy now';

  return {
    product,
    unitsRemaining,
    openedFraction: getOpenedFraction(unitsRemaining),
    unopenedEstimate: getUnopenedEstimate(unitsRemaining),
    coverageMonths,
    daysLeft: Math.max(0, Math.round(coverageDays)),
    runOutDate,
    safeDeadlineDate,
    recommendedDate,
    saleKey,
    saleLabel,
    status,
    isRisky,
    isDismissed: product.dismissedSaleKeys?.includes(saleKey) ?? false,
    estimatedSpend: product.salePrice * product.plannedQty,
  };
}

function sortAnalyses(a: ProductAnalysis, b: ProductAnalysis): number {
  if (a.status === 'urgent' && b.status !== 'urgent') return -1;
  if (b.status === 'urgent' && a.status !== 'urgent') return 1;

  const aTime = a.recommendedDate?.getTime() ?? 0;
  const bTime = b.recommendedDate?.getTime() ?? 0;

  return aTime - bTime;
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [buyTarget, setBuyTarget] = useState<ProductAnalysis | null>(null);
  const [buyQty, setBuyQty] = useState('1');
  const [buyPrice, setBuyPrice] = useState('');

  const today = useMemo(() => startOfDay(new Date()), []);

  const analyses = useMemo(
    () => products.map((product) => analyzeProduct(product, today)).sort(sortAnalyses),
    [products, today],
  );

  const activeAnalyses = useMemo(
    () => analyses.filter((analysis) => !analysis.isDismissed),
    [analyses],
  );

  const groups = useMemo(() => {
    const result: Array<{
      key: string;
      label: string;
      date: Date | null;
      total: number;
      items: ProductAnalysis[];
    }> = [];

    activeAnalyses.forEach((analysis) => {
      const existing = result.find((group) => group.key === analysis.saleKey);

      if (existing) {
        existing.items.push(analysis);
        existing.total += analysis.estimatedSpend;
      } else {
        result.push({
          key: analysis.saleKey,
          label: analysis.status === 'urgent' ? 'Buy Now' : `${analysis.saleLabel} Sale`,
          date: analysis.recommendedDate,
          total: analysis.estimatedSpend,
          items: [analysis],
        });
      }
    });

    return result.sort((a, b) => {
      if (a.key === 'urgent') return -1;
      if (b.key === 'urgent') return 1;

      return (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0);
    });
  }, [activeAnalyses]);

  const nextGroup = groups[0] ?? null;
  const totalForecast = groups.slice(0, 4).reduce((sum, group) => sum + group.total, 0);

  useEffect(() => {
    async function loadProducts() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (raw) {
          setProducts(JSON.parse(raw));
        } else {
          setProducts(getSeedProducts());
        }
      } catch {
        setProducts(getSeedProducts());
      } finally {
        setHydrated(true);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products)).catch(() => {
      // Local persistence failure is non-blocking for this MVP.
    });
  }, [products, hydrated]);

  function openAddModal() {
    setEditingProductId(null);
    setDraft(emptyDraft);
    setProductModalVisible(true);
  }

  function openEditModal(analysis: ProductAnalysis) {
    const product = analysis.product;

    setEditingProductId(product.id);
    setDraft({
      name: product.name,
      category: product.category,
      usageMonths: String(product.usageMonths),
      fullness: String(getNearestFullness(analysis.openedFraction || 0.25)),
      unopened: String(analysis.unopenedEstimate),
      normalPrice: String(product.normalPrice),
      salePrice: String(product.salePrice),
      plannedQty: String(product.plannedQty),
    });
    setProductModalVisible(true);
  }

  function saveProduct() {
    const name = draft.name.trim();
    const category = draft.category.trim() || 'Essentials';
    const usageMonths = parseNumber(draft.usageMonths, 0);
    const fullness = parseNumber(draft.fullness, 1);
    const unopened = Math.floor(parseNumber(draft.unopened, 0));
    const normalPrice = parseNumber(draft.normalPrice, 0);
    const salePrice = parseNumber(draft.salePrice, 0);
    const plannedQty = Math.max(1, Math.floor(parseNumber(draft.plannedQty, 1)));
    const now = new Date().toISOString();

    if (!name) {
      Alert.alert('Missing product name', 'Please enter a product name first.');
      return;
    }

    if (usageMonths <= 0) {
      Alert.alert('Invalid usage period', 'Usage period must be more than 0 months.');
      return;
    }

    const stockUnitsAtUpdate = fullness + unopened;

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                name,
                category,
                usageMonths,
                stockUnitsAtUpdate,
                stockUpdatedAt: now,
                normalPrice,
                salePrice,
                plannedQty,
                postponedUntil: null,
                dismissedSaleKeys: [],
              }
            : product,
        ),
      );
    } else {
      setProducts((current) => [
        {
          id: createId(),
          name,
          category,
          usageMonths,
          stockUnitsAtUpdate,
          stockUpdatedAt: now,
          normalPrice,
          salePrice,
          plannedQty,
          postponedUntil: null,
          dismissedSaleKeys: [],
          createdAt: now,
        },
        ...current,
      ]);
    }

    setProductModalVisible(false);
  }

  function openBuyModal(analysis: ProductAnalysis) {
    setBuyTarget(analysis);
    setBuyQty(String(analysis.product.plannedQty || 1));
    setBuyPrice(String(analysis.product.salePrice || ''));
    setBuyModalVisible(true);
  }

  function confirmBought() {
    if (!buyTarget) return;

    const qty = Math.max(1, Math.floor(parseNumber(buyQty, 1)));
    const paidPrice = parseNumber(buyPrice, buyTarget.product.salePrice);
    const now = new Date().toISOString();

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== buyTarget.product.id) return product;

        const currentUnits = getCurrentUnits(product, today);

        return {
          ...product,
          stockUnitsAtUpdate: currentUnits + qty,
          stockUpdatedAt: now,
          salePrice: paidPrice > 0 ? paidPrice : product.salePrice,
          plannedQty: qty,
          postponedUntil: null,
          dismissedSaleKeys: [],
        };
      }),
    );

    setBuyModalVisible(false);
    setBuyTarget(null);
  }

  function postponeProduct(analysis: ProductAnalysis) {
    const baselineDate = analysis.recommendedDate ?? today;
    const nextSale = findNextSaleAfter(baselineDate, today);

    if (!nextSale) return;

    const applyPostpone = () => {
      setProducts((current) =>
        current.map((product) =>
          product.id === analysis.product.id
            ? {
                ...product,
                postponedUntil: getSaleKey(nextSale),
              }
            : product,
        ),
      );
    };

    const risky = startOfDay(nextSale).getTime() > startOfDay(analysis.safeDeadlineDate).getTime();

    if (risky) {
      Alert.alert(
        'Risky postponement',
        `${analysis.product.name} may run out before ${formatSaleDate(nextSale, today)}. Postpone anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Postpone', style: 'destructive', onPress: applyPostpone },
        ],
      );
    } else {
      applyPostpone();
    }
  }

  function dismissReminder(analysis: ProductAnalysis) {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== analysis.product.id) return product;

        const existingKeys = product.dismissedSaleKeys ?? [];

        return {
          ...product,
          dismissedSaleKeys: Array.from(new Set([...existingKeys, analysis.saleKey])),
        };
      }),
    );
  }

  function discardCurrent(analysis: ProductAnalysis) {
    const amountToRemove = analysis.openedFraction;

    if (amountToRemove <= 0) return;

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== analysis.product.id) return product;

        const currentUnits = getCurrentUnits(product, today);

        return {
          ...product,
          stockUnitsAtUpdate: Math.max(0, currentUnits - amountToRemove),
          stockUpdatedAt: new Date().toISOString(),
          postponedUntil: null,
          dismissedSaleKeys: [],
        };
      }),
    );
  }

  function discardBackup(analysis: ProductAnalysis) {
    if (analysis.unopenedEstimate < 1) {
      Alert.alert('No backup stock', 'There is no unopened backup unit to discard.');
      return;
    }

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== analysis.product.id) return product;

        const currentUnits = getCurrentUnits(product, today);

        return {
          ...product,
          stockUnitsAtUpdate: Math.max(0, currentUnits - 1),
          stockUpdatedAt: new Date().toISOString(),
          postponedUntil: null,
          dismissedSaleKeys: [],
        };
      }),
    );
  }

  function openNewEarly(analysis: ProductAnalysis) {
    if (analysis.unopenedEstimate < 1) {
      Alert.alert('No backup available', 'You need at least 1 unopened backup unit to open a new one early.');
      return;
    }

    discardCurrent(analysis);
  }

  function deleteProduct(analysis: ProductAnalysis) {
    Alert.alert('Delete product?', `Remove ${analysis.product.name} from StockAhead?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setProducts((current) => current.filter((product) => product.id !== analysis.product.id));
        },
      },
    ]);
  }

  if (!hydrated) {
    return (
      <LinearGradient colors={[theme.bgStart, theme.bgMid, theme.bgEnd] as const} style={styles.app}>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.loadingText}>Loading StockAhead...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.bgStart, theme.bgMid, theme.bgEnd] as const} style={styles.app}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.shell}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>SALE-ALIGNED ESSENTIALS</Text>
                <Text style={styles.appTitle}>StockAhead</Text>
                <Text style={styles.subtitle}>Buy before you run out, not before you need to.</Text>
              </View>

              <TouchableOpacity activeOpacity={0.82} style={styles.addButton} onPress={openAddModal}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Next event</Text>
                <Text style={styles.metricValue}>{nextGroup ? nextGroup.label : 'All stocked'}</Text>
                <Text style={styles.metricHint}>
                  {nextGroup ? `${nextGroup.items.length} item(s)` : 'No purchase needed'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Next budget</Text>
                <Text style={styles.metricValue}>{formatCurrency(nextGroup?.total ?? 0)}</Text>
                <Text style={styles.metricHint}>Estimated sale spend</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>4-event forecast</Text>
                <Text style={styles.metricValue}>{formatCurrency(totalForecast)}</Text>
                <Text style={styles.metricHint}>Based on planned qty</Text>
              </View>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.sectionLabel}>Priority dashboard</Text>
                  <Text style={styles.heroTitle}>{nextGroup ? nextGroup.label : 'Nothing to buy yet'}</Text>
                </View>

                <View style={styles.budgetPill}>
                  <Text style={styles.budgetPillText}>{formatCurrency(nextGroup?.total ?? 0)}</Text>
                </View>
              </View>

              {nextGroup ? (
                <View style={styles.heroList}>
                  {nextGroup.items.map((analysis) => (
                    <View key={analysis.product.id} style={styles.heroItem}>
                      <View style={styles.heroBullet} />
                      <View style={styles.heroItemCopy}>
                        <Text style={styles.heroItemName}>{analysis.product.name}</Text>
                        <Text style={styles.heroItemMeta}>
                          {analysis.product.category} • Runs out {formatDate(analysis.runOutDate)}
                        </Text>
                      </View>
                      <Text style={styles.heroItemPrice}>{formatCurrency(analysis.estimatedSpend)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  Add more products or wait until your stock gets closer to the next sale window.
                </Text>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming sale forecast</Text>
              <Text style={styles.sectionHint}>Grouped by recommended buying date</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScroll}>
              {groups.length > 0 ? (
                groups.slice(0, 8).map((group) => (
                  <View key={group.key} style={styles.forecastCard}>
                    <Text style={styles.forecastLabel}>{group.label}</Text>
                    <Text style={styles.forecastAmount}>{formatCurrency(group.total)}</Text>
                    <Text style={styles.forecastMeta}>{group.items.length} item(s)</Text>
                  </View>
                ))
              ) : (
                <View style={styles.forecastCardWide}>
                  <Text style={styles.forecastLabel}>No upcoming purchases</Text>
                  <Text style={styles.forecastMeta}>Your essentials are covered for now.</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <Text style={styles.sectionHint}>{products.length} tracked item(s)</Text>
            </View>

            {analyses.length > 0 ? (
              analyses.map((analysis) => (
                <View key={analysis.product.id} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <View style={styles.productTitleBlock}>
                      <Text style={styles.productName}>{analysis.product.name}</Text>
                      <Text style={styles.productCategory}>{analysis.product.category}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusTag,
                        analysis.status === 'urgent' && styles.statusDanger,
                        analysis.isRisky && styles.statusWarning,
                        analysis.isDismissed && styles.statusMuted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          analysis.status === 'urgent' && styles.statusDangerText,
                          analysis.isRisky && styles.statusWarningText,
                          analysis.isDismissed && styles.statusMutedText,
                        ]}
                      >
                        {analysis.isDismissed
                          ? 'Dismissed'
                          : analysis.status === 'urgent'
                            ? 'Urgent'
                            : analysis.isRisky
                              ? 'Risky'
                              : `Buy ${analysis.saleLabel}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.coverageRow}>
                    <View>
                      <Text style={styles.coverageMain}>{formatMonths(analysis.coverageMonths)} left</Text>
                      <Text style={styles.coverageSub}>
                        Opened: {openedLabel(analysis.openedFraction)} • Backup: {analysis.unopenedEstimate}
                      </Text>
                    </View>

                    <View style={styles.priceBlock}>
                      <Text style={styles.priceText}>{formatCurrency(analysis.estimatedSpend)}</Text>
                      <Text style={styles.priceSub}>
                        {analysis.product.plannedQty} × {formatCurrency(analysis.product.salePrice)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(100, Math.max(5, (analysis.coverageMonths / 12) * 100))}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Run-out</Text>
                      <Text style={styles.detailValue}>{formatDate(analysis.runOutDate)}</Text>
                    </View>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Safe deadline</Text>
                      <Text style={styles.detailValue}>{formatDate(analysis.safeDeadlineDate)}</Text>
                    </View>
                    <View style={styles.detailCell}>
                      <Text style={styles.detailLabel}>Normal price</Text>
                      <Text style={styles.detailValue}>{formatCurrency(analysis.product.normalPrice)}</Text>
                    </View>
                  </View>

                  <View style={styles.actionGrid}>
                    <SmallButton label="Bought" variant="primary" onPress={() => openBuyModal(analysis)} />
                    <SmallButton label="Postpone" onPress={() => postponeProduct(analysis)} />
                    <SmallButton label="Dismiss" onPress={() => dismissReminder(analysis)} />
                    <SmallButton label="Edit" onPress={() => openEditModal(analysis)} />
                    <SmallButton label="Discard current" onPress={() => discardCurrent(analysis)} />
                    <SmallButton label="Discard backup" onPress={() => discardBackup(analysis)} />
                    <SmallButton label="Open new" onPress={() => openNewEarly(analysis)} />
                    <SmallButton label="Delete" variant="danger" onPress={() => deleteProduct(analysis)} />
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No products yet</Text>
                <Text style={styles.emptyText}>
                  Add your first essential item to calculate its next best double-digit sale date.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={openAddModal}>
                  <Text style={styles.primaryButtonText}>Add product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal visible={productModalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingProductId ? 'Edit product' : 'Add product'}</Text>
                <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Input
                  label="Product name"
                  value={draft.name}
                  placeholder="Face cleanser"
                  onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))}
                />

                <Input
                  label="Category / folder"
                  value={draft.category}
                  placeholder="Skincare"
                  onChangeText={(value) => setDraft((current) => ({ ...current, category: value }))}
                />

                <Input
                  label="One full unit lasts how many months?"
                  value={draft.usageMonths}
                  placeholder="3"
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setDraft((current) => ({ ...current, usageMonths: value }))}
                />

                <Text style={styles.inputLabel}>Current opened stock</Text>
                <View style={styles.segmentRow}>
                  {fullnessOptions.map((option) => {
                    const active = draft.fullness === String(option.value);

                    return (
                      <TouchableOpacity
                        key={option.label}
                        style={[styles.segmentButton, active && styles.segmentButtonActive]}
                        onPress={() => setDraft((current) => ({ ...current, fullness: String(option.value) }))}
                      >
                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Input
                  label="Unopened backup stock"
                  value={draft.unopened}
                  placeholder="2"
                  keyboardType="number-pad"
                  onChangeText={(value) => setDraft((current) => ({ ...current, unopened: value }))}
                />

                <Input
                  label="Normal price"
                  value={draft.normalPrice}
                  placeholder="60"
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setDraft((current) => ({ ...current, normalPrice: value }))}
                />

                <Input
                  label="Estimated sale price"
                  value={draft.salePrice}
                  placeholder="45"
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setDraft((current) => ({ ...current, salePrice: value }))}
                />

                <Input
                  label="Usually buy quantity"
                  value={draft.plannedQty}
                  placeholder="1"
                  keyboardType="number-pad"
                  onChangeText={(value) => setDraft((current) => ({ ...current, plannedQty: value }))}
                />

                <TouchableOpacity style={styles.primaryButton} onPress={saveProduct}>
                  <Text style={styles.primaryButtonText}>{editingProductId ? 'Save changes' : 'Add product'}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal visible={buyModalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
            <View style={styles.modalCardSmall}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Mark as bought</Text>
                <TouchableOpacity onPress={() => setBuyModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>{buyTarget ? buyTarget.product.name : ''}</Text>

              <Input
                label="How many did you buy?"
                value={buyQty}
                placeholder="1"
                keyboardType="number-pad"
                onChangeText={setBuyQty}
              />

              <Input
                label="Actual price per unit"
                value={buyPrice}
                placeholder="45"
                keyboardType="decimal-pad"
                onChangeText={setBuyPrice}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={confirmBought}>
                <Text style={styles.primaryButtonText}>Update stock</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Input({
  label,
  value,
  placeholder,
  keyboardType,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.muted2}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

function SmallButton({
  label,
  variant = 'ghost',
  onPress,
}: {
  label: string;
  variant?: 'ghost' | 'primary' | 'danger';
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.smallButton,
        variant === 'primary' && styles.smallButtonPrimary,
        variant === 'danger' && styles.smallButtonDanger,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          variant === 'primary' && styles.smallButtonPrimaryText,
          variant === 'danger' && styles.smallButtonDangerText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 40,
  },
  shell: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  eyebrow: {
    color: theme.accentSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  appTitle: {
    color: theme.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.accent,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  addButtonText: {
    color: theme.text,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    minHeight: 104,
    backgroundColor: 'rgba(18,21,54,0.88)',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
  },
  metricLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 9,
  },
  metricValue: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '900',
  },
  metricHint: {
    color: theme.muted2,
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15,
  },
  heroCard: {
    backgroundColor: 'rgba(18,21,54,0.94)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    padding: 18,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  sectionLabel: {
    color: theme.accentSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: theme.text,
    fontSize: 25,
    fontWeight: '900',
  },
  budgetPill: {
    backgroundColor: 'rgba(76,168,255,0.16)',
    borderColor: 'rgba(124,203,255,0.35)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  budgetPillText: {
    color: theme.accentSoft,
    fontSize: 15,
    fontWeight: '900',
  },
  heroList: {
    marginTop: 16,
    gap: 10,
  },
  heroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 12,
  },
  heroBullet: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.accent,
    marginRight: 10,
  },
  heroItemCopy: {
    flex: 1,
  },
  heroItemName: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '800',
  },
  heroItemMeta: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 3,
  },
  heroItemPrice: {
    color: theme.success,
    fontSize: 14,
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionHint: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 4,
  },
  forecastScroll: {
    paddingRight: 18,
    gap: 10,
    paddingBottom: 18,
  },
  forecastCard: {
    width: 140,
    minHeight: 98,
    backgroundColor: 'rgba(25,30,74,0.88)',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  forecastCardWide: {
    width: 250,
    minHeight: 98,
    backgroundColor: 'rgba(25,30,74,0.88)',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  forecastLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  forecastAmount: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
  },
  forecastMeta: {
    color: theme.muted2,
    fontSize: 12,
    marginTop: 6,
  },
  productCard: {
    backgroundColor: 'rgba(18,21,54,0.94)',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  productTitleBlock: {
    flex: 1,
  },
  productName: {
    color: theme.text,
    fontSize: 19,
    fontWeight: '900',
  },
  productCategory: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 3,
  },
  statusTag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: 'rgba(76,168,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusTagText: {
    color: theme.accentSoft,
    fontSize: 11,
    fontWeight: '900',
  },
  statusDanger: {
    borderColor: 'rgba(255,107,138,0.45)',
    backgroundColor: 'rgba(255,107,138,0.12)',
  },
  statusDangerText: {
    color: theme.danger,
  },
  statusWarning: {
    borderColor: 'rgba(255,184,92,0.45)',
    backgroundColor: 'rgba(255,184,92,0.12)',
  },
  statusWarningText: {
    color: theme.warning,
  },
  statusMuted: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusMutedText: {
    color: theme.muted,
  },
  coverageRow: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  coverageMain: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
  },
  coverageSub: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 5,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: theme.success,
    fontSize: 18,
    fontWeight: '900',
  },
  priceSub: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 4,
  },
  progressTrack: {
    height: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: theme.accent,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  detailCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 10,
  },
  detailLabel: {
    color: theme.muted2,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 5,
  },
  detailValue: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '800',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  smallButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  smallButtonPrimary: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  smallButtonDanger: {
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderColor: 'rgba(255,107,138,0.32)',
  },
  smallButtonText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  smallButtonPrimaryText: {
    color: theme.text,
  },
  smallButtonDangerText: {
    color: theme.danger,
  },
  emptyCard: {
    backgroundColor: 'rgba(18,21,54,0.94)',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 28,
    padding: 18,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: theme.accent,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(1,3,18,0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: theme.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  modalCardSmall: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: theme.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  closeText: {
    color: theme.accentSoft,
    fontSize: 13,
    fontWeight: '900',
  },
  inputGroup: {
    marginBottom: 13,
  },
  inputLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 13,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(76,168,255,0.2)',
    borderColor: theme.accent,
  },
  segmentText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: theme.accentSoft,
  },
});
