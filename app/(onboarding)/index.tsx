import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';

export default function OnboardingScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing profile data if any
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          if (data.name) setName(data.name);
          if (data.gender) setGender(data.gender);
          if (data.age) setAge(data.age.toString());
          if (data.height) setHeight(data.height.toString());
          if (data.weight) setWeight(data.weight.toString());
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleNext = async () => {
    if (!name || !gender || !age || !height || !weight) {
      Alert.alert('Missing Fields', 'Please fill out all fields to continue.');
      return;
    }

    setLoading(true);
    
    if (user) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const heightInMeters = h / 100;
      const bmi = w / (heightInMeters * heightInMeters);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: name,
          gender: gender,
          age: parseInt(age),
          height: h,
          weight: w,
          bmi: bmi,
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.push('/(onboarding)/goal');
      }
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Activity size={32} color="#ccff00" />
            <Text style={styles.title}>Let's Build Your Profile</Text>
            <Text style={styles.subtitle}>Enter your biometrics to generate personalized exercise plans.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]} 
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Male</Text>
                </TouchableOpacity>
                <View style={{width: 12}} />
                <TouchableOpacity 
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]} 
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="180"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  maxLength={3}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="75"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  maxLength={3}
                />
              </View>
            </View>
          </View>

          {/* Live BMI Preview */}
          {(() => {
            const h = parseFloat(height);
            const w = parseFloat(weight);
            if (!h || !w || h <= 0 || w <= 0) return null;
            const hM = h / 100;
            const bmi = w / (hM * hM);
            let category = '';
            let color = '#9CA3AF';
            if (bmi < 18.5) { category = 'Underweight'; color = '#60A5FA'; }
            else if (bmi <= 24.9) { category = 'Normal'; color = '#22C55E'; }
            else if (bmi <= 29.9) { category = 'Overweight'; color = '#F59E0B'; }
            else { category = 'Obese'; color = '#EF4444'; }
            return (
              <View style={[styles.bmiPreview, { borderColor: color + '50' }]}>
                <View>
                  <Text style={styles.bmiPreviewLabel}>YOUR BMI</Text>
                  <Text style={[styles.bmiPreviewValue, { color }]}>{bmi.toFixed(1)}</Text>
                </View>
                <View style={[styles.bmiPreviewBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                  <Text style={[styles.bmiPreviewBadgeText, { color }]}>{category}</Text>
                </View>
              </View>
            );
          })()}

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  keyboardView: {
    flex: 1,
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
  form: {
    gap: 20,
    backgroundColor: '#161921',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0F1115',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2430',
    color: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
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
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#1E2430',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderColor: '#ccff00',
  },
  genderText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#ccff00',
    fontWeight: 'bold',
  },
  bmiPreview: {
    backgroundColor: '#161921',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiPreviewLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  bmiPreviewValue: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },
  bmiPreviewBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  bmiPreviewBadgeText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
