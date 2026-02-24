import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Briefcase, ShoppingBag, Shield, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { GradientButton } from '@/components/ui/GradientButton';
import { useTheme } from '@/hooks/useTheme';

const ROLES = [
  { key: 'participant', label: 'Participant', desc: 'Discover events, register as individual or team, manage tickets', icon: User, color: '#FF1E2D' },
  { key: 'organizer', label: 'Organizer', desc: 'Create and manage events, track registrations and revenue', icon: Briefcase, color: '#FF5A1F' },
  { key: 'vendor', label: 'Vendor', desc: 'List services, manage inventory, accept bookings from organizers', icon: ShoppingBag, color: '#FFB300' },
];

export default function RoleSelectionScreen() {
  const [selected, setSelected] = useState('participant');
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { setRole, loading } = useAuthStore();

  const handleContinue = async () => {
    const { error } = await setRole(selected);
    if (error) return;
    switch (selected) {
      case 'organizer': router.replace('/(organizer)'); break;
      case 'vendor': router.replace('/(vendor)'); break;
      case 'admin': router.replace('/(admin)'); break;
      default: router.replace('/(participant)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.textPrimary }]}>Choose your role</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>You can change this later in profile settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.key;
          return (
            <TouchableOpacity key={role.key} onPress={() => setSelected(role.key)} activeOpacity={0.85}>
              <View style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: isSelected ? role.color : colors.border },
                isSelected && { borderWidth: 2 },
              ]}>
                <View style={[styles.iconBg, { backgroundColor: `${role.color}18` }]}>
                  <Icon size={26} color={role.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roleLabel, { color: colors.textPrimary }]}>{role.label}</Text>
                  <Text style={[styles.roleDesc, { color: colors.textMuted }]}>{role.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkIcon, { backgroundColor: role.color }]}>
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <GradientButton label="Continue" onPress={handleContinue} loading={loading} disabled={!selected} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  heading: { fontFamily: 'System', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  sub: { fontFamily: 'System', fontSize: 15 },
  grid: { paddingHorizontal: 20, paddingVertical: 8, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 16, padding: 16 },
  iconBg: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { fontFamily: 'System', fontSize: 16, fontWeight: '600', marginBottom: 3 },
  roleDesc: { fontFamily: 'System', fontSize: 12, lineHeight: 17 },
  checkIcon: { width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 16 },
});
