import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme/theme';
import type { AppSettings } from '../types';

type SettingsScreenProps = {
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
};

export default function SettingsScreen({ settings, onChangeSettings }: SettingsScreenProps) {
  function updateAllowMultipleMonthView(value: boolean) {
    onChangeSettings({
      ...settings,
      allowMultipleMonthView: value
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>App preferences</Text>
        <Text style={styles.subtitle}>V3 starts with view controls. Profile, backup, export, and reset tools can be added later.</Text>
      </View>

      <View style={styles.tabRow}>
        <View style={styles.activeTab}>
          <Text style={styles.activeTabText}>View</Text>
        </View>
        <View style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Profile later</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.settingTextBlock}>
          <Text style={styles.settingTitle}>Allow more than 1 month view</Text>
          <Text style={styles.settingDescription}>
            When off, opening one sale month will automatically minimize the other sale months on Home. This is the default clean view.
          </Text>
        </View>
        <Switch
          value={settings.allowMultipleMonthView}
          onValueChange={updateAllowMultipleMonthView}
          trackColor={{ false: colors.lightCard, true: colors.primary }}
          thumbColor={colors.text}
        />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Current behavior</Text>
        <Text style={styles.noteText}>
          {settings.allowMultipleMonthView
            ? 'Multiple sale months can stay open at the same time.'
            : 'Only one sale month can stay open at a time.'}
        </Text>
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
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
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
    fontWeight: '900'
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 23
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs
  },
  activeTab: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center'
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: colors.softCard,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center'
  },
  activeTabText: {
    color: colors.backgroundStart,
    fontSize: typography.small,
    fontWeight: '900'
  },
  inactiveTabText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '900'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  settingTextBlock: {
    flex: 1,
    gap: spacing.xs
  },
  settingTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  settingDescription: {
    color: colors.mutedText,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: '700'
  },
  noteCard: {
    backgroundColor: colors.softCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs
  },
  noteTitle: {
    color: colors.softAccent,
    fontSize: typography.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  noteText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    lineHeight: 22
  }
});
