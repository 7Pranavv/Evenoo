import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signIn, loading } = useAuthStore();

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setError('');
    const { error: err } = await signIn(email.trim(), password);
    if (err) { setError(err); return; }
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={[styles.logoIcon, { backgroundColor: 'rgba(255,30,45,0.1)' }]}>
              <Star size={20} color="#FF1E2D" fill="#FF1E2D" />
            </View>
            <Text style={[styles.brandName, { color: '#FF1E2D' }]}>eveno</Text>
          </View>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Welcome back</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>Sign in to your account</Text>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@college.edu" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <GradientButton label="Sign In" onPress={handleSignIn} loading={loading} style={{ marginTop: 4 }} />
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/sign-up')} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.textMuted }]}>
              Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 20, paddingBottom: 0, alignSelf: 'flex-start' },
  content: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: 'System', fontSize: 28, fontWeight: '700' },
  heading: { fontFamily: 'System', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  sub: { fontFamily: 'System', fontSize: 15, marginBottom: 32 },
  errorText: { color: '#EF4444', fontFamily: 'System', fontSize: 13, marginBottom: 12 },
  linkRow: { marginTop: 32, alignItems: 'center' },
  linkText: { fontFamily: 'System', fontSize: 14 },
  linkHighlight: { color: '#FF1E2D', fontFamily: 'System', fontWeight: '600' },
});
