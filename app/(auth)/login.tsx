import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Dumbbell, Mail, Lock, CheckSquare, Square } from 'lucide-react-native';
import { PremiumButton } from '../../components/PremiumButton';
import { AppScreen } from '../../components/AppScreen';
import { OnboardingFooter } from '../../components/OnboardingFooter';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function signInWithEmail() {
    setLoading(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMessage('Wrong password or email');
      } else {
        setErrorMessage(error.message);
      }
    }
    setLoading(false);
  }

  return (
    <AppScreen
      bgImage={require('../../assets/Login_page_img.jpg')}
      bgGradient
      scrollable
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.logoContainer}>
        <Dumbbell size={32} color="#ccff00" />
        <Text style={styles.logoText}>FITFORGE</Text>
      </View>
      
      <Text style={styles.tagline}>[ BE UNSTOPPABLE ]</Text>

      <View style={styles.heroTextContainer}>
        <Text style={styles.heroText}>TRANSFORM</Text>
        <Text style={styles.heroText}>YOUR LIMITS</Text>
        <Text style={styles.heroText}>INTO LEVEL-</Text>
        <Text style={styles.heroText}>UPS</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>LOG IN</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>WELCOME BACK</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>Enter your details to sync your daily rings</Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gmail / Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail color="#64748B" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="marcus@gmail.com"
                placeholderTextColor="#64748B"
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock color="#64748B" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={signInWithEmail}
              />
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              {rememberMe ? (
                <CheckSquare color="#ccff00" size={20} />
              ) : (
                <Square color="#64748B" size={20} />
              )}
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <PremiumButton 
            title={loading ? 'SIGNING IN...' : 'CONTINUE WITH EMAIL ➔'}
            onPress={signInWithEmail}
            disabled={loading}
            loading={loading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
      <OnboardingFooter />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 1,
  },
  tagline: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 32,
  },
  heroTextContainer: {
    marginBottom: 40,
  },
  heroText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 48,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#161921',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#ccff00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1115',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2430',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  forgotPasswordText: {
    color: '#ccff00',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  linkText: {
    color: '#ccff00',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
