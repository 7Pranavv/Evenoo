import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Calendar, MapPin, Globe, Bookmark, BadgeCheck } from 'lucide-react-native';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  index?: number;
}

const LEVEL_LABELS: Record<string, string> = {
  college: 'College', inter_college: 'Inter-College', state: 'State', national: 'National',
};
const MODE_LABELS: Record<string, string> = { online: 'Online', offline: 'Offline', hybrid: 'Hybrid' };

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function EventCard({ event, onPress, index = 0 }: EventCardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const formatDate = (d: string | null) => {
    if (!d) return 'TBA';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const bannerUri = event.banner_url ?? 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={0.9}
      style={[animStyle, styles.container]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark && styles.shadow]}>
        {/* Banner */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: bannerUri }} style={styles.image} resizeMode="cover" />
          {/* Badges on image */}
          <View style={styles.imageBadges}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{LEVEL_LABELS[event.event_level]}</Text>
            </View>
            {event.verified_badge && <BadgeCheck size={16} color="#FFB300" />}
          </View>
          <View style={styles.bookmarkBtn}>
            <Bookmark size={16} color="#fff" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>{event.name}</Text>
          {event.tagline ? <Text style={[styles.tagline, { color: colors.textMuted }]} numberOfLines={1}>{event.tagline}</Text> : null}

          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <Calendar size={13} color="#FF1E2D" />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(event.event_start)}</Text>
            </View>
            <View style={styles.metaRow}>
              {event.event_mode === 'online' ? <Globe size={13} color="#FF5A1F" /> : <MapPin size={13} color="#FF5A1F" />}
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {event.venue_name ?? event.platform_name ?? 'Online'}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Badge
                label={MODE_LABELS[event.event_mode]}
                bg={isDark ? '#334155' : '#F1F5F9'}
                textColor={colors.textMuted}
                size="sm"
              />
              <Badge
                label={event.event_type === 'team' ? 'Team' : 'Solo'}
                bg={isDark ? '#334155' : '#F1F5F9'}
                textColor={colors.textMuted}
                size="sm"
              />
            </View>
            {event.fee_type === 'free' ? (
              <Badge label="Free" bg="#DCFCE7" textColor="#16A34A" />
            ) : (
              <Text style={styles.feeText}>
                ₹{event.fee_structure === 'per_team_flat' ? event.team_flat_fee : event.fee_per_person}
              </Text>
            )}
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  imageContainer: { height: 160, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageBadges: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelBadge: { backgroundColor: 'rgba(255,30,45,0.85)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  levelBadgeText: { fontFamily: 'System', fontSize: 11, color: '#fff' },
  bookmarkBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 8 },
  content: { padding: 14 },
  title: { fontFamily: 'System', fontSize: 15, fontWeight: '700', marginBottom: 3, lineHeight: 20 },
  tagline: { fontFamily: 'System', fontSize: 12, marginBottom: 10 },
  meta: { gap: 5, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: 'System', fontSize: 12, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLeft: { flexDirection: 'row', gap: 6 },
  feeText: { fontFamily: 'System', fontSize: 14, color: '#FF1E2D' },
});
