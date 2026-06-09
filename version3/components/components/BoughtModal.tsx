import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Product } from '../types';
import { colors, radii, spacing, typography } from '../theme/theme';
import AppButton from './AppButton';

type BoughtModalProps = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (quantity: number, unitPrice: number) => void;
};

function toNumber(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export default function BoughtModal({ visible, product, onClose, onConfirm }: BoughtModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !product) {
      return;
    }

    setQuantity(String(product.defaultPurchaseQuantity));
    setUnitPrice(String(product.estimatedSalePrice > 0 ? product.estimatedSalePrice : product.normalPrice));
    setError(null);
  }, [product, visible]);

  function handleConfirm() {
    const parsedQuantity = toNumber(quantity);
    const parsedPrice = toNumber(unitPrice);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('Enter how many units you bought.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Actual price cannot be negative.');
      return;
    }

    onConfirm(parsedQuantity, parsedPrice);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Bought</Text>
          <Text style={styles.title}>{product ? product.name : 'Product'}</Text>
          <Text style={styles.description}>Update your stock and store the actual price paid.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>How many units did you buy?</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="1"
              placeholderTextColor={colors.veryMutedText}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Actual price paid per unit</Text>
            <TextInput
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="decimal-pad"
              placeholder="42"
              placeholderTextColor={colors.veryMutedText}
              style={styles.input}
            />
          </View>

          <View style={styles.actions}>
            <AppButton label="Cancel" onPress={onClose} variant="ghost" style={styles.actionButton} />
            <AppButton label="Confirm Bought" onPress={handleConfirm} variant="success" style={styles.actionButton} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  eyebrow: {
    color: colors.success,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: typography.small
  },
  title: {
    color: colors.text,
    fontWeight: '900',
    fontSize: typography.sectionTitle
  },
  description: {
    color: colors.mutedText,
    lineHeight: 22
  },
  fieldGroup: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  input: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: typography.body
  },
  error: {
    color: colors.danger,
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  actionButton: {
    flex: 1
  }
});
