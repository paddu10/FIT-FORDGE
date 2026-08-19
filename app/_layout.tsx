import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Suppress the harmless third-party warning from react-native-gifted-charts on the Web
LogBox.ignoreLogs(['Unknown event handler property']);

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const argString = args.join(' ');
  if (argString.includes('Unknown event handler property')) {
    return;
  }
  originalConsoleError(...args);
};
function RootLayoutNav() {
  const { session, isInitialized, onboardingCompleted } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const isSplash = !segments[0];

    if (!isSplash && !session && !inAuthGroup) {
      // Redirect to login if unauthenticated and trying to access protected routes
      router.replace('/(auth)/login');
    } else if (session) {
      if (!onboardingCompleted && !inOnboarding) {
        // Redirect to onboarding if incomplete
        router.replace('/(onboarding)');
      } else if (onboardingCompleted && (inAuthGroup || inOnboarding)) {
        // Redirect to main tabs if authenticated and completed onboarding
        router.replace('/(tabs)');
      }
    }
  }, [session, isInitialized, onboardingCompleted, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="exercises/[category]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="workout/session" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="workout/complete" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
