import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Alert, Text, Platform } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function OnboardingLayout() {
  const router = useRouter();
  
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerTransparent: true,
      headerTitle: '',
      headerBackVisible: true,
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
              try {
                await supabase.auth.signOut();
                router.replace('/(auth)/login');
              } catch (e) {
                console.error('Logout error:', e);
              }
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
      )
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="fitness-level" />
      <Stack.Screen name="abilities" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="diet" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
