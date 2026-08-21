import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { AppScreen } from '../../components/AppScreen';
import { AppHeader } from '../../components/AppHeader';
import { SPACING } from '../../constants/Layout';

export default function ExerciseDetailScreen() {
  const { name, description, muscle_group, difficulty, equipment, instructions, sets, reps, rest } = useLocalSearchParams();
  const router = useRouter();

  return (
    <AppScreen 
      hideBottomSafe 
      scrollable 
      contentContainerStyle={styles.content}
    >
      <AppHeader title={name as string} showBack={true} />

      <ExerciseAnimation placeholderTitle={name as string} />

      <View style={styles.tagsRow}>
        <View style={styles.tag}><Text style={styles.tagText}>{muscle_group}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{difficulty}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{equipment}</Text></View>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HOW TO PERFORM</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{sets || 3}</Text>
          <Text style={styles.statLabel}>SETS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{reps || 10}</Text>
          <Text style={styles.statLabel}>REPS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{rest || 60}s</Text>
          <Text style={styles.statLabel}>REST</Text>
        </View>
      </View>

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACING.screenHorizontal, gap: 24, paddingBottom: 60 },
  tagsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(204,255,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(204,255,0,0.3)' },
  tagText: { color: '#ccff00', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  description: { color: '#9CA3AF', fontSize: 15, lineHeight: 22 },
  section: { gap: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  instructions: { color: '#9CA3AF', fontSize: 14, lineHeight: 22 },
  statsCard: { flexDirection: 'row', backgroundColor: '#161921', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1E2430', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: '#1E2430' },
});
