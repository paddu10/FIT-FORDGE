import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
  generateWeeklyPlan, getExercisesFor, CATEGORY_META,
  getBmiCategory, DayPlan, MuscleCategory, WorkoutMode, BmiCategory,
} from '../../data/workouts';
import { Flame, Moon, ChevronRight } from 'lucide-react-native';

export default function WorkoutScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>('home');
  const [bmiCat, setBmiCat] = useState<BmiCategory>('normal');
  const [previewExercises, setPreviewExercises] = useState<ReturnType<typeof getExercisesFor>>([]);
  const [totalExercises, setTotalExercises] = useState(0);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        // Determine mode from equipment
        const hasGymEquipment =
          Array.isArray(data.equipment) &&
          data.equipment.length > 0 &&
          !(data.equipment.length === 1 && data.equipment[0] === 'none');
        const mode: WorkoutMode = hasGymEquipment ? 'gym' : 'home';
        setWorkoutMode(mode);

        const bc: BmiCategory = data.bmi ? getBmiCategory(data.bmi) : 'normal';
        setBmiCat(bc);

        const plan = generateWeeklyPlan(data.goal || '', data.fitness_level || 'beginner');
        setWeekPlan(plan);

        const todayIdx = new Date().getDay();
        const today = plan[todayIdx];
        setTodayPlan(today);

        if (!today.isRestDay && today.category) {
          const exList = getExercisesFor(mode, today.category as MuscleCategory, bc);
          setPreviewExercises(exList.slice(0, 3));
          setTotalExercises(exList.length);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const startWorkout = () => {
    if (!todayPlan?.category) return;
    router.push(
      `/workout/session?category=${todayPlan.category}&mode=${workoutMode}&bmiCat=${bmiCat}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  const todayMeta = todayPlan?.category ? CATEGORY_META[todayPlan.category as MuscleCategory] : null;
  const todayIdx = new Date().getDay();
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Greeting header ── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Today's Plan</Text>
          <Text style={styles.greetingDate}>{dateStr}</Text>
        </View>

        {/* ── Today card ── */}
        {todayPlan?.isRestDay ? (
          <View style={styles.restCard}>
            <Moon size={44} color="#6C63FF" />
            <Text style={styles.restTitle}>Rest Day</Text>
            <Text style={styles.restSub}>
              Recovery is part of the process.{'\n'}Sleep well, eat well, come back stronger.
            </Text>
          </View>
        ) : (
          <View style={[styles.todayCard, { borderColor: (todayMeta?.color ?? '#ccff00') + '50' }]}>
            {/* Card header */}
            <View style={styles.todayCardHeader}>
              <Text style={styles.todayCardBigIcon}>{todayMeta?.icon}</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.todayCardLabel}>{todayPlan?.label}</Text>
                <Text style={styles.todayCardMeta}>
                  {workoutMode === 'gym' ? '🏋️ Gym' : '🏠 Home'} · {totalExercises} exercises
                </Text>
              </View>
              <Flame size={22} color="#F59E0B" />
            </View>

            {/* Exercise preview rows */}
            <View style={styles.previewList}>
              {previewExercises.map((ex, i) => (
                <View key={ex.id} style={styles.previewRow}>
                  <Text style={styles.previewNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.previewIcon}>{ex.icon}</Text>
                  <Text style={styles.previewName} numberOfLines={1}>{ex.name}</Text>
                  <Text style={styles.previewSets}>{ex.sets} × {ex.reps}</Text>
                </View>
              ))}
              {totalExercises > 3 && (
                <Text style={styles.moreText}>+ {totalExercises - 3} more exercises</Text>
              )}
            </View>

            {/* Start CTA */}
            <TouchableOpacity
              style={styles.startBtn}
              onPress={startWorkout}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>START WORKOUT 🔥</Text>
              <ChevronRight size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Weekly strip ── */}
        <Text style={styles.sectionTitle}>THIS WEEK</Text>
        <View style={styles.weekStrip}>
          {weekPlan.map((dp) => {
            const meta = dp.category ? CATEGORY_META[dp.category as MuscleCategory] : null;
            const isToday = dp.day === todayIdx;
            return (
              <View
                key={dp.day}
                style={[
                  styles.dayChip,
                  isToday && styles.dayChipToday,
                  dp.isRestDay && !isToday && styles.dayChipRest,
                ]}
              >
                <Text style={[styles.dayChipName, isToday && styles.dayChipNameToday]}>
                  {dp.dayName}
                </Text>
                <Text style={styles.dayChipIcon}>
                  {dp.isRestDay ? '😴' : (meta?.icon ?? '💪')}
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
            const meta = dp.category ? CATEGORY_META[dp.category as MuscleCategory] : null;
            const isToday = dp.day === todayIdx;
            return (
              <View key={dp.day}>
                <View style={[styles.scheduleRow, isToday && styles.scheduleRowToday]}>
                  <Text style={[styles.scheduleDayName, isToday && styles.scheduleDayToday]}>
                    {dp.dayName}
                  </Text>
                  {dp.isRestDay ? (
                    <View style={styles.scheduleRestBadge}>
                      <Text style={styles.scheduleRestText}>Rest</Text>
                    </View>
                  ) : (
                    <View style={styles.scheduleWorkoutBadge}>
                      <Text style={styles.scheduleWorkoutIcon}>{meta?.icon}</Text>
                      <Text style={styles.scheduleWorkoutLabel}>{dp.label}</Text>
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
