import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Package, ClipboardList, CheckCircle, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/organizer/StatCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeItems: 0, totalBookings: 0, accepted: 0, pending: 0 });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: vendor } = await supabase.from('vendors').select('id').eq('uid', user.id).maybeSingle();
      if (!vendor) return;
      setVendorId(vendor.id);
      const { data: items } = await supabase.from('vendor_inventory').select('id, availability_status').eq('vendor_id', vendor.id);
      const { data: bookings } = await supabase.from('vendor_bookings').select('id, status').eq('vendor_id', vendor.id);
      setStats({
        activeItems: items?.filter((i) => i.availability_status === 'available').length ?? 0,
        totalBookings: bookings?.length ?? 0,
        accepted: bookings?.filter((b) => b.status === 'accepted').length ?? 0,
        pending: bookings?.filter((b) => b.status === 'pending').length ?? 0,
      });
    })();
  }, [user?.id]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>Hello,</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] ?? 'Vendor'}</Text>
          </View>
          <View style={[styles.roleTag, { backgroundColor: 'rgba(255,179,0,0.12)' }]}>
            <Text style={[styles.roleText, { color: '#D97706' }]}>Vendor</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="Active Items" value={stats.activeItems} icon={<Package size={18} color="#FF1E2D" />} accentColors={['#FF1E2D', '#FF5A1F']} />
            <StatCard label="Total Inquiries" value={stats.totalBookings} icon={<ClipboardList size={18} color="#FF5A1F" />} accentColors={['#FF5A1F', '#FFB300']} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Accepted" value={stats.accepted} icon={<CheckCircle size={18} color="#22C55E" />} accentColors={['#22C55E', '#16A34A']} />
            <StatCard label="Pending" value={stats.pending} icon={<Clock size={18} color="#F59E0B" />} accentColors={['#F59E0B', '#D97706']} />
          </View>
        </View>

        <View style={styles.quickActions}>
          <GradientButton label="Manage Inventory" onPress={() => router.push('/(vendor)/inventory')} />
          <TouchableOpacity style={[styles.outlineBtn, { borderColor: '#FF1E2D' }]} onPress={() => router.push('/(vendor)/bookings')} activeOpacity={0.7}>
            <Text style={styles.outlineBtnText}>View Booking Requests</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  greeting: { fontFamily: 'System', fontSize: 14 },
  userName: { fontFamily: 'System', fontSize: 22, fontWeight: '700' },
  roleTag: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  roleText: { fontFamily: 'System', fontSize: 12 },
  statsGrid: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12 },
  quickActions: { paddingHorizontal: 20, gap: 12 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, height: 52 },
  outlineBtnText: { fontFamily: 'System', fontSize: 15, color: '#FF1E2D' },
});
