import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Flame, Moon, ChevronRight } from 'lucide-react-native';
import { getTodayWorkout, getWeekSchedule, getMissedWorkouts, DailyWorkoutWithDetails } from '../../lib/WorkoutService';
import { rescheduleMissedWorkout } from '../../lib/WorkoutEngine';

function getCategoryMeta(name: string | null | undefined) {
  const defaultMeta = { label: name || 'Custom Workout', icon: '💪', color: '#ccff00' };
  if (!name) return defaultMeta;
  
  const lower = name.toLowerCase();
  if (lower.includes('upper')) return { label: name, icon: '🏋️', color: '#4ECDC4' };
  if (lower.includes('lower')) return { label: name, icon: '🦵', color: '#DDA0DD' };
  if (lower.includes('full')) return { label: name, icon: '🔥', color: '#FF6B35' };
  if (lower.includes('chest')) return { label: name, icon: '🏋️', color: '#4ECDC4' };
  if (lower.includes('back')) return { label: name, icon: '🦅', color: '#45B7D1' };
  if (lower.includes('shoulder')) return { label: name, icon: '💪', color: '#96CEB4' };
  if (lower.includes('leg')) return { label: name, icon: '🦵', color: '#DDA0DD' };
  if (lower.includes('arm')) return { label: name, icon: '💥', color: '#FFD93D' };
  if (lower.includes('core') || lower.includes('abs')) return { label: name, icon: '🔥', color: '#FF6B35' };
  return defaultMeta;
}

