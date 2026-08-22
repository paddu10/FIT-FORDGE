import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Dumbbell, Mail, ArrowLeft, ShieldCheck } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleResetPassword() {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: undefined, // Supabase will use the default redirect
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  return (
    <ImageBackground
      source={require('../../assets/fitness_bg.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Back button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft color="#ccff00" size={20} />
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Dumbbell size={32} color="#ccff00" />
                <Text style={styles.logoText}>FITFORGE</Text>
              </View>

              <Text style={styles.tagline}>[ ACCOUNT RECOVERY ]</Text>

              <View style={styles.heroTextContainer}>
                <Text style={styles.heroText}>RESET</Text>
                <Text style={styles.heroText}>YOUR</Text>
                <Text style={styles.heroText}>PASSWORD</Text>
              </View>

              <View style={styles.card}>
                {sent ? (
                  /* ── Success state ── */
                  <View style={styles.successContainer}>
                    <View style={styles.successIconBg}>
                      <ShieldCheck size={40} color="#22C55E" />
                    </View>
                    <Text style={styles.successTitle}>Check Your Inbox</Text>
                    <Text style={styles.successMessage}>
                      We've sent a password reset link to{'\n'}
                      <Text style={styles.emailHighlight}>{email.trim()}</Text>
                    </Text>
                    <Text style={styles.successHint}>
                      Can't find it? Check your spam or junk folder. The link expires in 1 hour.
                    </Text>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => router.replace('/(auth)/login')}
                    >
                      <Text style={styles.buttonText}>BACK TO LOGIN ➔</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={() => {
                        setSent(false);
                        setErrorMessage('');
                      }}
                    >
                      <Text style={styles.resendText}>Didn't receive it? Try again</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* ── Form state ── */
                  <>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>FORGOT PASSWORD</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>
                      Enter the email address you used to sign up and we'll send you a reset link.
                    </Text>

                    <View style={styles.form}>
                      {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                      ) : null}

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
                            autoFocus
                          />
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                      >
                        <Text style={styles.buttonText}>
                          {loading ? 'SENDING...' : 'SEND RESET LINK ➔'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                          <Text style={styles.linkText}>Sign In</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,9,12,0.85)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(204,255,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(204,255,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    color: '#ccff00',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 21,
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
  button: {
    backgroundColor: '#ccff00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  linkText: {
    color: '#ccff00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  successMessage: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: '#ccff00',
    fontWeight: '700',
  },
  successHint: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  resendButton: {
    marginTop: 8,
  },
  resendText: {
    color: '#ccff00',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
