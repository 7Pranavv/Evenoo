import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Users, ChevronRight, Plus } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending_approval', label: 'Pending' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function MyEventsScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('events').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
    setEvents((data as Event[]) ?? []);
    setLoading(false);
  };

  const filtered = selectedStatus === 'all' ? events : events.filter((e) => e.status === selectedStatus);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Events</Text>
        <TouchableOpacity onPress={() => router.push('/(organizer)/create')} style={[styles.createBtn, { backgroundColor: 'rgba(255,30,45,0.1)' }]} activeOpacity={0.7}>
          <Plus size={18} color="#FF1E2D" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity key={f.key} onPress={() => setSelectedStatus(f.key)} style={[styles.filterChip, { borderColor: selectedStatus === f.key ? '#FF1E2D' : colors.border, backgroundColor: selectedStatus === f.key ? '#FF1E2D' : colors.surface }]} activeOpacity={0.7}>
            <Text style={[styles.filterText, { color: selectedStatus === f.key ? '#fff' : colors.textMuted }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push(`/(organizer)/event/${item.id}`)} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.eventMeta}>
                  <Calendar size={12} color="#FF1E2D" />
                  <Text style={[styles.eventDate, { color: colors.textMuted }]}>
                    {item.event_start ? new Date(item.event_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                  </Text>
                </View>
                {item.tagline ? <Text style={[styles.eventTagline, { color: colors.textMuted }]} numberOfLines={1}>{item.tagline}</Text> : null}
              </View>
              <View style={styles.eventRight}>
                <StatusBadge status={item.status} />
                <ChevronRight size={16} color={colors.textMuted} style={{ marginTop: 8 }} />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Calendar size={32} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No {selectedStatus === 'all' ? '' : selectedStatus} events</Text>
              <GradientButton label="Create Event" onPress={() => router.push('/(organizer)/create')} style={{ marginTop: 16 }} size="sm" />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  createBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  filterText: { fontFamily: 'System', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  eventCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10 },
  eventName: { fontFamily: 'System', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  eventDate: { fontFamily: 'System', fontSize: 12 },
  eventTagline: { fontFamily: 'System', fontSize: 12 },
  eventRight: { alignItems: 'flex-end' },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontFamily: 'System', fontSize: 15 },
});