function toLocalDateStr(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export default function WorkoutScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [weekPlan, setWeekPlan] = useState<DailyWorkoutWithDetails[]>([]);
  const [todayPlan, setTodayPlan] = useState<DailyWorkoutWithDetails | null>(null);
  const [missedWorkout, setMissedWorkout] = useState<DailyWorkoutWithDetails | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        if (!user) return;
        setLoading(true);

        const today = new Date();
        const todayStr = toLocalDateStr(today);
        
        // Find Monday of the current week
        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek);
        const startOfWeekStr = toLocalDateStr(monday);

        const [todayWorkout, weekWorkouts, missed] = await Promise.all([
          getTodayWorkout(user.id, todayStr),
          getWeekSchedule(user.id, startOfWeekStr),
          getMissedWorkouts(user.id, todayStr)
        ]);

        setTodayPlan(todayWorkout);
        if (missed.length > 0) {
          setMissedWorkout(missed[0]); // Grab the most recent missed workout
        } else {
          setMissedWorkout(null);
        }
        
        // Pad the week array if missing days
        const paddedWeek = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const dStr = toLocalDateStr(d);
          const existing = weekWorkouts.find(w => w.scheduled_date === dStr);
          return existing || {
            id: 'dummy-' + i,
            scheduled_date: dStr,
            status: 'pending',
            is_rest_day: true,
            actual_duration_minutes: null,
            workouts: null,
            daily_workout_exercises: []
          };
        });
        
        setWeekPlan(paddedWeek as DailyWorkoutWithDetails[]);
        setLoading(false);
      }
      load();
    }, [user])
  );

  const startWorkout = () => {
    // Navigate to session with the daily_workout ID instead of generic category
    if (!todayPlan) return;
    router.push(`/workout/session?workoutId=${todayPlan.id}`);
  };

  const handleReschedule = async () => {
    if (!user || !missedWorkout) return;
    setRescheduling(true);
    const todayStr = toLocalDateStr(new Date());
    await rescheduleMissedWorkout(user.id, missedWorkout.id, todayStr);
    
    // Reload data
    const [todayWorkout, weekWorkouts, missed] = await Promise.all([
      getTodayWorkout(user.id, todayStr),
      // Need start of week
      getWeekSchedule(user.id, toLocalDateStr(new Date(new Date().setDate(new Date().getDate() - (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1))))),
      getMissedWorkouts(user.id, todayStr)
    ]);
    
    setTodayPlan(todayWorkout);
    setMissedWorkout(missed.length > 0 ? missed[0] : null);
    
    // Repopulate weekPlan loosely
    const monday = new Date();
    monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
    const paddedWeek = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = toLocalDateStr(d);
      const existing = weekWorkouts.find(w => w.scheduled_date === dStr);
      return existing || {
        id: 'dummy-' + i,
        scheduled_date: dStr,
        status: 'pending',
        is_rest_day: true,
        actual_duration_minutes: null,
        workouts: null,
        daily_workout_exercises: []
      };
    });
    setWeekPlan(paddedWeek as DailyWorkoutWithDetails[]);
    setRescheduling(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  const todayMeta = getCategoryMeta(todayPlan?.workouts?.name);
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
  
  const todayLocalStr = toLocalDateStr(new Date());
  const previewExercises = todayPlan?.daily_workout_exercises.slice(0, 3) || [];
  const totalExercises = todayPlan?.daily_workout_exercises.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Missed Workout Alert ── */}
        {missedWorkout && (
          <View style={styles.missedCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.missedTitle}>Missed Workout</Text>
              <Text style={styles.missedSub}>You missed {missedWorkout.workouts?.name || 'a workout'} on {missedWorkout.scheduled_date}.</Text>
            </View>
            <TouchableOpacity style={styles.rescheduleBtn} onPress={handleReschedule} disabled={rescheduling}>
              {rescheduling ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.rescheduleBtnText}>Reschedule</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Greeting header ── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Today's Plan</Text>
          <Text style={styles.greetingDate}>{todayDateStr}</Text>
        </View>

        {/* ── Today card ── */}
        {(!todayPlan || todayPlan.is_rest_day) ? (
          <View style={styles.restCard}>
            <Moon size={44} color="#6C63FF" />
            <Text style={styles.restTitle}>Rest Day</Text>
            <Text style={styles.restSub}>
              Recovery is part of the process.{'\n'}Sleep well, eat well, come back stronger.
            </Text>
          </View>
        ) : (
          <View style={[styles.todayCard, { borderColor: todayMeta.color + '50' }]}>
            {/* Card header */}
            <View style={styles.todayCardHeader}>
              <Text style={styles.todayCardBigIcon}>{todayMeta.icon}</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.todayCardLabel}>{todayMeta.label}</Text>
                <Text style={styles.todayCardMeta}>
                  {todayPlan.workouts?.duration_minutes || 45} mins · {totalExercises} exercises
                </Text>
              </View>
              <Flame size={22} color="#F59E0B" />
            </View>

            {/* Exercise preview rows */}
            <View style={styles.previewList}>
              {previewExercises.map((dwe, i) => (
                <View key={dwe.id} style={styles.previewRow}>
                  <Text style={styles.previewNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.previewIcon}>{'💪'}</Text>
                  <Text style={styles.previewName} numberOfLines={1}>{dwe.exercises?.name || 'Exercise'}</Text>
                  <Text style={styles.previewSets}>{dwe.sets} × {dwe.reps || dwe.rest_duration_seconds + 's'}</Text>
                </View>
              ))}
              {totalExercises > 3 && (
                <Text style={styles.moreText}>+ {totalExercises - 3} more exercises</Text>
              )}
            </View>

            {/* Start CTA */}
            {todayPlan.status === 'completed' ? (
              <View style={[styles.startBtn, { backgroundColor: '#374151' }]}>
                <Text style={[styles.startBtnText, { color: '#9CA3AF' }]}>WORKOUT COMPLETED</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={startWorkout}
                activeOpacity={0.85}
              >
                <Text style={styles.startBtnText}>START WORKOUT 🔥</Text>
                <ChevronRight size={20} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Weekly strip ── */}
        <Text style={styles.sectionTitle}>THIS WEEK</Text>
        <View style={styles.weekStrip}>
          {weekPlan.map((dp, idx) => {
            const meta = getCategoryMeta(dp.workouts?.name);
            const isToday = dp.scheduled_date === todayLocalStr;
            const dayName = new Date(dp.scheduled_date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            
            return (
              <View
                key={dp.scheduled_date + idx}
                style={[
                  styles.dayChip,
                  isToday && styles.dayChipToday,
                  dp.is_rest_day && !isToday && styles.dayChipRest,
                ]}
              >
                <Text style={[styles.dayChipName, isToday && styles.dayChipNameToday]}>
                  {dayName}
                </Text>
                <Text style={styles.dayChipIcon}>
                  {dp.is_rest_day ? '😴' : meta.icon}
                </Text>
                {isToday && <View style={styles.todayDot} />}
              </View>
            );
          })}
        </View>

        {/* ── Week plan detail ── */}
        <Text style={styles.sectionTitle}>SCHEDULE</Text>
        <View style={styles.scheduleCard}>
          {weekPlan.map((dp, i) => {
            const meta = getCategoryMeta(dp.workouts?.name);
            const isToday = dp.scheduled_date === todayLocalStr;
            const dayName = new Date(dp.scheduled_date).toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <View key={dp.scheduled_date + i}>
                <View style={[styles.scheduleRow, isToday && styles.scheduleRowToday]}>
                  <Text style={[styles.scheduleDayName, isToday && styles.scheduleDayToday]}>
                    {dayName}
                  </Text>
                  {dp.is_rest_day ? (
                    <View style={styles.scheduleRestBadge}>
                      <Text style={styles.scheduleRestText}>Rest</Text>
                    </View>
                  ) : (
                    <View style={styles.scheduleWorkoutBadge}>
                      <Text style={styles.scheduleWorkoutIcon}>{meta.icon}</Text>
                      <Text style={styles.scheduleWorkoutLabel}>{meta.label}</Text>
                    </View>
                  )}
                  {isToday && <Text style={styles.todayTag}>TODAY</Text>}
                </View>
                {i < weekPlan.length - 1 && <View style={styles.scheduleDivider} />}
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 48 },

  greeting: { marginBottom: 24, marginTop: 4 },
  greetingTitle: { fontSize: 30, fontWeight: '900', color: '#FFFFFF' },
  greetingDate: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  // Missed workout
  missedCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  missedTitle: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
  missedSub: { color: '#FCA5A5', fontSize: 13, marginTop: 4 },
  rescheduleBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  rescheduleBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  // Rest card
  restCard: {
    backgroundColor: '#161921',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6C63FF40',
    padding: 32,
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  restTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  restSub: {
    fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22,
  },

  // Today card
  todayCard: {
    backgroundColor: '#161921',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
    gap: 16,
  },
  todayCardHeader: { flexDirection: 'row', alignItems: 'center' },
  todayCardBigIcon: { fontSize: 36 },
  todayCardLabel: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  todayCardMeta: { fontSize: 13, color: '#6B7280', marginTop: 3 },

  previewList: { gap: 10 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1115',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  previewNum: { color: '#4B5563', fontSize: 11, fontWeight: '900', width: 22 },
  previewIcon: { fontSize: 18 },
  previewName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  previewSets: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  moreText: { color: '#6B7280', fontSize: 13, textAlign: 'center', marginTop: 4 },

  startBtn: {
    backgroundColor: '#ccff00',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startBtnText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },

  // Section title
  sectionTitle: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 2,
  },

  // Weekly strip
  weekStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#161921',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E2430',
    gap: 4,
  },
  dayChipToday: {
    backgroundColor: 'rgba(204,255,0,0.08)',
    borderColor: '#ccff00',
  },
  dayChipRest: { opacity: 0.5 },
  dayChipName: { color: '#6B7280', fontSize: 10, fontWeight: '700' },
  dayChipNameToday: { color: '#ccff00' },
  dayChipIcon: { fontSize: 16 },
  todayDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#ccff00', marginTop: 2,
  },

  // Schedule card
  scheduleCard: {
    backgroundColor: '#161921',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2430',
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  scheduleRowToday: { backgroundColor: 'rgba(204,255,0,0.04)' },
  scheduleDayName: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', width: 36 },
  scheduleDayToday: { color: '#ccff00', fontWeight: '800' },
  scheduleRestBadge: {
    backgroundColor: '#1A1D24',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scheduleRestText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
  scheduleWorkoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  scheduleWorkoutIcon: { fontSize: 16 },
  scheduleWorkoutLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  todayTag: {
    color: '#ccff00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 'auto',
  },
  scheduleDivider: { height: 1, backgroundColor: '#1E2430', marginHorizontal: 18 },
});
