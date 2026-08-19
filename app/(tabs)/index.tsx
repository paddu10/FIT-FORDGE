import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Flame, User as UserIcon } from 'lucide-react-native';
import { WorkoutHero } from '../../components/WorkoutHero';
import { MetricCard } from '../../components/MetricCard';
import { WeeklyActivity, WeekData, DayStatus } from '../../components/WeeklyActivity';
import { CalisthenicsProgress, SkillProgress } from '../../components/CalisthenicsProgress';
import { getDailyQuote } from '../../data/quotes';
import { getTodayWorkout } from '../../lib/WorkoutService';
import { generateFutureSchedule } from '../../lib/WorkoutEngine';
import { theme } from '../../constants/theme';
import Animated, { FadeIn, FadeInDown, useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [dailyWorkout, setDailyWorkout] = useState<any>(null);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const quote = getDailyQuote();

  useFocusEffect(
    useCallback(() => {
    async function loadDashboard() {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Load Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // 2. Load Today's Workout
        const todayStr = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD
        const workoutData = await getTodayWorkout(user.id, todayStr);
        
        if (workoutData) setDailyWorkout(workoutData);

        // 3. Load Total Workouts
        const { count } = await supabase
          .from('daily_workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');
        
        setTotalWorkouts(count || 0);

        // 4. Generate Weekly Activity
        let wData = await generateWeekData(user.id, todayStr);
        
        // AUTO-HEALING: If no workouts exist for this week, generate them now.
        const hasWorkoutsThisWeek = wData.some(d => d.status !== 'upcoming' && d.status !== 'missed');
        if (!hasWorkoutsThisWeek) {
          console.log('[HomeScreen] No workouts found for this week. Auto-generating...');
          await generateFutureSchedule(user.id, todayStr, 14);
          
          // Re-fetch today's workout and week data after generation
          const newWorkoutData = await getTodayWorkout(user.id, todayStr);
          if (newWorkoutData) setDailyWorkout(newWorkoutData);
          wData = await generateWeekData(user.id, todayStr);
        }

        setWeekData(wData);

        // 5. Calculate Calisthenics Progress
        if (profileData) {
          const mappedSkills = mapAbilitiesToProgress(profileData);
          setSkills(mappedSkills);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
    }, [user])
  );

  async function generateWeekData(userId: string, todayStr: string): Promise<WeekData[]> {
    const today = new Date();
    // 0 = Sunday, 1 = Monday. Let's make Monday = 0
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d.toLocaleDateString('en-CA'),
        dayStr: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i],
        isToday: i === dayOfWeek
      };
    });

    // Fetch this week's workouts
    const { data } = await supabase
      .from('daily_workouts')
      .select('scheduled_date, status, is_rest_day')
      .eq('user_id', userId)
      .gte('scheduled_date', weekDates[0].date)
      .lte('scheduled_date', weekDates[6].date);
      
    const lookup = (data || []).reduce((acc: any, w: any) => {
      acc[w.scheduled_date] = w;
      return acc;
    }, {});

    return weekDates.map(wd => {
      const w = lookup[wd.date];
      let status: DayStatus = 'upcoming';
      
      if (w) {
        if (w.status === 'completed') status = 'completed';
        else if (w.is_rest_day) status = 'rest';
        else if (wd.date < todayStr) status = 'missed';
        else status = 'upcoming';
      } else {
        if (wd.date < todayStr) status = 'missed';
      }
      return { ...wd, status };
    });
  }

  function mapAbilitiesToProgress(p: any): SkillProgress[] {
    const s: SkillProgress[] = [];
    const mapVal = (val: string) => {
      if (!val || val === '0') return 10;
      if (val === '1-5') return 40;
      if (val === '5-10') return 70;
      if (val === '10+') return 100;
      return 0;
    };
    if (p.pull_up_ability) s.push({ name: 'Pull-up', percentage: mapVal(p.pull_up_ability) });
    if (p.push_up_ability) s.push({ name: 'Push-up', percentage: mapVal(p.push_up_ability) });
    if (p.plank_ability) s.push({ name: 'Plank', percentage: mapVal(p.plank_ability) });
    
    // Add dummy skills if empty to show the premium empty state visually
    if (s.length === 0) {
      return [];
    }
    return s;
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderQuote = (q: string, emphasis: string) => {
    const parts = q.split(emphasis);
    if (parts.length === 2) {
      return (
        <Text style={styles.quoteText}>
          {parts[0]}
          <Text style={styles.quoteEmphasis}>{emphasis}</Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={styles.quoteText}>{q}</Text>;
  };

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [40, 100], [0, 1], Extrapolation.CLAMP),
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/Home_img1.jpg')}
      style={styles.bgWrapper}
      imageStyle={styles.bgImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(9,9,11,0.4)', 'rgba(9,9,11,0.8)', 'rgba(9,9,11,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.container}>
        
        {/* STICKY BLUR HEADER */}
        <AnimatedBlurView intensity={80} tint="dark" style={[styles.stickyHeader, stickyHeaderStyle]}>
          <View style={styles.stickyHeaderContent}>
            <Text style={styles.stickyHeaderTitle}>FIT FORGE</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarSmall}>
              <UserIcon color="#FFF" size={18} />
            </TouchableOpacity>
          </View>
        </AnimatedBlurView>

        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          
          {/* HEADER */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getTimeOfDay()}, {profile?.name?.split(' ')[0] || 'Athlete'}</Text>
                <Text style={styles.greetingSub}>Ready to train?</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
                <UserIcon color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* MOTIVATIONAL QUOTE */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.quoteContainer}>
            {renderQuote(quote.quote, quote.emphasis)}
            <Text style={styles.brandText}>FIT FORGE</Text>
          </Animated.View>

          {/* TODAY'S WORKOUT */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.sectionTitle}>TODAY'S SESSION</Text>
            {dailyWorkout && !dailyWorkout.is_rest_day ? (
              <WorkoutHero
                title={(dailyWorkout.workouts as any)?.name || 'Custom Workout'}
                category="DAILY PLAN"
                duration={(dailyWorkout.workouts as any)?.duration_minutes || 45}
                difficulty={(dailyWorkout.workouts as any)?.fitness_level || 'MIXED'}
                isCompleted={dailyWorkout.status === 'completed'}
                onPressStart={() => router.push('/(tabs)/workout')}
                style={styles.heroSpacing}
              />
            ) : (
              <WorkoutHero
                title="RECOVERY DAY"
                category="REST"
                onPressStart={() => {}}
                style={styles.heroSpacing}
              />
            )}
          </Animated.View>

          {/* STREAK */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <Flame size={24} color={theme.colors.accent} />
                <Text style={styles.streakTitle}>{profile?.current_streak || 0} DAY STREAK</Text>
              </View>
              <WeeklyActivity data={weekData} style={styles.transparentActivity} />
            </View>
          </Animated.View>

          {/* QUICK STATS */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Text style={styles.sectionTitle}>YOUR STATS</Text>
            <View style={styles.statsRow}>
              <MetricCard 
                label="WEIGHT"
                value={profile?.weight || '--'}
                unit="kg"
              />
              <MetricCard 
                label="WORKOUTS"
                value={totalWorkouts}
              />
              <MetricCard 
                label="BEST STREAK"
                value={profile?.longest_streak || 0}
              />
            </View>
          </Animated.View>

          {/* CALISTHENICS JOURNEY */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.sectionMargin}>
            <CalisthenicsProgress skills={skills} />
          </Animated.View>

          {/* QUICK ACTIONS */}
          <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.sectionMargin}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/profile')}>
                <Text style={styles.actionBtnText}>Track Weight</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/training_days')}>
                <Text style={styles.actionBtnText}>Edit Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/edit-schedule')}>
                <Text style={styles.actionBtnText}>Move Workout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

        </Animated.ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgWrapper: {
    flex: 1,
    backgroundColor: '#000', // Solid black base
  },
  bgImage: {
    opacity: 0.65, // Increased visibility
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let background show through
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 50, // accommodate safe area roughly
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stickyHeaderTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.typography.weights.black,
    letterSpacing: 2,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginTop: 10,
    marginBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.typography.weights.medium,
  },
  greetingSub: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quoteContainer: {
    marginBottom: 48,
  },
  quoteText: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: theme.typography.weights.medium,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  quoteEmphasis: {
    color: theme.colors.accent,
    fontWeight: theme.typography.weights.bold,
  },
  brandText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: theme.typography.weights.black,
    letterSpacing: 4,
    marginTop: 16,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  heroSpacing: {
    marginBottom: 32,
  },
  streakCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 32,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  streakTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.typography.weights.black,
    letterSpacing: 0.5,
  },
  transparentActivity: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  sectionMargin: {
    marginTop: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionBtnText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
  },
});
