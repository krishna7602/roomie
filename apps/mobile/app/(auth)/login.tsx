import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) return setError('Please enter your email.');
    if (!password) return setError('Please enter your password.');

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoWrap}>
          <Text style={s.logoEmoji}>🏠</Text>
          <Text style={s.logoText}>Roomie</Text>
          <Text style={s.tagline}>Find your perfect roommate match</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.heading}>Welcome back</Text>

          {error ? <Text style={s.errorMsg}>{error}</Text> : null}

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={s.label}>Password</Text>
          <View style={s.pwdRow}>
            <TextInput
              style={[s.input, s.pwdInput]}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable style={s.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
              <Text style={s.eyeIcon}>{showPwd ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Log In</Text>
            )}
          </Pressable>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>or</Text>
            <View style={s.divLine} />
          </View>

          {/* Demo hint */}
          <Pressable
            style={s.demoBtn}
            onPress={() => {
              setEmail('alex@roomie.local');
              setPassword('password123');
            }}>
            <Text style={s.demoBtnText}>Use demo account</Text>
          </Pressable>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={s.footerLink}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFF' },
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 56 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#FF385C', letterSpacing: -1, marginTop: 4 },
  tagline: { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center' },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  heading: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  errorMsg: {
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    padding: 12,
    color: '#E11D48',
    fontSize: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pwdRow: { position: 'relative', marginBottom: 4 },
  pwdInput: { paddingRight: 50, marginBottom: 0 },
  eyeBtn: { position: 'absolute', right: 14, top: 13 },
  eyeIcon: { fontSize: 18 },
  btn: {
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  divText: { marginHorizontal: 12, color: '#94A3B8', fontSize: 13 },
  demoBtn: {
    borderWidth: 1.5,
    borderColor: '#FF385C',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  demoBtnText: { color: '#FF385C', fontWeight: '600', fontSize: 14 },
  footer: { flexDirection: 'row', marginTop: 28, alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#FF385C', fontWeight: '700', fontSize: 14 },
});
