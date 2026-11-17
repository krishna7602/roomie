/**
 * Multi-step registration — Step 1: Basic Info
 */
import React, { useState } from 'react';
import {
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
import { useAuth, RegisterInput } from '@/context/AuthContext';

// We store partial data in module-level state so Step 2 can access it
export let pendingRegisterData: Partial<RegisterInput> = {};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim() || !email.includes('@')) return 'Valid email is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!age || isNaN(Number(age)) || Number(age) < 18) return 'Age must be 18 or older.';
    if (!gender) return 'Please select a gender.';
    if (!occupation.trim()) return 'Occupation is required.';
    if (!targetCity.trim()) return 'Target city is required.';
    if (!budgetMin || !budgetMax) return 'Budget range is required.';
    if (Number(budgetMin) > Number(budgetMax)) return 'Min budget must be ≤ max budget.';
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) return setError(err);
    setError('');

    pendingRegisterData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      age: Number(age),
      gender: gender.toLowerCase().replace(/\s+/g, '_'),
      occupation: occupation.trim(),
      targetCity: targetCity.trim(),
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      bio: bio.trim() || undefined,
    };

    router.push('/(auth)/preferences');
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.headerRow}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </Pressable>
          <View style={s.stepPills}>
            <View style={[s.pill, s.pillActive]} />
            <View style={s.pill} />
          </View>
        </View>

        <Text style={s.heading}>Create account</Text>
        <Text style={s.subheading}>Step 1 of 2 — Basic Info</Text>

        {error ? <Text style={s.errorMsg}>{error}</Text> : null}

        <Field label="Full Name" placeholder="Alex Chen">
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Alex Chen" placeholderTextColor="#94A3B8" />
        </Field>

        <Field label="Email">
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" />
        </Field>

        <Field label="Password">
          <View style={s.pwdRow}>
            <TextInput style={[s.input, s.pwdInput]} value={password} onChangeText={setPassword} placeholder="Min 8 characters" placeholderTextColor="#94A3B8" secureTextEntry={!showPwd} />
            <Pressable style={s.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
              <Text>{showPwd ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>
        </Field>

        <Field label="Confirm Password">
          <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" placeholderTextColor="#94A3B8" secureTextEntry={!showPwd} />
        </Field>

        <View style={s.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Field label="Age">
              <TextInput style={s.input} value={age} onChangeText={setAge} placeholder="25" placeholderTextColor="#94A3B8" keyboardType="number-pad" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Occupation">
              <TextInput style={s.input} value={occupation} onChangeText={setOccupation} placeholder="Software Engineer" placeholderTextColor="#94A3B8" />
            </Field>
          </View>
        </View>

        <Field label="Gender">
          <View style={s.chipRow}>
            {GENDERS.map((g) => (
              <Pressable
                key={g}
                style={[s.chip, gender === g && s.chipActive]}
                onPress={() => setGender(g)}>
                <Text style={[s.chipText, gender === g && s.chipTextActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Target City">
          <TextInput style={s.input} value={targetCity} onChangeText={setTargetCity} placeholder="San Francisco, CA" placeholderTextColor="#94A3B8" />
        </Field>

        <View style={s.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Field label="Budget Min (\$)">
              <TextInput style={s.input} value={budgetMin} onChangeText={setBudgetMin} placeholder="1200" placeholderTextColor="#94A3B8" keyboardType="number-pad" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Budget Max (\$)">
              <TextInput style={s.input} value={budgetMax} onChangeText={setBudgetMax} placeholder="2500" placeholderTextColor="#94A3B8" keyboardType="number-pad" />
            </Field>
          </View>
        </View>

        <Field label="Bio (optional)">
          <TextInput
            style={[s.input, s.textarea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell potential roommates about yourself..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>

        <Pressable style={({ pressed }) => [s.btn, pressed && s.btnPressed]} onPress={handleNext}>
          <Text style={s.btnText}>Next: Lifestyle Preferences →</Text>
        </Pressable>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable><Text style={s.footerLink}>Log In</Text></Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFF' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { marginRight: 'auto' },
  backIcon: { fontSize: 22, color: '#475569' },
  stepPills: { flexDirection: 'row', gap: 6 },
  pill: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#FF385C' },
  heading: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  errorMsg: {
    backgroundColor: '#FFF1F2', borderRadius: 10, padding: 12,
    color: '#E11D48', fontSize: 13, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECDD3',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 13, fontSize: 15, color: '#0F172A',
    marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0',
  },
  textarea: { minHeight: 90, paddingTop: 12 },
  row: { flexDirection: 'row' },
  pwdRow: { position: 'relative', marginBottom: 0 },
  pwdInput: { paddingRight: 50, marginBottom: 16 },
  eyeBtn: { position: 'absolute', right: 14, top: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#FFF1F2', borderColor: '#FF385C' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#FF385C', fontWeight: '700' },
  btn: {
    backgroundColor: '#FF385C', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', marginTop: 24, alignItems: 'center', justifyContent: 'center' },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#FF385C', fontWeight: '700', fontSize: 14 },
});
