import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Clock, Repeat } from 'lucide-react-native';
import { getExercisesFor, CATEGORY_META, MuscleCategory, WorkoutMode, BmiCategory, Difficulty } from '../../data/workouts';

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; label: string }> = {
  beginner:     { bg: '#064E3B', text: '#34D399', label: 'Beginner' },
  intermediate: { bg: '#78350F', text: '#FCD34D', label: 'Intermediate' },
  advanced:     { bg: '#7F1D1D', text: '#FCA5A5', label: 'Advanced' },
};

export default function ExerciseCategoryScreen() {
  const { category, mode, bmiCat } = useLocalSearchParams<{
    category: string;
    mode: string;
    bmiCat: string;
  }>();
  const router = useRouter();

  const cat = (category || 'abs') as MuscleCategory;
  const workoutMode = (mode || 'home') as WorkoutMode;
  const bmiCategory = (bmiCat || 'normal') as BmiCategory;

  const meta = CATEGORY_META[cat];
  const exercises = getExercisesFor(workoutMode, cat, bmiCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{meta.icon}</Text>
          <View>
            <Text style={styles.headerTitle}>{meta.label}</Text>
            <Text style={styles.headerSub}>
              {workoutMode === 'home' ? '🏠 Home' : '🏋️ Gym'} · {exercises.length} exercises
            </Text>
          </View>
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {exercises.map((exercise, index) => {
          const diff = DIFFICULTY_COLORS[exercise.difficulty];
          return (
            <View key={exercise.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.exerciseNum}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                  <Text style={[styles.diffText, { color: diff.text }]}>{diff.label}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDesc}>{exercise.description}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Repeat color="#9CA3AF" size={14} />
                  <Text style={styles.statText}>{exercise.sets} × {exercise.reps}</Text>
                </View>
                <View style={styles.stat}>
                  <Clock color="#9CA3AF" size={14} />
                  <Text style={styles.statText}>{exercise.restSeconds}s rest</Text>
                </View>
              </View>
            </View>
          );
        })}

        {exercises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤷</Text>
            <Text style={styles.emptyText}>No exercises found for your profile.</Text>
            <Text style={styles.emptySub}>Try switching between Home and Gym modes.</Text>
          </View>
        )}
      </ScrollView>

      {/* Start Workout Button */}
      {exercises.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startBtn}
            activeOpacity={0.8}
            onPress={() => router.push(`/workout/session?category=${cat}&mode=${workoutMode}&bmiCat=${bmiCategory}`)}
          >
            <Text style={styles.startBtnText}>START WORKOUT 🔥</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D24',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // List
  list: {
    padding: 20,
    paddingBottom: 100,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2430',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNum: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '900',
    letterSpacing: 2,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  exerciseIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E2430',
    paddingTop: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#08090C',
    borderTopWidth: 1,
    borderTopColor: '#1A1D24',
  },
  startBtn: {
    backgroundColor: '#ccff00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
