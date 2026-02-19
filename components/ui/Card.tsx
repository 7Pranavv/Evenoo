import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, style, padding = 16 }: CardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        padding,
        ...(isDark ? {} : colors.cardShadow),
      },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16 },
});
