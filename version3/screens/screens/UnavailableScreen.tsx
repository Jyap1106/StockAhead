import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme/theme';

type UnavailableScreenProps = {
  title: string;
  subtitle: string;
  icon: string;
};

export default function UnavailableScreen({ title, subtitle, icon }: UnavailableScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Unavailable in MVP V3</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md
  },
  icon: {
    color: colors.softAccent,
    fontSize: 42,
    fontWeight: '900'
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    textAlign: 'center'
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center'
  },
  badge: {
    backgroundColor: colors.softCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  badgeText: {
    color: colors.warning,
    fontSize: typography.small,
    fontWeight: '900'
  }
});
