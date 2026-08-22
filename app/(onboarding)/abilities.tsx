import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ImageBackground, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const PUSHUP_LEVELS = [
  { id: '0-5', title: '0–5', description: 'Still learning the movement.' },
  { id: '6-15', title: '6–15', description: 'Can do a few solid reps.' },
  { id: '16-30', title: '16–30', description: 'Good base strength.' },
  { id: '31-50', title: '31–50', description: 'Advanced push strength.' },
  { id: '50+', title: '50+', description: 'Elite pushing endurance.' },
];

const PULLUP_LEVELS = [
  { id: '0', title: '0', description: 'Cannot perform one yet.' },
  { id: '1-3', title: '1–3', description: 'Just getting started.' },
  { id: '4-8', title: '4–8', description: 'Can do a few solid reps.' },
  { id: '9-15', title: '9–15', description: 'Good pulling strength.' },
  { id: '15+', title: '15+', description: 'Advanced pulling strength.' },
];

const PLANK_LEVELS = [
  { id: '<30s', title: '< 30s', description: 'Building core stability.' },
  { id: '30-60s', title: '30–60s', description: 'Average core strength.' },
  { id: '1-2m', title: '1–2 min', description: 'Solid core endurance.' },
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
      const { data } = await supabase
        .from('profiles')
        .select('push_up_ability, pull_up_ability, plank_ability')
        .eq('id', user.id)
        .single();
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
          plank_ability: plank,
        })
        .eq('id', user.id);

      if (error) throw error;

      setLoading(false);
      router.push('/(onboarding)/equipment');
    } catch (err: any) {
      const msg = err?.message ?? JSON.stringify(err);
      console.warn('[abilities] save error:', msg);
      Alert.alert('Error', `Failed to save abilities.\n\n${msg}`);
      setLoading(false);
    }
  };

  const renderSection = (
    title: string,
    options: { id: string; title: string; description: string }[],
    selected: string,
    setSelected: (val: string) => void,
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => setSelected(opt.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {opt.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/current baseline_img.jpg')}
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
          {/* Hero top */}
          <View style={styles.heroSpace}>
            <View style={styles.badgeRow}>
              <Activity size={18} color="#ccff00" />
              <Text style={styles.badgeText}>FIT FORGE</Text>
            </View>
            <Text style={styles.heroTitle}>Current{'\n'}Baseline</Text>
            <Text style={styles.heroSub}>
              Honest answers build the best progression path for you.
            </Text>
          </View>

          {/* Glassmorphism card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>YOUR MOVEMENT BASELINE</Text>

            {renderSection('💪  Unbroken Push-ups', PUSHUP_LEVELS, pushUp, setPushUp)}
            {renderSection('🏋️  Unbroken Pull-ups', PULLUP_LEVELS, pullUp, setPullUp)}
            {renderSection('🧘  Max Plank Hold', PLANK_LEVELS, plank, setPlank)}

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
              "Success starts with self-discipline."
            </Text>
            <Text style={styles.footerQuoteAttr}>Dwayne Johnson</Text>

            <View style={styles.footerPills}>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>💪</Text>
                <Text style={styles.pillText}>Strength-Based</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>📊</Text>
                <Text style={styles.pillText}>Data-Driven</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>⚡</Text>
                <Text style={styles.pillText}>Progressive</Text>
              </View>
            </View>

            <Text style={styles.footerAbout}>
              FIT FORGE uses your baseline to build a smart calisthenics progression
              — no guesswork, just measurable growth.
            </Text>

            <Text style={styles.footerCopy}>© 2025 FIT FORGE. All rights reserved.</Text>
          </View>

        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },

  // Hero
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

  // Glass card
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(22, 25, 33, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    gap: 20,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Sections & chips
  section: { gap: 10 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: 'rgba(204,255,0,0.1)',
    borderColor: '#ccff00',
  },
  chipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: { color: '#ccff00' },

  button: { borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  btnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Footer
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
  pillIcon: { fontSize: 13 },
  pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
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
