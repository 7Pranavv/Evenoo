import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GradientButton({ label, onPress, loading, disabled, size = 'md', style }: GradientButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const heights = { sm: 44, md: 52, lg: 56 };
  const fontSizes = { sm: 14, md: 15, lg: 16 };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[animStyle, style]}
    >
      <LinearGradient
        colors={disabled ? ['#CBD5E1', '#94A3B8', '#64748B'] : ['#FF1E2D', '#FF5A1F', '#FFB300']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btn, { height: heights[size] }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.label, { fontSize: fontSizes[size] }]}>{label}</Text>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  label: { fontFamily: 'System', fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});
