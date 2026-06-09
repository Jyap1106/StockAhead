import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme/theme';
import type { AppTab } from '../types';

type TabItem = {
  key: AppTab | 'add';
  label: string;
  icon: string;
};

const tabs: TabItem[] = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'finance', label: 'Finance', icon: 'RM' },
  { key: 'add', label: 'Add', icon: '+' },
  { key: 'calendar', label: 'Calendar', icon: '□' },
  { key: 'settings', label: 'Settings', icon: '⚙' }
];

type BottomTabBarProps = {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
  onAddPress: () => void;
};

export default function BottomTabBar({ activeTab, onTabPress, onAddPress }: BottomTabBarProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isAdd = tab.key === 'add';
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={isAdd ? 'Add product' : tab.label}
              onPress={() => {
                if (isAdd) {
                  onAddPress();
                  return;
                }

                onTabPress(tab.key as AppTab);
              }}
              style={({ pressed }: { pressed: boolean }) => [
                styles.tab,
                isAdd && styles.addTab,
                isActive && !isAdd && styles.activeTab,
                pressed && styles.pressed
              ]}
            >
              <Text style={[styles.icon, isAdd && styles.addIcon, isActive && !isAdd && styles.activeText]}>{tab.icon}</Text>
              <Text style={[styles.label, isAdd && styles.addLabel, isActive && !isAdd && styles.activeText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.backgroundStart,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm
  },
  tabBar: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs
  },
  tab: {
    flex: 1,
    minHeight: 58,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  activeTab: {
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.primary
  },
  addTab: {
    flex: 1.06,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xs,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  icon: {
    color: colors.mutedText,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  label: {
    color: colors.mutedText,
    fontSize: typography.tiny,
    fontWeight: '900'
  },
  activeText: {
    color: colors.text
  },
  addIcon: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 28
  },
  addLabel: {
    color: colors.text
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }]
  }
});
