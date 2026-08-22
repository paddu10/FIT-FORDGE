import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

export type SkillProgress = {
  name: string;
  percentage: number; // 0 to 100
};

type Props = {
  skills: SkillProgress[];
  style?: ViewStyle;
};

function ProgressBar({ percentage }: { percentage: number }) {
  const width = useSharedValue(0);

  // Note: using React.useEffect to trigger the animation on mount
  React.useEffect(() => {
    width.value = withTiming(percentage, { duration: 1000 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    };
  });

  return (
    <View style={styles.barBackground}>
      <Animated.View style={[styles.barFill, animatedStyle]} />
    </View>
  );
}

export function CalisthenicsProgress({ skills, style }: Props) {
  if (!skills || skills.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>CALISTHENICS JOURNEY</Text>
        <Text style={styles.emptyText}>Complete your first workout to begin tracking skills.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>CALISTHENICS JOURNEY</Text>
      
      <View style={styles.skillsContainer}>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillRow}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillName}>{skill.name.toUpperCase()}</Text>
              <Text style={styles.skillPercentage}>{Math.round(skill.percentage)}%</Text>
            </View>
            <ProgressBar percentage={skill.percentage} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  skillsContainer: {
    gap: 16,
  },
  skillRow: {
    gap: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  skillPercentage: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: theme.typography.weights.black,
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
});
