import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Scale, Ruler, CheckCircle, RefreshCw } from 'lucide-react-native';

function calcBmi(weightKg: number, heightCm: number): number {
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
}

function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60A5FA' };
  if (bmi <= 24.9) return { label: 'Normal', color: '#22C55E' };
  if (bmi <= 29.9) return { label: 'Overweight', color: '#F59E0B' };
  return { label: 'Obese', color: '#EF4444' };
}

function calcBmr(weightKg: number, heightCm: number, age: number, gender: string): number {
  // Mifflin-St Jeor
  if (gender === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  beginner: 1.375,
  intermediate: 1.55,
  advanced: 1.725,
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Loaded from DB (read-only context)
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [goal, setGoal] = useState('');

  // Editable fields
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Live preview derived values
  const wNum = parseFloat(weight);
  const hNum = parseFloat(height);
  const validInputs = !isNaN(wNum) && !isNaN(hNum) && wNum > 0 && hNum > 0;
  const previewBmi = validInputs ? calcBmi(wNum, hNum) : null;
  const previewBmiCat = previewBmi ? getBmiCategory(previewBmi) : null;
  const previewBmr = validInputs ? calcBmr(wNum, hNum, age, gender) : null;
  const multiplier = ACTIVITY_MULTIPLIERS[fitnessLevel] ?? 1.375;
  const previewTdee = previewBmr ? previewBmr * multiplier : null;

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('weight, height, age, gender, fitness_level, goal, protein_target, calorie_target')
        .eq('id', user.id)
        .single();

      if (data) {
        setWeight(data.weight?.toString() ?? '');
        setHeight(data.height?.toString() ?? '');
        setAge(data.age ?? 25);
        setGender(data.gender ?? 'male');
        setFitnessLevel(data.fitness_level ?? 'beginner');
        setGoal(data.goal ?? '');
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async () => {
    if (!validInputs) {
      Alert.alert('Invalid Input', 'Please enter valid weight and height values.');
      return;
    }
    if (wNum < 20 || wNum > 300) {
      Alert.alert('Invalid Weight', 'Weight must be between 20 and 300 kg.');
      return;
    }
    if (hNum < 50 || hNum > 280) {
      Alert.alert('Invalid Height', 'Height must be between 50 and 280 cm.');
      return;
    }

    setSaving(true);
    const newBmi = parseFloat(calcBmi(wNum, hNum).toFixed(1));
    const newBmr = parseFloat(calcBmr(wNum, hNum, age, gender).toFixed(0));
    const newTdee = parseFloat((newBmr * multiplier).toFixed(0));

    // Recalculate targets based on goal
    let newCalorieTarget: number;
    let newProteinTarget: number;
    if (goal === 'lose_weight') {
      newCalorieTarget = Math.round(newTdee - 500);
      newProteinTarget = Math.round(wNum * 2.0);
    } else if (goal === 'build_muscle') {
      newCalorieTarget = Math.round(newTdee + 300);
      newProteinTarget = Math.round(wNum * 2.2);
    } else if (goal === 'get_stronger') {
      newCalorieTarget = Math.round(newTdee + 200);
      newProteinTarget = Math.round(wNum * 2.1);
    } else {
      newCalorieTarget = Math.round(newTdee);
      newProteinTarget = Math.round(wNum * 1.8);
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        weight: wNum,
        height: hNum,
        bmi: newBmi,
        bmr: newBmr,
        tdee: newTdee,
        calorie_target: newCalorieTarget,
        protein_target: newProteinTarget,
      })
      .eq('id', user!.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } else {
      Alert.alert('Saved!', 'Your stats and targets have been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Body Stats</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Update your measurements to keep BMI, BMR, and calorie targets accurate.
          </Text>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Scale size={18} color="#ccff00" />
              <Text style={styles.inputLabel}>Weight</Text>
              <Text style={styles.inputUnit}>kg</Text>
            </View>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 75"
              placeholderTextColor="#4B5563"
              maxLength={6}
            />
          </View>

          {/* Height Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Ruler size={18} color="#ccff00" />
              <Text style={styles.inputLabel}>Height</Text>
              <Text style={styles.inputUnit}>cm</Text>
            </View>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 175"
              placeholderTextColor="#4B5563"
              maxLength={6}
            />
          </View>

          {/* Live Preview */}
          {validInputs && previewBmi !== null && previewBmiCat && (
            <View style={[styles.previewCard, { borderColor: previewBmiCat.color + '50' }]}>
              <View style={styles.previewHeader}>
                <RefreshCw size={13} color="#9CA3AF" />
                <Text style={styles.previewHeaderText}>LIVE PREVIEW</Text>
              </View>
              <View style={styles.previewRow}>
                {/* BMI column */}
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatLabel}>BMI</Text>
                  <Text style={[styles.previewBigValue, { color: previewBmiCat.color }]}>
                    {previewBmi.toFixed(1)}
                  </Text>
                  <View style={[styles.badgePill, { backgroundColor: previewBmiCat.color + '20', borderColor: previewBmiCat.color + '40' }]}>
                    <Text style={[styles.badgePillText, { color: previewBmiCat.color }]}>{previewBmiCat.label}</Text>
                  </View>
                </View>

                <View style={styles.previewDivider} />

                {/* BMR / TDEE column */}
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatLabel}>BMR</Text>
                  <Text style={styles.previewSmallValue}>{Math.round(previewBmr!)} <Text style={styles.previewUnit}>kcal</Text></Text>
                  <View style={{ height: 10 }} />
                  <Text style={styles.previewStatLabel}>TDEE</Text>
                  <Text style={styles.previewSmallValue}>{Math.round(previewTdee!)} <Text style={styles.previewUnit}>kcal</Text></Text>
                </View>
              </View>
            </View>
          )}

          {/* Tip */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Calorie &amp; protein targets are automatically recalculated from your goal and new measurements when you save.
            </Text>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, (!validInputs || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!validInputs || saving}
          >
            {saving ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <>
                <CheckCircle size={20} color="#000000" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C' },
  center: { justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2430',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#161921',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  scroll: { padding: 20, paddingBottom: 60 },
  subtitle: {
    color: '#9CA3AF', fontSize: 14, lineHeight: 21,
    marginBottom: 28, textAlign: 'center',
  },

  inputGroup: { marginBottom: 20 },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  inputLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flex: 1 },
  inputUnit: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#161921',
    borderWidth: 1, borderColor: '#2D3748',
    borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 16,
    color: '#FFFFFF', fontSize: 24, fontWeight: '800',
  },

  previewCard: {
    backgroundColor: '#161921',
    borderRadius: 20, borderWidth: 1,
    padding: 20, marginBottom: 20, marginTop: 4,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  previewHeaderText: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.2 },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewStat: { flex: 1, alignItems: 'center', gap: 4 },
  previewStatLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  previewBigValue: { fontSize: 48, fontWeight: '900', lineHeight: 54 },
  previewSmallValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  previewUnit: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  previewDivider: { width: 1, height: 90, backgroundColor: '#2D3748', marginHorizontal: 16 },
  badgePill: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, marginTop: 6,
  },
  badgePillText: { fontSize: 12, fontWeight: 'bold' },

  infoBox: {
    backgroundColor: 'rgba(204,255,0,0.05)',
    borderWidth: 1, borderColor: 'rgba(204,255,0,0.15)',
    borderRadius: 12, padding: 14, marginBottom: 28,
  },
  infoText: { color: '#9CA3AF', fontSize: 13, lineHeight: 20 },

  saveBtn: {
    backgroundColor: '#ccff00',
    borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 10,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#000000', fontWeight: '900', fontSize: 16 },
});
