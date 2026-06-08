import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
};

export default function AppButton({ label, onPress, variant = 'secondary', disabled, style, icon }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      {icon}
      <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    borderWidth: 1
  },
  label: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '700'
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.lightCard,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border
  },
  danger: {
    backgroundColor: 'rgba(255,107,138,0.18)',
    borderColor: colors.danger
  },
  warning: {
    backgroundColor: 'rgba(255,184,92,0.18)',
    borderColor: colors.warning
  },
  success: {
    backgroundColor: 'rgba(101,230,163,0.18)',
    borderColor: colors.success
  },
  ghostLabel: {
    color: colors.softAccent
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }]
  }
});
