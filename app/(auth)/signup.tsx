import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Dumbbell, User, Mail, Phone, Lock } from 'lucide-react-native';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function signUpWithEmail() {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      if (data.session && data.user) {
        // Save the name to the profiles table so it persists across logins
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, name: fullName });
        // Automatically logged in, layout will redirect to tabs
      } else {
        setSuccessMessage('Account created! You can now sign in.');
      }
    }
    setLoading(false);
  }

  return (
    <ImageBackground 
      source={require('../../assets/fitness_bg.png')} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.logoContainer}>
                <Dumbbell size={32} color="#ccff00" />
                <Text style={styles.logoText}>FITFORGE</Text>
              </View>
              
              <Text style={styles.tagline}>[ BE UNSTOPPABLE ]</Text>

              <View style={styles.heroTextContainer}>
                <Text style={styles.heroText}>START YOUR</Text>
                <Text style={styles.heroText}>JOURNEY</Text>
                <Text style={styles.heroText}>TODAY</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>SIGN UP</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>NEW HERE</Text>
                  </View>
                </View>
                <Text style={styles.cardSubtitle}>Create your lifetime profile in seconds</Text>

                <View style={styles.form}>
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                  {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                      <User color="#64748B" size={20} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Marcus Vane"
                        placeholderTextColor="#64748B"
                        onChangeText={setFullName}
                        value={fullName}
                      />
                    </View>
                  </View>

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
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={styles.inputContainer}>
                      <Phone color="#64748B" size={20} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="+1 (555) 000-0000"
                        placeholderTextColor="#64748B"
                        onChangeText={setPhone}
                        value={phone}
                        keyboardType="phone-pad"
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
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={signUpWithEmail}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'CREATING ACCOUNT...' : 'SIGN UP & START ➔'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Secure 256-bit SSL encrypted connection</Text>
                  </View>

                  <View style={styles.footerLinks}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                      <TouchableOpacity>
                        <Text style={styles.linkText}>Sign In</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
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
    marginBottom: 32,
  },
  heroText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 44,
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
  form: {
    gap: 16,
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
    paddingVertical: 14,
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
    color: '#64748B',
    fontSize: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successText: {
    color: '#A8FF3E',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
