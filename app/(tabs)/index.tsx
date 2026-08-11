import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking Supabase connection...');

  useEffect(() => {
    async function checkSupabase() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setSupabaseStatus(`Supabase Error: ${error.message}`);
        } else {
          setSupabaseStatus('Supabase Connected Successfully! 🚀');
        }
      } catch (err) {
        setSupabaseStatus('Supabase Connection Failed ❌');
      }
    }
    
    checkSupabase();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home Dashboard</Text>
        <Text style={styles.subtitle}>Your progress story starts today.</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{supabaseStatus}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statusBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusText: {
    color: '#A8FF3E',
    fontWeight: 'bold',
  }
});
