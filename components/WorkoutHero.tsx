import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';
import { PlayCircle, CheckCircle2 } from 'lucide-react-native';
import { PremiumButton } from './PremiumButton';

export type WorkoutHeroProps = {
  title: string;
  category?: string;
  duration?: number;
  exercisesCount?: number;
  difficulty?: string;
  isCompleted?: boolean;
  onPressStart: () => void;
  style?: ViewStyle;
};

export function WorkoutHero({
  title,
  category,
  duration,
  exercisesCount,
  difficulty,
  isCompleted,
  onPressStart,
  style,
}: WorkoutHeroProps) {
  return (
    <View style={[styles.container, style]}>
      <ImageBackground 
        source={require('../assets/fitness_bg.jpg')} 
        style={styles.bgImage}
        imageStyle={{ opacity: 0.15 }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{category || 'WORKOUT'}</Text>
            </View>
            {isCompleted && <CheckCircle2 size={24} color={theme.colors.success} />}
          </View>
          
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.metaRow}>
            {duration && (
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>{duration}</Text>
                <Text style={styles.metaLabel}>MIN</Text>
              </View>
            )}
            
            {exercisesCount && (
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>{exercisesCount}</Text>
                <Text style={styles.metaLabel}>EXERCISES</Text>
              </View>
            )}
            
            {difficulty && (
              <View style={styles.metaItem}>
                <Text style={styles.metaValue}>{difficulty.toUpperCase()}</Text>
                <Text style={styles.metaLabel}>LEVEL</Text>
              </View>
            )}
          </View>

          <PremiumButton 
            title={isCompleted ? 'WORKOUT COMPLETED' : 'START WORKOUT'}
            onPress={onPressStart}
            variant={isCompleted ? 'secondary' : 'primary'}
            disabled={isCompleted}
            icon={!isCompleted ? <PlayCircle size={20} color="#000" /> : undefined}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bgImage: {
    width: '100%',
  },
  overlay: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(22, 25, 33, 0.7)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.accentMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.black,
    marginBottom: theme.spacing.lg,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  metaItem: {
    alignItems: 'flex-start',
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
});
