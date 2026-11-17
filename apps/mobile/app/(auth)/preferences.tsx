/**
 * Multi-step registration — Step 2: Lifestyle Preferences
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { pendingRegisterData } from './register';

type Option = { label: string; value: string; emoji?: string };

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={s.group}>
      <Text style={s.groupLabel}>{label}</Text>
      <View style={s.chipRow}>
        {options.map((o) => (
          <Pressable
            key={o.value}
            style={[s.chip, value === o.value && s.chipActive]}
            onPress={() => onChange(o.value)}>
            <Text style={[s.chipText, value === o.value && s.chipTextActive]}>
              {o.emoji ? `${o.emoji} ` : ''}{o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MultiSelect({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <View style={s.group}>
      <Text style={s.groupLabel}>{label}</Text>
      <View style={s.chipRow}>
        {options.map((o) => (
          <Pressable
            key={o}
            style={[s.chip, values.includes(o) && s.chipActive]}
            onPress={() => toggle(o)}>
            <Text style={[s.chipText, values.includes(o) && s.chipTextActive]}>#{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function PreferencesScreen() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [cleanliness, setCleanliness] = useState('moderate');
  const [sleepSchedule, setSleepSchedule] = useState('flexible');
  const [smoking, setSmoking] = useState('no');
  const [drinking, setDrinking] = useState('socially');
  const [pets, setPets] = useState('no_pets');
  const [diet, setDiet] = useState('no_preference');
  const [guests, setGuests] = useState('occasionally');
  const [workFromHome, setWorkFromHome] = useState('hybrid');
  const [parties, setParties] = useState('rarely');
  const [preferredGender, setPreferredGender] = useState('no_preference');
  const [interests, setInterests] = useState<string[]>([]);

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      await register({
        ...pendingRegisterData,
        lifestyle: {
          cleanliness,
          sleepSchedule,
          smoking: smoking === 'yes',
          drinking,
          pets,
          diet,
          guests,
          workFromHome,
          parties,
        },
        // Merge preferences into the top-level shape the API expects
      } as any);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>
        <View style={s.stepPills}>
          <View style={s.pill} />
          <View style={[s.pill, s.pillActive]} />
        </View>
      </View>

      <Text style={s.heading}>Lifestyle & Preferences</Text>
      <Text style={s.subheading}>Step 2 of 2 — Help us find your best matches</Text>

      {error ? <Text style={s.errorMsg}>{error}</Text> : null}

      <OptionGroup
        label="🧹 Cleanliness"
        value={cleanliness}
        onChange={setCleanliness}
        options={[
          { label: 'Spotless', value: 'spotless' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Relaxed', value: 'relaxed' },
        ]}
      />

      <OptionGroup
        label="🌙 Sleep Schedule"
        value={sleepSchedule}
        onChange={setSleepSchedule}
        options={[
          { label: 'Early Bird', value: 'early_bird' },
          { label: 'Night Owl', value: 'night_owl' },
          { label: 'Flexible', value: 'flexible' },
        ]}
      />

      <OptionGroup
        label="🚬 Smoking"
        value={smoking}
        onChange={setSmoking}
        options={[
          { label: 'Non-smoker', value: 'no' },
          { label: 'Outdoors only', value: 'outdoors' },
          { label: 'Yes', value: 'yes' },
        ]}
      />

      <OptionGroup
        label="🍺 Drinking"
        value={drinking}
        onChange={setDrinking}
        options={[
          { label: "Don't drink", value: 'never' },
          { label: 'Socially', value: 'socially' },
          { label: 'Regularly', value: 'regularly' },
        ]}
      />

      <OptionGroup
        label="🐾 Pets"
        value={pets}
        onChange={setPets}
        options={[
          { label: 'No pets', value: 'no_pets' },
          { label: 'Has cat', value: 'has_cat' },
          { label: 'Has dog', value: 'has_dog' },
          { label: 'Pet friendly', value: 'pet_friendly' },
        ]}
      />

      <OptionGroup
        label="🥗 Diet"
        value={diet}
        onChange={setDiet}
        options={[
          { label: 'No preference', value: 'no_preference' },
          { label: 'Vegetarian', value: 'vegetarian' },
          { label: 'Vegan', value: 'vegan' },
          { label: 'Halal', value: 'halal' },
          { label: 'Kosher', value: 'kosher' },
        ]}
      />

      <OptionGroup
        label="👥 Guests"
        value={guests}
        onChange={setGuests}
        options={[
          { label: 'Rarely', value: 'rarely' },
          { label: 'Weekends only', value: 'weekends_only' },
          { label: 'Occasionally', value: 'occasionally' },
          { label: 'Often', value: 'often' },
        ]}
      />

      <OptionGroup
        label="💻 Work From Home"
        value={workFromHome}
        onChange={setWorkFromHome}
        options={[
          { label: 'Never', value: 'never' },
          { label: 'Hybrid', value: 'hybrid' },
          { label: 'Full time', value: 'full_time' },
        ]}
      />

      <OptionGroup
        label="🎉 Parties"
        value={parties}
        onChange={setParties}
        options={[
          { label: 'Never', value: 'never' },
          { label: 'Rarely', value: 'rarely' },
          { label: 'Sometimes', value: 'sometimes' },
          { label: 'Often', value: 'often' },
        ]}
      />

      <OptionGroup
        label="🏠 Preferred Roommate Gender"
        value={preferredGender}
        onChange={setPreferredGender}
        options={[
          { label: 'No preference', value: 'no_preference' },
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Non-binary', value: 'non_binary' },
        ]}
      />

      <MultiSelect
        label="✨ Interests (pick any)"
        values={interests}
        onChange={setInterests}
        options={[
          'Yoga', 'Coffee', 'Reading', 'Gaming', 'Hiking', 'Cooking',
          'Music', 'Art', 'Movies', 'Fitness', 'Travel', 'Photography',
          'Cycling', 'Meditation', 'Dancing',
        ]}
      />

      <Pressable
        style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
        onPress={handleCreate}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>🏠 Create My Account</Text>
        )}
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFF' },
  container: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { marginRight: 'auto' },
  backIcon: { fontSize: 22, color: '#475569' },
  stepPills: { flexDirection: 'row', gap: 6 },
  pill: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#FF385C' },
  heading: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  errorMsg: {
    backgroundColor: '#FFF1F2', borderRadius: 10, padding: 12,
    color: '#E11D48', fontSize: 13, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECDD3',
  },
  group: { marginBottom: 20 },
  groupLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#FFF1F2', borderColor: '#FF385C' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#FF385C', fontWeight: '700' },
  btn: {
    backgroundColor: '#FF385C', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 12,
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
