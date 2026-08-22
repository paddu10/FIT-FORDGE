import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

export type DayStatus = 'completed' | 'rest' | 'upcoming' | 'missed';

export type WeekData = {
  dayStr: string; // "MON", "TUE", etc.
  date: string;   // YYYY-MM-DD
  status: DayStatus;
  isToday: boolean;
};

type Props = {
  data: WeekData[];
  style?: ViewStyle;
};

export function WeeklyActivity({ data, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>THIS WEEK</Text>
      
      <View style={styles.daysContainer}>
        {data.map((day, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
              {day.dayStr}
            </Text>
            
            <View style={[
              styles.statusCircle,
              day.status === 'completed' && styles.statusCompleted,
              day.status === 'rest' && styles.statusRest,
              day.status === 'missed' && styles.statusMissed,
              day.isToday && day.status === 'upcoming' && styles.statusToday
            ]}>
              {day.status === 'completed' && <Text style={styles.statusTextMark}>✓</Text>}
              {day.status === 'rest' && <Text style={styles.statusTextRest}>R</Text>}
              {day.status === 'upcoming' && <View style={styles.upcomingDot} />}
            </View>
            
            {day.isToday && <View style={styles.todayIndicator} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.lg,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
    width: 32,
  },
  dayName: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  dayNameToday: {
    color: theme.colors.text,
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCompleted: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: 'rgba(204, 255, 0, 0.4)',
  },
  statusRest: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
  },
  statusMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusToday: {
    borderColor: theme.colors.textSecondary,
  },
  statusTextMark: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusTextRest: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  upcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    marginTop: 2,
  },
});
