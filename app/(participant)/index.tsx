import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  Image, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { EventCard } from '@/components/participant/EventCard';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Music', 'Sports', 'Technology', 'Food', 'Art', 'Networking', 'Gaming', 'Health', 'Cultural', 'Literary'];

const FEATURED_BANNERS = [
  { id: '1', title: 'Horizon Fest 2025', tagline: 'The biggest inter-college music festival', image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: '2', title: 'Code Sprint Hackathon', tagline: '48 hours. 1 problem. Unlimited solutions.', image: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: '3', title: 'Cultural Kaleidoscope', tagline: 'Celebrate diversity through art and dance', image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1200' },
];

const MOCK_EVENTS: Partial<Event>[] = [
  { id: 'm1', name: 'National Hackathon 2025', tagline: '48 hours to build something incredible', event_level: 'national', event_mode: 'offline', event_start: new Date(Date.now() + 7*86400000).toISOString(), venue_name: 'BITS Pilani', fee_type: 'paid', fee_per_person: 200, fee_structure: 'per_person', team_flat_fee: 0, verified_badge: true, status: 'live', banner_url: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'team' },
  { id: 'm2', name: 'Battle of Bands', tagline: 'Showcase your music talent', event_level: 'inter_college', event_mode: 'offline', event_start: new Date(Date.now() + 14*86400000).toISOString(), venue_name: 'IIT Delhi', fee_type: 'free', fee_per_person: 0, fee_structure: null, team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'team' },
  { id: 'm3', name: 'Photography Contest', tagline: 'Capture the perfect moment', event_level: 'college', event_mode: 'online', event_start: new Date(Date.now() + 5*86400000).toISOString(), platform_name: 'Instagram', fee_type: 'free', fee_per_person: 0, fee_structure: null, team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'individual' },
  { id: 'm4', name: 'Debate Championship', tagline: 'Argue your way to the top', event_level: 'state', event_mode: 'offline', event_start: new Date(Date.now() + 21*86400000).toISOString(), venue_name: 'Jadavpur University', fee_type: 'paid', fee_per_person: 150, fee_structure: 'per_person', team_flat_fee: 0, status: 'live', banner_url: 'https://images.pexels.com/photos/3280908/pexels-photo-3280908.jpeg?auto=compress&cs=tinysrgb&w=800', event_type: 'individual' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState<Partial<Event>[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const carouselRef = useRef<FlatList>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (carouselIndex + 1) % FEATURED_BANNERS.length;
      setCarouselIndex(next);
      try { carouselRef.current?.scrollToIndex({ index: next, animated: true }); } catch {}
    }, 3500);
    return () => clearInterval(timer);
  }, [carouselIndex]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').eq('status', 'live').limit(20);
    if (data && data.length > 0) setEvents(data);
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchEvents(); setRefreshing(false); };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF1E2D" />}>
        <View style={[styles.headerSection, { paddingTop: insets.top + 12 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting()},</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] ?? 'Student'} 👋</Text>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/(participant)/notifications')} activeOpacity={0.7}>
            <Bell size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.carouselSection}>
          <FlatList
            ref={carouselRef}
            data={FEATURED_BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            getItemLayout={(_, index) => ({ length: width - 40, offset: (width - 40) * index, index })}
            onMomentumScrollEnd={(e) => {
              setCarouselIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 40)));
            }}
            renderItem={({ item }) => (
              <View style={[styles.featuredCard, { width: width - 40 }]}>
                <Image source={{ uri: item.image }} style={styles.featuredImage} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(15,23,42,0.88)']} style={styles.featuredGradient} />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredTagline}>{item.tagline}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.dots}>
            {FEATURED_BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === carouselIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} style={[styles.categoryChip, { borderColor: selectedCategory === cat ? '#FF1E2D' : colors.border, backgroundColor: selectedCategory === cat ? '#FF1E2D' : colors.surface }]} activeOpacity={0.7}>
              <Text style={[styles.categoryText, { color: selectedCategory === cat ? '#fff' : colors.textMuted }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trending Events</Text>
          <TouchableOpacity onPress={() => router.push('/(participant)/explore')} activeOpacity={0.7}>
            <View style={styles.seeAllRow}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={15} color="#FF1E2D" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsList}>
          {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginVertical: 40 }} /> :
            events.map((event, i) => (
              <EventCard key={event.id} event={event as Event} onPress={() => router.push(`/(participant)/event/${event.id}`)} index={i} />
            ))
          }
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontFamily: 'System', fontSize: 14 },
  userName: { fontFamily: 'System', fontSize: 22, fontWeight: '700' },
  notifBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  carouselSection: { paddingLeft: 20, marginBottom: 8 },
  featuredCard: { height: 210, borderRadius: 20, marginRight: 8, overflow: 'hidden' },
  featuredImage: { width: '100%', height: '100%' },
  featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 130 },
  featuredContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  featuredTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  featuredTagline: { fontFamily: 'System', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: '#CBD5E1' },
  dotActive: { width: 18, backgroundColor: '#FF1E2D' },
  categoryScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  categoryChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  categoryText: { fontFamily: 'System', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '700' },
  seeAllRow: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontFamily: 'System', fontSize: 13, color: '#FF1E2D' },
  eventsList: { paddingHorizontal: 20, paddingBottom: 24 },
});
