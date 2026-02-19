import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { WalletTransaction } from '@/types';

const MOCK_TX: WalletTransaction[] = [
  { id: 't1', user_id: 'demo', type: 'credit', amount: 500, description: 'Wallet top-up', event_id: null, created_at: new Date(Date.now() - 2*86400000).toISOString() },
  { id: 't2', user_id: 'demo', type: 'debit', amount: 200, description: 'Registration: National Hackathon 2025', event_id: 'm1', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 't3', user_id: 'demo', type: 'credit', amount: 1000, description: 'Wallet top-up', event_id: null, created_at: new Date(Date.now() - 5*86400000).toISOString() },
];

export default function WalletScreen() {
  const { user, fetchUser } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_TX);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data && data.length > 0) setTransactions(data);
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0 || !user?.id) return;
    setTopupLoading(true);
    await supabase.from('wallet_transactions').insert({ user_id: user.id, type: 'credit', amount, description: 'Wallet top-up' });
    await supabase.from('users').update({ wallet_balance: (user.wallet_balance ?? 0) + amount }).eq('id', user.id);
    await fetchUser(user.id);
    await fetchTransactions();
    setShowTopup(false);
    setTopupAmount('');
    setTopupLoading(false);
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Wallet</Text>
      </View>
      <View style={styles.balanceWrapper}>
        <LinearGradient colors={['#FF1E2D', '#FF5A1F', '#FFB300']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{(user?.wallet_balance ?? 0).toFixed(2)}</Text>
          <TouchableOpacity style={styles.addMoneyBtn} onPress={() => setShowTopup(true)} activeOpacity={0.85}>
            <Plus size={16} color="#FF1E2D" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.txItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.txIcon, { backgroundColor: item.type === 'credit' ? '#DCFCE7' : '#FEE2E2' }]}>
              {item.type === 'credit' ? <TrendingUp size={18} color="#16A34A" /> : <TrendingDown size={18} color="#DC2626" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.txDesc, { color: colors.textPrimary }]} numberOfLines={1}>{item.description}</Text>
              <Text style={[styles.txDate, { color: colors.textMuted }]}>{fmtDate(item.created_at)}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'credit' ? '#16A34A' : '#DC2626' }]}>
              {item.type === 'credit' ? '+' : '-'}₹{item.amount.toFixed(0)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.txList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet</Text>}
      />

      <Modal visible={showTopup} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Money</Text>
              <TouchableOpacity onPress={() => setShowTopup(false)} activeOpacity={0.7}><X size={22} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <View style={[styles.amountInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text style={[styles.rupee, { color: colors.textPrimary }]}>₹</Text>
              <TextInput value={topupAmount} onChangeText={setTopupAmount} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={[styles.amountText, { color: colors.textPrimary }]} autoFocus />
            </View>
            <View style={styles.quickRow}>
              {[100, 250, 500, 1000].map((amt) => (
                <TouchableOpacity key={amt} style={[styles.quickChip, { borderColor: colors.border }]} onPress={() => setTopupAmount(String(amt))} activeOpacity={0.7}>
                  <Text style={[styles.quickText, { color: colors.textPrimary }]}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <GradientButton label="Add to Wallet" onPress={handleTopup} loading={topupLoading} disabled={!topupAmount} style={{ marginTop: 16 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  balanceWrapper: { paddingHorizontal: 20, marginBottom: 24 },
  balanceCard: { borderRadius: 22, padding: 24, alignItems: 'center' },
  balanceLabel: { fontFamily: 'System', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  balanceAmount: { fontFamily: 'System', fontSize: 44, fontWeight: '700', color: '#fff', marginBottom: 20 },
  addMoneyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  addMoneyText: { fontFamily: 'System', fontSize: 14, color: '#FF1E2D' },
  sectionTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
  txList: { paddingHorizontal: 20, gap: 10, paddingBottom: 24 },
  txItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  txIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txDesc: { fontFamily: 'System', fontSize: 14 },
  txDate: { fontFamily: 'System', fontSize: 12, marginTop: 2 },
  txAmount: { fontFamily: 'System', fontSize: 15, fontWeight: '700' },
  emptyText: { textAlign: 'center', fontFamily: 'System', fontSize: 14, marginTop: 40 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontFamily: 'System', fontSize: 20, fontWeight: '700' },
  amountInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  rupee: { fontFamily: 'System', fontSize: 22, marginRight: 4 },
  amountText: { flex: 1, fontFamily: 'System', fontSize: 28, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickChip: { flex: 1, borderWidth: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 10 },
  quickText: { fontFamily: 'System', fontSize: 14 },
});
