import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SPACING } from '../constants/Layout';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export function AppHeader({ title, subtitle, showBack = false, rightAction }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) router.back();
            }} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft color="#FFF" size={28} />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyLeft} />
        )}

        {rightAction ? (
          <View style={styles.rightActionContainer}>
            {rightAction}
          </View>
        ) : null}
      </View>

      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.top,
    marginBottom: SPACING.headerToContent,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 32, // Ensure space even if no back/right action
  },
  backBtn: {
    marginLeft: -8, // slight offset to align arrow visually
    padding: 8,
  },
  emptyLeft: {
    width: 32,
  },
  rightActionContainer: {
    padding: 4,
  },
  titleContainer: {
    marginTop: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  }
});
