import { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_META, MuscleCategory } from '../../data/workouts';
import { PremiumButton } from '../../components/PremiumButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// ─── Confetti particle — each is its own component so hooks are legal ───
const CONFETTI_COLORS = [
  '#ccff00', '#FF6B35', '#4ECDC4', '#FFD93D',
  '#6C63FF', '#FF69B4', '#00CED1', '#F59E0B',
  '#22C55E', '#EF4444', '#a855f7', '#0ea5e9',
];
const DISTANCES = [90, 120, 80, 130, 100, 115, 85, 125, 95, 110, 75, 140];

function ConfettiDot({
  index,
  color,
  tx,
  ty,
}: {
  index: number;
  color: string;
  tx: number;
  ty: number;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const delay = index * 35;
    x.value = withDelay(delay, withSpring(tx, { damping: 10, stiffness: 80 }));
    y.value = withDelay(delay, withSpring(ty, { damping: 10, stiffness: 80 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 120 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ] as any,
    opacity: opacity.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.confettiDot, style]} />;
}

// ─── Animated stat card ──────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  icon,
  delay,
}: {
  value: string;
  label: string;
  icon: string;
  delay: number;
}) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }] as any,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statCard, style]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Motivational lines keyed by category ───────────────────────────────────
const MOTIVATION: Partial<Record<MuscleCategory, string>> = {
  chest:     'Your chest pressed through every rep. 🔥',
  back:      'A strong back carries everything forward. 💪',
  legs:      'Champions are built from the ground up. 🦵',
  shoulders: 'You carried the weight — now shoulder the results. 🏋️',
  arms:      'Arms of iron, will of steel. 💥',
  abs:       'Your core is the engine — and it just leveled up. 🔥',
};

// ─── Format duration ─────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function CompleteScreen() {
  const { category, totalExercises, totalSets, totalReps, durationSeconds, newPrs } =
    useLocalSearchParams<{
      category: string;
      totalExercises: string;
      totalSets: string;
      totalReps: string;
      durationSeconds: string;
      newPrs: string; // Passed as JSON string if any
    }>();
  const router = useRouter();

  const cat = (category || 'abs') as MuscleCategory;
  const meta = CATEGORY_META[cat] ?? { label: category || 'Workout', icon: '🏋️', color: '#ccff00' };
  const motivation = MOTIVATION[cat] ?? 'Every rep counts. You did the work. 🏆';
  const prs = newPrs ? JSON.parse(newPrs) : [{ name: 'Push-up', value: '25 reps' }]; // Dummy PR for demo if none passed

  // ── Trophy animation ──
  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(-15);
  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ] as any,
  }));

  // ── Title animation ──
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }] as any,
  }));

  useEffect(() => {
    trophyScale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 120 }),
      withSpring(1.0, { damping: 12, stiffness: 200 }),
    );
    trophyRotate.value = withSequence(
      withTiming(15, { duration: 180, easing: Easing.ease }),
      withSpring(0, { damping: 8, stiffness: 100 }),
    );
    titleOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    titleY.value = withDelay(250, withSpring(0, { damping: 14 }));
  }, []);

  // Build confetti particles (12 particles evenly distributed)
  const NUM_PARTICLES = 12;
  const confettiData = Array.from({ length: NUM_PARTICLES }, (_, i) => {
    const angle = (i / NUM_PARTICLES) * 2 * Math.PI;
    const dist = DISTANCES[i % DISTANCES.length];
    return {
      index: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
    };
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>

          {/* ── Trophy + confetti ── */}
          <View style={styles.trophyWrap}>
            {/* Confetti burst */}
            {confettiData.map((p) => (
              <ConfettiDot key={p.index} {...p} />
            ))}
            {/* Trophy */}
            <Animated.View style={trophyStyle}>
              <Text style={styles.trophy}>🏆</Text>
            </Animated.View>
          </View>

          {/* ── Titles ── */}
          <Animated.View style={[styles.titleWrap, titleStyle]}>
            <Text style={styles.title}>WORKOUT{'\n'}COMPLETE!</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{meta.icon}  {meta.label}</Text>
            </View>
          </Animated.View>

          {/* ── Stat cards (2 × 2 grid) ── */}
          <View style={styles.statsGrid}>
            <StatCard
              value={totalExercises ?? '0'}
              label="EXERCISES"
              icon="🎯"
              delay={350}
            />
            <StatCard
              value={totalSets ?? '0'}
              label="TOTAL SETS"
              icon="🔁"
              delay={460}
            />
            <StatCard
              value={totalReps ?? '0'}
              label="TOTAL REPS"
              icon="💪"
              delay={570}
            />
            <StatCard
              value={formatDuration(parseInt(durationSeconds ?? '0'))}
              label="DURATION"
              icon="⏱️"
              delay={680}
            />
          </View>

          {/* ── PR Section ── */}
          {prs.length > 0 && (
            <Animated.View style={[styles.prCard, titleStyle]}>
              <View style={styles.prHeader}>
                <Text style={styles.prIcon}>🔥</Text>
                <Text style={styles.prTitle}>NEW PERSONAL RECORD!</Text>
              </View>
              {prs.map((pr: any, i: number) => (
                <View key={i} style={styles.prRow}>
                  <Text style={styles.prName}>{pr.name}</Text>
                  <Text style={styles.prValue}>{pr.value}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* ── Motivation ── */}
          <Text style={styles.motivation}>{motivation}</Text>

          {/* ── CTA ── */}
          <View style={styles.btnRow}>
            <PremiumButton 
              title="BACK TO HOME"
              onPress={() => router.replace('/(tabs)')}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },

  // ── Trophy ──
  trophyWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophy: { fontSize: 72 },
  confettiDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ── Titles ──
  titleWrap: { alignItems: 'center', gap: 12 },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(204,255,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(204,255,0,0.35)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  categoryBadgeText: {
    color: '#ccff00',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // ── Stats grid ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#161921',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2430',
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: { fontSize: 22 },
  statValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // ── PR Section ──
  prCard: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 16,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  prIcon: { fontSize: 18 },
  prTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  prName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  prValue: { color: '#EF4444', fontSize: 15, fontWeight: '800' },

  // ── Motivation ──
  motivation: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    fontStyle: 'italic',
  },

  // ── Buttons ──
  btnRow: { width: '100%', gap: 12 },
});
