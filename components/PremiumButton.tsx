import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import * as Haptics from 'expo-haptics';

export type PremiumButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
};

export function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: PremiumButtonProps) {
  
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getContainerStyle = () => {
    const base = [styles.container, styles[`size_${size}`], style];
    if (variant === 'primary') base.push(styles.variant_primary);
    if (variant === 'secondary') base.push(styles.variant_secondary);
    if (variant === 'outline') base.push(styles.variant_outline);
    if (variant === 'ghost') base.push(styles.variant_ghost);
    if (disabled) base.push(styles.disabled);
    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text, styles[`text_${size}`], textStyle];
    if (variant === 'primary') base.push(styles.text_primary);
    if (variant === 'secondary') base.push(styles.text_secondary);
    if (variant === 'outline' || variant === 'ghost') base.push(styles.text_outline);
    if (disabled) base.push(styles.text_disabled);
    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : theme.colors.accent} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    gap: theme.spacing.sm,
  },
  size_sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
  },
  size_lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    width: '100%', // Full width by default for large CTA
  },
  variant_primary: {
    backgroundColor: theme.colors.accent,
  },
  variant_secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  text_sm: {
    fontSize: theme.typography.sizes.sm,
  },
  text_md: {
    fontSize: theme.typography.sizes.md,
  },
  text_lg: {
    fontSize: theme.typography.sizes.md,
  },
  text_primary: {
    color: '#000000',
  },
  text_secondary: {
    color: theme.colors.text,
  },
  text_outline: {
    color: theme.colors.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  text_disabled: {
    color: theme.colors.textMuted,
  }
});
