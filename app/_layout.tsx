import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';

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
