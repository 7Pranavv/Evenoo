import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, TrendingUp, Users, Calendar, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface AdminStats {
  pendingApprovals: number;
  totalEvents: number;
  totalUsers: number;
  liveEvents: number;
}

export default function AdminDashboard() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [eventsRes, usersRes] = await Promise.all([
        supabase.from('events').select('status', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
      ]);

      const events = eventsRes.data || [];
      const pendingCount = events.filter((e: any) => e.status === 'pending_approval').length;
      const liveCount = events.filter((e: any) => e.status === 'live').length;

      setStats({
        pendingApprovals: pendingCount,
        totalEvents: eventsRes.count || 0,
        totalUsers: usersRes.count || 0,
        liveEvents: liveCount,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark && styles.shadow]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.statIconBg, { backgroundColor: `${color}18` }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: colors.textMuted }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Admin Dashboard</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {stats && stats.pendingApprovals > 0 && (
            <TouchableOpacity
              style={[styles.alertBanner, { backgroundColor: '#FEF3C7', borderColor: '#D97706' }]}
              onPress={() => router.push('/(admin)/approvals')}
              activeOpacity={0.7}>
              <AlertCircle size={20} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: '#D97706' }]}>Pending Approvals</Text>
                <Text style={[styles.alertDesc, { color: '#D97706' }]}>{stats.pendingApprovals} events awaiting review</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.statsGrid}>
            <StatCard
              icon={AlertCircle}
              title="Pending Approvals"
              value={stats?.pendingApprovals || 0}
              color="#FF1E2D"
              onPress={() => router.push('/(admin)/approvals')}
            />
            <StatCard
              icon={CheckCircle2}
              title="Live Events"
              value={stats?.liveEvents || 0}
              color="#10B981"
            />
            <StatCard
              icon={Calendar}
              title="Total Events"
              value={stats?.totalEvents || 0}
              color="#3B82F6"
            />
            <StatCard
              icon={Users}
              title="Total Users"
              value={stats?.totalUsers || 0}
              color="#8B5CF6"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
              <TouchableOpacity onPress={fetchStats}>
                <TrendingUp size={18} color="#FF1E2D" />
              </TouchableOpacity>
            </View>
            <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent activity</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  alertBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertTitle: { fontFamily: 'System', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  alertDesc: { fontFamily: 'System', fontSize: 12 },
  statsGrid: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  statCard: { borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statIconBg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statContent: { flex: 1 },
  statTitle: { fontFamily: 'System', fontSize: 12, marginBottom: 4 },
  statValue: { fontFamily: 'System', fontSize: 20, fontWeight: '700' },
  section: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'System', fontSize: 16, fontWeight: '600' },
  activityCard: { borderWidth: 1, borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: 'System', fontSize: 14 },
});
