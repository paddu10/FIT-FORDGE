import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { OnboardingFooter } from '../../components/OnboardingFooter';

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

  // Pre-populate from saved profile
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('training_days_pref, training_duration').eq('id', user.id).single();
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Calendar size={32} color="#ccff00" />
          <Text style={styles.title}>Commit to yourself</Text>
          <Text style={styles.subtitle}>Which days do you want to train?</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Days ({trainingDaysPref.length}/7)</Text>
          <View style={styles.daysGrid}>
            {WEEKDAYS.map((day) => {
              const isActive = trainingDaysPref.includes(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayButton, isActive && styles.activeButton]}
                  onPress={() => toggleDay(day.id)}
                >
                  <Text style={[styles.buttonLabel, isActive && styles.activeLabel]}>{day.label}</Text>
                  {isActive && <View style={styles.checkIcon}><Text style={{color: '#ccff00', fontSize: 10, fontWeight: 'bold'}}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minutes per session</Text>
          <View style={styles.durationList}>
            {DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[styles.durationButton, trainingDuration === duration && styles.activeButton]}
                onPress={() => setTrainingDuration(duration)}
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
        >
          <Text style={styles.buttonText}>{loading ? 'SAVING...' : 'NEXT ➔'}</Text>
        </TouchableOpacity>

        <OnboardingFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  section: { marginBottom: 32, backgroundColor: '#161921', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#2D3748' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  dayButton: { 
    width: '30%', 
    height: 48, 
    borderRadius: 8, 
    backgroundColor: '#0F1115', 
    borderWidth: 1, 
    borderColor: '#1E2430', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonLabel: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  checkIcon: { marginLeft: 6, marginTop: 1 },
  durationList: { gap: 8 },
  durationButton: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#1E2430', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  durationLabel: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  activeButton: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  activeLabel: { color: '#ccff00', fontWeight: 'bold' },
  button: { backgroundColor: '#ccff00', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});
