import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ticket as TicketIcon } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { TicketCard } from '@/components/participant/TicketCard';
import { useTheme } from '@/hooks/useTheme';
import { getCollection, getDocument } from '@/lib/db';
import { Ticket } from '@/types';

const MOCK_TICKETS: Ticket[] = [
  { id: 'EVN-TKT-A3F9X2', event_id: 'm1', registration_id: null, team_registration_id: null, member_name: 'Demo User', member_email: 'demo@example.com', uid: 'demo', status: 'active', checked_in_at: null, checked_in_by: null, issued_at: new Date().toISOString(), events: { id: 'm1', name: 'National Hackathon 2025', event_start: new Date(Date.now() + 7*86400000).toISOString(), venue_name: 'BITS Pilani', platform_name: null, banner_url: null } },
  { id: 'EVN-TKT-B7K3M1', event_id: 'm2', registration_id: null, team_registration_id: 'team-001', member_name: 'Demo User', member_email: 'demo@example.com', uid: 'demo', status: 'active', checked_in_at: null, checked_in_by: null, issued_at: new Date().toISOString(), events: { id: 'm2', name: 'Battle of Bands', event_start: new Date(Date.now() + 14*86400000).toISOString(), venue_name: 'IIT Delhi', platform_name: null, banner_url: null } },
];

export default function TicketsScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    if (!user?.id) { setTickets(MOCK_TICKETS); setLoading(false); return; }
    try {
      const data = await getCollection<Ticket>('tickets', [where('uid', '==', user.id), orderBy('issued_at', 'desc')]);
      const enriched = await Promise.all(data.map(async (t) => {
        try {
          const event = await getDocument<any>('events', t.event_id);
          return { ...t, events: event ? { id: event.id, name: event.name, event_start: event.event_start, venue_name: event.venue_name, platform_name: event.platform_name, banner_url: event.banner_url } : null };
        } catch { return t; }
      }));
      setTickets(enriched.length > 0 ? enriched as Ticket[] : MOCK_TICKETS);
    } catch {
      setTickets(MOCK_TICKETS);
    }
    setLoading(false);
  };

  const individual = tickets.filter((t) => !t.team_registration_id);
  const team = tickets.filter((t) => t.team_registration_id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Tickets</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</Text>
      </View>
      {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} /> :
        tickets.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: 'rgba(255,30,45,0.08)' }]}>
              <TicketIcon size={32} color="#FF1E2D" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No tickets yet</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>Register for events to get your tickets here</Text>
          </View>
        ) : (
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                {individual.length > 0 && (
                  <View>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Individual</Text>
                    {individual.map((t) => <TicketCard key={t.id} ticket={t} />)}
                  </View>
                )}
                {team.length > 0 && (
                  <View>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Team Tickets</Text>
                    {team.map((t) => <TicketCard key={t.id} ticket={t} />)}
                  </View>
                )}
              </>
            }
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  subtitle: { fontFamily: 'System', fontSize: 14, marginTop: 2, color: '#94A3B8' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'System', fontSize: 18, marginBottom: 8 },
  emptySub: { fontFamily: 'System', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionLabel: { fontFamily: 'System', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 4 },
});
