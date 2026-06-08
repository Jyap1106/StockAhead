import { StyleSheet, Text, View } from 'react-native';

import type { Product, ProductAnalysis, ProductStatus } from '../types';
import { colors, radii, spacing, typography } from '../theme/theme';
import { formatCoverageMonths, formatCurrency, formatDate, formatOpenedFraction, formatUnits } from '../lib/formatters';
import AppButton from './AppButton';

type ProductCardProps = {
  product: Product;
  analysis: ProductAnalysis;
  onBought: () => void;
  onPostpone: () => void;
  onDismiss: () => void;
  onEdit: () => void;
  onDiscardCurrent: () => void;
  onDiscardBackup: () => void;
  onOpenNew: () => void;
  onDelete: () => void;
};

function statusColor(status: ProductStatus): string {
  switch (status) {
    case 'urgent':
    case 'overdue':
      return colors.danger;
    case 'risky':
      return colors.warning;
    case 'dismissed':
      return colors.veryMutedText;
    case 'safe':
      return colors.success;
    case 'scheduled':
    default:
      return colors.primary;
  }
}

function statusLabel(status: ProductStatus): string {
  switch (status) {
    case 'urgent':
      return 'Urgent';
    case 'overdue':
      return 'Overdue';
    case 'risky':
      return 'Risky';
    case 'dismissed':
      return 'Dismissed';
    case 'safe':
      return 'Safe';
    case 'scheduled':
    default:
      return 'Scheduled';
  }
}

type DetailProps = {
  label: string;
  value: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ProductCard({
  product,
  analysis,
  onBought,
  onPostpone,
  onDismiss,
  onEdit,
  onDiscardCurrent,
  onDiscardBackup,
  onOpenNew,
  onDelete
}: ProductCardProps) {
  const accentColor = statusColor(analysis.status);
  const recommendation =
    analysis.status === 'urgent' || analysis.status === 'overdue' || analysis.saleLabel === 'Buy Now'
      ? 'Buy Now'
      : `Buy on ${analysis.saleLabel}`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.productName}>{product.name}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: accentColor, backgroundColor: `${accentColor}22` }]}>
          <Text style={[styles.statusText, { color: accentColor }]}>{statusLabel(analysis.status)}</Text>
        </View>
      </View>

      <View style={styles.recommendationBox}>
        <Text style={styles.recommendationLabel}>Buy recommendation</Text>
        <Text style={[styles.recommendationText, { color: accentColor }]}>{recommendation}</Text>
      </View>

      <View style={styles.detailsGrid}>
        <Detail label="Coverage" value={formatCoverageMonths(analysis.coverageMonths)} />
        <Detail label="Total stock" value={formatUnits(analysis.totalStockUnits)} />
        <Detail label="Opened" value={formatOpenedFraction(analysis.openedFraction)} />
        <Detail label="Backups" value={`${analysis.unopenedUnitsEstimate}`} />
        <Detail label="Run-out date" value={formatDate(analysis.runOutDate)} />
        <Detail label="Safe deadline" value={formatDate(analysis.safePurchaseDeadline)} />
        <Detail label="Normal price" value={formatCurrency(product.normalPrice)} />
        <Detail label="Sale spend" value={formatCurrency(analysis.estimatedSpend)} />
      </View>

      <View style={styles.priceStrip}>
        <Text style={styles.priceStripText}>Estimated sale price: {formatCurrency(product.estimatedSalePrice)}</Text>
        <Text style={styles.priceStripText}>Planned qty: {product.defaultPurchaseQuantity}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="Bought" onPress={onBought} variant="success" style={styles.actionButton} />
        <AppButton label="Postpone" onPress={onPostpone} variant="warning" style={styles.actionButton} />
        <AppButton label="Dismiss" onPress={onDismiss} variant="ghost" style={styles.actionButton} />
        <AppButton label="Edit" onPress={onEdit} variant="secondary" style={styles.actionButton} />
        <AppButton label="Discard current" onPress={onDiscardCurrent} variant="danger" style={styles.actionButtonWide} />
        <AppButton label="Discard backup" onPress={onDiscardBackup} variant="danger" style={styles.actionButtonWide} />
        <AppButton label="Open new" onPress={onOpenNew} variant="secondary" style={styles.actionButton} />
        <AppButton label="Delete" onPress={onDelete} variant="danger" style={styles.actionButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start'
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs
  },
  category: {
    color: colors.softAccent,
    fontSize: typography.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  productName: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm
  },
  statusText: {
    fontSize: typography.tiny,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  recommendationBox: {
    backgroundColor: colors.softCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  recommendationLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  recommendationText: {
    fontSize: typography.sectionTitle,
    fontWeight: '900'
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  detailItem: {
    width: '48%',
    minWidth: 140,
    backgroundColor: colors.softCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  detailLabel: {
    color: colors.veryMutedText,
    fontSize: typography.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  detailValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800'
  },
  priceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md
  },
  priceStripText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 112
  },
  actionButtonWide: {
    flexGrow: 1,
    minWidth: 160
  }
});
