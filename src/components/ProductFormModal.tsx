import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FULLNESS_OPTIONS, type FullnessLabel, type ProductFormValues } from '../types';
import { colors, radii, spacing, typography } from '../theme/theme';
import AppButton from './AppButton';

type ProductFormModalProps = {
  visible: boolean;
  mode: 'add' | 'edit';
  initialValues?: ProductFormValues | null;
  onSave: (values: ProductFormValues) => void;
  onClose: () => void;
};

const emptyValues: ProductFormValues = {
  name: '',
  category: 'Essentials',
  usagePeriodMonths: 3,
  fullnessLabel: 'Full',
  backupUnits: 0,
  normalPrice: 0,
  estimatedSalePrice: 0,
  defaultPurchaseQuantity: 1
};

function toNumber(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
};

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.veryMutedText}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export default function ProductFormModal({ visible, mode, initialValues, onSave, onClose }: ProductFormModalProps) {
  const [name, setName] = useState(emptyValues.name);
  const [category, setCategory] = useState(emptyValues.category);
  const [usagePeriodMonths, setUsagePeriodMonths] = useState(String(emptyValues.usagePeriodMonths));
  const [fullnessLabel, setFullnessLabel] = useState<FullnessLabel>(emptyValues.fullnessLabel);
  const [backupUnits, setBackupUnits] = useState(String(emptyValues.backupUnits));
  const [normalPrice, setNormalPrice] = useState(String(emptyValues.normalPrice));
  const [estimatedSalePrice, setEstimatedSalePrice] = useState(String(emptyValues.estimatedSalePrice));
  const [defaultPurchaseQuantity, setDefaultPurchaseQuantity] = useState(String(emptyValues.defaultPurchaseQuantity));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const source = initialValues ?? emptyValues;
    setName(source.name);
    setCategory(source.category);
    setUsagePeriodMonths(String(source.usagePeriodMonths));
    setFullnessLabel(source.fullnessLabel);
    setBackupUnits(String(source.backupUnits));
    setNormalPrice(String(source.normalPrice));
    setEstimatedSalePrice(String(source.estimatedSalePrice));
    setDefaultPurchaseQuantity(String(source.defaultPurchaseQuantity));
    setError(null);
  }, [initialValues, visible]);

  function handleSubmit() {
    const usage = toNumber(usagePeriodMonths);
    const backups = toNumber(backupUnits);
    const normal = toNumber(normalPrice);
    const sale = toNumber(estimatedSalePrice);
    const quantity = toNumber(defaultPurchaseQuantity);

    if (!name.trim()) {
      setError('Enter a product name.');
      return;
    }

    if (!Number.isFinite(usage) || usage <= 0) {
      setError('Usage period must be more than 0 months.');
      return;
    }

    if (!Number.isFinite(backups) || backups < 0) {
      setError('Backup stock cannot be negative.');
      return;
    }

    if (!Number.isFinite(normal) || normal < 0 || !Number.isFinite(sale) || sale < 0) {
      setError('Prices cannot be negative.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Default purchase quantity must be more than 0.');
      return;
    }

    onSave({
      name: name.trim(),
      category: category.trim() || 'Essentials',
      usagePeriodMonths: usage,
      fullnessLabel,
      backupUnits: Math.floor(backups),
      normalPrice: normal,
      estimatedSalePrice: sale,
      defaultPurchaseQuantity: quantity
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{mode === 'add' ? 'New product' : 'Edit product'}</Text>
              <Text style={styles.title}>{mode === 'add' ? 'Add Product' : 'Update Product'}</Text>
            </View>
            <AppButton label="Close" onPress={onClose} variant="ghost" />
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Field label="Product name" value={name} onChangeText={setName} placeholder="Face cleanser" />
            <Field label="Category or folder" value={category} onChangeText={setCategory} placeholder="Skincare" />
            <Field
              label="Usage period for one full unit, in months"
              value={usagePeriodMonths}
              onChangeText={setUsagePeriodMonths}
              keyboardType="decimal-pad"
              placeholder="3"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Current opened stock fullness</Text>
              <View style={styles.fullnessRow}>
                {FULLNESS_OPTIONS.map((option) => (
                  <AppButton
                    key={option}
                    label={option}
                    onPress={() => setFullnessLabel(option)}
                    variant={fullnessLabel === option ? 'primary' : 'secondary'}
                    style={styles.fullnessButton}
                  />
                ))}
              </View>
            </View>

            <Field
              label="Unopened backup stock"
              value={backupUnits}
              onChangeText={setBackupUnits}
              keyboardType="number-pad"
              placeholder="0"
            />
            <Field
              label="Normal price"
              value={normalPrice}
              onChangeText={setNormalPrice}
              keyboardType="decimal-pad"
              placeholder="60"
            />
            <Field
              label="Estimated sale price"
              value={estimatedSalePrice}
              onChangeText={setEstimatedSalePrice}
              keyboardType="decimal-pad"
              placeholder="42"
            />
            <Field
              label="Default planned purchase quantity"
              value={defaultPurchaseQuantity}
              onChangeText={setDefaultPurchaseQuantity}
              keyboardType="decimal-pad"
              placeholder="1"
            />

            <View style={styles.footer}>
              <AppButton label="Cancel" onPress={onClose} variant="ghost" style={styles.footerButton} />
              <AppButton label={mode === 'add' ? 'Save Product' : 'Save Changes'} onPress={handleSubmit} variant="primary" style={styles.footerButton} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end'
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md
  },
  eyebrow: {
    color: colors.softAccent,
    fontSize: typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginTop: spacing.xs
  },
  form: {
    paddingBottom: spacing.xxl,
    gap: spacing.md
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
  fullnessRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  fullnessButton: {
    minWidth: 76
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
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  footerButton: {
    flex: 1
  }
});
