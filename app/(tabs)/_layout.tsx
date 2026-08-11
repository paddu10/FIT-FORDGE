import { Tabs } from 'expo-router';
import { Home, Dumbbell, Utensils, TrendingUp, User, MoreVertical } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#08090C',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#1A1D24',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          letterSpacing: 1,
        },
        headerRight: () => (
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => {
              // Using a simple confirm for web compatibility, or you can just sign out directly
              supabase.auth.signOut();
            }}
          >
            <MoreVertical color="#9CA3AF" size={24} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#12151B',
          borderTopWidth: 0,
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
    </Tabs>
  );
}
