import { View, Text, StyleSheet } from 'react-native';
export function OnboardingFooter() {
  return (
    <View style={styles.footer}>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Brand line */}
      <Text style={styles.brand}>⚡ FIT FORGE</Text>
      <Text style={styles.tagline}>Your body. Your plan. Your results.</Text>

      <Text style={styles.copy}>© 2025 FIT FORGE. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    gap: 8,
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: '#1E2430',
    marginBottom: 12,
  },
  brand: {
    color: '#ccff00',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: '#4B5563',
    fontSize: 12,
    textAlign: 'center',
  },
  copy: {
    color: '#1F2937',
    fontSize: 11,
    marginTop: 4,
  },
});
