import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export type ExerciseAnimationProps = {
  // Ideally this would be an asset URI (Lottie, MP4)
  assetUri?: string;
  type?: 'lottie' | 'video' | 'placeholder';
  placeholderTitle?: string;
};

export function ExerciseAnimation({
  assetUri,
  type = 'placeholder',
  placeholderTitle = 'Exercise',
}: ExerciseAnimationProps) {
  
  // A clean animated placeholder demonstrating Start -> Movement -> End -> Return
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (type === 'placeholder') {
      translateY.value = withRepeat(
        withSequence(
          // Start position (delay)
          withDelay(500, withTiming(0, { duration: 0 })),
          // Movement phase
          withTiming(-30, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          // End position
          withTiming(-30, { duration: 200 }),
          // Return
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          // Wait at bottom
          withTiming(0, { duration: 500 })
        ),
        -1, // infinite repeat
        false
      );

      scale.value = withRepeat(
        withSequence(
          withDelay(500, withTiming(1, { duration: 0 })),
          withTiming(1.1, { duration: 1000 }),
          withTiming(1.1, { duration: 200 }),
          withTiming(1, { duration: 1000 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
      
      opacity.value = withRepeat(
        withSequence(
          withDelay(500, withTiming(0.5, { duration: 0 })),
          withTiming(1, { duration: 1000 }),
          withTiming(1, { duration: 200 }),
          withTiming(0.5, { duration: 1000 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1,
        false
      );
    }
  }, [type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }] as any,
    opacity: opacity.value,
  }));

  if (type === 'lottie' && assetUri) {
    // Return LottieView when implemented
    return <View style={styles.container}><Text style={styles.text}>Lottie Animation</Text></View>;
  }

  if (type === 'video' && assetUri) {
    // Return Video component when implemented
    return <View style={styles.container}><Text style={styles.text}>Video</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.placeholderBox}>
        <Animated.View style={[styles.dot, animatedStyle]} />
        <View style={styles.track} />
      </View>
      <Text style={styles.title}>{placeholderTitle} Demonstration</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    backgroundColor: '#0F1115',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2430',
    overflow: 'hidden',
  },
  placeholderBox: {
    width: 100,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  track: {
    position: 'absolute',
    width: 4,
    height: 80,
    backgroundColor: '#1E2430',
    borderRadius: 2,
    bottom: 20,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccff00',
    zIndex: 10,
    shadowColor: '#ccff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: '#9CA3AF',
  },
  title: {
    position: 'absolute',
    bottom: 16,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
