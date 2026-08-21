import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ImageBackground, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const WEEKDAYS = [
  { id: 1, label: 'MON' },
  { id: 2, label: 'TUE' },
  { id: 3, label: 'WED' },
  { id: 4, label: 'THU' },
  { id: 5, label: 'FRI' },
  { id: 6, label: 'SAT' },
  { id: 0, label: 'SUN' },
];
const DURATIONS = [15, 20, 30, 45, 60];

export default function ScheduleScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [trainingDaysPref, setTrainingDaysPref] = useState<number[]>([]);
  const [trainingDuration, setTrainingDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('training_days_pref, training_duration')
        .eq('id', user.id)
        .single();
      if (data?.training_days_pref) setTrainingDaysPref(data.training_days_pref);
      if (data?.training_duration) setTrainingDuration(data.training_duration);
    }
    loadSaved();
  }, [user]);

  const toggleDay = (dayId: number) => {
    setTrainingDaysPref(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(id => id !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  const handleNext = async () => {
    if (trainingDaysPref.length === 0 || !trainingDuration) {
      Alert.alert('Select Schedule', 'Please select at least one training day and a duration.');
      return;
    }
    if (trainingDaysPref.length === 7) {
      Alert.alert('Consider Recovery', 'Training 7 days a week is intense. We recommend adding at least one recovery day.', [
        { text: 'Change Schedule', style: 'cancel' },
        { text: 'Keep 7 Days', onPress: saveAndContinue }
      ]);
      return;
    }
    saveAndContinue();
  };

  const saveAndContinue = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          training_days_pref: trainingDaysPref, 
          training_days: trainingDaysPref.length,
          training_duration: trainingDuration 
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('[Schedule] Save failed:', error.message);
        Alert.alert('Save Failed', 'Could not save your schedule. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/(onboarding)/diet');
    } catch (err) {
      console.error('[Schedule] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/commit yourself_img.jpg')}
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
              <Calendar size={18} color="#ccff00" />
              <Text style={styles.badgeText}>FIT FORGE</Text>
            </View>
            <Text style={styles.heroTitle}>Commit To{'\n'}Yourself</Text>
            <Text style={styles.heroSub}>Which days do you want to train?</Text>
          </View>

          {/* Glass card */}
          <View style={styles.card}>

            {/* Training Days */}
            <View style={styles.section}>
              <Text style={styles.cardLabel}>TRAINING DAYS ({trainingDaysPref.length}/7)</Text>
              <View style={styles.daysGrid}>
                {WEEKDAYS.map((day) => {
                  const isActive = trainingDaysPref.includes(day.id);
                  return (
                    <TouchableOpacity
                      key={day.id}
                      style={[styles.dayButton, isActive && styles.activeButton]}
                      onPress={() => toggleDay(day.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.buttonLabel, isActive && styles.activeLabel]}>{day.label}</Text>
                      {isActive && <View style={styles.checkIcon}><Text style={{color: '#ccff00', fontSize: 10, fontWeight: 'bold'}}>✓</Text></View>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.cardLabel}>MINUTES PER SESSION</Text>
              <View style={styles.durationList}>
                {DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[styles.durationButton, trainingDuration === duration && styles.activeButton]}
                    onPress={() => setTrainingDuration(duration)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.durationLabel, trainingDuration === duration && styles.activeLabel]}>
                      {duration} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#d4ff00', '#ccff00', '#aadd00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGrad}
              >
                <Text style={styles.buttonText}>{loading ? 'SAVING...' : 'NEXT ➔'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ───── Footer ───── */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />

            <Text style={styles.footerQuote}>
              "Discipline is the bridge between goals and accomplishment."
            </Text>
            <Text style={styles.footerQuoteAttr}>— Jim Rohn</Text>

            <View style={styles.footerPills}>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🗓️</Text>
                <Text style={styles.pillText}>Structured</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>⏱️</Text>
                <Text style={styles.pillText}>Time-Efficient</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>⚡</Text>
                <Text style={styles.pillText}>Consistent</Text>
              </View>
            </View>

            <Text style={styles.footerAbout}>
              Consistency is key. FIT FORGE helps you stay on track by building a schedule that works for you.
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
    gap: 24,
  },
  section: { gap: 12 },
  cardLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Days Grid
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  dayButton: { 
    width: '30%', 
    height: 48, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  checkIcon: { marginLeft: 6, marginTop: 1 },

  // Duration List
  durationList: { gap: 8 },
  durationButton: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  durationLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' },

  // Active States
  activeButton: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  activeLabel: { color: '#ccff00', fontWeight: 'bold' },

  // Button
  button: { borderRadius: 14, overflow: 'hidden' },
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
