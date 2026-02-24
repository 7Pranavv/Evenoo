import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Shield, X, Edit2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export default function UsersScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers((data as User[]) ?? []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#8B5CF6';
      case 'organizer': return '#FF5A1F';
      case 'vendor': return '#FFB300';
      default: return '#10B981';
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark && styles.shadow]}
      onPress={() => {
        setSelectedUser(item);
        setModalVisible(true);
      }}
      activeOpacity={0.85}>
      <View style={[styles.avatarPlaceholder, { backgroundColor: `${getRoleColor(item.role)}18` }]}>
        <Text style={[styles.avatarInitial, { color: getRoleColor(item.role) }]}>
          {(item.name?.[0] || item.email?.[0] || '?').toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name || 'User'}
        </Text>
        <View style={styles.userMeta}>
          <Mail size={12} color={colors.textMuted} />
          <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}18` }]}>
        <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Users</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{users.length} users</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Shield size={32} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No users found</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>User Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={updating}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedUser && (
                <>
                  <View style={styles.userInfoSection}>
                    <View style={[styles.modalAvatarPlaceholder, { backgroundColor: `${getRoleColor(selectedUser.role)}18` }]}>
                      <Text style={[styles.modalAvatarInitial, { color: getRoleColor(selectedUser.role) }]}>
                        {(selectedUser.name?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.userFullName, { color: colors.textPrimary }]}>{selectedUser.name || 'User'}</Text>
                    <Text style={[styles.userFullEmail, { color: colors.textMuted }]}>{selectedUser.email}</Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Account Information</Text>
                    <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoKey, { color: colors.textMuted }]}>Role:</Text>
                        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{selectedUser.role}</Text>
                      </View>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoKey, { color: colors.textMuted }]}>Status:</Text>
                        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Active</Text>
                      </View>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoKey, { color: colors.textMuted }]}>Joined:</Text>
                        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                          {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('en-IN') : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedUser.role === 'organizer' && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Organizer Status</Text>
                      <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.infoRow}>
                          <Text style={[styles.infoKey, { color: colors.textMuted }]}>Verification:</Text>
                          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                            {selectedUser.organizer_verification_status || 'unverified'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {selectedUser.role === 'participant' && selectedUser.wallet_balance !== undefined && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Wallet</Text>
                      <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.infoRow}>
                          <Text style={[styles.infoKey, { color: colors.textMuted }]}>Balance:</Text>
                          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                            ₹{Number(selectedUser.wallet_balance).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
                disabled={updating}
                activeOpacity={0.7}>
                <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  subtitle: { fontFamily: 'System', fontSize: 13, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  userCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: 'System', fontSize: 18, fontWeight: '700' },
  userName: { fontFamily: 'System', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userEmail: { fontFamily: 'System', fontSize: 12, flex: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleText: { fontFamily: 'System', fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontFamily: 'System', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '600' },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, gap: 16 },
  userInfoSection: { alignItems: 'center', gap: 8, paddingBottom: 16 },
  modalAvatarPlaceholder: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalAvatarInitial: { fontFamily: 'System', fontSize: 28, fontWeight: '700' },
  userFullName: { fontFamily: 'System', fontSize: 18, fontWeight: '700' },
  userFullEmail: { fontFamily: 'System', fontSize: 13 },
  infoSection: { gap: 8 },
  infoLabel: { fontFamily: 'System', fontSize: 12, fontWeight: '600' },
  infoBox: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  infoKey: { fontFamily: 'System', fontSize: 13 },
  infoValue: { fontFamily: 'System', fontSize: 13, fontWeight: '600' },
  divider: { height: 1 },
  modalFooter: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  closeBtn: { flex: 1, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  closeBtnText: { fontFamily: 'System', fontSize: 14, fontWeight: '600' },
});
