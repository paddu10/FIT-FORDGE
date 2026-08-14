import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Target } from 'lucide-react-native';
import { OnboardingFooter } from '../../components/OnboardingFooter';

const GOALS = [
  { id: 'lose_weight',     title: 'Lose Weight',     description: 'Burn fat and get leaner' },
  { id: 'build_muscle',   title: 'Build Muscle',    description: 'Increase muscle mass and size' },
  { id: 'get_stronger',   title: 'Get Stronger',    description: 'Increase maximum strength' },
  { id: 'improve_fitness',title: 'Improve Fitness', description: 'Better endurance and health' },
  { id: 'maintain_weight',title: 'Maintain Weight', description: 'Stay at current weight, get toned' },
];

export default function GoalScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedGoal, setSelectedGoal] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-populate from saved profile
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('goal').eq('id', user.id).single();
      if (data?.goal) setSelectedGoal(data.goal);
    }
    loadSaved();
  }, [user]);

  const handleNext = async () => {
    if (!selectedGoal) {
      Alert.alert('Select a Goal', 'Please select your primary fitness goal.');
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
        .update({ goal: selectedGoal })
        .eq('id', user.id);
      if (error) {
        console.error('[Goal] Save failed:', error.message);
        Alert.alert('Save Failed', 'Could not save your goal. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/(onboarding)/fitness-level');
    } catch (err) {
      console.error('[Goal] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Target size={32} color="#ccff00" />
          <Text style={styles.title}>What's your goal?</Text>
          <Text style={styles.subtitle}>This helps us tailor your workout intensity and diet.</Text>
        </View>

        <View style={styles.list}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.optionCard, isSelected && styles.optionCardActive]}
                onPress={() => setSelectedGoal(goal.id)}
              >
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>{goal.title}</Text>
                <Text style={styles.optionDescription}>{goal.description}</Text>
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
