import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Plus, Check, MoreVertical, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { generateDailyWorkout } from '../../lib/WorkoutEngine';
import { useRouter } from 'expo-router';

type SetData = {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
};

type Exercise = {
  id: string; // daily_workout_exercise.id
  name: string;
  sets: SetData[];
};

export default function WorkoutScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [dailyWorkoutId, setDailyWorkoutId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  useEffect(() => {
    async function loadWorkout() {
      if (!user) return;
      setLoading(true);

      try {
        const workout = await generateDailyWorkout(user.id);
        
        if (!workout) {
          // It's a rest day
          setExercises([]);
          setLoading(false);
          return;
        }

        setDailyWorkoutId(workout.id);
        
        if (workout.status === 'completed') {
          setWorkoutComplete(true);
          setLoading(false);
          return;
        }

        // Fetch exercises for this workout
        const { data: exData, error } = await supabase
          .from('daily_workout_exercises')
          .select(`
            id,
            sets,
            reps,
            exercises (
              name
            )
          `)
          .eq('daily_workout_id', workout.id)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (exData) {
          const mapped: Exercise[] = exData.map(e => {
            const numSets = e.sets || 3;
            const setsArr: SetData[] = Array.from({ length: numSets }).map((_, i) => ({
              id: `${e.id}-set-${i}`,
              weight: '',
              reps: e.reps?.toString() || '10',
              completed: false
            }));

            return {
              id: e.id,
              name: (e.exercises as any)?.name || 'Unknown Exercise',
              sets: setsArr
            };
          });
          setExercises(mapped);
        }

      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load workout');
      }

      setLoading(false);
    }

    loadWorkout();
  }, [user]);

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
        };
      }
      return ex;
    }));
  };

  const handleFinishWorkout = async () => {
    if (!dailyWorkoutId || !user) return;
    setFinishing(true);

    try {
      // Mark daily workout as completed
      await supabase
        .from('daily_workouts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', dailyWorkoutId);

      // Save sets completed
      for (const ex of exercises) {
        const completedSetsCount = ex.sets.filter(s => s.completed).length;
        await supabase
          .from('daily_workout_exercises')
          .update({
            completed_sets: completedSetsCount
          })
          .eq('id', ex.id);
      }

      // Also mark today's task as complete if it exists
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_tasks')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('type', 'workout');

      setWorkoutComplete(true);
      
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    
    setFinishing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  if (workoutComplete) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <CheckCircle2 size={64} color="#ccff00" />
        <Text style={styles.successTitle}>Workout Complete!</Text>
        <Text style={styles.successSubtitle}>Great job today. Keep up the momentum.</Text>
        <TouchableOpacity style={[styles.finishButton, { marginTop: 40, width: '80%' }]} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.finishButtonText}>BACK TO HOME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.successTitle}>Rest Day</Text>
        <Text style={styles.successSubtitle}>Take time to recover today.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Workout</Text>
          <Text style={styles.headerSubtitle}>Personalized Plan</Text>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNameText}>{exercise.name}</Text>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeader, styles.colSet]}>SET</Text>
                <Text style={[styles.columnHeader, styles.colWeight]}>LBS</Text>
                <Text style={[styles.columnHeader, styles.colReps]}>REPS</Text>
                <Text style={[styles.columnHeader, styles.colCheck]}></Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                  <View style={styles.colSet}>
                    <Text style={styles.setNumberText}>{setIndex + 1}</Text>
                  </View>
                  <View style={styles.colWeight}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={set.weight}
                      onChangeText={(val) => updateSet(exercise.id, set.id, 'weight', val)}
                      placeholder="-"
                      placeholderTextColor="#64748B"
                      editable={!set.completed}
                    />
                  </View>
                  <View style={styles.colReps}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={set.reps}
                      onChangeText={(val) => updateSet(exercise.id, set.id, 'reps', val)}
                      placeholder="-"
                      placeholderTextColor="#64748B"
                      editable={!set.completed}
                    />
                  </View>
                  <View style={styles.colCheck}>
                    <TouchableOpacity 
                      style={[styles.checkButton, set.completed && styles.checkButtonActive]}
                      onPress={() => toggleSetComplete(exercise.id, set.id)}
                    >
                      {set.completed ? <Check size={16} color="#000" /> : null}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
          
          <View style={{height: 100}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.finishButton, finishing && { opacity: 0.7 }]} 
          onPress={handleFinishWorkout}
          disabled={finishing}
        >
          <Text style={styles.finishButtonText}>{finishing ? 'FINISHING...' : 'FINISH WORKOUT'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D24',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccff00',
    marginTop: 4,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 24,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#161921',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccff00',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  columnHeader: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  colSet: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colWeight: {
    flex: 1,
    alignItems: 'center',
  },
  colReps: {
    flex: 1,
    alignItems: 'center',
  },
  colCheck: {
    width: 50,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#0F1115',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  setRowCompleted: {
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  setNumberText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1A1D24',
    borderRadius: 6,
    color: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    width: '80%',
    fontWeight: '600',
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1A1D24',
    borderWidth: 1,
    borderColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonActive: {
    backgroundColor: '#ccff00',
    borderColor: '#ccff00',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1D24',
    backgroundColor: '#08090C',
  },
  finishButton: {
    backgroundColor: '#ccff00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  }
});
