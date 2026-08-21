import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ImageBackground, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner',
    emoji: '🌱',
    description: 'New to fitness or returning after a long break.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    emoji: '💪',
    description: 'Train regularly and know the basics well.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    emoji: '🔥',
    description: 'Training consistently for years.',
  },
];

export default function FitnessLevelScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/describe your fitness_img.png')}
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
              <TrendingUp size={18} color="#ccff00" />
              <Text style={styles.badgeText}>FIT FORGE</Text>
            </View>
            <Text style={styles.heroTitle}>Describe Your{'\n'}Fitness</Text>
            <Text style={styles.heroSub}>Be honest — we scale every workout to match your level.</Text>
          </View>

          {/* Glassmorphism card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SELECT YOUR FITNESS LEVEL</Text>

            <View style={styles.list}>
              {LEVELS.map((level) => {
                const isSelected = selectedLevel === level.id;
                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => setSelectedLevel(level.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionRow}>
                      <Text style={styles.optionEmoji}>{level.emoji}</Text>
                      <View style={styles.optionText}>
                        <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                          {level.title}
                        </Text>
                        <Text style={styles.optionDescription}>{level.description}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
              "Take care of your body. It's the only place you have to live."
            </Text>
            <Text style={styles.footerQuoteAttr}>— Jim Rohn</Text>

            <View style={styles.footerPills}>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>📈</Text>
                <Text style={styles.pillText}>Progressive</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🧬</Text>
                <Text style={styles.pillText}>Science-Backed</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>⚡</Text>
                <Text style={styles.pillText}>Adaptive</Text>
              </View>
            </View>

            <Text style={styles.footerAbout}>
              FIT FORGE scales every workout to your fitness level — so you're always
              challenged but never overwhelmed.
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
    gap: 16,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  list: { gap: 10 },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionCardActive: {
    backgroundColor: 'rgba(204,255,0,0.1)',
    borderColor: '#ccff00',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionEmoji: { fontSize: 28 },
  optionText: { flex: 1 },
  optionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  optionTitleActive: { color: '#ccff00' },
  optionDescription: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

  button: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
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
