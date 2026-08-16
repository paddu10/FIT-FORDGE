import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { CheckCircle2, Flame, Droplets } from 'lucide-react-native';
import { generateFutureSchedule } from '../../lib/WorkoutEngine';

export default function CompleteScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function calculateMetrics() {
      if (!user) return;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error || !profile) {
        console.error('[Complete] Failed to load profile:', error?.message);
        setLoading(false);
        return;
      }

      // 1. Calculate BMR (Mifflin-St Jeor)
      const w = profile.weight;
      const h = profile.height;
      const a = profile.age;
      
      let bmr = 10 * w + 6.25 * h - 5 * a;
      if (profile.gender === 'male') {
        bmr += 5;
      } else {
        bmr -= 161;
      }

      // 2. Calculate TDEE based on training days
      let activityMultiplier = 1.2; // Sedentary
      const days = profile.training_days || 0;
      if (days >= 1 && days <= 2) activityMultiplier = 1.375;
      else if (days >= 3 && days <= 4) activityMultiplier = 1.55;
      else if (days >= 5) activityMultiplier = 1.725;
      
      const tdee = bmr * activityMultiplier;

      // 3. Calorie Target based on goal
      let calorieTarget = tdee;
      if (profile.goal === 'lose_weight') calorieTarget = tdee - 400;
      else if (profile.goal === 'build_muscle') calorieTarget = tdee + 300;
      else if (profile.goal === 'get_stronger') calorieTarget = tdee + 200;

      // Safeguard against too low calories
      if (profile.gender === 'female' && calorieTarget < 1200) calorieTarget = 1200;
      if (profile.gender === 'male' && calorieTarget < 1500) calorieTarget = 1500;

      // 4. Protein Target (g per kg of bodyweight)
      let proteinMultiplier = 1.6;
      if (profile.goal === 'build_muscle' || profile.goal === 'get_stronger') proteinMultiplier = 1.8;
      else if (profile.goal === 'lose_weight') proteinMultiplier = 1.8; // High protein for satiety and muscle retention
      else proteinMultiplier = 1.4; // Maintenance/Fitness
      
      const proteinTarget = w * proteinMultiplier;

      // 5. Calculate BMI
      const heightInMeters = h / 100;
      const bmi = w / (heightInMeters * heightInMeters);

      const calculatedMetrics = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorie_target: Math.round(calorieTarget),
        protein_target: Math.round(proteinTarget),
        bmi: Number(bmi.toFixed(1))
      };

      setMetrics(calculatedMetrics);
      setLoading(false);
    }

    calculateMetrics();
  }, [user]);

  const handleFinish = async () => {
    if (!user || !metrics) return;
    
    setSaving(true);

    try {
      // Save the calculated metrics to the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          calorie_target: metrics.calorie_target,
          protein_target: metrics.protein_target,
          bmi: metrics.bmi
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[Complete] Save failed:', updateError.message);
        Alert.alert(
          'Save Failed',
          'Could not save your plan. Please check your connection and try again.\n\nError: ' + updateError.message
        );
        setSaving(false);
        return;
      }

      // Verify the save actually worked by reading back
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('calorie_target')
        .eq('id', user.id)
        .single();

      if (verifyError || !verifyData?.calorie_target) {
        console.error('[Complete] Save verification failed:', verifyError?.message, 'data:', verifyData);
        
        // Retry once with upsert approach
        console.log('[Complete] Retrying save with upsert...');
        const { error: retryError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            bmr: metrics.bmr,
            tdee: metrics.tdee,
            calorie_target: metrics.calorie_target,
            protein_target: metrics.protein_target,
            bmi: metrics.bmi
          });

        if (retryError) {
          console.error('[Complete] Retry also failed:', retryError.message);
          Alert.alert(
            'Save Failed',
            'Could not save your plan after retrying. Please check your internet connection and try again.\n\nError: ' + retryError.message
          );
          setSaving(false);
          return;
        }
      }

      console.log('[Complete] Save verified successfully! calorie_target =', metrics.calorie_target);
      
      // Generate the user's initial schedule for the next 14 days
      const todayStr = new Date().toLocaleDateString('en-CA');
      await generateFutureSchedule(user.id, todayStr, 14);

      // Now refresh the AuthContext so it knows onboarding is complete
      await refreshProfile();
      // The router in _layout.tsx will automatically redirect to (tabs)
    } catch (err: any) {
      console.error('[Complete] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ccff00" />
          <Text style={styles.loadingText}>Generating your personalized plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <CheckCircle2 size={48} color="#ccff00" />
          <Text style={styles.title}>Your personalized plan is ready</Text>
          <Text style={styles.subtitle}>Based on your biometrics and goals, we've calculated your optimal targets. (These are estimates)</Text>
        </View>

        {metrics && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconBox}>
                <Flame size={24} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.metricLabel}>Daily Calorie Target</Text>
                <Text style={styles.metricValue}>{metrics.calorie_target} <Text style={styles.metricUnit}>kcal</Text></Text>
                <Text style={styles.metricSubtext}>Maintenance: {metrics.tdee} kcal</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconBox}>
                <Droplets size={24} color="#6C63FF" />
              </View>
              <View>
                <Text style={styles.metricLabel}>Daily Protein Target</Text>
                <Text style={styles.metricValue}>{metrics.protein_target} <Text style={styles.metricUnit}>g</Text></Text>
                <Text style={styles.metricSubtext}>To support your goals</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Your Basal Metabolic Rate (BMR) is estimated at {metrics.bmr} kcal. 
                This is what your body burns at rest.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, saving && styles.buttonDisabled]} 
          onPress={handleFinish}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'FINISHING...' : 'START MY FITNESS JOURNEY'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  metricsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  metricCard: {
    backgroundColor: '#161921',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metricIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F1115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  metricSubtext: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ccff00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
