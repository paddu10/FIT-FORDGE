import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';
import { OnboardingFooter } from '../../components/OnboardingFooter';

const PUSHUP_LEVELS = [
  { id: '0-5', title: '0-5', description: 'Still learning the movement.' },
  { id: '6-15', title: '6-15', description: 'Can do a few solid reps.' },
  { id: '16-30', title: '16-30', description: 'Good base strength.' },
  { id: '31-50', title: '31-50', description: 'Advanced push strength.' },
  { id: '50+', title: '50+', description: 'Elite pushing endurance.' },
];

const PULLUP_LEVELS = [
  { id: '0', title: '0', description: 'Cannot perform one yet.' },
  { id: '1-3', title: '1-3', description: 'Just getting started.' },
  { id: '4-8', title: '4-8', description: 'Can do a few solid reps.' },
  { id: '9-15', title: '9-15', description: 'Good pulling strength.' },
  { id: '15+', title: '15+', description: 'Advanced pulling strength.' },
];

const PLANK_LEVELS = [
  { id: '<30s', title: '< 30 sec', description: 'Building core stability.' },
  { id: '30-60s', title: '30-60 sec', description: 'Average core strength.' },
  { id: '1-2m', title: '1-2 min', description: 'Solid core endurance.' },
  { id: '2m+', title: '2+ min', description: 'Advanced core stability.' },
];

export default function AbilitiesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [pushUp, setPushUp] = useState('');
  const [pullUp, setPullUp] = useState('');
  const [plank, setPlank] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('push_up_ability, pull_up_ability, plank_ability').eq('id', user.id).single();
      if (data) {
        if (data.push_up_ability) setPushUp(data.push_up_ability);
        if (data.pull_up_ability) setPullUp(data.pull_up_ability);
        if (data.plank_ability) setPlank(data.plank_ability);
      }
    }
    loadSaved();
  }, [user]);

  const handleNext = async () => {
    if (!pushUp || !pullUp || !plank) {
      Alert.alert('Incomplete', 'Please select your ability level for all three exercises.');
      return;
    }
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_up_ability: pushUp,
          pull_up_ability: pullUp,
          plank_ability: plank
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setLoading(false);
      router.push('/(onboarding)/equipment');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save abilities.');
      setLoading(false);
    }
  };

  const renderSection = (title: string, options: any[], selected: string, setSelected: (val: string) => void) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, selected === opt.id && styles.chipActive]}
            onPress={() => setSelected(opt.id)}
          >
            <Text style={[styles.chipText, selected === opt.id && styles.chipTextActive]}>{opt.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Activity size={32} color="#ccff00" />
          <Text style={styles.title}>What's your current baseline?</Text>
          <Text style={styles.subtitle}>This helps us build your calisthenics progression path.</Text>
        </View>

        {renderSection('Unbroken Push-ups', PUSHUP_LEVELS, pushUp, setPushUp)}
        {renderSection('Unbroken Pull-ups', PULLUP_LEVELS, pullUp, setPullUp)}
        {renderSection('Max Plank Hold', PLANK_LEVELS, plank, setPlank)}

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
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#161921', borderWidth: 1, borderColor: '#2D3748', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 },
  chipActive: { backgroundColor: 'rgba(204,255,0,0.05)', borderColor: '#ccff00' },
  chipText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  chipTextActive: { color: '#ccff00' },
  button: { backgroundColor: '#ccff00', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});
