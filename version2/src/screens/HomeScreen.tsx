import { ScrollView, StyleSheet, Text, View } from 'react-native';

import NextEventSummary from '../components/NextEventSummary';
import ProductCard from '../components/ProductCard';
import { formatUnits } from '../lib/formatters';
import { colors, radii, spacing, typography } from '../theme/theme';
import type { Product, ProductAnalysis, SaleGroup } from '../types';

type AnalyzedProduct = {
  product: Product;
  analysis: ProductAnalysis;
};

type HomeScreenProps = {
  isLoading: boolean;
  saleGroups: SaleGroup[];
  analyzedProducts: AnalyzedProduct[];
  totalTrackedStock: number;
  onBought: (product: Product) => void;
  onPostpone: (product: Product) => void;
  onDismiss: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDiscardCurrent: (product: Product) => void;
  onDiscardBackup: (product: Product) => void;
  onOpenNew: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function HomeScreen({
  isLoading,
  saleGroups,
  analyzedProducts,
  totalTrackedStock,
  onBought,
  onPostpone,
  onDismiss,
  onEdit,
  onDiscardCurrent,
  onDiscardBackup,
  onOpenNew,
  onDelete
}: HomeScreenProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <NextEventSummary groups={saleGroups} />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tracked products</Text>
          <Text style={styles.statValue}>{analyzedProducts.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total stock</Text>
          <Text style={styles.statValue}>{formatUnits(totalTrackedStock)}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Product cards</Text>
        <Text style={styles.sectionHint}>Cards stay minimized first. Tap a card to open actions and details.</Text>
      </View>

      {isLoading ? <Text style={styles.loadingText}>Loading local StockAhead data...</Text> : null}

      {!isLoading && analyzedProducts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Start with one product</Text>
          <Text style={styles.emptyText}>Tap the + tab below to add cleanser, toothpaste, shampoo, detergent, or any daily-use item.</Text>
        </View>
      ) : null}

      <View style={styles.cardsList}>
        {analyzedProducts.map(({ product, analysis }) => (
          <ProductCard
            key={product.id}
            product={product}
            analysis={analysis}
            onBought={() => onBought(product)}
            onPostpone={() => onPostpone(product)}
            onDismiss={() => onDismiss(product)}
            onEdit={() => onEdit(product)}
            onDiscardCurrent={() => onDiscardCurrent(product)}
            onDiscardBackup={() => onDiscardBackup(product)}
            onOpenNew={() => onOpenNew(product)}
            onDelete={() => onDelete(product)}
          />
        ))}
      </View>
    </ScrollView>
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
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  statCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xs
  },
  statLabel: {
    color: colors.veryMutedText,
    fontSize: typography.tiny,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  statValue: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900'
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
  loadingText: {
    color: colors.mutedText,
    textAlign: 'center',
    fontWeight: '800'
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
  cardsList: {
    gap: spacing.lg
  }
});
