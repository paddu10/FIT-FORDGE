import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ImageBackground, Dimensions, StatusBar,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Utensils } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const DIETS = [
  { id: 'vegetarian',     title: 'Vegetarian',      emoji: '🥗' },
  { id: 'eggetarian',     title: 'Eggetarian',      emoji: '🍳' },
  { id: 'non_vegetarian', title: 'Non-vegetarian',  emoji: '🥩' },
];

export default function DietScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [diet, setDiet] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('diet_preference, allergies')
        .eq('id', user.id)
        .single();
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
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/Dietplan_img.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(8,9,12,0.70)', 'rgba(8,9,12,0.97)']}
          locations={[0, 0.42, 0.72]}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.kavFlex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero */}
            <View style={styles.heroSpace}>
              <View style={styles.badgeRow}>
                <Utensils size={18} color="#ccff00" />
                <Text style={styles.badgeText}>FIT FORGE</Text>
              </View>
              <Text style={styles.heroTitle}>What's Your{'\n'}Diet?</Text>
              <Text style={styles.heroSub}>We'll personalize your daily meal plan to match.</Text>
            </View>

            {/* Glass card */}
            <View style={styles.card}>

              <View style={styles.section}>
                <Text style={styles.cardLabel}>DIET PREFERENCE</Text>
                <View style={styles.list}>
                  {DIETS.map((d) => {
                    const isSelected = diet === d.id;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        style={[styles.dietButton, isSelected && styles.activeButton]}
                        onPress={() => setDiet(d.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dietEmoji}>{d.emoji}</Text>
                        <Text style={[styles.dietLabel, isSelected && styles.activeLabel]}>{d.title}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.cardLabel}>FOOD ALLERGIES & RESTRICTIONS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E.g. Peanuts, lactose intolerance..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={allergies}
                  onChangeText={setAllergies}
                  multiline
                  numberOfLines={3}
                />
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
                "You can't out-train a bad diet."
              </Text>
              <Text style={styles.footerQuoteAttr}>— Unknown</Text>

              <View style={styles.footerPills}>
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>🍎</Text>
                  <Text style={styles.pillText}>Nutritious</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>📊</Text>
                  <Text style={styles.pillText}>Macro-Focused</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>⚡</Text>
                  <Text style={styles.pillText}>Fueling</Text>
                </View>
              </View>

              <Text style={styles.footerAbout}>
                Nutrition is 80% of the battle. FIT FORGE builds meals that match your
                dietary needs and fuel your performance.
              </Text>

              <Text style={styles.footerCopy}>© 2025 FIT FORGE. All rights reserved.</Text>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  bgImage: { width, height, flex: 1 },
  kavFlex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 32 },

  // Hero
  heroSpace: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 32 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  badgeText: { color: '#ccff00', fontWeight: '800', fontSize: 13, letterSpacing: 2.5 },
  heroTitle: {
    fontSize: 48, fontWeight: '900', color: '#FFFFFF', lineHeight: 52, marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },

  // Glass card
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
  cardLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Diet List
  list: { gap: 10 },
  dietButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dietEmoji: { fontSize: 20 },
  dietLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' },
  activeButton: { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: '#ccff00' },
  activeLabel: { color: '#ccff00', fontWeight: 'bold' },

  // Text Input
  input: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    color: '#FFFFFF', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    fontSize: 15, 
    minHeight: 100, 
    textAlignVertical: 'top' 
  },

  // Button
  button: { borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  btnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Footer
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
