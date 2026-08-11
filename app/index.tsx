import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Dumbbell } from 'lucide-react-native';

export default function SplashScreen() {
  const router = useRouter();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 500 }),
        withTiming(0, { duration: 500 }),
        withDelay(200, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Dumbbell size={64} color="#A8FF3E" />
      </Animated.View>
      <Text style={styles.title}>FITFORGE</Text>
      <Text style={styles.subtitle}>Build your body. Build your discipline.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
