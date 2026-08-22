import { Tabs, useRouter } from 'expo-router';
import { Home, Dumbbell, Utensils, TrendingUp, User, LogOut, ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity, Alert, Text, Platform, ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/workout_img1.jpg')}
      style={styles.bgWrapper}
      imageStyle={styles.bgImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(8,9,12,0.55)', 'rgba(8,9,12,0.75)', 'rgba(8,9,12,0.97)']}
        style={StyleSheet.absoluteFill}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(12,14,18,0.88)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.06)',
            elevation: 0,
          },
          tabBarActiveTintColor: '#ccff00',
          tabBarInactiveTintColor: '#9CA3AF',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="diet"
          options={{
            title: 'Diet',
            tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="edit-schedule"
          options={{
            href: null,
            title: 'Edit Plan',
          }}
        />
        <Tabs.Screen
          name="training_days"
          options={{
            href: null,
            title: 'Workout Days',
          }}
        />
      </Tabs>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgWrapper: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  bgImage: {
    opacity: 0.45,
  },
  headerBg: {
    flex: 1,
    backgroundColor: 'rgba(8,9,12,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
});
