import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { EventCard } from '@/components/participant/EventCard';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

const MOCK_EVENTS: Partial<Event>[] = [
  { id: 'm1', name: 'National Hackathon 2025', tagline: '48 hours to build something incredible', event_level: 'national', event_mode: 'offline', event_start: new Date(Date.now() + 7*86400000).toISOString(), venue_name: 'BITS Pilani', fee_type: 'paid', fee_per_person: 200, fee_structure: 'per_person', team_flat_fee: 0, verified_badge: true, status: 'live', banner_url: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'team' },
  { id: 'm2', name: 'Battle of Bands', tagline: 'Showcase your music talent', event_level: 'inter_college', event_mode: 'offline', event_start: new Date(Date.now() + 14*86400000).toISOString(), venue_name: 'IIT Delhi', fee_type: 'free', fee_per_person: 0, fee_structure: null, team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'team' },
  { id: 'm3', name: 'Photography Contest', tagline: 'Capture the perfect moment', event_level: 'college', event_mode: 'online', event_start: new Date(Date.now() + 5*86400000).toISOString(), platform_name: 'Instagram', fee_type: 'free', fee_per_person: 0, fee_structure: null, team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'individual' },
  { id: 'm4', name: 'Debate Championship', tagline: 'Argue your way to the top', event_level: 'state', event_mode: 'offline', event_start: new Date(Date.now() + 21*86400000).toISOString(), venue_name: 'Jadavpur University', fee_type: 'paid', fee_per_person: 150, fee_structure: 'per_person', team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/3280908/pexels-photo-3280908.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'individual' },
  { id: 'm5', name: 'Dance Fiesta', tagline: 'Move to the rhythm', event_level: 'inter_college', event_mode: 'offline', event_start: new Date(Date.now() + 10*86400000).toISOString(), venue_name: 'NIT Trichy', fee_type: 'paid', fee_per_person: 100, fee_structure: 'per_person', team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'team' },
];

const LEVEL_OPTS = [
  { key: 'all', label: 'All Levels' }, { key: 'college', label: 'College' },
  { key: 'inter_college', label: 'Inter-College' }, { key: 'state', label: 'State' }, { key: 'national', label: 'National' },
];
const MODE_OPTS = [
  { key: 'all', label: 'All Modes' }, { key: 'online', label: 'Online' }, { key: 'offline', label: 'Offline' }, { key: 'hybrid', label: 'Hybrid' },
];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Partial<Event>[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('events').select('*').eq('status', 'live').limit(30);
      if (data && data.length > 0) setEvents(data);
      setLoading(false);
    })();
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = selectedLevel === 'all' || e.event_level === selectedLevel;
    const matchMode = selectedMode === 'all' || e.event_mode === selectedMode;
    return matchSearch && matchLevel && matchMode;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Find your next event</Text>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search events..." placeholderTextColor={colors.textMuted} style={[styles.searchInput, { color: colors.textPrimary }]} />
        {search ? <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}><X size={16} color={colors.textMuted} /></TouchableOpacity> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {LEVEL_OPTS.map((opt) => (
          <TouchableOpacity key={opt.key} onPress={() => setSelectedLevel(opt.key)} style={[styles.filterChip, { borderColor: selectedLevel === opt.key ? '#FF1E2D' : colors.border, backgroundColor: selectedLevel === opt.key ? 'rgba(255,30,45,0.08)' : colors.surface }]} activeOpacity={0.7}>
            <Text style={[styles.filterText, { color: selectedLevel === opt.key ? '#FF1E2D' : colors.textMuted }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: 4, alignSelf: 'center' }} />
        {MODE_OPTS.map((opt) => (
          <TouchableOpacity key={opt.key} onPress={() => setSelectedMode(opt.key)} style={[styles.filterChip, { borderColor: selectedMode === opt.key ? '#FF5A1F' : colors.border, backgroundColor: selectedMode === opt.key ? 'rgba(255,90,31,0.08)' : colors.surface }]} activeOpacity={0.7}>
            <Text style={[styles.filterText, { color: selectedMode === opt.key ? '#FF5A1F' : colors.textMuted }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: colors.textMuted }]}>{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</Text>
      </View>
      {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id ?? ''}
          renderItem={({ item, index }) => <EventCard event={item as Event} onPress={() => router.push(`/(participant)/event/${item.id}`)} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No events found</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Try adjusting your filters</Text>
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: 'System', fontSize: 15, padding: 0 },
  filterScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  filterText: { fontFamily: 'System', fontSize: 12 },
  resultsRow: { paddingHorizontal: 20, marginBottom: 8 },
  resultsText: { fontFamily: 'System', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: 'System', fontSize: 16, marginBottom: 6 },
  emptySub: { fontFamily: 'System', fontSize: 13 },
});
