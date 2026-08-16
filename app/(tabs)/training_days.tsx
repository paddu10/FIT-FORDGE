import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { generateFutureSchedule } from '../../lib/WorkoutEngine';
import { theme } from '../../constants/theme';

const WEEKDAYS = [
  { id: 1, label: 'MON' },
  { id: 2, label: 'TUE' },
  { id: 3, label: 'WED' },
  { id: 4, label: 'THU' },
  { id: 5, label: 'FRI' },
  { id: 6, label: 'SAT' },
  { id: 0, label: 'SUN' },
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
          {
            text: 'This Week',
            onPress: () => saveSchedule(true)
          },
          {
            text: 'Next Week',
            onPress: () => saveSchedule(false)
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const saveSchedule = async (applyThisWeek: boolean) => {
    if (!user) return;
    setSaving(true);
    
    try {
      // Save to profile
      await supabase.from('profiles').update({ 
        training_days_pref: trainingDaysPref,
        training_days: trainingDaysPref.length
      }).eq('id', user.id);

      // Determine date to start regenerating
      const today = new Date();
      if (!applyThisWeek) {
        // Find next Monday
        const day = today.getDay();
        const diff = (day === 0 ? 1 : 8 - day);
        today.setDate(today.getDate() + diff);
      }
      
      const startDateStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
      ].join('-');
      
      // Delete pending future workouts to allow regeneration
      await supabase
        .from('daily_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('scheduled_date', startDateStr);
        
      // Regenerate
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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Days</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Calendar size={48} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>Customize your week</Text>
        <Text style={styles.subtitle}>Select the days you want to train. Unselected days will become Recovery Days.</Text>

        <View style={styles.grid}>
          {WEEKDAYS.map((day) => {
            const isActive = trainingDaysPref.includes(day.id);
            return (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayCard, isActive && styles.dayCardActive]}
                onPress={() => toggleDay(day.id)}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day.label}</Text>
                {isActive && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleSave} 
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE SCHEDULE'}</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Historical completed workouts will not be affected. Only future planned sessions will be rescheduled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
  content: { padding: 24, paddingBottom: 60 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  grid: { gap: 12, marginBottom: 40 },
  dayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  dayCardActive: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: theme.colors.accent },
  dayText: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: '600' },
  dayTextActive: { color: theme.colors.accent, fontWeight: 'bold' },
  check: { color: theme.colors.accent, fontWeight: 'bold', fontSize: 16 },
  saveBtn: { backgroundColor: theme.colors.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8 },
  infoText: { color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18 }
});
