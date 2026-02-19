import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  label: string;
  bg?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, bg = '#F1F5F9', textColor = '#64748B', style, textStyle, size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: textColor }, textStyle]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    live: { label: 'Live', bg: '#DCFCE7', color: '#16A34A' },
    pending_approval: { label: 'Pending', bg: '#FEF3C7', color: '#D97706' },
    draft: { label: 'Draft', bg: '#F1F5F9', color: '#64748B' },
    cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#DC2626' },
    completed: { label: 'Completed', bg: '#E2E8F0', color: '#475569' },
    active: { label: 'Active', bg: '#DCFCE7', color: '#16A34A' },
    used: { label: 'Used', bg: '#F1F5F9', color: '#64748B' },
    pending: { label: 'Pending', bg: '#FEF3C7', color: '#D97706' },
    accepted: { label: 'Accepted', bg: '#DCFCE7', color: '#16A34A' },
    declined: { label: 'Declined', bg: '#FEE2E2', color: '#DC2626' },
  };
  const cfg = map[status] ?? { label: status, bg: '#F1F5F9', color: '#64748B' };
  return <Badge label={cfg.label} bg={cfg.bg} textColor={cfg.color} />;
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontFamily: 'System', fontSize: 12, fontWeight: '600' },
  textSm: { fontSize: 11 },
});
