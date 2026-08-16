import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import { OnboardingFooter } from '../../components/OnboardingFooter';

const EQUIPMENT_OPTIONS = [
  { id: 'none',      title: 'No equipment',    description: 'Bodyweight only' },
  { id: 'dumbbells', title: 'Dumbbells',        description: 'Light or heavy dumbbells' },
  { id: 'bands',     title: 'Resistance bands', description: 'Loops or handled bands' },
  { id: 'pullup_bar',title: 'Pull-up bar',      description: 'Doorway or mounted' },
  { id: 'full_gym',  title: 'Full home gym',    description: 'Bench, rack, barbells' },
];

export default function EquipmentScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [trainingLocation, setTrainingLocation] = useState<string>('home');
  const [limitations, setLimitations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Pre-populate from saved profile
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('equipment, training_location, limitations').eq('id', user.id).single();
      if (data) {
        if (data.equipment && Array.isArray(data.equipment)) setSelectedEquipment(data.equipment);
        if (data.training_location) setTrainingLocation(data.training_location);
        if (data.limitations && Array.isArray(data.limitations)) setLimitations(data.limitations);
      }
    }
    loadSaved();
  }, [user]);

  const toggleEquipment = (id: string) => {
    if (id === 'none') { setSelectedEquipment(['none']); return; }
    let next = selectedEquipment.filter((i) => i !== 'none');
    if (next.includes(id)) next = next.filter((i) => i !== id);
    else next.push(id);
    setSelectedEquipment(next);
  };

  const toggleLimitation = (id: string) => {
    if (id === 'none') { setLimitations(['none']); return; }
    let next = limitations.filter((i) => i !== 'none');
    if (next.includes(id)) next = next.filter((i) => i !== id);
    else next.push(id);
    setLimitations(next);
  };

  const handleNext = async () => {
    if (selectedEquipment.length === 0) {
      Alert.alert('Select Equipment', 'Please select at least one option.');
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
        .update({ 
          equipment: selectedEquipment,
          training_location: trainingLocation,
          limitations: limitations
        })
        .eq('id', user.id);
      if (error) {
        console.error('[Equipment] Save failed:', error.message);
        Alert.alert('Save Failed', 'Could not save your equipment. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/(onboarding)/schedule');
    } catch (err) {
      console.error('[Equipment] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Location</Text>
          <View style={styles.grid}>
            {['Home', 'Gym', 'Both'].map((loc) => {
              const id = loc.toLowerCase();
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.chip, trainingLocation === id && styles.chipActive]}
                  onPress={() => setTrainingLocation(id)}
                >
                  <Text style={[styles.chipText, trainingLocation === id && styles.chipTextActive]}>{loc}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.header}>
          <Dumbbell size={32} color="#ccff00" />
          <Text style={styles.title}>What's available?</Text>
          <Text style={styles.subtitle}>Select equipment available to you.</Text>
        </View>

        <View style={styles.list}>
          {EQUIPMENT_OPTIONS.map((equipment) => {
            const isSelected = selectedEquipment.includes(equipment.id);
            return (
              <TouchableOpacity
                key={equipment.id}
                style={[styles.optionCard, isSelected && styles.optionCardActive]}
                onPress={() => toggleEquipment(equipment.id)}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <View style={styles.checkboxInner} />}
                  </View>
                  <View>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>{equipment.title}</Text>
                    <Text style={styles.optionDescription}>{equipment.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Limitations</Text>
          <View style={styles.grid}>
            {['None', 'Wrist', 'Shoulder', 'Knee', 'Back', 'Other'].map((lim) => {
              const id = lim.toLowerCase();
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.chip, limitations.includes(id) && styles.chipActive]}
                  onPress={() => toggleLimitation(id)}
                >
                  <Text style={[styles.chipText, limitations.includes(id) && styles.chipTextActive]}>{lim}</Text>
                </TouchableOpacity>
              )
            })}
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
  list: { gap: 12, marginBottom: 32 },
  optionCard: { backgroundColor: '#161921', borderWidth: 1, borderColor: '#2D3748', borderRadius: 12, padding: 16 },
  optionCardActive: { backgroundColor: 'rgba(204,255,0,0.05)', borderColor: '#ccff00' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#4A5568', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: '#ccff00' },
  checkboxInner: { width: 12, height: 12, borderRadius: 3, backgroundColor: '#ccff00' },
  optionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  optionTitleActive: { color: '#ccff00' },
  optionDescription: { color: '#9CA3AF', fontSize: 13 },
  button: { backgroundColor: '#ccff00', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#161921', borderWidth: 1, borderColor: '#2D3748', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 },
  chipActive: { backgroundColor: 'rgba(204,255,0,0.05)', borderColor: '#ccff00' },
  chipText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  chipTextActive: { color: '#ccff00' },
});
