import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';

const EQUIPMENT_OPTIONS = [
  { id: 'none', title: 'No equipment', description: 'Bodyweight only' },
  { id: 'dumbbells', title: 'Dumbbells', description: 'Light or heavy dumbbells' },
  { id: 'bands', title: 'Resistance bands', description: 'Loops or handled bands' },
  { id: 'pullup_bar', title: 'Pull-up bar', description: 'Doorway or mounted' },
  { id: 'full_gym', title: 'Full home gym', description: 'Bench, rack, barbells' }
];

export default function EquipmentScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleEquipment = (id: string) => {
    if (id === 'none') {
      setSelectedEquipment(['none']);
      return;
    }
    
    let newSelection = [...selectedEquipment];
    
    // If 'none' was selected, remove it since they are selecting actual equipment
    newSelection = newSelection.filter(item => item !== 'none');
    
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(item => item !== id);
    } else {
      newSelection.push(id);
    }
    
    setSelectedEquipment(newSelection);
  };

  const handleNext = async () => {
    if (selectedEquipment.length === 0) {
      Alert.alert('Select Equipment', 'Please select at least one option. Choose "No equipment" if you don\'t have any.');
      return;
    }

    setLoading(true);
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          equipment: selectedEquipment
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.push('/(onboarding)/schedule');
      }
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Dumbbell size={32} color="#ccff00" />
          <Text style={styles.title}>What's available at home?</Text>
          <Text style={styles.subtitle}>Select all that apply.</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
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
  list: {
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: '#161921',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
  },
  optionCardActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
    borderColor: '#ccff00',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#ccff00',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#ccff00',
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#ccff00',
  },
  optionDescription: {
    color: '#9CA3AF',
    fontSize: 13,
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
  }
});
