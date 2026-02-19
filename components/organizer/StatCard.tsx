import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColors?: [string, string];
}

export function StatCard({ label, value, icon, accentColors = ['#FF1E2D', '#FF5A1F'] }: StatCardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark && styles.shadow]}>
      <LinearGradient
        colors={accentColors}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.accentBar}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.iconBg, { backgroundColor: `${accentColors[0]}18` }]}>{icon}</View>
        </View>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, borderWidth: 1, flexDirection: 'row', overflow: 'hidden', minWidth: 140 },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  accentBar: { width: 4 },
  content: { flex: 1, padding: 14 },
  topRow: { marginBottom: 8 },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: 'System', fontSize: 22, fontWeight: '700', marginBottom: 2 },
  label: { fontFamily: 'System', fontSize: 12 },
});
