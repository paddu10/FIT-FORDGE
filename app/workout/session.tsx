import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, SkipForward, Check, Info, PlayCircle } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import {
  getExercisesFor,
  CATEGORY_META,
  MuscleCategory,
  WorkoutMode,
  BmiCategory,
} from '../../data/workouts';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { PremiumButton } from '../../components/PremiumButton';
import { theme } from '../../constants/theme';

// ── Animated SVG circle for the rest timer ring ──
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_R = 48;
const RING_STROKE = 6;
const RING_CIRC = 2 * Math.PI * RING_R;

type SetState = {
  weight: string;
  reps: string;
  completed: boolean;
};

export default function SessionScreen() {
  const { category, mode, bmiCat } = useLocalSearchParams<{
    category: string;
    mode: string;
    bmiCat: string;
  }>();
  const router = useRouter();

  const cat = (category || 'abs') as MuscleCategory;
  const workoutMode = (mode || 'home') as WorkoutMode;
  const bmiCategory = (bmiCat || 'normal') as BmiCategory;

  const exercises = getExercisesFor(workoutMode, cat, bmiCategory);
  const meta = CATEGORY_META[cat];

  // Current exercise index
  const [exIdx, setExIdx] = useState(0);

  // Sets state for every exercise
  const [allSets, setAllSets] = useState<SetState[][]>(() =>
    exercises.map((ex) =>
      Array.from({ length: ex.sets }, () => ({
        weight: '',
        reps: ex.reps,
        completed: false,
      }))
    )
  );

  // Rest timer
  const [restActive, setRestActive] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reanimated shared value drives the SVG ring
  const ringProgress = useSharedValue(1);
  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRC * (1 - ringProgress.value),
  }));

  // Slide-in animation for exercise card transitions
  const cardOpacity = useSharedValue(1);
  const cardTranslate = useSharedValue(0);
  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslate.value }],
  }));

  // Workout start time for duration tracking
  const startTime = useRef(Date.now());

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const currentEx = exercises[exIdx];
  const currentSets = allSets[exIdx] ?? [];
  const allCurrentDone = currentSets.every((s) => s.completed);
  const isLastEx = exIdx === exercises.length - 1;

  // ── Rest timer ──────────────────────────────────
  const startRest = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestTimeLeft(seconds);
    setRestActive(true);
    ringProgress.value = 1;
    ringProgress.value = withTiming(0, {
      duration: seconds * 1000,
      easing: Easing.linear,
    });
    timerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setRestActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    ringProgress.value = withTiming(0, { duration: 200 });
    setRestActive(false);
    setRestTimeLeft(0);
  };

  // ── Set actions ─────────────────────────────────
  const toggleSet = (si: number) => {
    const updated = allSets.map((exSets, i) =>
      i !== exIdx
        ? exSets
        : exSets.map((s, j) =>
            j !== si ? s : { ...s, completed: !s.completed }
          )
    );
    setAllSets(updated);
    // Start rest only when marking complete (not un-marking)
    if (!allSets[exIdx][si].completed) {
      startRest(currentEx.restSeconds);
    } else {
      skipRest();
    }
  };

  const updateSet = (si: number, field: 'weight' | 'reps', value: string) => {
    const updated = allSets.map((exSets, i) =>
      i !== exIdx
        ? exSets
        : exSets.map((s, j) => (j !== si ? s : { ...s, [field]: value }))
    );
    setAllSets(updated);
  };

  // ── Navigation ──────────────────────────────────
  const animateTransition = (cb: () => void) => {
    cardOpacity.value = withTiming(0, { duration: 150 });
    cardTranslate.value = withTiming(-30, { duration: 150 });
    setTimeout(() => {
      cb();
      cardTranslate.value = 30;
      cardOpacity.value = withTiming(1, { duration: 220 });
      cardTranslate.value = withSpring(0, { damping: 18, stiffness: 200 });
    }, 160);
  };

  const handleNext = () => {
    skipRest();
    if (isLastEx) {
      finishWorkout();
    } else {
      animateTransition(() => setExIdx((i) => i + 1));
    }
  };

  const finishWorkout = () => {
    const durationSeconds = Math.round((Date.now() - startTime.current) / 1000);
    const totalSets = allSets.reduce(
      (acc, exSets) => acc + exSets.filter((s) => s.completed).length,
      0
    );
    const totalReps = allSets.reduce(
      (acc, exSets) =>
        acc +
        exSets
          .filter((s) => s.completed)
          .reduce((r, s) => r + (parseInt(s.reps) || 0), 0),
      0
    );
    router.replace({
      pathname: '/workout/complete',
      params: {
        category: cat,
        totalExercises: String(exercises.length),
        totalSets: String(totalSets),
        totalReps: String(totalReps),
        durationSeconds: String(durationSeconds),
      },
    });
  };

  const handleBack = () => {
    Alert.alert('End Workout?', 'Your progress for this session will be lost.', [
      { text: 'Keep Going 💪', style: 'cancel' },
      {
        text: 'End Session',
        style: 'destructive',
        onPress: () => { skipRest(); router.back(); },
      },
    ]);
  };

  // ── Empty guard ──────────────────────────────────
  if (exercises.length === 0) {
    return (
      <SafeAreaView style={[styles.container]}>
        <View style={styles.center}>
          <PlayCircle color={theme.colors.textMuted} size={48} />
          <Text style={styles.emptyText}>No exercises in this workout.</Text>
          <PremiumButton 
            title="GO BACK" 
            onPress={handleBack} 
            size="md"
            style={{marginTop: theme.spacing.md}}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />
      <SafeAreaView style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ArrowLeft color="#FFFFFF" size={22} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerPill}>
              {meta.icon}  {meta.label}  ·  {exIdx + 1} / {exercises.length}
            </Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{currentEx.name}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Exercise card ── */}
          <Animated.View style={[styles.exCard, cardAnimStyle]}>
            <ExerciseAnimation placeholderTitle={currentEx.name} />
            <Text style={styles.exDesc}>{currentEx.description}</Text>
            <View style={styles.exStats}>
              <View style={styles.exStat}>
                <Text style={styles.exStatVal}>{currentEx.sets}</Text>
                <Text style={styles.exStatLbl}>SETS</Text>
              </View>
              <View style={styles.exStatDiv} />
              <View style={styles.exStat}>
                <Text style={styles.exStatVal}>{currentEx.reps}</Text>
                <Text style={styles.exStatLbl}>REPS</Text>
              </View>
              <View style={styles.exStatDiv} />
              <View style={styles.exStat}>
                <Text style={styles.exStatVal}>{currentEx.restSeconds}s</Text>
                <Text style={styles.exStatLbl}>REST</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Rest Timer ── */}
          {restActive && (
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>REST TIMER</Text>
              <View style={styles.timerRingWrap}>
                <Svg width={120} height={120} style={styles.timerSvg}>
                  {/* Track */}
                  <Circle
                    cx={60} cy={60} r={RING_R}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={RING_STROKE}
                    fill="none"
                  />
                  {/* Animated progress ring */}
                  <AnimatedCircle
                    cx={60} cy={60} r={RING_R}
                    stroke="#ccff00"
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeDasharray={RING_CIRC}
                    animatedProps={animatedRingProps}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={60}
                    originY={60}
                  />
                </Svg>
                {/* Countdown number centered over SVG */}
                <View style={styles.timerOverlay}>
                  <Text style={styles.timerCount}>{restTimeLeft}</Text>
                  <Text style={styles.timerSec}>SEC</Text>
                </View>
              </View>
              <TouchableOpacity onPress={skipRest} style={styles.skipBtn}>
                <SkipForward size={15} color="#6B7280" />
                <Text style={styles.skipText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Set tracker ── */}
          <View style={styles.setsCard}>
            {/* Table header */}
            <View style={styles.setTableHead}>
              <Text style={[styles.setCol, styles.setColSet, styles.setHeadTxt]}>SET</Text>
              <Text style={[styles.setCol, styles.setColInput, styles.setHeadTxt]}>KG</Text>
              <Text style={[styles.setCol, styles.setColInput, styles.setHeadTxt]}>REPS</Text>
              <View style={[styles.setCol, styles.setColCheck]} />
            </View>

            {currentSets.map((set, si) => (
              <View
                key={si}
                style={[styles.setRow, set.completed && styles.setRowDone]}
              >
                {/* Set number */}
                <View style={[styles.setCol, styles.setColSet]}>
                  <Text style={[styles.setNum, set.completed && styles.setNumDone]}>
                    {si + 1}
                  </Text>
                </View>

                {/* KG input */}
                <View style={[styles.setCol, styles.setColInput]}>
                  <TextInput
                    style={[styles.setInput, set.completed && styles.setInputDone]}
                    keyboardType="numeric"
                    value={set.weight}
                    onChangeText={(v) => updateSet(si, 'weight', v)}
                    placeholder="—"
                    placeholderTextColor="#374151"
                    editable={!set.completed}
                  />
                </View>

                {/* Reps input */}
                <View style={[styles.setCol, styles.setColInput]}>
                  <TextInput
                    style={[styles.setInput, set.completed && styles.setInputDone]}
                    keyboardType="numeric"
                    value={set.reps}
                    onChangeText={(v) => updateSet(si, 'reps', v)}
                    placeholder="—"
                    placeholderTextColor="#374151"
                    editable={!set.completed}
                  />
                </View>

                {/* Check button */}
                <View style={[styles.setCol, styles.setColCheck]}>
                  <TouchableOpacity
                    style={[styles.checkBtn, set.completed && styles.checkBtnDone]}
                    onPress={() => toggleSet(si)}
                  >
                    {set.completed && <Check size={15} color="#000" strokeWidth={3} />}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* ── Exercise progress dots ── */}
          <View style={styles.progressRow}>
            {exercises.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progDot,
                  i < exIdx && styles.progDotDone,
                  i === exIdx && styles.progDotActive,
                ]}
              />
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ── Footer CTA ── */}
        <View style={styles.footer}>
          <PremiumButton
            title={isLastEx ? '🏆  FINISH WORKOUT' : 'NEXT EXERCISE  →'}
            onPress={handleNext}
            disabled={!allCurrentDone}
            variant={allCurrentDone ? 'primary' : 'secondary'}
          />
          {!allCurrentDone && (
            <Text style={styles.nextHint}>Complete all sets to continue</Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', gap: 16 },

  // ── Empty ──
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#9CA3AF', fontSize: 15, textAlign: 'center' },
  backBtnSolo: {
    backgroundColor: '#ccff00',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  backBtnSoloText: { color: '#000', fontWeight: '800', fontSize: 14 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D24',
  },
  backBtn: { marginRight: 14, padding: 2 },
  headerCenter: { flex: 1 },
  headerPill: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // ── Exercise card ──
  exCard: {
    backgroundColor: '#161921',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E2430',
    padding: 20,
    marginBottom: 14,
    gap: 12,
  },
  exIcon: { fontSize: 32 },
  exDesc: { color: '#9CA3AF', fontSize: 14, lineHeight: 21 },
  exStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1115',
    borderRadius: 12,
    padding: 14,
  },
  exStat: { flex: 1, alignItems: 'center', gap: 4 },
  exStatVal: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  exStatLbl: { color: '#4B5563', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  exStatDiv: { width: 1, height: 32, backgroundColor: '#1E2430' },

  // ── Rest Timer ──
  timerCard: {
    backgroundColor: '#161921',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(204,255,0,0.2)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  timerLabel: {
    color: '#ccff00',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  timerRingWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSvg: { position: 'absolute' },
  timerOverlay: { alignItems: 'center' },
  timerCount: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', lineHeight: 40 },
  timerSec: { color: '#6B7280', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#0F1115',
    borderRadius: 20,
  },
  skipText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },

  // ── Sets card ──
  setsCard: {
    backgroundColor: '#161921',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E2430',
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  setTableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  setHeadTxt: { color: '#4B5563', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1115',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  setRowDone: { backgroundColor: 'rgba(204,255,0,0.06)' },
  setCol: { alignItems: 'center', justifyContent: 'center' },
  setColSet: { width: 44 },
  setColInput: { flex: 1 },
  setColCheck: { width: 52 },
  setNum: { color: '#6B7280', fontSize: 14, fontWeight: '700' },
  setNumDone: { color: '#ccff00' },
  setInput: {
    backgroundColor: '#1A1D24',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    width: '80%',
  },
  setInputDone: { color: '#ccff00', backgroundColor: 'rgba(204,255,0,0.06)' },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2D3748',
    backgroundColor: '#1A1D24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: '#ccff00', borderColor: '#ccff00' },

  // ── Progress dots ──
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E2430',
  },
  progDotActive: {
    backgroundColor: '#ccff00',
    width: 20,
    borderRadius: 4,
  },
  progDotDone: { backgroundColor: '#4B5563' },

  // ── Footer ──
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1A1D24',
    backgroundColor: '#08090C',
    gap: 8,
  },
  nextBtn: {
    backgroundColor: '#ccff00',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#1E2430' },
  nextBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  nextHint: {
    color: '#4B5563',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
