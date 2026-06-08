import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatDate } from '../lib/formatters';
import { colors, radii, spacing, typography } from '../theme/theme';
import type { SaleGroup } from '../types';

type NextEventSummaryProps = {
  groups: SaleGroup[];
};

export default function NextEventSummary({ groups }: NextEventSummaryProps) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const firstGroupKey = groups[0]?.key ?? null;

  useEffect(() => {
    if (!firstGroupKey) {
      setExpandedKeys([]);
      return;
    }

    setExpandedKeys((currentKeys) => (currentKeys.includes(firstGroupKey) ? currentKeys : [firstGroupKey, ...currentKeys]));
  }, [firstGroupKey]);

  function toggleGroup(key: string) {
    setExpandedKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys.filter((currentKey) => currentKey !== key) : [...currentKeys, key]
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>Next event summary</Text>
        <Text style={styles.title}>Only sale dates with products appear here.</Text>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No purchase events yet</Text>
          <Text style={styles.emptyText}>Add a product and StockAhead will show the next sale date that needs action.</Text>
        </View>
      ) : null}

      <View style={styles.groupList}>
        {groups.map((group, index) => {
          const isExpanded = expandedKeys.includes(group.key);
          const dateText = group.date ? formatDate(group.date) : 'Needs action now';
          const productCount = group.products.length;

          return (
            <View key={group.key} style={[styles.groupCard, index === 0 && styles.firstGroupCard]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${group.label} event summary`}
                onPress={() => toggleGroup(group.key)}
                style={({ pressed }: { pressed: boolean }) => [styles.groupHeader, pressed && styles.pressed]}
              >
                <View style={styles.groupLeft}>
                  <Text style={styles.groupLabel}>{index === 0 ? 'Next to prepare' : 'Upcoming'}</Text>
                  <Text style={styles.groupTitle}>{group.label}</Text>
                  <Text style={styles.groupDate}>{dateText}</Text>
                </View>
                <View style={styles.groupRight}>
                  <Text style={styles.groupBudget}>{formatCurrency(group.totalSpend)}</Text>
                  <Text style={styles.groupCount}>
                    {productCount} item{productCount === 1 ? '' : 's'}
                  </Text>
                  <Text style={styles.chevron}>{isExpanded ? '−' : '+'}</Text>
                </View>
              </Pressable>

              {isExpanded ? (
                <View style={styles.itemsList}>
                  {group.products.map(({ product, analysis }) => (
                    <View key={product.id} style={styles.itemRow}>
                      <View style={styles.itemTextBlock}>
                        <Text style={styles.itemName}>{product.name}</Text>
                        <Text style={styles.itemMeta}>Run-out: {formatDate(analysis.runOutDate)}</Text>
                      </View>
                      <Text style={styles.itemPrice}>{formatCurrency(analysis.estimatedSpend)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md
  },
  headingBlock: {
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.softAccent,
    fontSize: typography.small,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    lineHeight: 28
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 22
  },
  groupList: {
    gap: spacing.md
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  firstGroupCard: {
    borderColor: colors.primary
  },
  groupHeader: {
    minHeight: 112,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  groupLeft: {
    flex: 1,
    gap: spacing.xs
  },
  groupRight: {
    alignItems: 'flex-end',
    gap: spacing.xs
  },
  groupLabel: {
    color: colors.veryMutedText,
    fontSize: typography.tiny,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  groupTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900'
  },
  groupDate: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '800'
  },
  groupBudget: {
    color: colors.success,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  groupCount: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '800'
  },
  chevron: {
    color: colors.softAccent,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm
  },
  itemRow: {
    backgroundColor: colors.softCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  itemTextBlock: {
    flex: 1,
    gap: 3
  },
  itemName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900'
  },
  itemMeta: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  itemPrice: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: '900'
  },
  pressed: {
    opacity: 0.75
  }
});
