import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, Bell, LogOut, Star, Settings } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';

export default function VendorProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark && styles.shadow]}>
          <LinearGradient colors={['#FF1E2D', '#FF5A1F', '#FFB300']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.avatarRing}>
            <View style={[styles.avatarInner, { backgroundColor: colors.surface }]}>
              <View style={[styles.avatarBg, { backgroundColor: 'rgba(255,30,45,0.1)' }]}>
                <Text style={styles.avatarInitial}>{(user?.name ?? 'V')[0].toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name ?? 'Vendor'}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          <Badge label="Vendor" bg="rgba(255,179,0,0.12)" textColor="#D97706" />
          <View style={[styles.ratingRow, { marginTop: 12 }]}>
            {[1,2,3,4,5].map((s) => <Star key={s} size={16} color="#FFB300" fill={s <= 4 ? '#FFB300' : 'none'} />)}
            <Text style={[styles.ratingText, { color: colors.textMuted }]}>4.0 (0 reviews)</Text>
          </View>
        </View>
        <View style={styles.menuSection}>
          {[
            { label: 'Notifications', icon: Bell, color: '#22C55E' },
            { label: 'Settings', icon: Settings, color: '#94A3B8' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={i} style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.7}>
                <View style={[styles.menuIconBg, { backgroundColor: `${item.color}18` }]}><Icon size={18} color={item.color} /></View>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.signOutSection}>
          <TouchableOpacity onPress={async () => { await signOut(); router.replace('/(auth)/welcome'); }} style={styles.signOutBtn} activeOpacity={0.7}>
            <LogOut size={18} color="#DC2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  card: { margin: 20, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatarRing: { width: 84, height: 84, borderRadius: 999, padding: 3, marginBottom: 12 },
  avatarInner: { flex: 1, borderRadius: 999, padding: 2 },
  avatarBg: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: 'System', fontSize: 28, fontWeight: '700', color: '#FF1E2D' },
  userName: { fontFamily: 'System', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontFamily: 'System', fontSize: 14, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontFamily: 'System', fontSize: 13, marginLeft: 4 },
  menuSection: { paddingHorizontal: 20, gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 14, padding: 16 },
  menuIconBg: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontFamily: 'System', fontSize: 15 },
  signOutSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 14, backgroundColor: '#FEE2E2' },
  signOutText: { fontFamily: 'System', fontSize: 15, color: '#DC2626' },
});
