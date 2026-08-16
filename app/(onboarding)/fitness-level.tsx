import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import { OnboardingFooter } from '../../components/OnboardingFooter';

const LEVELS = [
  { id: 'beginner',     title: 'Beginner',     description: 'I am new to fitness or returning after a long break.' },
  { id: 'intermediate', title: 'Intermediate', description: 'I train regularly and know the basics.' },
  { id: 'advanced',     title: 'Advanced',     description: 'I have been training consistently for years.' },
];

export default function FitnessLevelScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-populate from saved profile
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('fitness_level').eq('id', user.id).single();
      if (data?.fitness_level) setSelectedLevel(data.fitness_level);
    }
    loadSaved();
  }, [user]);

  const handleNext = async () => {
    if (!selectedLevel) {
      Alert.alert('Select a Level', 'Please select your current fitness level.');
      return;
    }
    if (!user) {
      Alert.alert('Session Error', 'Not logged in. Please restart the app.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ fitness_level: selectedLevel })
        .eq('id', user.id);
      if (error) {
        console.error('[FitnessLevel] Save failed:', error.message);
        Alert.alert('Save Failed', 'Could not save your fitness level. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/(onboarding)/abilities');
    } catch (err) {
      console.error('[FitnessLevel] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TrendingUp size={32} color="#ccff00" />
          <Text style={styles.title}>How would you describe your fitness?</Text>
          <Text style={styles.subtitle}>Be honest! We will scale the workouts accordingly.</Text>
        </View>

        <View style={styles.list}>
          {LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                style={[styles.optionCard, isSelected && styles.optionCardActive]}
                onPress={() => setSelectedLevel(level.id)}
              >
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>{level.title}</Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </TouchableOpacity>
            );
          })}
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
  list: { gap: 16, marginBottom: 32 },
  optionCard: { backgroundColor: '#161921', borderWidth: 1, borderColor: '#2D3748', borderRadius: 12, padding: 20 },
  optionCardActive: { backgroundColor: 'rgba(204,255,0,0.05)', borderColor: '#ccff00' },
  optionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  optionTitleActive: { color: '#ccff00' },
  optionDescription: { color: '#9CA3AF', fontSize: 14 },
  button: { backgroundColor: '#ccff00', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});
