import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { LineChart } from 'react-native-gifted-charts';
import { Trophy, TrendingUp, Scale, Ruler } from 'lucide-react-native';
import { MetricCard } from '../../components/MetricCard';
import { AppScreen } from '../../components/AppScreen';
import { AppHeader } from '../../components/AppHeader';
import { SPACING } from '../../constants/Layout';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);

  useEffect(() => {
    async function loadProgress() {
      if (!user) return;
      setLoading(true);

      try {
        const { data: measData } = await supabase
          .from('progress_measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });
        
        if (!measData || measData.length === 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('weight, created_at')
            .eq('id', user.id)
            .single();
          
          if (profileData && profileData.weight) {
            setMeasurements([{
              date: new Date(profileData.created_at).toISOString().split('T')[0],
              weight: profileData.weight
            }]);
          }
        } else {
          setMeasurements(measData);
        }

        const { data: achData } = await supabase
          .from('user_achievements')
          .select(`
            unlocked_at,
            achievements ( name, description, icon_name )
          `)
          .eq('user_id', user.id);
        
        if (achData) setAchievements(achData);

        const { data: prData } = await supabase
          .from('personal_records')
          .select('*')
          .eq('user_id', user.id)
          .order('achieved_at', { ascending: false })
          .limit(5);

        if (prData) setPrs(prData);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadProgress();
  }, [user]);

  if (loading) {
    return (
      <AppScreen bgImage={require('../../assets/Progress_img.jpg')} bgGradient hideBottomSafe>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ccff00" />
        </View>
      </AppScreen>
    );
  }

  let chartData = measurements.map(m => ({
    value: Number(m.weight),
    label: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  if (chartData.length === 1) {
    chartData.push({
      value: chartData[0].value - 1,
      label: 'Today'
    });
  } else if (chartData.length === 0) {
    chartData = [{value: 0, label: ''}, {value: 0, label: ''}];
  }

  return (
    <AppScreen 
      bgImage={require('../../assets/Progress_img.jpg')} 
      bgGradient 
      hideBottomSafe
      scrollable
      contentContainerStyle={styles.scrollContent}
    >
      <AppHeader title="Progress" subtitle="Track your journey" showBack={router.canGoBack()} />

      {/* Chart Section */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
          <TrendingUp color="#ccff00" size={24} style={{marginRight: 8}} />
          <Text style={styles.sectionTitle}>WEIGHT TREND</Text>
        </View>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - (SPACING.screenHorizontal * 2) - 40}
            height={200}
            thickness={3}
            color="#ccff00"
            dataPointsColor="#FFFFFF"
            dataPointsRadius={4}
            yAxisTextStyle={{color: '#9CA3AF'}}
            xAxisLabelTextStyle={{color: '#9CA3AF', fontSize: 10}}
            yAxisColor="#2D3748"
            xAxisColor="#2D3748"
            hideRules
            isAnimated
            curved
          />
        </View>
      </View>

      {/* Measurements Section */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
          <Ruler color="#4ECDC4" size={24} style={{marginRight: 8}} />
          <Text style={styles.sectionTitle}>LATEST MEASUREMENTS</Text>
        </View>
        
        <View style={styles.measurementsGrid}>
          <MetricCard 
            label="WEIGHT"
            value={measurements.length > 0 ? measurements[measurements.length - 1].weight : '--'}
            unit="lbs"
            style={{width: '48%'}}
          />
          <MetricCard 
            label="WAIST"
            value={measurements.length > 0 && measurements[measurements.length - 1].waist ? measurements[measurements.length - 1].waist : '--'}
            unit="in"
            style={{width: '48%'}}
          />
          <MetricCard 
            label="CHEST"
            value={measurements.length > 0 && measurements[measurements.length - 1].chest ? measurements[measurements.length - 1].chest : '--'}
            unit="in"
            style={{width: '48%'}}
          />
          <MetricCard 
            label="ARMS"
            value={measurements.length > 0 && measurements[measurements.length - 1].arms ? measurements[measurements.length - 1].arms : '--'}
            unit="in"
            style={{width: '48%'}}
          />
        </View>
      </View>

      {/* PRs Section */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
          <Trophy color="#EF4444" size={24} style={{marginRight: 8}} />
          <Text style={styles.sectionTitle}>PERSONAL RECORDS</Text>
        </View>

        {prs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Keep training to hit your first PR!</Text>
          </View>
        ) : (
          prs.map((pr, idx) => (
            <View key={idx} style={styles.achievementCard}>
              <View style={[styles.achievementIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={styles.achievementIcon}>🔥</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{pr.exercise_name}</Text>
                <Text style={styles.achievementDesc}>{pr.record_value}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
          <Trophy color="#F59E0B" size={24} style={{marginRight: 8}} />
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        </View>

        {achievements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Complete tasks and workouts to unlock achievements!</Text>
          </View>
        ) : (
          achievements.map((ach, idx) => (
            <View key={idx} style={styles.achievementCard}>
              <View style={styles.achievementIconBg}>
                <Text style={styles.achievementIcon}>{ach.achievements.icon_name || '🏆'}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{ach.achievements.name}</Text>
                <Text style={styles.achievementDesc}>{ach.achievements.description}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: 120,
  },
  section: {
    marginBottom: SPACING.section,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  chartContainer: {
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
    alignItems: 'center',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D3748',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
