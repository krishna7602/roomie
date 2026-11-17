/**
 * Profile Screen — view/edit all user details + Cloudinary photo upload
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { uploadToCloudinary } from '@/services/cloudinary';

// ─── Avatar badge (initials fallback) ────────────────────────────────────────
function Avatar({ url, name, size = 90 }: { url?: string; name?: string; size?: number }) {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E2E8F0' }}
      />
    );
  }
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: '#FF385C', alignItems: 'center', justifyContent: 'center',
      }}>
      <Text style={{ color: '#fff', fontSize: size * 0.36, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

// ─── Photo picker (cross-platform) ───────────────────────────────────────────
async function pickImage(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) resolve(URL.createObjectURL(file));
        else resolve(null);
      };
      input.click();
    });
  }

  try {
    const ImagePicker = await import('expo-image-picker');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  } catch {
    Alert.alert('Error', 'Could not open photo library.');
    return null;
  }
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();

  // Editable fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [targetCity, setTargetCity] = useState(user?.targetCity || '');
  const [budgetMin, setBudgetMin] = useState(String(user?.budgetMin ?? ''));
  const [budgetMax, setBudgetMax] = useState(String(user?.budgetMax ?? ''));

  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [photos, setPhotos] = useState<string[]>(user?.photos ?? []);

  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setOccupation(user.occupation || '');
      setTargetCity(user.targetCity || '');
      setBudgetMin(String(user.budgetMin ?? ''));
      setBudgetMax(String(user.budgetMax ?? ''));
      setAvatar(user.avatar);
      setPhotos(user.photos ?? []);
    }
  }, [user]);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarUpload = async () => {
    const uri = await pickImage();
    if (!uri) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadToCloudinary(uri);
      setAvatar(result.secure_url);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Add photo ─────────────────────────────────────────────────────────────
  const handleAddPhoto = async () => {
    if (photos.length >= 6) return Alert.alert('Limit reached', 'Maximum 6 photos.');
    const uri = await pickImage();
    if (!uri) return;
    const idx = photos.length;
    setUploadingIdx(idx);
    try {
      const result = await uploadToCloudinary(uri);
      setPhotos((prev) => [...prev, result.secure_url]);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  // ── Remove photo ──────────────────────────────────────────────────────────
  const handleRemovePhoto = (idx: number) => {
    Alert.alert('Remove photo', 'Remove this photo from your profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setPhotos((prev) => prev.filter((_, i) => i !== idx)),
      },
    ]);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        bio: bio.trim() || undefined,
        occupation: occupation.trim() || undefined,
        targetCity: targetCity.trim() || undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        avatar,
        photos,
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      {/* Back */}
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backIcon}>← Back</Text>
      </Pressable>

      <Text style={s.title}>My Profile</Text>

      {/* Avatar */}
      <View style={s.avatarSection}>
        <Pressable onPress={handleAvatarUpload} style={s.avatarWrap}>
          {uploadingAvatar ? (
            <View style={[s.avatarPlaceholder, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color="#FF385C" />
            </View>
          ) : (
            <Avatar url={avatar} name={name || user?.name} size={100} />
          )}
          <View style={s.avatarBadge}>
            <Text style={s.avatarBadgeText}>📷</Text>
          </View>
        </Pressable>
        <Text style={s.avatarHint}>Tap to change avatar</Text>
      </View>

      {/* Error */}
      {error ? <Text style={s.errorMsg}>{error}</Text> : null}

      {/* Basic info */}
      <Section title="Basic Info">
        <Field label="Full Name">
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#94A3B8" />
        </Field>
        <Field label="Bio">
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
        <Field label="Occupation">
          <TextInput style={s.input} value={occupation} onChangeText={setOccupation} placeholder="e.g. Software Engineer" placeholderTextColor="#94A3B8" />
        </Field>
        <Field label="Target City">
          <TextInput style={s.input} value={targetCity} onChangeText={setTargetCity} placeholder="e.g. San Francisco, CA" placeholderTextColor="#94A3B8" />
        </Field>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Budget Min ($)">
              <TextInput style={s.input} value={budgetMin} onChangeText={setBudgetMin} keyboardType="number-pad" placeholder="1200" placeholderTextColor="#94A3B8" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Budget Max ($)">
              <TextInput style={s.input} value={budgetMax} onChangeText={setBudgetMax} keyboardType="number-pad" placeholder="2500" placeholderTextColor="#94A3B8" />
            </Field>
          </View>
        </View>
      </Section>

      {/* Photo gallery */}
      <Section title={`Photos (${photos.length}/6)`}>
        <View style={s.photoGrid}>
          {photos.map((url, idx) => (
            <Pressable key={url + idx} style={s.photoCell} onLongPress={() => handleRemovePhoto(idx)}>
              <Image source={{ uri: url }} style={s.photoImg} />
              <Pressable style={s.photoRemove} onPress={() => handleRemovePhoto(idx)}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </Pressable>
          ))}
          {uploadingIdx === photos.length && (
            <View style={[s.photoCell, s.photoPlaceholder]}>
              <ActivityIndicator color="#FF385C" />
            </View>
          )}
          {photos.length < 6 && uploadingIdx === null && (
            <Pressable style={[s.photoCell, s.photoPlaceholder]} onPress={handleAddPhoto}>
              <Text style={s.addPhotoIcon}>+</Text>
              <Text style={s.addPhotoText}>Add Photo</Text>
            </Pressable>
          )}
        </View>
        <Text style={s.photoHint}>Long-press a photo to remove it</Text>
      </Section>

      {/* Save button */}
      <Pressable
        style={({ pressed }) => [s.saveBtn, pressed && s.btnPressed, saved && s.savedBtn]}
        onPress={handleSave}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.saveBtnText}>{saved ? '✓ Saved!' : 'Save Changes'}</Text>
        )}
      </Pressable>

      {/* Logout */}
      <Pressable style={({ pressed }) => [s.logoutBtn, pressed && s.btnPressed]} onPress={handleLogout}>
        <Text style={s.logoutText}>Log Out</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFF' },
  container: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  backBtn: { marginBottom: 8 },
  backIcon: { fontSize: 15, color: '#FF385C', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 24 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#E2E8F0',
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#FF385C', borderRadius: 14, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarBadgeText: { fontSize: 14 },
  avatarHint: { marginTop: 8, fontSize: 12, color: '#94A3B8' },

  errorMsg: {
    backgroundColor: '#FFF1F2', borderRadius: 10, padding: 12,
    color: '#E11D48', fontSize: 13, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECDD3',
  },

  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 10, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 },

  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 13, fontSize: 15, color: '#0F172A',
    marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0',
  },
  textarea: { minHeight: 90, paddingTop: 12 },

  // Photo grid
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCell: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholder: {
    backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  addPhotoIcon: { fontSize: 28, color: '#FF385C', fontWeight: '300' },
  addPhotoText: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  photoHint: { fontSize: 11, color: '#94A3B8', marginTop: 10 },

  saveBtn: {
    backgroundColor: '#FF385C', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 12,
  },
  savedBtn: { backgroundColor: '#10B981' },
  btnPressed: { opacity: 0.8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  logoutBtn: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});
