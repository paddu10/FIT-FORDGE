import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { generateDailyDiet } from '../../lib/DietEngine';
import { CheckCircle2, Circle, Flame, Droplets, Utensils } from 'lucide-react-native';

export default function DietScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [consumedProtein, setConsumedProtein] = useState(0);

  useEffect(() => {
    async function loadDiet() {
      if (!user) return;
      setLoading(true);

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        const dailyMeals = await generateDailyDiet(user.id);
        setMeals(dailyMeals);
        
        calculateTotals(dailyMeals);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadDiet();
  }, [user]);

  const calculateTotals = (currentMeals: any[]) => {
    let cals = 0;
    let protein = 0;
    currentMeals.forEach(m => {
      if (m.status === 'eaten' && m.food_items) {
        cals += (m.food_items.calories || 0) * (m.quantity || 1);
        protein += (m.food_items.protein || 0) * (m.quantity || 1);
      }
    });
    setConsumedCalories(Math.round(cals));
    setConsumedProtein(Math.round(protein));
  };

  const toggleMeal = async (planId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'eaten' ? 'pending' : 'eaten';
    
    try {
      const { error } = await supabase
        .from('diet_plans')
        .update({ status: newStatus })
        .eq('id', planId);

      if (!error) {
        const updatedMeals = meals.map(m => m.id === planId ? { ...m, status: newStatus } : m);
        setMeals(updatedMeals);
        calculateTotals(updatedMeals);
        
        // Also update task status if all meals eaten
        if (newStatus === 'eaten') {
          const allEaten = updatedMeals.every(m => m.status === 'eaten');
          if (allEaten) {
            const today = new Date().toISOString().split('T')[0];
            await supabase
              .from('daily_tasks')
              .update({ completed: true, completed_at: new Date().toISOString() })
              .eq('user_id', user!.id)
              .eq('date', today)
              .eq('type', 'meal');
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ccff00" />
      </SafeAreaView>
    );
  }

  const targetCals = profile?.calorie_target || 2000;
  const targetProtein = profile?.protein_target || 100;
  
  const remainingCals = Math.max(0, targetCals - consumedCalories);
  const remainingProtein = Math.max(0, targetProtein - consumedProtein);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Diet Plan</Text>
          <Text style={styles.headerSubtitle}>Fuel your body</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressCard}>
            <Flame size={24} color="#F59E0B" style={{marginBottom: 8}} />
            <Text style={styles.progressValue}>{remainingCals}</Text>
            <Text style={styles.progressLabel}>CALS LEFT</Text>
            <Text style={styles.progressSubtext}>{consumedCalories} / {targetCals}</Text>
          </View>
          <View style={styles.progressCard}>
            <Droplets size={24} color="#6C63FF" style={{marginBottom: 8}} />
            <Text style={styles.progressValue}>{remainingProtein}g</Text>
            <Text style={styles.progressLabel}>PROTEIN LEFT</Text>
            <Text style={styles.progressSubtext}>{consumedProtein}g / {targetProtein}g</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S MEALS</Text>
          
          {meals.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>We couldn't find enough foods matching your diet preference. Please check your food_items database.</Text>
            </View>
          )}

          {meals.map(plan => {
            const food = plan.food_items;
            if (!food) return null;
            return (
              <View key={plan.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={{flex: 1}}>
                    <Text style={styles.mealType}>{plan.meal_type.toUpperCase()}</Text>
                    <Text style={styles.mealName}>{food.food_name || 'Meal'}</Text>
                    <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>
                      {plan.quantity} {plan.unit} • {food.serving_size || '1 serving'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleMeal(plan.id, plan.status)}>
                    {plan.status === 'eaten' ? (
                      <CheckCircle2 size={32} color="#22C55E" />
                    ) : (
                      <Circle size={32} color="#4B5563" />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.mealStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>CALORIES</Text>
                    <Text style={styles.statValue}>{Math.round((food.calories || 0) * plan.quantity)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>PROTEIN</Text>
                    <Text style={styles.statValue}>{Math.round((food.protein || 0) * plan.quantity)}g</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>CARBS</Text>
                    <Text style={styles.statValue}>{Math.round((food.carbs || 0) * plan.quantity)}g</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>FAT</Text>
                    <Text style={styles.statValue}>{Math.round((food.fat || 0) * plan.quantity)}g</Text>
                  </View>
                </View>
                
                <View style={styles.mealDetails}>
                  {food.description ? (
                    <Text style={[styles.detailText, {marginBottom: 8}]}>{food.description}</Text>
                  ) : null}
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                    <Utensils size={14} color="#9CA3AF" />
                    <Text style={styles.detailTitle}> BENEFITS</Text>
                  </View>
                  <Text style={styles.detailText}>{food.health_benefits || 'Good for your health and performance.'}</Text>
                </View>
              </View>
            );
          })}
          
        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccff00',
    marginTop: 4,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  progressCard: {
    flex: 1,
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },
  mealCard: {
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealType: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mealName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F1115',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '800',
  },
  mealDetails: {
    borderTopWidth: 1,
    borderTopColor: '#1E2430',
    paddingTop: 16,
  },
  detailTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
  },
});
