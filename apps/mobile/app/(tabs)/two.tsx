import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Chore, Expense } from '@roomie/shared';
import { RoomieApiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { FALLBACK_CHORES, FALLBACK_EXPENSES } from '@/services/fallbackData';

export default function RoomieHubScreen() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chores' | 'expenses'>('chores');
  const [chores, setChores] = useState<Chore[]>(FALLBACK_CHORES);
  const [expenses, setExpenses] = useState<Expense[]>(FALLBACK_EXPENSES);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadHubData = async () => {
    setIsLoading(true);
    try {
      if (token) {
        RoomieApiClient.setToken(token);
      }
      const [choresData, expensesData] = await Promise.all([
        RoomieApiClient.getChores(),
        RoomieApiClient.getExpenses(),
      ]);
      setChores(choresData);
      setExpenses(expensesData.expenses);
      setBalances(expensesData.balances);
    } catch (err: any) {
      console.warn('Using fallback hub data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHubData();
  }, [token]);

  const handleToggleChore = async (chore: Chore) => {
    const nextStatus = chore.status === 'completed' ? 'pending' : 'completed';
    setChores((prev) =>
      prev.map((c) => (c.id === chore.id ? { ...c, status: nextStatus } : c))
    );

    try {
      await RoomieApiClient.updateChoreStatus(chore.id, nextStatus);
    } catch (err: any) {
      console.warn('Chore status toggle handled locally');
    }
  };

  const handleSettleExpense = async (expense: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? { ...e, settled: true } : e))
    );

    try {
      await RoomieApiClient.settleExpense(expense.id);
    } catch (err: any) {
      console.warn('Expense settled locally');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.responsiveContainer}>
        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segmentBtn, activeTab === 'chores' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('chores')}>
            <Text
              style={[
                styles.segmentText,
                activeTab === 'chores' && styles.segmentTextActive,
              ]}>
              🧹 Chores ({chores.filter((c) => c.status !== 'completed').length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, activeTab === 'expenses' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('expenses')}>
            <Text
              style={[
                styles.segmentText,
                activeTab === 'expenses' && styles.segmentTextActive,
              ]}>
              💳 Shared Bills ({expenses.filter((e) => !e.settled).length})
            </Text>
          </Pressable>
        </View>

        {activeTab === 'chores' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Household Chore Schedule</Text>
            <Text style={styles.sectionSubtitle}>
              Complete shared chores to keep the living space clean and earn roommate points!
            </Text>

            {chores.map((chore) => {
              const isDone = chore.status === 'completed';
              return (
                <View key={chore.id} style={[styles.choreCard, isDone && styles.choreCardDone]}>
                  <Pressable
                    style={[styles.checkbox, isDone && styles.checkboxDone]}
                    onPress={() => handleToggleChore(chore)}>
                    {isDone && <Text style={styles.checkIcon}>✓</Text>}
                  </Pressable>

                  <View style={styles.choreDetails}>
                    <Text style={[styles.choreTitle, isDone && styles.choreTitleDone]}>
                      {chore.title}
                    </Text>
                    {chore.description ? (
                      <Text style={styles.choreDescription}>{chore.description}</Text>
                    ) : null}
                    <View style={styles.choreMetaRow}>
                      <Text style={styles.choreDueDate}>
                        📅 Due: {new Date(chore.dueDate).toLocaleDateString()}
                      </Text>
                      <View style={styles.pointsPill}>
                        <Text style={styles.pointsText}>+{chore.points} pts</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shared Household Expenses</Text>
            <Text style={styles.sectionSubtitle}>
              Split rent, utilities, and groceries transparently among flatmates.
            </Text>

            {/* Balance Summary Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceCardTitle}>Active Unsettled Bills</Text>
              <Text style={styles.balanceCardAmount}>
                $
                {expenses
                  .filter((e) => !e.settled)
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toFixed(2)}
              </Text>
              <Text style={styles.balanceCardSub}>
                {expenses.filter((e) => !e.settled).length} pending payments
              </Text>
            </View>

            {expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <Text style={styles.expenseCategory}>
                      📂 {expense.category.toUpperCase()} •{' '}
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.splitsContainer}>
                  {expense.splits.map((split, idx) => (
                    <View key={idx} style={styles.splitRow}>
                      <Text style={styles.splitUser}>Roommate #{idx + 1}</Text>
                      <Text style={styles.splitAmount}>
                        ${split.amount.toFixed(2)} ({split.paid ? 'Paid' : 'Pending'})
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.expenseFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      expense.settled ? styles.statusBadgeSettled : styles.statusBadgePending,
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        expense.settled
                          ? styles.statusBadgeTextSettled
                          : styles.statusBadgeTextPending,
                      ]}>
                      {expense.settled ? 'Settled' : 'Unpaid Balance'}
                    </Text>
                  </View>

                  {!expense.settled && (
                    <Pressable
                      style={styles.settleBtn}
                      onPress={() => handleSettleExpense(expense)}>
                      <Text style={styles.settleBtnText}>Settle Up</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
  },
  section: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  choreCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  choreCardDone: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  choreDetails: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  choreTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  choreDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  choreMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  choreDueDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  pointsPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  balanceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  balanceCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceCardAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 6,
  },
  balanceCardSub: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 4,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  splitsContainer: {
    marginVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  splitUser: {
    fontSize: 12,
    color: '#64748B',
  },
  splitAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePending: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeSettled: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextPending: {
    color: '#DC2626',
  },
  statusBadgeTextSettled: {
    color: '#16A34A',
  },
  settleBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  settleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
