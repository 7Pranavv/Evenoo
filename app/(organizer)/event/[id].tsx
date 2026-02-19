import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, CheckCircle, XCircle, Users, Calendar } from 'lucide-react-native';
import { StatusBadge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event, Ticket } from '@/types';

export default function EventManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin' | 'registrations'>('overview');
  const [ticketId, setTicketId] = useState('');
  const [ticketResult, setTicketResult] = useState<Ticket | null>(null);
  const [ticketError, setTicketError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      setEvent(data as Event);
      const { data: regs } = await supabase.from('registrations').select('*').eq('event_id', id).limit(20);
      setRegistrations(regs ?? []);
      setLoading(false);
    })();
  }, [id]);

  const verifyTicket = async () => {
    if (!ticketId.trim()) return;
    setVerifying(true);
    setTicketResult(null);
    setTicketError('');
    const { data } = await supabase.from('tickets').select('*, events(name, event_start, venue_name)').eq('id', ticketId.trim().toUpperCase()).maybeSingle();
    if (!data) setTicketError('Ticket not found. Please check the ID and try again.');
    else setTicketResult(data as Ticket);
    setVerifying(false);
  };

  const checkIn = async () => {
    if (!ticketResult) return;
    setCheckingIn(true);
    await supabase.from('tickets').update({ status: 'used', checked_in_at: new Date().toISOString() }).eq('id', ticketResult.id);
    setTicketResult({ ...ticketResult, status: 'used' });
    setCheckingIn(false);
  };

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'checkin', label: 'Check-in' },
    { key: 'registrations', label: 'Registrations' },
  ] as const;

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color="#FF1E2D" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eventName, { color: colors.textPrimary }]} numberOfLines={1}>{event?.name ?? 'Event'}</Text>
          {event && <StatusBadge status={event.status} />}
        </View>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && styles.tabActive]} activeOpacity={0.7}>
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FF1E2D' : colors.textMuted }]}>{tab.label}</Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && event && (
          <View>
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Event Details</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.event_level.replace('_', '-')} · {event.event_mode} · {event.event_type}</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {event.event_start ? new Date(event.event_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA'}
              </Text>
              {event.venue_name && <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.venue_name}</Text>}
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Registration Stats</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}><Text style={[styles.statValue, { color: colors.textPrimary }]}>{registrations.length}</Text><Text style={[styles.statLabel, { color: colors.textMuted }]}>Registered</Text></View>
                <View style={styles.stat}><Text style={[styles.statValue, { color: colors.textPrimary }]}>{event.max_participants ?? '∞'}</Text><Text style={[styles.statLabel, { color: colors.textMuted }]}>Max</Text></View>
                <View style={styles.stat}><Text style={[styles.statValue, { color: colors.textPrimary }]}>₹0</Text><Text style={[styles.statLabel, { color: colors.textMuted }]}>Revenue</Text></View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'checkin' && (
          <View style={styles.checkinSection}>
            <Text style={[styles.checkinTitle, { color: colors.textPrimary }]}>Verify & Check-in</Text>
            <Text style={[styles.checkinSub, { color: colors.textMuted }]}>Enter or paste a ticket ID to verify and check in a participant</Text>
            <View style={[styles.ticketInput, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                value={ticketId}
                onChangeText={setTicketId}
                placeholder="e.g. EVN-TKT-A3F9X2"
                placeholderTextColor={colors.textMuted}
                style={[styles.ticketInputText, { color: colors.textPrimary }]}
                autoCapitalize="characters"
                onSubmitEditing={verifyTicket}
              />
            </View>
            <GradientButton label={verifying ? 'Verifying...' : 'Verify Ticket'} onPress={verifyTicket} loading={verifying} />

            {ticketError ? (
              <View style={styles.errorCard}>
                <XCircle size={20} color="#DC2626" />
                <Text style={styles.errorCardText}>{ticketError}</Text>
              </View>
            ) : null}

            {ticketResult && (
              <View style={[styles.resultCard, { backgroundColor: ticketResult.status === 'active' ? '#F0FDF4' : '#FEF2F2', borderColor: ticketResult.status === 'active' ? '#86EFAC' : '#FCA5A5' }]}>
                <View style={styles.resultHeader}>
                  {ticketResult.status === 'active' ? <CheckCircle size={20} color="#16A34A" /> : <XCircle size={20} color="#DC2626" />}
                  <Text style={[styles.resultStatus, { color: ticketResult.status === 'active' ? '#16A34A' : '#DC2626' }]}>
                    {ticketResult.status === 'active' ? 'Valid Ticket' : ticketResult.status === 'used' ? 'Already Checked In' : 'Cancelled Ticket'}
                  </Text>
                </View>
                <Text style={styles.resultName}>{ticketResult.member_name}</Text>
                <Text style={styles.resultEmail}>{ticketResult.member_email}</Text>
                <Text style={styles.resultId}>{ticketResult.id}</Text>
                {ticketResult.status === 'used' && ticketResult.checked_in_at && (
                  <Text style={styles.resultTime}>Checked in: {new Date(ticketResult.checked_in_at).toLocaleString('en-IN')}</Text>
                )}
                {ticketResult.status === 'active' && (
                  <GradientButton label="Mark as Used" onPress={checkIn} loading={checkingIn} style={{ marginTop: 12 }} />
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'registrations' && (
          <View>
            {registrations.length === 0 ? (
              <View style={styles.empty}>
                <Users size={32} color="#94A3B8" />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No registrations yet</Text>
              </View>
            ) : (
              registrations.map((reg) => (
                <View key={reg.id} style={[styles.regCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.regType, { color: colors.textPrimary }]}>{reg.type}</Text>
                  <Text style={[styles.regDate, { color: colors.textMuted }]}>{new Date(reg.registered_at).toLocaleDateString('en-IN')}</Text>
                  <StatusBadge status={reg.payment_status} />
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  backBtn: { padding: 4 },
  eventName: { fontFamily: 'System', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabActive: {},
  tabText: { fontFamily: 'System', fontSize: 14 },
  tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, backgroundColor: '#FF1E2D', borderRadius: 999 },
  scrollContent: { padding: 20 },
  infoCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontFamily: 'System', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  infoText: { fontFamily: 'System', fontSize: 14, marginBottom: 4, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: 'System', fontSize: 20, fontWeight: '700' },
  statLabel: { fontFamily: 'System', fontSize: 12 },
  checkinSection: { gap: 16 },
  checkinTitle: { fontFamily: 'System', fontSize: 20, fontWeight: '700' },
  checkinSub: { fontFamily: 'System', fontSize: 14, lineHeight: 20 },
  ticketInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  ticketInputText: { fontFamily: 'System', fontSize: 16, letterSpacing: 1 },
  errorCard: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, backgroundColor: '#FEE2E2', borderRadius: 12 },
  errorCardText: { fontFamily: 'System', fontSize: 14, color: '#DC2626', flex: 1 },
  resultCard: { borderWidth: 1.5, borderRadius: 16, padding: 16, gap: 4 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultStatus: { fontFamily: 'System', fontSize: 15 },
  resultName: { fontFamily: 'System', fontSize: 16, color: '#0F172A' },
  resultEmail: { fontFamily: 'System', fontSize: 13, color: '#64748B' },
  resultId: { fontFamily: 'System', fontSize: 14, color: '#475569', letterSpacing: 1, marginTop: 4 },
  resultTime: { fontFamily: 'System', fontSize: 12, color: '#DC2626', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: { fontFamily: 'System', fontSize: 15 },
  regCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  regType: { fontFamily: 'System', fontSize: 14, flex: 1, textTransform: 'capitalize' },
  regDate: { fontFamily: 'System', fontSize: 12 },
});
