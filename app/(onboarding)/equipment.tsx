import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ImageBackground, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const EQUIPMENT_OPTIONS = [
  { id: 'none',       title: 'No Equipment',    emoji: '🤸', description: 'Bodyweight only' },
  { id: 'dumbbells',  title: 'Dumbbells',        emoji: '🏋️', description: 'Light or heavy dumbbells' },
  { id: 'bands',      title: 'Resistance Bands', emoji: '🔁', description: 'Loops or handled bands' },
  { id: 'pullup_bar', title: 'Pull-up Bar',      emoji: '🔩', description: 'Doorway or mounted' },
  { id: 'full_gym',   title: 'Full Home Gym',    emoji: '🏟️', description: 'Bench, rack, barbells' },
];

const LOCATION_OPTIONS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'gym',  label: 'Gym',  emoji: '🏢' },
  { id: 'both', label: 'Both', emoji: '🔄' },
];

const LIMITATION_OPTIONS = ['None', 'Wrist', 'Shoulder', 'Knee', 'Back', 'Other'];

export default function EquipmentScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [trainingLocation, setTrainingLocation] = useState<string>('home');
  const [limitations, setLimitations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('equipment, training_location, limitations')
        .eq('id', user.id)
        .single();
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
          limitations,
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
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/what_availabel_img.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(8,9,12,0.70)', 'rgba(8,9,12,0.97)']}
          locations={[0, 0.42, 0.72]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.heroSpace}>
            <View style={styles.badgeRow}>
              <Dumbbell size={18} color="#ccff00" />
              <Text style={styles.badgeText}>FIT FORGE</Text>
            </View>
            <Text style={styles.heroTitle}>What's{'\n'}Available?</Text>
            <Text style={styles.heroSub}>Tell us your setup — we'll build around what you have.</Text>
          </View>

          {/* Glass card */}
          <View style={styles.card}>

            {/* Training Location */}
            <View style={styles.section}>
              <Text style={styles.cardLabel}>TRAINING LOCATION</Text>
              <View style={styles.locationRow}>
                {LOCATION_OPTIONS.map((loc) => {
                  const isSelected = trainingLocation === loc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      style={[styles.locationBtn, isSelected && styles.locationBtnActive]}
                      onPress={() => setTrainingLocation(loc.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.locationEmoji}>{loc.emoji}</Text>
                      <Text style={[styles.locationText, isSelected && styles.locationTextActive]}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Equipment */}
            <View style={styles.section}>
              <Text style={styles.cardLabel}>AVAILABLE EQUIPMENT</Text>
              <View style={styles.list}>
                {EQUIPMENT_OPTIONS.map((eq) => {
                  const isSelected = selectedEquipment.includes(eq.id);
                  return (
                    <TouchableOpacity
                      key={eq.id}
                      style={[styles.optionCard, isSelected && styles.optionCardActive]}
                      onPress={() => toggleEquipment(eq.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                          {isSelected && <View style={styles.checkboxInner} />}
                        </View>
                        <Text style={styles.optionEmoji}>{eq.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                            {eq.title}
                          </Text>
                          <Text style={styles.optionDescription}>{eq.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Limitations */}
            <View style={styles.section}>
              <Text style={styles.cardLabel}>PHYSICAL LIMITATIONS</Text>
              <View style={styles.grid}>
                {LIMITATION_OPTIONS.map((lim) => {
                  const id = lim.toLowerCase();
                  const isSelected = limitations.includes(id);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleLimitation(id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{lim}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#d4ff00', '#ccff00', '#aadd00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGrad}
              >
                <Text style={styles.buttonText}>{loading ? 'SAVING...' : 'NEXT ➔'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ───── Footer ───── */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerQuote}>
              "The groundwork of all happiness is health."
            </Text>
            <Text style={styles.footerQuoteAttr}>— Leigh Hunt</Text>
            <View style={styles.footerPills}>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🏠</Text>
                <Text style={styles.pillText}>Any Setup</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🔧</Text>
                <Text style={styles.pillText}>Adaptive Plans</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>⚡</Text>
                <Text style={styles.pillText}>Zero Waste</Text>
              </View>
            </View>
            <Text style={styles.footerAbout}>
              FIT FORGE works with whatever you have — from a living room floor
              to a fully equipped gym.
            </Text>
            <Text style={styles.footerCopy}>© 2025 FIT FORGE. All rights reserved.</Text>
          </View>

        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  bgImage: { width, height, flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 32 },

  heroSpace: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 32 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  badgeText: { color: '#ccff00', fontWeight: '800', fontSize: 13, letterSpacing: 2.5 },
  heroTitle: {
    fontSize: 48, fontWeight: '900', color: '#FFFFFF', lineHeight: 52, marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },

  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(22, 25, 33, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    gap: 24,
  },
  section: { gap: 12 },
  cardLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  locationRow: { flexDirection: 'row', gap: 10 },
  locationBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', gap: 6,
  },
  locationBtnActive: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  locationEmoji: { fontSize: 20 },
  locationText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  locationTextActive: { color: '#ccff00' },

  list: { gap: 10 },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 14,
  },
  optionCardActive: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { borderColor: '#ccff00' },
  checkboxInner: { width: 11, height: 11, borderRadius: 3, backgroundColor: '#ccff00' },
  optionEmoji: { fontSize: 22 },
  optionTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  optionTitleActive: { color: '#ccff00' },
  optionDescription: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
  },
  chipActive: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#ccff00' },

  button: { borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  btnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  footer: { marginHorizontal: 16, marginTop: 28, marginBottom: 40, alignItems: 'center', gap: 16 },
  footerDivider: { width: '40%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 4 },
  footerQuote: {
    color: 'rgba(255,255,255,0.75)', fontSize: 15, fontStyle: 'italic',
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 16,
  },
  footerQuoteAttr: { color: '#ccff00', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: -8 },
  footerPills: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  pillIcon: { fontSize: 13 },
  pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  footerAbout: {
    color: 'rgba(255,255,255,0.38)', fontSize: 12,
    textAlign: 'center', lineHeight: 19, paddingHorizontal: 8,
  },
  footerCopy: { color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 0.5, marginTop: 4 },
});
