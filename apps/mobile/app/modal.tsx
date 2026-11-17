import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoomieApiClient } from '@/services/api';

export default function ModalScreen() {
  const { user } = useAuth();
  const [serverHealth, setServerHealth] = useState<string>('Checking...');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    const res = await RoomieApiClient.checkHealth();
    setServerHealth(res.status === 'healthy' ? '🟢 Online & Connected' : '🔴 Offline (Mock Data Mode)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.responsiveContainer}>
        <Text style={styles.title}>Server Status</Text>
        <Text style={styles.subtitle}>
          API server connection and account information.
        </Text>

        {/* Backend Status Box */}
        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Backend Server (API):</Text>
            <Text style={styles.statusValue}>{serverHealth}</Text>
          </View>
          <Text style={styles.statusUrl}>{RoomieApiClient.getBaseUrl()}</Text>
          <Pressable onPress={checkBackend} style={styles.recheckBtn}>
            <Text style={styles.recheckText}>↻ Refresh Server Status</Text>
          </Pressable>
        </View>

        {/* Current Account */}
        {user && (
          <View style={styles.currentCard}>
            <Text style={styles.cardHeader}>Signed In As</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.occupation} • {user.targetCity}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  responsiveContainer: { width: '100%', maxWidth: 540 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 20, lineHeight: 18 },
  statusBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  statusValue: { fontSize: 13, fontWeight: '800' },
  statusUrl: { fontSize: 12, color: '#64748B', marginTop: 4 },
  recheckBtn: { marginTop: 10, alignSelf: 'flex-start' },
  recheckText: { fontSize: 12, color: '#FF385C', fontWeight: '700' },
  currentCard: { backgroundColor: '#0F172A', borderRadius: 18, padding: 18 },
  cardHeader: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  userName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  userRole: { fontSize: 13, color: '#CBD5E1', marginTop: 2 },
  userEmail: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});
