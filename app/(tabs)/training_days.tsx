import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { generateFutureSchedule } from '../../lib/WorkoutEngine';
import { AppScreen } from '../../components/AppScreen';
import { AppHeader } from '../../components/AppHeader';
import { SPACING } from '../../constants/Layout';

const WEEKDAYS = [
  { id: 1, label: 'MONDAY' },
  { id: 2, label: 'TUESDAY' },
  { id: 3, label: 'WEDNESDAY' },
  { id: 4, label: 'THURSDAY' },
  { id: 5, label: 'FRIDAY' },
  { id: 6, label: 'SATURDAY' },
  { id: 0, label: 'SUNDAY' },
];

export default function TrainingDaysScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [trainingDaysPref, setTrainingDaysPref] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('training_days_pref').eq('id', user.id).single();
      if (data?.training_days_pref) setTrainingDaysPref(data.training_days_pref);
      setLoading(false);
    }
    loadSaved();
  }, [user]);

  const toggleDay = (dayId: number) => {
    setTrainingDaysPref(prev => {
      if (prev.includes(dayId)) return prev.filter(id => id !== dayId);
      return [...prev, dayId];
    });
  };

  const handleSave = async () => {
    if (trainingDaysPref.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Please select at least one training day.');
      } else {
        Alert.alert('Error', 'Please select at least one training day.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const applyThisWeek = window.confirm('Click OK to apply this schedule starting THIS WEEK, or click Cancel to apply to NEXT WEEK.');
      saveSchedule(applyThisWeek);
    } else {
      Alert.alert(
        'Update Schedule',
        'Do you want to apply this schedule starting from this week, or next week?',
        [
          { text: 'This Week', onPress: () => saveSchedule(true) },
          { text: 'Next Week', onPress: () => saveSchedule(false) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const saveSchedule = async (applyThisWeek: boolean) => {
    if (!user) return;
    setSaving(true);
    
    try {
      await supabase.from('profiles').update({ 
        training_days_pref: trainingDaysPref,
        training_days: trainingDaysPref.length
      }).eq('id', user.id);

      const today = new Date();
      if (!applyThisWeek) {
        const day = today.getDay();
        const diff = (day === 0 ? 1 : 8 - day);
        today.setDate(today.getDate() + diff);
      }
      
      const startDateStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
      ].join('-');
      
      await supabase
        .from('daily_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('scheduled_date', startDateStr);
        
      await generateFutureSchedule(user.id, startDateStr, 14);
      setSaving(false);
      
      if (Platform.OS === 'web') {
        window.alert('Your training schedule has been updated.');
        router.back();
      } else {
        Alert.alert('Success', 'Your training schedule has been updated.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      console.error(err);
      setSaving(false);
      if (Platform.OS === 'web') {
        window.alert('Failed to update schedule.');
      } else {
        Alert.alert('Error', 'Failed to update schedule.');
      }
    }
  };

  if (loading) {
    return (
      <AppScreen bgImage={require('../../assets/Custom your week_img.jpg')} bgGradient hideBottomSafe>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ccff00" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen 
      bgImage={require('../../assets/Custom your week_img.jpg')} 
      bgGradient
      hideBottomSafe
      scrollable
      contentContainerStyle={styles.scrollContent}
    >
      {/* We just use AppHeader for the back button, since it handles status bar padding perfectly */}
      <AppHeader showBack={true} />

      {/* Hero */}
      <View style={styles.heroSpace}>
        <View style={styles.badgeRow}>
          <Calendar size={18} color="#ccff00" />
          <Text style={styles.badgeText}>FIT FORGE</Text>
        </View>
        <Text style={styles.heroTitle}>Custom{'\n'}Your Week</Text>
        <Text style={styles.heroSub}>Select the days you want to train. Unselected days will become Recovery Days.</Text>
      </View>

      {/* Glass card */}
      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.cardLabel}>TRAINING DAYS ({trainingDaysPref.length}/7)</Text>
          
          <View style={styles.grid}>
            {WEEKDAYS.map((day) => {
              const isActive = trainingDaysPref.includes(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayCard, isActive && styles.dayCardActive]}
                  onPress={() => toggleDay(day.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day.label}</Text>
                  <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                    {isActive && <View style={styles.checkboxInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#d4ff00', '#ccff00', '#aadd00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGrad}
          >
            <Text style={styles.buttonText}>{saving ? 'SAVING...' : 'SAVE SCHEDULE'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Historical completed workouts will not be affected. Only future planned sessions will be rescheduled.
          </Text>
        </View>
      </View>

      {/* ───── Footer ───── */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />

        <Text style={styles.footerQuote}>
          "Failing to plan is planning to fail."
        </Text>
        <Text style={styles.footerQuoteAttr}>— Alan Lakein</Text>

        <View style={styles.footerPills}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>🗓️</Text>
            <Text style={styles.pillText}>Structured</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>⚡</Text>
            <Text style={styles.pillText}>Flexible</Text>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 120 }, // Extra padding for bottom tabs

  // Hero
  heroSpace: { paddingHorizontal: 28, paddingTop: 10, paddingBottom: 32 },
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
    gap: 24,
  },
  section: { gap: 12 },
  cardLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  // Days list
  grid: { gap: 10 },
  dayCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16,
    paddingHorizontal: 18, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  dayCardActive: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  dayText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  dayTextActive: { color: '#ccff00' },
  
  checkbox: { 
    width: 22, height: 22, borderRadius: 6, 
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  checkboxActive: { borderColor: '#ccff00' },
  checkboxInner: { width: 11, height: 11, borderRadius: 3, backgroundColor: '#ccff00' },

  // Info Box
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Button
  button: { borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  btnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Footer
  footer: { marginHorizontal: 16, marginTop: 32, marginBottom: 20, alignItems: 'center', gap: 16 },
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
});
