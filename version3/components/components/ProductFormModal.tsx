import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FULLNESS_OPTIONS, type FullnessLabel, type ProductFormValues } from '../types';
import { colors, radii, spacing, typography } from '../theme/theme';
import AppButton from './AppButton';

type ProductFormModalProps = {
  visible: boolean;
  mode: 'add' | 'edit';
  initialValues?: ProductFormValues | null;
  categoryOptions: string[];
  onSave: (values: ProductFormValues) => void;
  onClose: () => void;
};

const emptyValues: ProductFormValues = {
  name: '',
  category: '',
  usagePeriodMonths: 3,
  fullnessLabel: 'Full',
  backupUnits: 0,
  normalPrice: 0
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

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function ChoiceChip({ label, selected, onPress }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [styles.choiceChip, selected && styles.choiceChipSelected, pressed && styles.pressed]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ProductFormModal({
  visible,
  mode,
  initialValues,
  categoryOptions,
  onSave,
  onClose
}: ProductFormModalProps) {
  const [name, setName] = useState(emptyValues.name);
  const [selectedCategory, setSelectedCategory] = useState(emptyValues.category);
  const [customCategory, setCustomCategory] = useState(emptyValues.category);
  const [isCustomCategory, setCustomCategoryMode] = useState(true);
  const [usagePeriodMonths, setUsagePeriodMonths] = useState(String(emptyValues.usagePeriodMonths));
  const [fullnessLabel, setFullnessLabelState] = useState<FullnessLabel>(emptyValues.fullnessLabel);
  const [backupUnits, setBackupUnits] = useState(String(emptyValues.backupUnits));
  const [normalPrice, setNormalPrice] = useState(String(emptyValues.normalPrice));
  const [error, setError] = useState<string | null>(null);

  const cleanedCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set(categoryOptions.map((option) => option.trim()).filter((option) => option.length > 0))
      ).sort((a, b) => a.localeCompare(b)),
    [categoryOptions]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const source = initialValues ?? emptyValues;
    const startingCategory = source.category.trim();
    const hasExistingCategory = cleanedCategoryOptions.includes(startingCategory);

    setName(source.name);
    setSelectedCategory(hasExistingCategory ? startingCategory : '');
    setCustomCategory(hasExistingCategory ? '' : startingCategory);
    setCustomCategoryMode(!hasExistingCategory);
    setUsagePeriodMonths(String(source.usagePeriodMonths));
    setFullnessLabelState(source.fullnessLabel);
    setBackupUnits(String(source.fullnessLabel === '0' ? 0 : source.backupUnits));
    setNormalPrice(String(source.normalPrice));
    setError(null);
  }, [cleanedCategoryOptions, initialValues, visible]);

  function setFullnessLabel(nextFullnessLabel: FullnessLabel) {
    setFullnessLabelState(nextFullnessLabel);

    if (nextFullnessLabel === '0') {
      setBackupUnits('0');
    }
  }

  function handleSave() {
    const parsedUsagePeriod = toNumber(usagePeriodMonths);
    const parsedBackupUnits = fullnessLabel === '0' ? 0 : Math.max(0, Math.floor(toNumber(backupUnits)));
    const parsedNormalPrice = toNumber(normalPrice);
    const finalCategory = isCustomCategory ? customCategory.trim() : selectedCategory.trim();

    if (!name.trim()) {
      setError('Enter the product name.');
      return;
    }

    if (!finalCategory) {
      setError('Choose a category or type a new category.');
      return;
    }

    if (!Number.isFinite(parsedUsagePeriod) || parsedUsagePeriod <= 0) {
      setError('Usage period must be more than 0 months.');
      return;
    }

    if (!Number.isFinite(parsedBackupUnits) || parsedBackupUnits < 0) {
      setError('Backup stock cannot be negative.');
      return;
    }

    if (!Number.isFinite(parsedNormalPrice) || parsedNormalPrice < 0) {
      setError('Price cannot be negative.');
      return;
    }

    onSave({
      name: name.trim(),
      category: finalCategory,
      usagePeriodMonths: parsedUsagePeriod,
      fullnessLabel,
      backupUnits: parsedBackupUnits,
      normalPrice: parsedNormalPrice
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.eyebrow}>{mode === 'add' ? 'Add product' : 'Edit product'}</Text>
              <Text style={styles.title}>{mode === 'add' ? 'Track a product' : 'Update product details'}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close add product" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formBody}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Field label="1) Product Name" value={name} onChangeText={setName} placeholder="Face cleanser" />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>2) Category</Text>
              <View style={styles.categoryBox}>
                {cleanedCategoryOptions.length > 0 ? (
                  <View style={styles.choiceRow}>
                    {cleanedCategoryOptions.map((category) => (
                      <ChoiceChip
                        key={category}
                        label={category}
                        selected={!isCustomCategory && selectedCategory === category}
                        onPress={() => {
                          setSelectedCategory(category);
                          setCustomCategoryMode(false);
                          setError(null);
                        }}
                      />
                    ))}
                  </View>
                ) : null}

                <ChoiceChip
                  label="Type and add to categories +"
                  selected={isCustomCategory}
                  onPress={() => {
                    setCustomCategoryMode(true);
                    setError(null);
                  }}
                />

                {isCustomCategory ? (
                  <TextInput
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="Example: Skincare"
                    placeholderTextColor={colors.veryMutedText}
                    style={styles.input}
                  />
                ) : null}
              </View>
            </View>

            <Field
              label="3) Usage Period For One Full Unit (Months)"
              value={usagePeriodMonths}
              onChangeText={setUsagePeriodMonths}
              placeholder="3"
              keyboardType="decimal-pad"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>4) Current Opened Stock Fullness</Text>
              <View style={styles.choiceRow}>
                {FULLNESS_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={fullnessLabel === option}
                    onPress={() => setFullnessLabel(option)}
                  />
                ))}
              </View>
              {fullnessLabel === '0' ? (
                <Text style={styles.helperText}>0 means no opened unit. Backup stock is cleared for this product entry.</Text>
              ) : null}
            </View>

            {fullnessLabel !== '0' ? (
              <Field
                label="Unopened Backup Stock"
                value={backupUnits}
                onChangeText={setBackupUnits}
                placeholder="0"
                keyboardType="number-pad"
              />
            ) : null}

            <Field
              label="6) Price"
              value={normalPrice}
              onChangeText={setNormalPrice}
              placeholder="42"
              keyboardType="decimal-pad"
            />
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Cancel" onPress={onClose} variant="ghost" style={styles.actionButton} />
            <AppButton label={mode === 'add' ? 'Save Product' : 'Save Changes'} onPress={handleSave} variant="primary" style={styles.actionButton} />
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
    justifyContent: 'flex-end'
  },
  card: {
    maxHeight: '92%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  headerTextBlock: {
    flex: 1,
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.softAccent,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: typography.small
  },
  title: {
    color: colors.text,
    fontWeight: '900',
    fontSize: typography.sectionTitle
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30
  },
  formBody: {
    gap: spacing.md,
    paddingBottom: spacing.md
  },
  fieldGroup: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '800'
  },
  input: {
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: typography.body
  },
  categoryBox: {
    gap: spacing.sm
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  choiceChip: {
    minHeight: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  choiceChipSelected: {
    backgroundColor: 'rgba(76,168,255,0.20)',
    borderColor: colors.primary
  },
  choiceText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '900'
  },
  choiceTextSelected: {
    color: colors.text
  },
  helperText: {
    color: colors.warning,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: '700'
  },
  error: {
    color: colors.danger,
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontWeight: '800',
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  actionButton: {
    flex: 1
  },
  pressed: {
    opacity: 0.75
  }
});
