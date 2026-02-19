import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Globe, Users, Trophy, Award, BadgeCheck, Clock } from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

const { width } = Dimensions.get('window');

const MOCK: Event = {
  id: 'm1', name: 'National Hackathon 2025', tagline: '48 hours to build something that matters',
  description: 'Join the most prestigious college hackathon in India.\n\n500+ teams. ₹5L in prizes. Top mentors from leading tech companies.\n\nBuild something incredible in just 48 hours — AI/ML, web dev, mobile apps, blockchain, or anything else that sparks your imagination.',
  category_id: null, subcategory_id: null, event_type: 'team', event_level: 'national', event_mode: 'offline',
  registration_start: new Date(Date.now() - 7*86400000).toISOString(),
  registration_end: new Date(Date.now() + 5*86400000).toISOString(),
  event_start: new Date(Date.now() + 7*86400000).toISOString(),
  event_end: new Date(Date.now() + 9*86400000).toISOString(),
  result_date: new Date(Date.now() + 10*86400000).toISOString(),
  venue_name: 'BITS Pilani', venue_address: 'Vidya Vihar, Pilani, Rajasthan 333031', venue_maps_link: null,
  platform_name: null, meeting_link: null, access_code: null,
  organizer_type: 'college', contact_email: 'hackathon@bits.ac.in', contact_phone: '+91 98765 43210', whatsapp_number: null,
  max_participants: 500, registration_visibility: 'public',
  eligibility_criteria: 'Open to all college students across India.', participant_instructions: 'Bring your laptops and power banks.',
  min_team_size: 2, max_team_size: 4, max_team_size_custom: null, team_name_required: true, team_leader_mandatory: true, allow_self_registration_only: true,
  submission_required: true, submission_type: 'link', allowed_file_formats: [], submission_deadline: new Date(Date.now() + 9*86400000).toISOString(), max_file_size_mb: 10,
  fee_type: 'paid', fee_structure: 'per_team_flat', fee_per_person: 200, team_flat_fee: 500, team_fee_cap: 0,
  payment_deadline: new Date(Date.now() + 5*86400000).toISOString(), late_fee: 0, refund_policy: 'no_refund',
  prize_pool_amount: 500000, prize_pool_type: 'monetary',
  prize_breakdown: [{ position: '1st Place', amount: '₹2,00,000' }, { position: '2nd Place', amount: '₹1,00,000' }, { position: '3rd Place', amount: '₹50,000' }],
  certificate_types: ['Participation', 'Merit', 'Winner'], certificate_issuer: 'BITS Pilani',
  logo_url: null, banner_url: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=1200',
  gallery_urls: [], sponsor_logos: [],
  instagram_link: null, youtube_link: null, website_link: 'https://hackatbits.com', hashtags: ['HackAtBITS'],
  promotional_description: null,
  rules_and_regulations: '1. All work must be done during the hackathon.\n2. Teams must present a working prototype.\n3. No pre-built projects allowed.',
  code_of_conduct: null, disclaimer: null,
  registrations_enabled: true, registrations_paused: false, auto_close_on_capacity: true,
  featured: true, verified_badge: true, admin_notes: null, analytics_access_enabled: true, admin_approval_note: null,
  created_by: 'org1', status: 'live', view_count: 1420, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

const MOCK_MAP: Record<string, Event> = {
  m1: MOCK,
  m2: { ...MOCK, id: 'm2', name: 'Battle of Bands', event_type: 'team', event_level: 'inter_college', fee_type: 'free', fee_structure: null, team_flat_fee: 0, fee_per_person: 0, banner_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200', venue_name: 'IIT Delhi' },
  m3: { ...MOCK, id: 'm3', name: 'Photography Contest', event_type: 'individual', event_level: 'college', event_mode: 'online', fee_type: 'free', fee_structure: null, team_flat_fee: 0, fee_per_person: 0, banner_url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200', platform_name: 'Instagram', venue_name: null },
  m4: { ...MOCK, id: 'm4', name: 'Debate Championship', event_type: 'individual', event_level: 'state', fee_type: 'paid', fee_structure: 'per_person', fee_per_person: 150, team_flat_fee: 0, banner_url: 'https://images.pexels.com/photos/3280908/pexels-photo-3280908.jpeg?auto=compress&cs=tinysrgb&w=1200', venue_name: 'Jadavpur University' },
};

const LEVEL_LABELS: Record<string, string> = { college: 'College', inter_college: 'Inter-College', state: 'State', national: 'National' };
const MODE_LABELS: Record<string, string> = { online: 'Online', offline: 'Offline', hybrid: 'Hybrid' };

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<Event>(MOCK_MAP[id ?? 'm1'] ?? MOCK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || MOCK_MAP[id]) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      if (data) setEvent(data as Event);
      setLoading(false);
    })();
  }, [id]);

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA';

  if (loading) return <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}><ActivityIndicator color="#FF1E2D" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: event.banner_url ?? 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=1200' }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(10,14,23,0.92)']} style={styles.heroGradient} />
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <Badge label={LEVEL_LABELS[event.event_level]} bg="rgba(255,255,255,0.2)" textColor="#fff" />
              <Badge label={MODE_LABELS[event.event_mode]} bg="rgba(255,255,255,0.2)" textColor="#fff" />
              <Badge label={event.event_type === 'team' ? 'Team' : 'Solo'} bg="rgba(255,255,255,0.2)" textColor="#fff" />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.heroTitle} numberOfLines={2}>{event.name}</Text>
              {event.verified_badge && <BadgeCheck size={20} color="#FFB300" />}
            </View>
            {event.tagline ? <Text style={styles.heroTagline}>{event.tagline}</Text> : null}
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Date & Time</Text>
            <View style={styles.infoRow}><Calendar size={16} color="#FF1E2D" /><Text style={[styles.infoText, { color: colors.textSecondary }]}>{fmtDate(event.event_start)}</Text></View>
            {event.event_end && <View style={styles.infoRow}><Clock size={16} color="#FF5A1F" /><Text style={[styles.infoText, { color: colors.textSecondary }]}>Ends: {fmtDate(event.event_end)}</Text></View>}
            <View style={[styles.divider, { borderColor: colors.border }]} />
            <Text style={[styles.subLabel, { color: colors.textMuted }]}>Registration closes</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{fmtDate(event.registration_end)}</Text>
          </View>

          {(event.venue_name || event.platform_name) && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{event.event_mode === 'online' ? 'Platform' : 'Venue'}</Text>
              <View style={styles.infoRow}>
                {event.event_mode === 'online' ? <Globe size={16} color="#FF1E2D" /> : <MapPin size={16} color="#FF1E2D" />}
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.venue_name ?? event.platform_name}</Text>
              </View>
              {event.venue_address && <Text style={[styles.subText, { color: colors.textMuted }]}>{event.venue_address}</Text>}
            </View>
          )}

          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
            <Text style={[styles.descText, { color: colors.textSecondary }]}>{event.description}</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Registration Fee</Text>
            {event.fee_type === 'free' ? (
              <Text style={styles.freeText}>Free</Text>
            ) : (
              <Text style={[styles.feeAmount, { color: colors.textPrimary }]}>
                {event.fee_structure === 'per_team_flat' ? `₹${event.team_flat_fee} per team` :
                 event.fee_structure === 'per_person' ? `₹${event.fee_per_person} per person` :
                 `₹${event.fee_per_person}/person (cap ₹${event.team_fee_cap})`}
              </Text>
            )}
          </View>

          {event.event_type === 'team' && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Team Configuration</Text>
              <View style={styles.infoRow}>
                <Users size={16} color="#FF1E2D" />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.min_team_size}–{event.max_team_size_custom ?? event.max_team_size} members per team</Text>
              </View>
              {event.team_name_required && <Text style={[styles.subText, { color: colors.textMuted }]}>Team name required</Text>}
            </View>
          )}

          {event.prize_pool_amount > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Prizes</Text>
                <Text style={styles.prizeTotal}>₹{(event.prize_pool_amount / 100000).toFixed(1)}L total</Text>
              </View>
              {event.prize_breakdown?.map((p, i) => (
                <View key={i} style={[styles.prizeRow, { borderColor: colors.border }]}>
                  <Trophy size={14} color="#FFB300" />
                  <Text style={[styles.prizePos, { color: colors.textPrimary }]}>{p.position}</Text>
                  <Text style={styles.prizeAmt}>{p.amount}</Text>
                </View>
              ))}
            </View>
          )}

          {event.certificate_types && event.certificate_types.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Certificates</Text>
              <View style={styles.certRow}>
                {event.certificate_types.map((c, i) => (
                  <View key={i} style={[styles.certChip, { borderColor: colors.border }]}>
                    <Award size={13} color="#FF5A1F" />
                    <Text style={[styles.certText, { color: colors.textSecondary }]}>{c}</Text>
                  </View>
                ))}
              </View>
              {event.certificate_issuer && <Text style={[styles.subText, { color: colors.textMuted }]}>Issued by {event.certificate_issuer}</Text>}
            </View>
          )}

          {event.rules_and_regulations && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Rules & Regulations</Text>
              <Text style={[styles.descText, { color: colors.textSecondary }]}>{event.rules_and_regulations}</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
      <View style={[styles.stickyFooter, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <GradientButton label="Register Now" onPress={() => {}} size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 220 },
  backBtn: { position: 'absolute', left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 10 },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  heroBadges: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroTitle: { flex: 1, fontFamily: 'System', fontSize: 22, fontWeight: '700', color: '#fff', lineHeight: 30 },
  heroTagline: { fontFamily: 'System', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  content: { padding: 16 },
  infoCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontFamily: 'System', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontFamily: 'System', fontSize: 14, flex: 1 },
  subText: { fontFamily: 'System', fontSize: 13, marginTop: 4 },
  subLabel: { fontFamily: 'System', fontSize: 12, marginBottom: 4 },
  divider: { borderBottomWidth: 1, marginVertical: 12 },
  descText: { fontFamily: 'System', fontSize: 14, lineHeight: 22 },
  freeText: { fontFamily: 'System', fontSize: 18, color: '#22C55E' },
  feeAmount: { fontFamily: 'System', fontSize: 18 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  prizeTotal: { fontFamily: 'System', fontSize: 14, color: '#FF5A1F' },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1 },
  prizePos: { flex: 1, fontFamily: 'System', fontSize: 14 },
  prizeAmt: { fontFamily: 'System', fontSize: 14, color: '#FF5A1F' },
  certRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  certChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  certText: { fontFamily: 'System', fontSize: 13 },
  stickyFooter: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
});
