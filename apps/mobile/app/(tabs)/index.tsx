import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RoommateCandidate } from '@roomie/shared';
import { RoomieApiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { FALLBACK_CANDIDATES } from '@/services/fallbackData';

export default function RoommateDiscoveryScreen() {
  const { user, token } = useAuth();
  const [candidates, setCandidates] = useState<RoommateCandidate[]>(FALLBACK_CANDIDATES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMatch, setLastMatch] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const health = await RoomieApiClient.checkHealth();
      const connected = health.status === 'healthy';
      setIsLiveConnected(connected);

      if (token) {
        RoomieApiClient.setToken(token);
        const data = await RoomieApiClient.getCandidates();
        if (data && data.length > 0) {
          setCandidates(data);
          setCurrentIndex(0);
        }
      }
    } catch (err: any) {
      console.warn('Using fallback candidate data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [token]);

  const handleSwipe = async (direction: 'like' | 'pass') => {
    const candidate = candidates[currentIndex];
    if (!candidate) return;

    try {
      const res = await RoomieApiClient.swipe(candidate.id, direction);
      if (res.isMatch) {
        setLastMatch(candidate.name);
      }
    } catch (err: any) {
      if (direction === 'like') {
        setLastMatch(candidate.name);
      }
    }

    if (currentIndex + 1 < candidates.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(candidates.length);
    }
  };

  const currentCandidate = candidates[currentIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.responsiveContainer}>
        {/* Backend Status Header */}
        <View style={styles.statusPillRow}>
          <View
            style={[
              styles.statusPill,
              isLiveConnected ? styles.statusPillOnline : styles.statusPillOffline,
            ]}>
            <Text
              style={[
                styles.statusPillText,
                isLiveConnected ? styles.statusPillTextOnline : styles.statusPillTextOffline,
              ]}>
              {isLiveConnected
                ? '● API Live (:4000)'
                : '○ Offline Preview (Mock Data Active)'}
            </Text>
          </View>

          <Pressable onPress={loadCandidates} style={styles.syncBtn}>
            <Text style={styles.syncBtnText}>↻ Refresh</Text>
          </Pressable>
        </View>

        {/* Mutual Match Banner */}
        {lastMatch && (
          <View style={styles.matchBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.matchBannerTitle}>🎉 It's a Mutual Match!</Text>
              <Text style={styles.matchBannerSub}>
                You and {lastMatch} both liked each other! Head to Living Hub to connect.
              </Text>
            </View>
            <Pressable onPress={() => setLastMatch(null)} style={styles.matchCloseBtn}>
              <Text style={styles.matchCloseText}>Dismiss ✕</Text>
            </Pressable>
          </View>
        )}

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#FF385C" style={{ width: 32, height: 32 }} />
            <Text style={styles.loadingText}>Updating roommate recommendations...</Text>
          </View>
        ) : currentCandidate ? (
          <View style={styles.card}>
            {/* Candidate Photo */}
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    currentCandidate.avatar ||
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
                }}
                style={styles.cardImage}
              />
              <View style={styles.imageOverlayBadge}>
                <Text style={styles.imageOverlayBadgeText}>
                  {currentIndex + 1} of {candidates.length}
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              {/* Header Info */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.candidateName}>
                    {currentCandidate.name}, {currentCandidate.age}
                  </Text>
                  <Text style={styles.candidateOccupation}>
                    💼 {currentCandidate.occupation}
                    {currentCandidate.universityOrCompany
                      ? ` • ${currentCandidate.universityOrCompany}`
                      : ''}
                  </Text>
                  <Text style={styles.candidateCity}>📍 {currentCandidate.targetCity}</Text>
                </View>

                {currentCandidate.compatibility && (
                  <View style={styles.compatibilityBadge}>
                    <Text style={styles.compatibilityScore}>
                      {currentCandidate.compatibility.score}%
                    </Text>
                    <Text style={styles.compatibilityLabel}>Match</Text>
                  </View>
                )}
              </View>

              {/* Budget Badge */}
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Monthly Budget:</Text>
                <Text style={styles.budgetValue}>
                  ${currentCandidate.budgetMin} – ${currentCandidate.budgetMax}/mo
                </Text>
              </View>

              {/* Bio */}
              <Text style={styles.bioText}>{currentCandidate.bio}</Text>

              {/* Lifestyle Badges */}
              <Text style={styles.sectionHeader}>Lifestyle & Habits</Text>
              <View style={styles.tagGrid}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    🧼 Cleanliness: {currentCandidate.lifestyle.cleanliness}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    🌙 Sleep: {currentCandidate.lifestyle.sleepSchedule.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    🐾 Pets: {currentCandidate.lifestyle.pets.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    🥗 Diet: {currentCandidate.lifestyle.diet}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    👥 Guests: {currentCandidate.lifestyle.guests.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    🚭 {currentCandidate.lifestyle.smoking ? 'Smoking' : 'Non-smoking'}
                  </Text>
                </View>
              </View>

              {/* Interests */}
              {currentCandidate.interests && currentCandidate.interests.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>Interests & Hobbies</Text>
                  <View style={styles.tagGrid}>
                    {currentCandidate.interests.map((interest, idx) => (
                      <View key={idx} style={[styles.tag, styles.interestTag]}>
                        <Text style={styles.interestTagText}>#{interest}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Compatibility Highlights */}
              {currentCandidate.compatibility?.notes &&
                currentCandidate.compatibility.notes.length > 0 && (
                  <View style={styles.matchNotesBox}>
                    <Text style={styles.matchNotesTitle}>Compatibility Highlights:</Text>
                    {currentCandidate.compatibility.notes.map((note, idx) => (
                      <Text key={idx} style={styles.matchNoteItem}>
                        ✓ {note}
                      </Text>
                    ))}
                  </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.actionBtn, styles.passBtn]}
                onPress={() => handleSwipe('pass')}>
                <Text style={styles.passBtnText}>✕ Pass</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.likeBtn]}
                onPress={() => handleSwipe('like')}>
                <Text style={styles.likeBtnText}>♥ Like Roomie</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>✨</Text>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySub}>
              You have reviewed all roommate candidates in your area. Check back soon for new profiles!
            </Text>
            <Pressable style={styles.refreshBtn} onPress={loadCandidates}>
              <Text style={styles.refreshBtnText}>Review Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  responsiveContainer: {
    width: '100%',
    maxWidth: 540,
  },
  statusPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillOnline: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  statusPillOffline: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPillTextOnline: {
    color: '#15803D',
  },
  statusPillTextOffline: {
    color: '#B45309',
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  matchBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  matchBannerSub: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
    lineHeight: 18,
  },
  matchCloseBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
  },
  matchCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 320,
    backgroundColor: '#CBD5E1',
  },
  cardImage: {
    width: '100%',
    height: 320,
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageOverlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  candidateName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  candidateOccupation: {
    fontSize: 14,
    color: '#475569',
    marginTop: 3,
    fontWeight: '500',
  },
  candidateCity: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },
  compatibilityBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  compatibilityScore: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  compatibilityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  budgetLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 6,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    marginTop: 14,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  interestTag: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  interestTagText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  matchNotesBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  matchNotesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  matchNoteItem: {
    fontSize: 12,
    color: '#047857',
    marginTop: 3,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 16,
    gap: 12,
    backgroundColor: '#FAFAFA',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  passBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  likeBtn: {
    backgroundColor: '#FF385C',
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  likeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  refreshBtn: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
