import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, X, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { VendorBooking } from '@/types';

export default function VendorBookingsScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    if (!user?.id) { setLoading(false); return; }
    const { data: v } = await supabase.from('vendors').select('id').eq('uid', user.id).maybeSingle();
    if (!v) { setLoading(false); return; }
    setVendorId(v.id);
    const { data } = await supabase.from('vendor_bookings').select('*').eq('vendor_id', v.id).order('created_at', { ascending: false });
    setBookings((data as VendorBooking[]) ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    await supabase.from('vendor_bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const relTime = (d: string) => { const diff = Date.now() - new Date(d).getTime(); const h = Math.floor(diff / 3600000); return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`; };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Booking Requests</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{bookings.length} request{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.organizerName, { color: colors.textPrimary }]}>{item.organizer_name}</Text>
                  <Text style={[styles.itemName, { color: colors.textMuted }]}>{item.inventory_item_name}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.eventName, { color: colors.textSecondary }]}>{item.event_name}</Text>
              {item.event_date && <Text style={[styles.eventDate, { color: colors.textMuted }]}>{fmtDate(item.event_date)}</Text>}
              {item.event_level && <Text style={[styles.eventLevel, { color: colors.textMuted }]}>{item.event_level.replace('_', '-')}</Text>}
              {item.message && <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>}
              <Text style={[styles.timestamp, { color: colors.textMuted }]}>{relTime(item.created_at)}</Text>
              {item.status === 'pending' && (
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={[styles.declineBtn, { borderColor: '#EF4444' }]} onPress={() => updateStatus(item.id, 'declined')} activeOpacity={0.8}>
                    <X size={16} color="#EF4444" />
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <GradientButton label="Accept" onPress={() => updateStatus(item.id, 'accepted')} size="sm" style={{ flex: 1 }} />
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: 'rgba(255,30,45,0.08)' }]}><ClipboardList size={32} color="#FF1E2D" /></View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No booking requests yet</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Organizers will reach out when they need your services</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  subtitle: { fontFamily: 'System', fontSize: 14, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  organizerName: { fontFamily: 'System', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  itemName: { fontFamily: 'System', fontSize: 12 },
  divider: { height: 1, marginBottom: 12 },
  eventName: { fontFamily: 'System', fontSize: 14, marginBottom: 3 },
  eventDate: { fontFamily: 'System', fontSize: 12, marginBottom: 2 },
  eventLevel: { fontFamily: 'System', fontSize: 12, textTransform: 'capitalize', marginBottom: 8 },
  message: { fontFamily: 'System', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  timestamp: { fontFamily: 'System', fontSize: 11, marginBottom: 12 },
  actionBtns: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  declineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  declineBtnText: { fontFamily: 'System', fontSize: 14, color: '#EF4444' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontFamily: 'System', fontSize: 18 },
  emptySub: { fontFamily: 'System', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
