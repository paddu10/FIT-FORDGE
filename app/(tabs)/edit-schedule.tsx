import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { AppScreen } from '../../components/AppScreen';
import { AppHeader } from '../../components/AppHeader';
import { SPACING } from '../../constants/Layout';

type WorkoutDay = {
  id: string;
  scheduled_date: string;
  status: string;
  is_rest_day: boolean;
  workouts: any;
  dayStr: string;
  isPast: boolean;
};

export default function EditScheduleScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<WorkoutDay[]>([]);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    loadWeek();
  }, [user]);

  async function loadWeek() {
    if (!user) return;
    setLoading(true);

    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    
    const dates = Array.from({length: 7}).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toLocaleDateString('en-CA');
    });

    const { data } = await supabase
      .from('daily_workouts')
      .select('id, scheduled_date, status, is_rest_day, workouts(name)')
      .eq('user_id', user.id)
      .gte('scheduled_date', dates[0])
      .lte('scheduled_date', dates[6])
      .order('scheduled_date', { ascending: true });
      
    if (data) {
      const todayStr = today.toLocaleDateString('en-CA');
      const mapped = dates.map((dStr, i) => {
        const found = data.find(x => x.scheduled_date === dStr);
        return {
          id: found?.id || '',
          scheduled_date: dStr,
          status: found?.status || 'pending',
          is_rest_day: found?.is_rest_day || false,
          workouts: found?.workouts || null,
          dayStr: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i],
          isPast: dStr < todayStr
        };
      });
      setWeek(mapped);
    }
    setLoading(false);
  }

  const handleMove = (item: WorkoutDay) => {
    if (item.isPast) {
      if (Platform.OS === 'web') window.alert('Cannot move a past or completed workout.');
      else Alert.alert('Notice', 'Cannot move a past or completed workout.');
      return;
    }
    if (item.status === 'completed') {
      if (Platform.OS === 'web') window.alert('Cannot move a completed workout.');
      else Alert.alert('Notice', 'Cannot move a completed workout.');
      return;
    }
    if (item.is_rest_day || !item.id) {
      if (Platform.OS === 'web') window.alert('Nothing to move here.');
      else Alert.alert('Notice', 'Nothing to move here.');
      return;
    }
    setMovingId(item.id);
  };

  const cancelMove = () => setMovingId(null);

  const confirmMove = async (targetDay: WorkoutDay) => {
    if (!user || !movingId) return;
    if (targetDay.isPast) {
      if (Platform.OS === 'web') window.alert('Cannot move to a past date.');
      else Alert.alert('Notice', 'Cannot move to a past date.');
      return;
    }
    
    const sourceItem = week.find(x => x.id === movingId);
    if (!sourceItem) return;

    if (targetDay.id === movingId) {
      cancelMove();
      return;
    }

    if (!targetDay.is_rest_day && targetDay.id && targetDay.status !== 'completed') {
      if (Platform.OS === 'web') {
        const swap = window.confirm(`${targetDay.dayStr} already has a workout. Click OK to Swap them, or Cancel to abort.`);
        if (swap) {
          setLoading(true);
          await supabase.from('daily_workouts').update({ scheduled_date: targetDay.scheduled_date }).eq('id', sourceItem.id);
          await supabase.from('daily_workouts').update({ scheduled_date: sourceItem.scheduled_date }).eq('id', targetDay.id);
          cancelMove();
          await loadWeek();
        } else {
          cancelMove();
        }
      } else {
        Alert.alert(
          'Conflict',
          `${targetDay.dayStr} already has a workout scheduled. What would you like to do?`,
          [
            {
              text: 'Swap Workouts',
              onPress: async () => {
                setLoading(true);
                await supabase.from('daily_workouts').update({ scheduled_date: targetDay.scheduled_date }).eq('id', sourceItem.id);
                await supabase.from('daily_workouts').update({ scheduled_date: sourceItem.scheduled_date }).eq('id', targetDay.id);
                cancelMove();
                await loadWeek();
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: cancelMove
            }
          ]
        );
      }
    } else {
      setLoading(true);
      await supabase.from('daily_workouts').update({ scheduled_date: targetDay.scheduled_date }).eq('id', sourceItem.id);
      if (targetDay.id) {
        await supabase.from('daily_workouts').update({ scheduled_date: sourceItem.scheduled_date }).eq('id', targetDay.id);
      }
      cancelMove();
      await loadWeek();
    }
  };

  if (loading) {
    return (
      <AppScreen hideBottomSafe>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen 
      hideBottomSafe
      scrollable
      contentContainerStyle={styles.content}
    >
      <AppHeader title={movingId ? 'Select Target Day' : 'Edit Plan'} showBack={true} />

      {movingId && (
        <View style={styles.movingBanner}>
          <Text style={styles.movingText}>Select a day to move your workout to.</Text>
          <TouchableOpacity onPress={cancelMove} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {week.map((item, idx) => {
        const isMovingSource = item.id === movingId;
        const name = item.is_rest_day ? 'REST DAY' : (
          (Array.isArray(item.workouts) ? item.workouts[0]?.name : item.workouts?.name) || 'Workout'
        );
        
        return (
          <TouchableOpacity 
            key={idx} 
            style={[
              styles.row, 
              item.isPast && styles.rowPast,
              isMovingSource && styles.rowSource,
              movingId && !isMovingSource && !item.isPast && styles.rowTarget
            ]}
            disabled={item.isPast || (!!movingId && item.status === 'completed')}
            onPress={() => movingId ? confirmMove(item) : undefined}
          >
            <View style={styles.dayCol}>
              <Text style={styles.dayLabel}>{item.dayStr}</Text>
              {item.status === 'completed' && <Text style={styles.check}>✓</Text>}
            </View>
            
            <View style={styles.infoCol}>
              <Text style={[styles.workoutName, item.is_rest_day && styles.restName]}>{name}</Text>
              <Text style={styles.dateLabel}>{item.scheduled_date}</Text>
            </View>

            {!movingId && !item.isPast && item.status !== 'completed' && !item.is_rest_day && (
              <TouchableOpacity style={styles.moveBtn} onPress={() => handleMove(item)}>
                <Text style={styles.moveBtnText}>MOVE</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: SPACING.screenHorizontal, paddingBottom: 120 },
  movingBanner: { backgroundColor: 'rgba(204,255,0,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.accent, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  movingText: { color: theme.colors.accent, fontSize: 14, fontWeight: 'bold', flex: 1 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 },
  cancelBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: theme.colors.surface, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  rowPast: { opacity: 0.5 },
  rowSource: { borderColor: theme.colors.accent, backgroundColor: '#1A2016' },
  rowTarget: { borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed' },
  dayCol: { width: 48, alignItems: 'center' },
  dayLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold' },
  check: { color: theme.colors.accent, fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  infoCol: { flex: 1, paddingLeft: 12 },
  workoutName: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  restName: { color: theme.colors.textMuted, fontWeight: 'normal' },
  dateLabel: { color: theme.colors.textSecondary, fontSize: 12 },
  moveBtn: { backgroundColor: '#1A202C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#2D3748' },
  moveBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});
