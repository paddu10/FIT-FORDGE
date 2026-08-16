import { Tabs, useRouter } from 'expo-router';
import { Home, Dumbbell, Utensils, TrendingUp, User, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Alert, Text, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  const router = useRouter();
  
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
            style={{
              marginRight: 16,
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            onPress={() => {
              const doLogout = async () => {
                await supabase.auth.signOut();
                router.replace('/(auth)/login');
              };

              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to log out?')) {
                  doLogout();
                }
              } else {
                Alert.alert('Log Out', 'Are you sure you want to log out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log Out', style: 'destructive', onPress: doLogout },
                ]);
              }
            }}
          >
            <LogOut color="#EF4444" size={14} />
            <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>Log Out</Text>
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
  );
}
