import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, style, ...props }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? '#EF4444' : focused ? '#FF1E2D' : colors.border,
            color: colors.textPrimary,
          },
          style,
        ]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={[styles.hintText, { color: colors.textMuted }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontFamily: 'System', fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontFamily: 'System', fontSize: 15,
  },
  errorText: { color: '#EF4444', fontFamily: 'System', fontSize: 12, marginTop: 4 },
  hintText: { fontFamily: 'System', fontSize: 12, marginTop: 4 },
});
