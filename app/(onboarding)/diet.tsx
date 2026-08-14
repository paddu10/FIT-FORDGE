import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Utensils } from 'lucide-react-native';
import { OnboardingFooter } from '../../components/OnboardingFooter';

const DIETS = [
  { id: 'vegetarian',     title: 'Vegetarian' },
  { id: 'eggetarian',     title: 'Eggetarian' },
  { id: 'non_vegetarian', title: 'Non-vegetarian' },
];

export default function DietScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [diet, setDiet] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-populate from saved profile
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('diet_preference, allergies').eq('id', user.id).single();
      if (data?.diet_preference) setDiet(data.diet_preference);
      if (data?.allergies) setAllergies(data.allergies);
    }
    loadSaved();
  }, [user]);

  const handleNext = async () => {
    if (!diet) {
      Alert.alert('Select Diet', 'Please select your diet preference.');
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
        .update({ diet_preference: diet, allergies })
        .eq('id', user.id);
      if (error) {
        console.error('[Diet] Save failed:', error.message);
        Alert.alert('Save Failed', 'Could not save your diet preferences. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/(onboarding)/complete');
    } catch (err) {
      console.error('[Diet] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Utensils size={32} color="#ccff00" />
            <Text style={styles.title}>What's your diet?</Text>
            <Text style={styles.subtitle}>We'll personalize your daily meal plan.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diet Preference</Text>
              <View style={styles.list}>
                {DIETS.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dietButton, diet === d.id && styles.activeButton]}
                    onPress={() => setDiet(d.id)}
                  >
                    <Text style={[styles.dietLabel, diet === d.id && styles.activeLabel]}>{d.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Allergies & Restrictions (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. Peanuts, lactose intolerance..."
                placeholderTextColor="#64748B"
                value={allergies}
                onChangeText={setAllergies}
                multiline
                numberOfLines={3}
              />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  form: { gap: 24, backgroundColor: '#161921', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#2D3748', marginBottom: 32 },
  inputGroup: { gap: 12 },
  label: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  list: { gap: 8 },
  dietButton: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#1E2430', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  dietLabel: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  activeButton: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  activeLabel: { color: '#ccff00', fontWeight: 'bold' },
  input: { backgroundColor: '#0F1115', borderRadius: 8, borderWidth: 1, borderColor: '#1E2430', color: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#ccff00', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});
