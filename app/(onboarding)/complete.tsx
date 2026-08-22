import { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, ImageBackground, Dimensions, StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { CheckCircle2, Flame, Droplets } from 'lucide-react-native';
import { generateFutureSchedule } from '../../lib/WorkoutEngine';

const { width, height } = Dimensions.get('window');

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
      <View style={[styles.root, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ccff00" />
        <Text style={styles.loadingText}>Generating your personalized plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/person plan_img.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(8,9,12,0.70)', 'rgba(8,9,12,0.97)']}
          locations={[0, 0.42, 0.72]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.heroSpace}>
            <View style={styles.badgeRow}>
              <CheckCircle2 size={18} color="#ccff00" />
              <Text style={styles.badgeText}>FIT FORGE</Text>
            </View>
            <Text style={styles.heroTitle}>Your Plan{'\n'}Is Ready</Text>
            <Text style={styles.heroSub}>Based on your biometrics and goals, we've calculated your optimal targets.</Text>
          </View>

          {/* Glass card */}
          {metrics && (
            <View style={styles.card}>
              
              {/* Calorie Metric */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconBox}>
                  <Flame size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.metricLabel}>Daily Calorie Target</Text>
                  <Text style={styles.metricValue}>
                    {metrics.calorie_target} <Text style={styles.metricUnit}>kcal</Text>
                  </Text>
                  <Text style={styles.metricSubtext}>Maintenance: {metrics.tdee} kcal</Text>
                </View>
              </View>

              {/* Protein Metric */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconBox}>
                  <Droplets size={24} color="#6C63FF" />
                </View>
                <View>
                  <Text style={styles.metricLabel}>Daily Protein Target</Text>
                  <Text style={styles.metricValue}>
                    {metrics.protein_target} <Text style={styles.metricUnit}>g</Text>
                  </Text>
                  <Text style={styles.metricSubtext}>To support your goals</Text>
                </View>
              </View>

              {/* BMR Info Box */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Your Basal Metabolic Rate (BMR) is estimated at {metrics.bmr} kcal. 
                  This is what your body burns at rest.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={handleFinish}
                disabled={saving}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#d4ff00', '#ccff00', '#aadd00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGrad}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'FINISHING...' : 'START MY JOURNEY ➔'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          
          {/* ───── Footer ───── */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />

            <Text style={styles.footerQuote}>
              "A goal without a plan is just a wish."
            </Text>
            <Text style={styles.footerQuoteAttr}>— Antoine de Saint-Exupéry</Text>

            <View style={styles.footerPills}>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🧬</Text>
                <Text style={styles.pillText}>Science-Based</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🎯</Text>
                <Text style={styles.pillText}>Goal-Oriented</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🚀</Text>
                <Text style={styles.pillText}>Ready</Text>
              </View>
            </View>

            <Text style={styles.footerAbout}>
              Everything is set. Your tailored nutrition targets and custom workout plan are locked in. Let's forge your physique.
            </Text>

            <Text style={styles.footerCopy}>© 2025 FIT FORGE. All rights reserved.</Text>
          </View>
          
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#9CA3AF', marginTop: 16, fontSize: 16, fontWeight: '600' },
  bgImage: { width, height, flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 32 },

  // Hero
  heroSpace: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 32 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  badgeText: { color: '#ccff00', fontWeight: '800', fontSize: 13, letterSpacing: 2.5 },
  heroTitle: {
    fontSize: 48, fontWeight: '900', color: '#FFFFFF', lineHeight: 52, marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },

  // Glass card
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(22, 25, 33, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    gap: 20,
  },

  // Metric Cards
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metricIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  metricSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },

  // Info Box
  infoBox: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  infoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Button
  button: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  buttonDisabled: { opacity: 0.7 },
  btnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Footer
  footer: { marginHorizontal: 16, marginTop: 28, marginBottom: 40, alignItems: 'center', gap: 16 },
  footerDivider: { width: '40%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 4 },
  footerQuote: {
    color: 'rgba(255,255,255,0.75)', fontSize: 15, fontStyle: 'italic',
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 16,
  },
  footerQuoteAttr: { color: '#ccff00', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: -8 },
  footerPills: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  pillIcon: { fontSize: 13 },
  pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  footerAbout: {
    color: 'rgba(255,255,255,0.38)', fontSize: 12,
    textAlign: 'center', lineHeight: 19, paddingHorizontal: 8,
  },
  footerCopy: { color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 0.5, marginTop: 4 },
});
