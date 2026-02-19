import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';

const MOCK_NOTIFS: Notification[] = [
  { id: 'n1', recipient_uid: 'demo', title: 'Registration Confirmed', body: 'Your registration for National Hackathon 2025 is confirmed! Your ticket ID: EVN-TKT-A3F9X2', type: 'registration', related_id: 'm1', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', recipient_uid: 'demo', title: 'Event Starting Soon', body: 'Battle of Bands starts in 2 days. Get ready to rock!', type: 'reminder', related_id: 'm2', read: true, created_at: new Date(Date.now() - 6*3600000).toISOString() },
];

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState<Notification[]>(MOCK_NOTIFS);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('notifications').select('*').eq('recipient_uid', user.id).order('created_at', { ascending: false });
      if (data && data.length > 0) setNotifs(data);
    })();
  }, []);

  const markRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const relativeTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
      </View>
      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markRead(item.id)} style={[styles.item, { backgroundColor: item.read ? colors.surface : 'rgba(255,30,45,0.04)', borderColor: colors.border }]} activeOpacity={0.85}>
            <View style={[styles.dot, !item.read && styles.dotActive]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.itemBody, { color: colors.textMuted }]} numberOfLines={2}>{item.body}</Text>
              <Text style={[styles.itemTime, { color: colors.textMuted }]}>{relativeTime(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={32} color="#94A3B8" />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  backBtn: { padding: 4 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  list: { paddingHorizontal: 20, gap: 8, paddingBottom: 24 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: 'transparent', marginTop: 5 },
  dotActive: { backgroundColor: '#FF1E2D' },
  itemTitle: { fontFamily: 'System', fontSize: 14, marginBottom: 3 },
  itemBody: { fontFamily: 'System', fontSize: 13, lineHeight: 18, marginBottom: 4 },
  itemTime: { fontFamily: 'System', fontSize: 11 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontFamily: 'System', fontSize: 15 },
});
