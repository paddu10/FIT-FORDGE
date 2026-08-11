import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { initializeDailyTasks, checkAndUpdateStreak } from '../../lib/TaskEngine';
import { Flame, PlayCircle, CheckCircle2, Circle, LogOut } from 'lucide-react-native';
import { getBmiCategory } from '../../data/workouts';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [dailyWorkout, setDailyWorkout] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      setLoading(true);

      try {
        // Load Profile (for name, streak, calories)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Load Today's Workout
        const today = new Date().toISOString().split('T')[0];
        const { data: workoutData } = await supabase
          .from('daily_workouts')
          .select(`
            id, status, actual_duration_minutes,
            workouts (name, duration_minutes, fitness_level)
          `)
          .eq('user_id', user.id)
          .eq('scheduled_date', today)
          .single();
        
        if (workoutData) setDailyWorkout(workoutData);

        // Initialize and Load Tasks
        const dailyTasks = await initializeDailyTasks(user.id);
        setTasks(dailyTasks);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, [user]);

  const toggleTask = async (task: any) => {
    if (task.completed) return; // Prevent unchecking as per PRD "Prevent accidental repeated completion"

    try {
      const { error } = await supabase
        .from('daily_tasks')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', task.id);

      if (!error) {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: true } : t));
        
        // Check if all tasks are complete to update streak
        if (user) {
          await checkAndUpdateStreak(user.id);
          // Refresh profile streak silently
          const { data } = await supabase.from('profiles').select('current_streak').eq('id', user.id).single();
          if (data && profile) {
            setProfile({ ...profile, current_streak: data.current_streak });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View>
              <Text style={styles.greeting}>{getTimeOfDay()}, {profile?.name || 'Athlete'} 👋</Text>
              <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
              {(() => {
                let bmiValue = profile?.bmi;
                if (!bmiValue && profile?.weight && profile?.height) {
                  const hM = profile.height / 100;
                  bmiValue = profile.weight / (hM * hM);
                }
                
                if (bmiValue) {
                  return (
                    <View style={styles.bmiBadge}>
                      <Text style={styles.bmiBadgeText}>
                        BMI {Number(bmiValue).toFixed(1)} · {getBmiCategory(Number(bmiValue)).charAt(0).toUpperCase() + getBmiCategory(Number(bmiValue)).slice(1)}
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
            </View>
            <TouchableOpacity onPress={() => supabase.auth.signOut()}>
              <LogOut color="#EF4444" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakIconContainer}>
            <Flame size={32} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.streakTitle}>{profile?.current_streak || 0} DAY STREAK</Text>
            <Text style={styles.streakSubtitle}>Keep the fire burning!</Text>
          </View>
        </View>

        {/* Today's Workout Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S WORKOUT</Text>
          <TouchableOpacity 
            style={styles.workoutCard} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/workout')}
          >
            {dailyWorkout ? (
              <>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{(dailyWorkout.workouts as any)?.name || 'Custom Workout'}</Text>
                  <Text style={styles.workoutDetails}>
                    {(dailyWorkout.workouts as any)?.duration_minutes || 30} min • {(dailyWorkout.workouts as any)?.fitness_level || 'Mixed'}
                  </Text>
                </View>
                {dailyWorkout.status === 'completed' ? (
                  <View style={styles.completedBadge}>
                    <CheckCircle2 size={24} color="#22C55E" />
                  </View>
                ) : (
                  <View style={styles.playButton}>
                    <PlayCircle size={32} color="#ccff00" />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>Rest Day</Text>
                <Text style={styles.workoutDetails}>Take time to recover</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S TASKS</Text>
          <View style={styles.tasksContainer}>
            {tasks.map(task => (
              <TouchableOpacity 
                key={task.id} 
                style={[styles.taskRow, task.completed && styles.taskRowCompleted]}
                onPress={() => toggleTask(task)}
                activeOpacity={0.7}
              >
                {task.completed ? (
                  <CheckCircle2 size={24} color="#22C55E" />
                ) : (
                  <Circle size={24} color="#4B5563" />
                )}
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S PROGRESS</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>CALORIES</Text>
              <Text style={styles.progressValue}>
                0 / {profile?.calorie_target || 2000} <Text style={styles.progressUnit}>kcal</Text>
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>PROTEIN</Text>
              <Text style={styles.progressValue}>
                0 / {profile?.protein_target || 100} <Text style={styles.progressUnit}>g</Text>
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  bmiBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  bmiBadgeText: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  streakIconContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  streakTitle: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  streakSubtitle: {
    color: '#D97706',
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  workoutCard: {
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  workoutDetails: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  playButton: {
    padding: 8,
  },
  completedBadge: {
    padding: 8,
  },
  tasksContainer: {
    backgroundColor: '#161921',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  taskRowCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  taskTitleCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  progressCard: {
    backgroundColor: '#161921',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2430',
    marginVertical: 16,
  },
  progressLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressUnit: {
    color: '#64748B',
    fontSize: 14,
  }
});
