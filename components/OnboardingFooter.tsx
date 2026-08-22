import { View, Text, StyleSheet } from 'react-native';

export function OnboardingFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerDivider} />

      <Text style={styles.footerQuote}>
        "Discipline is the bridge between goals and accomplishment."
      </Text>
      <Text style={styles.footerQuoteAttr}>— Jim Rohn</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 }}>
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>🔒</Text>
          <Text style={styles.pillText}>Secure Data</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillIcon}>⚡</Text>
          <Text style={styles.pillText}>Fast Sync</Text>
        </View>
      </View>
      <View style={{ height: 24 }} />
      <Text style={styles.footerAbout}>FitForge uses your biometrics to craft a scientifically-backed plan. Your data is private.</Text>
      <Text style={[styles.footerAbout, styles.footerCopy]}>© 2025 FIT FORGE. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    marginHorizontal: 16,
    gap: 8,
  },
  footerDivider: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  footerQuote: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  footerQuoteAttr: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillIcon: {
    fontSize: 13,
  },
  pillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  footerAbout: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  footerCopy: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
