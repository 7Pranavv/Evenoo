import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Clock, Users, TrendingUp, ChevronRight, Plus } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/organizer/StatCard';
import { StatusBadge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

export default function OrganizerDashboard() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('events').select('*').eq('created_by', user.id).order('created_at', { ascending: false }).limit(10);
    setEvents((data as Event[]) ?? []);
    setLoading(false);
  };

  const total = events.length;
  const pending = events.filter((e) => e.status === 'pending_approval').length;
  const live = events.filter((e) => e.status === 'live').length;
  const recentEvents = events.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>Hello,</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] ?? 'Organizer'}</Text>
          </View>
          <View style={[styles.roleTag, { backgroundColor: 'rgba(255,30,45,0.1)' }]}>
            <Text style={styles.roleText}>Organizer</Text>
          </View>
        </View>

        {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginTop: 20 }} /> : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard label="Total Events" value={total} icon={<Calendar size={18} color="#FF1E2D" />} accentColors={['#FF1E2D', '#FF5A1F']} />
                <StatCard label="Pending" value={pending} icon={<Clock size={18} color="#FF5A1F" />} accentColors={['#FF5A1F', '#FFB300']} />
              </View>
              <View style={styles.statsRow}>
                <StatCard label="Live Events" value={live} icon={<Users size={18} color="#22C55E" />} accentColors={['#22C55E', '#16A34A']} />
                <StatCard label="Revenue" value="₹0" icon={<TrendingUp size={18} color="#FFB300" />} accentColors={['#FFB300', '#F59E0B']} />
              </View>
            </View>

            <View style={styles.quickActions}>
              <GradientButton label="Create New Event" onPress={() => router.push('/(organizer)/create')} />
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: '#FF1E2D' }]} onPress={() => router.push('/(organizer)/events')} activeOpacity={0.7}>
                <Text style={styles.outlineBtnText}>View All Events</Text>
                <ChevronRight size={16} color="#FF1E2D" />
              </TouchableOpacity>
            </View>

            {recentEvents.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Events</Text>
                {recentEvents.map((event) => (
                  <TouchableOpacity key={event.id} style={[styles.eventItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push(`/(organizer)/event/${event.id}`)} activeOpacity={0.8}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.eventName, { color: colors.textPrimary }]} numberOfLines={1}>{event.name}</Text>
                      <Text style={[styles.eventDate, { color: colors.textMuted }]}>
                        {event.event_start ? new Date(event.event_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBA'}
                      </Text>
                    </View>
                    <StatusBadge status={event.status} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {events.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: 'rgba(255,30,45,0.08)' }]}>
                  <Calendar size={32} color="#FF1E2D" />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No events yet</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Create your first event to get started</Text>
              </View>
            )}
          </>
        )}
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
  roleText: { fontFamily: 'System', fontSize: 12, color: '#FF1E2D' },
  statsGrid: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12 },
  quickActions: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, height: 52, gap: 6 },
  outlineBtnText: { fontFamily: 'System', fontSize: 15, color: '#FF1E2D' },
  recentSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  eventItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  eventName: { fontFamily: 'System', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  eventDate: { fontFamily: 'System', fontSize: 12 },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'System', fontSize: 18, marginBottom: 8 },
  emptySub: { fontFamily: 'System', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
