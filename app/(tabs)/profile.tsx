import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { getBmiCategory } from '../../data/workouts';
import { User, Flame, Scale, Ruler, Target, LogOut, ChevronRight, Activity, Zap } from 'lucide-react-native';

type Profile = {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  bmr: number;
  tdee: number;
  calorie_target: number;
  protein_target: number;
  goal: string;
  fitness_level: string;
  current_streak: number;
  longest_streak: number;
  push_up_ability?: string;
  pull_up_ability?: string;
  plank_ability?: string;
  training_location?: string;
  limitations?: string[];
};

function getBmiColor(bmi: number): string {
  if (bmi < 18.5) return '#60A5FA'; // blue - underweight
  if (bmi <= 24.9) return '#22C55E'; // green - normal
  if (bmi <= 29.9) return '#F59E0B'; // amber - overweight
  return '#EF4444'; // red - obese
}

function getGoalLabel(goal: string): string {
  const map: Record<string, string> = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    get_stronger: 'Get Stronger',
    improve_fitness: 'Improve Fitness',
    maintain: 'Maintain Weight',
  };
  return map[goal] || goal;
}

function getFitnessLabel(level: string): string {
  const map: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return map[level] || level;
}

export default function ProfileScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [computedBmi, setComputedBmi] = useState<number | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        // If BMI not in DB but we have height/weight, calculate it now and save it
        let bmi = data.bmi;
        if (!bmi && data.height && data.weight) {
          const hM = data.height / 100;
          bmi = data.weight / (hM * hM);
          // Patch the database so it's saved for next time
          await supabase
            .from('profiles')
            .update({ bmi: Number(bmi.toFixed(1)) })
            .eq('id', user.id);
        }
        setComputedBmi(bmi ? Number(bmi) : null);
        setProfile({ ...data, bmi });
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  const bmi = computedBmi;
  const bmiCategory = bmi ? getBmiCategory(bmi) : null;
  const bmiColor = bmi ? getBmiColor(bmi) : '#9CA3AF';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#ccff00" />
          </View>
          <Text style={styles.name}>{profile?.name || 'Athlete'}</Text>
          <Text style={styles.meta}>
            {profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''}{profile?.age ? ` · ${profile.age} yrs` : ''}
          </Text>
          <View style={styles.streakRow}>
            <Flame size={16} color="#F59E0B" />
            <Text style={styles.streakText}>{profile?.current_streak || 0} day streak</Text>
          </View>
        </View>

        {/* BMI Card — the main feature */}
        {bmi ? (
          <View style={[styles.bmiCard, { borderColor: bmiColor + '50' }]}>
            <View style={styles.bmiLeft}>
              <Text style={styles.bmiLabel}>BODY MASS INDEX</Text>
              <Text style={[styles.bmiValue, { color: bmiColor }]}>{bmi.toFixed(1)}</Text>
              <View style={[styles.bmiBadge, { backgroundColor: bmiColor + '20', borderColor: bmiColor + '40' }]}>
                <Text style={[styles.bmiBadgeText, { color: bmiColor }]}>
                  {bmiCategory ? bmiCategory.charAt(0).toUpperCase() + bmiCategory.slice(1) : ''}
                </Text>
              </View>
            </View>
            <View style={styles.bmiRight}>
              <View style={styles.bmiStatRow}>
                <Scale size={16} color="#9CA3AF" />
                <Text style={styles.bmiStatText}>{profile?.weight} kg</Text>
              </View>
              <View style={styles.bmiStatRow}>
                <Ruler size={16} color="#9CA3AF" />
                <Text style={styles.bmiStatText}>{profile?.height} cm</Text>
              </View>
              <Text style={styles.bmiHint}>Healthy: 18.5 – 24.9</Text>
            </View>
          </View>
        ) : (
          <View style={styles.missingCard}>
            <Text style={styles.missingText}>BMI could not be calculated. Please update your profile.</Text>
          </View>
        )}

        {/* Nutrition Targets */}
        <Text style={styles.sectionTitle}>NUTRITION TARGETS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Flame size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{profile?.calorie_target || '—'}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={20} color="#6C63FF" />
            <Text style={styles.statValue}>{profile?.protein_target || '—'}g</Text>
            <Text style={styles.statLabel}>Protein</Text>
          </View>
          <View style={styles.statCard}>
            <Activity size={20} color="#22C55E" />
            <Text style={styles.statValue}>{profile?.bmr ? Math.round(profile.bmr) : '—'}</Text>
            <Text style={styles.statLabel}>BMR</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color="#ccff00" />
            <Text style={styles.statValue}>{profile?.tdee ? Math.round(profile.tdee) : '—'}</Text>
            <Text style={styles.statLabel}>TDEE</Text>
          </View>
        </View>

        {/* Goal & Level */}
        <Text style={styles.sectionTitle}>TRAINING PROFILE</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Goal</Text>
            <Text style={styles.infoValue}>{profile?.goal ? getGoalLabel(profile.goal) : '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Fitness Level</Text>
            <Text style={styles.infoValue}>{profile?.fitness_level ? getFitnessLabel(profile.fitness_level) : '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Best Streak</Text>
            <Text style={styles.infoValue}>{profile?.longest_streak || 0} days</Text>
          </View>
        </View>

        {/* Abilities */}
        <Text style={styles.sectionTitle}>CURRENT BASELINE</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Push-ups</Text>
            <Text style={styles.infoValue}>{profile?.push_up_ability || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Pull-ups</Text>
            <Text style={styles.infoValue}>{profile?.pull_up_ability || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Plank</Text>
            <Text style={styles.infoValue}>{profile?.plank_ability || '—'}</Text>
          </View>
        </View>

        {/* Re-do onboarding */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/(onboarding)')}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Update Profile & Recalculate</Text>
          <ChevronRight size={20} color="#ccff00" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(204,255,0,0.1)',
    borderWidth: 2, borderColor: 'rgba(204,255,0,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  name: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  meta: { fontSize: 15, color: '#9CA3AF', marginTop: 4 },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  streakText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 14 },

  // BMI
  bmiCard: {
    backgroundColor: '#161921',
    borderRadius: 20, borderWidth: 1,
    padding: 24, flexDirection: 'row',
    alignItems: 'center', marginBottom: 28,
  },
  bmiLeft: { flex: 1 },
  bmiLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 6 },
  bmiValue: { fontSize: 56, fontWeight: '900', lineHeight: 60 },
  bmiBadge: {
    alignSelf: 'flex-start', marginTop: 8,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  bmiBadgeText: { fontSize: 13, fontWeight: 'bold' },
  bmiRight: { alignItems: 'flex-end', gap: 10 },
  bmiStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bmiStatText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  bmiHint: { color: '#4B5563', fontSize: 11, marginTop: 4 },
  missingCard: {
    backgroundColor: '#161921', borderRadius: 16,
    padding: 20, marginBottom: 28, borderWidth: 1, borderColor: '#2D3748',
  },
  missingText: { color: '#9CA3AF', textAlign: 'center' },

  // Stats grid
  sectionTitle: {
    color: '#9CA3AF', fontSize: 12, fontWeight: 'bold',
    letterSpacing: 1.2, marginBottom: 12, marginLeft: 4,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: '#161921', borderRadius: 16,
    padding: 18, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#2D3748',
  },
  statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

  // Info rows
  infoCard: {
    backgroundColor: '#161921', borderRadius: 16,
    borderWidth: 1, borderColor: '#2D3748',
    marginBottom: 24, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
  },
  infoKey: { color: '#9CA3AF', fontSize: 14 },
  infoValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1E2430' },

  editButton: {
    backgroundColor: 'rgba(204,255,0,0.08)',
    borderWidth: 1, borderColor: 'rgba(204,255,0,0.3)',
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  editButtonText: { color: '#ccff00', fontWeight: 'bold', fontSize: 15 },

  logoutButton: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
});
