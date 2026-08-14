import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  ImageBackground, Dimensions, StatusBar,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const BMI_BG = require('../../assets/BMi background.webp');

export default function OnboardingScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [heightVal, setHeightVal] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          // We removed the auto-resume redirect logic here because it breaks the back button.
          // If a user clicks back to fix a mistake, we want them to stay on the screen they navigated to.
          // Their data will still be pre-populated below so they can quickly click Next.

          // Pre-populate fields from saved profile data
          // Fallback to auth metadata for name if not in profiles table
          const savedName = data.name || user.user_metadata?.full_name || '';
          if (savedName) setName(savedName);
          if (data.gender) setGender(data.gender);
          if (data.age) setAge(data.age.toString());
          if (data.height) setHeightVal(data.height.toString());
          if (data.weight) setWeight(data.weight.toString());
        } else {
          // No profile row yet — try auth metadata for name
          const metaName = user.user_metadata?.full_name || '';
          if (metaName) setName(metaName);
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleNext = async () => {
    if (!name || !gender || !age || !heightVal || !weight) {
      Alert.alert('Missing Fields', 'Please fill out all fields to continue.');
      return;
    }

    if (!user) {
      Alert.alert('Session Error', 'Not logged in. Please restart the app.');
      return;
    }

    setLoading(true);

    try {
      const h = parseFloat(heightVal);
      const w = parseFloat(weight);
      const bmi = w / ((h / 100) * (h / 100));

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name, gender, age: parseInt(age), height: h, weight: w, bmi });

      if (error) {
        console.error('[Onboarding] Profile save failed:', error.message);
        Alert.alert('Save Failed', 'Could not save your profile. Please check your connection and try again.\n\nError: ' + error.message);
        setLoading(false);
        return;
      }

      // Verify save succeeded
      const { data: verify } = await supabase
        .from('profiles')
        .select('name, bmi')
        .eq('id', user.id)
        .single();

      if (!verify?.bmi) {
        console.error('[Onboarding] Save verification failed — bmi not found after save');
        Alert.alert('Save Failed', 'Your data did not save properly. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[Onboarding] Profile saved successfully:', { name: verify.name, bmi: verify.bmi });
      setLoading(false);
      router.push('/(onboarding)/goal');
    } catch (err: any) {
      console.error('[Onboarding] Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };


  // Live BMI
  const h = parseFloat(heightVal);
  const w = parseFloat(weight);
  const liveBmi = h > 0 && w > 0 ? w / ((h / 100) * (h / 100)) : null;
  let bmiCategory = '';
  let bmiColor = '#9CA3AF';
  if (liveBmi) {
    if (liveBmi < 18.5) { bmiCategory = 'Underweight'; bmiColor = '#60A5FA'; }
    else if (liveBmi <= 24.9) { bmiCategory = 'Normal'; bmiColor = '#22C55E'; }
    else if (liveBmi <= 29.9) { bmiCategory = 'Overweight'; bmiColor = '#F59E0B'; }
    else { bmiCategory = 'Obese'; bmiColor = '#EF4444'; }
  }

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Full-screen background */}
      <ImageBackground
        source={BMI_BG}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* Gradient overlay — transparent top, dark bottom so form is readable */}
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(8,9,12,0.70)', 'rgba(8,9,12,0.97)']}
          locations={[0, 0.42, 0.72]}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavFlex}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero top — image shows here */}
            <View style={styles.heroSpace}>
              <View style={styles.badgeRow}>
                <Activity size={18} color="#ccff00" />
                <Text style={styles.badgeText}>FIT FORGE</Text>
              </View>
              <Text style={styles.heroTitle}>Build Your{'\n'}Profile</Text>
              <Text style={styles.heroSub}>Your biometrics fuel your personalized plan.</Text>
            </View>

            {/* Glassmorphism form card */}
            <View style={styles.card}>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>GENDER</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                    onPress={() => setGender('male')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>♂  Male</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                    onPress={() => setGender('female')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>♀  Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>AGE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  maxLength={3}
                />
              </View>

              {/* Height + Weight side by side */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>HEIGHT (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={heightVal}
                    onChangeText={setHeightVal}
                    maxLength={3}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>WEIGHT (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Live BMI chip */}
              {liveBmi && (
                <View style={[styles.bmiChip, { borderColor: bmiColor + '60' }]}>
                  <View>
                    <Text style={styles.bmiChipLabel}>LIVE BMI</Text>
                    <Text style={[styles.bmiChipValue, { color: bmiColor }]}>{liveBmi.toFixed(1)}</Text>
                  </View>
                  <View style={[styles.bmiChipBadge, { backgroundColor: bmiColor + '20', borderColor: bmiColor + '50' }]}>
                    <Text style={[styles.bmiChipBadgeText, { color: bmiColor }]}>{bmiCategory}</Text>
                  </View>
                </View>
              )}

              {/* CTA */}
              <TouchableOpacity
                style={[styles.btn, loading && { opacity: 0.7 }]}
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#d4ff00', '#99cc00']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.btnGrad}
                >
                  <Text style={styles.btnText}>{loading ? 'SAVING…' : 'NEXT  ➔'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* ───── Footer ───── */}
            <View style={styles.footer}>
              {/* Divider */}
              <View style={styles.footerDivider} />

              {/* Motivational quote */}
              <Text style={styles.footerQuote}>
                "The body achieves what the mind believes."
              </Text>
              <Text style={styles.footerQuoteAttr}>— Napoleon Hill</Text>

              {/* About pills */}
              <View style={styles.footerPills}>
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>🔒</Text>
                  <Text style={styles.pillText}>100% Private</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>🧬</Text>
                  <Text style={styles.pillText}>Science-Backed</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>⚡</Text>
                  <Text style={styles.pillText}>Personalized</Text>
                </View>
              </View>

              {/* About line */}
              <Text style={styles.footerAbout}>
                FIT FORGE uses your biometrics — BMI, BMR & TDEE — to craft
                a workout and nutrition plan built specifically for you.
                No generic plans. No guesswork.
              </Text>

              {/* Copyright */}
              <Text style={styles.footerCopy}>© 2025 FIT FORGE. All rights reserved.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  bgImage: {
    width,
    height,
    flex: 1,
  },
  kavFlex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },

  // Hero area at top (shows the background image)
  heroSpace: {
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  badgeText: {
    color: '#ccff00',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2.5,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 52,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
  },

  // Form card
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(22, 25, 33, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    gap: 20,
  },

  row: { flexDirection: 'row' },

  inputGroup: { gap: 8 },

  label: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },

  // Gender
  genderBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(204,255,0,0.12)',
    borderColor: '#ccff00',
  },
  genderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#ccff00',
    fontWeight: '800',
  },

  // BMI chip
  bmiChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bmiChipLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  bmiChipValue: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  bmiChipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  bmiChipBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Button
  btn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  btnGrad: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ── Footer ──
  footer: {
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  footerDivider: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 4,
  },
  footerQuote: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  footerQuoteAttr: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -8,
  },
  footerPills: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillIcon: {
    fontSize: 13,
  },
  pillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  footerAbout: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  footerCopy: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
