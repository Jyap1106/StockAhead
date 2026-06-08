import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import { dateToKey, todayDate } from '../lib/dateMath';
import { formatDate } from '../lib/formatters';
import { colors, radii, spacing, typography } from '../theme/theme';
import type { CalendarMarker, CalendarMarkerType } from '../types';

type CalendarScreenProps = {
  markers: CalendarMarker[];
};

type CalendarCell = {
  key: string;
  dateKey: string | null;
  dayNumber: number | null;
  markers: CalendarMarker[];
  isToday: boolean;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const markerStyles: Record<CalendarMarkerType, { label: string; color: string }> = {
  entry: { label: 'Entry / Add product', color: colors.primary },
  bought: { label: 'Bought something', color: colors.success },
  postponed: { label: 'Postponed', color: colors.warning },
  discarded_backup: { label: 'Discarded backup', color: colors.danger }
};

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });
}

function addMonths(date: Date, monthsToAdd: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + monthsToAdd, 1);
}

function buildMonthCells(monthDate: Date, markersByDate: Map<string, CalendarMarker[]>): CalendarCell[] {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const todayKey = dateToKey(todayDate());
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({
      key: `empty-start-${index}`,
      dateKey: null,
      dayNumber: null,
      markers: [],
      isToday: false
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const dateKey = dateToKey(new Date(year, monthIndex, dayNumber));
    cells.push({
      key: dateKey,
      dateKey,
      dayNumber,
      markers: markersByDate.get(dateKey) ?? [],
      isToday: dateKey === todayKey
    });
  }

  const finalCellCount = Math.ceil(cells.length / 7) * 7;

  while (cells.length < finalCellCount) {
    cells.push({
      key: `empty-end-${cells.length}`,
      dateKey: null,
      dayNumber: null,
      markers: [],
      isToday: false
    });
  }

  return cells;
}

export default function CalendarScreen({ markers }: CalendarScreenProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => todayDate());
  const [selectedDateKey, setSelectedDateKey] = useState(dateToKey(todayDate()));

  const markersByDate = useMemo(() => {
    const nextMap = new Map<string, CalendarMarker[]>();

    for (const marker of markers) {
      const existingMarkers = nextMap.get(marker.dateKey) ?? [];
      existingMarkers.push(marker);
      nextMap.set(marker.dateKey, existingMarkers);
    }

    return nextMap;
  }, [markers]);

  const cells = useMemo(() => buildMonthCells(visibleMonth, markersByDate), [markersByDate, visibleMonth]);
  const selectedMarkers = selectedDateKey ? markersByDate.get(selectedDateKey) ?? [] : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Calendar</Text>
        <Text style={styles.title}>Stock activity calendar</Text>
        <Text style={styles.subtitle}>Outlined circles show product entries, purchases, postpones, and discarded backups.</Text>
      </View>

      <View style={styles.legendCard}>
        {Object.entries(markerStyles).map(([type, details]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: details.color }]} />
            <Text style={styles.legendText}>{details.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <AppButton label="‹" onPress={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))} variant="ghost" style={styles.monthButton} />
          <Text style={styles.monthTitle}>{monthLabel(visibleMonth)}</Text>
          <AppButton label="›" onPress={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))} variant="ghost" style={styles.monthButton} />
        </View>

        <View style={styles.weekdayRow}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekdayText}>{weekday}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell) => {
            const isSelected = Boolean(cell.dateKey && cell.dateKey === selectedDateKey);

            return (
              <Pressable
                key={cell.key}
                accessibilityRole="button"
                accessibilityLabel={cell.dateKey ? `Calendar day ${cell.dateKey}` : 'Empty calendar cell'}
                disabled={!cell.dateKey}
                onPress={() => {
                  if (cell.dateKey) {
                    setSelectedDateKey(cell.dateKey);
                  }
                }}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.dayCell,
                  cell.isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                  !cell.dateKey && styles.emptyCell,
                  pressed && cell.dateKey && styles.pressed
                ]}
              >
                {cell.dayNumber ? <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>{cell.dayNumber}</Text> : null}
                <View style={styles.markerRow}>
                  {cell.markers.slice(0, 4).map((marker) => (
                    <View key={marker.id} style={[styles.markerDot, { borderColor: markerStyles[marker.type].color }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.selectedCard}>
        <Text style={styles.selectedTitle}>{formatDate(selectedDateKey)}</Text>
        {selectedMarkers.length === 0 ? (
          <Text style={styles.selectedEmpty}>No StockAhead activity on this date.</Text>
        ) : (
          <View style={styles.selectedList}>
            {selectedMarkers.map((marker) => (
              <View key={marker.id} style={styles.selectedItem}>
                <View style={[styles.selectedDot, { borderColor: markerStyles[marker.type].color }]} />
                <View style={styles.selectedTextBlock}>
                  <Text style={styles.selectedItemLabel}>{marker.label}</Text>
                  <Text style={styles.selectedItemType}>{markerStyles[marker.type].label}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  legendCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  legendItem: {
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent'
  },
  legendText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '800'
  },
  calendarCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  monthButton: {
    width: 48,
    minWidth: 48
  },
  monthTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900',
    textAlign: 'center'
  },
  weekdayRow: {
    flexDirection: 'row'
  },
  weekdayText: {
    width: '14.2857%',
    color: colors.veryMutedText,
    fontSize: typography.tiny,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  dayCell: {
    width: '14.2857%',
    minHeight: 64,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softCard,
    padding: 5,
    justifyContent: 'space-between'
  },
  emptyCell: {
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  todayCell: {
    backgroundColor: 'rgba(76,168,255,0.12)'
  },
  selectedCell: {
    backgroundColor: 'rgba(76,168,255,0.22)'
  },
  dayNumber: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '900'
  },
  selectedDayNumber: {
    color: colors.softAccent
  },
  markerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3
  },
  markerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: 'transparent'
  },
  selectedCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  selectedTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900'
  },
  selectedEmpty: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 22
  },
  selectedList: {
    gap: spacing.sm
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.softCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  selectedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'transparent'
  },
  selectedTextBlock: {
    flex: 1,
    gap: 3
  },
  selectedItemLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900'
  },
  selectedItemType: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700'
  },
  pressed: {
    opacity: 0.75
  }
});
