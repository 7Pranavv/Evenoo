import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Copy, Share2, Calendar, MapPin } from 'lucide-react-native';
import { StatusBadge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import { Ticket } from '@/types';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { colors } = useTheme();

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(ticket.id);
  };

  const shareTicket = async () => {
    await Share.share({ message: `My Eveno ticket for ${ticket.events?.name ?? 'the event'}: ${ticket.id}` });
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'TBA';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Gradient header strip */}
      <LinearGradient
        colors={['#FF1E2D', '#FF5A1F', '#FFB300']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.gradientStrip}
      />

      <View style={styles.content}>
        {/* Event info */}
        <Text style={[styles.eventName, { color: colors.textPrimary }]} numberOfLines={1}>
          {ticket.events?.name ?? 'Event'}
        </Text>
        <Text style={[styles.memberName, { color: colors.textMuted }]}>{ticket.member_name}</Text>

        <View style={styles.metaRow}>
          <Calendar size={12} color="#FF1E2D" />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(ticket.events?.event_start ?? null)}</Text>
          <MapPin size={12} color="#FF5A1F" />
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
            {ticket.events?.venue_name ?? ticket.events?.platform_name ?? 'TBA'}
          </Text>
        </View>

        {/* Ticket ID */}
        <View style={[styles.ticketIdContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.ticketId, { color: colors.textPrimary }]}>{ticket.id}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <StatusBadge status={ticket.status} />
          <View style={styles.actions}>
            <TouchableOpacity onPress={copyToClipboard} style={[styles.actionBtn, { backgroundColor: 'rgba(255,30,45,0.08)' }]} activeOpacity={0.7}>
              <Copy size={15} color="#FF1E2D" />
            </TouchableOpacity>
            <TouchableOpacity onPress={shareTicket} style={[styles.actionBtn, { backgroundColor: 'rgba(255,90,31,0.08)' }]} activeOpacity={0.7}>
              <Share2 size={15} color="#FF5A1F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  gradientStrip: { height: 5 },
  content: { padding: 16 },
  eventName: { fontFamily: 'System', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  memberName: { fontFamily: 'System', fontSize: 13, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { fontFamily: 'System', fontSize: 12, flex: 1 },
  ticketIdContainer: { borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', padding: 12, marginBottom: 12, alignItems: 'center' },
  ticketId: { fontFamily: 'System', fontSize: 18, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
