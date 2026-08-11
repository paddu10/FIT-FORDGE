import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const DURATIONS = [15, 20, 30, 45, 60];

export default function ScheduleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [trainingDays, setTrainingDays] = useState<number | null>(null);
  const [trainingDuration, setTrainingDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!trainingDays || !trainingDuration) {
      Alert.alert('Select Schedule', 'Please select both training frequency and duration.');
      return;
    }

    setLoading(true);
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          training_days: trainingDays,
          training_duration: trainingDuration
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.push('/(onboarding)/diet');
      }
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Calendar size={32} color="#ccff00" />
          <Text style={styles.title}>Commit to yourself</Text>
          <Text style={styles.subtitle}>How often and how long can you train?</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Days per week</Text>
          <View style={styles.daysGrid}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, trainingDays === day && styles.activeButton]}
                onPress={() => setTrainingDays(day)}
              >
                <Text style={[styles.buttonLabel, trainingDays === day && styles.activeLabel]}>{day}</Text>
              </TouchableOpacity>
            ))}
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
                <Text style={[styles.durationLabel, trainingDuration === duration && styles.activeLabel]}>{duration} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'SAVING...' : 'NEXT ➔'}
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
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#161921',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#1E2430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '600',
  },
  durationList: {
    gap: 8,
  },
  durationButton: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#1E2430',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationLabel: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  activeButton: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderColor: '#ccff00',
  },
  activeLabel: {
    color: '#ccff00',
    fontWeight: 'bold',
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
