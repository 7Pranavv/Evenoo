import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, Users, Trophy, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const features = [
    { icon: <Calendar size={22} color="#FF1E2D" />, title: 'Discover Events', desc: 'Find college and inter-college events near you' },
    { icon: <Users size={22} color="#FF5A1F" />, title: 'Team Registration', desc: 'Register solo or with your entire team instantly' },
    { icon: <Trophy size={22} color="#FFB300" />, title: 'Win & Achieve', desc: 'Compete, win prizes and earn certificates' },
  ];

  return (
    <LinearGradient
      colors={['#FF1E2D', '#FF5A1F', '#FFB300']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <View style={[styles.safeArea, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Star size={32} color="#fff" fill="#fff" />
          </View>
          <Text style={styles.appName}>eveno</Text>
          <Text style={styles.tagline}>Your Campus. Your Events.</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>{f.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => router.push('/(auth)/sign-up')} activeOpacity={0.9}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signInLink} onPress={() => router.push('/(auth)/sign-in')} activeOpacity={0.7}>
            <Text style={styles.signInText}>Already have an account? <Text style={styles.signInBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  circle1: { width: 320, height: 320, top: -130, right: -110 },
  circle2: { width: 220, height: 220, top: height * 0.38, left: -90 },
  circle3: { width: 160, height: 160, bottom: 160, right: -60 },
  safeArea: { flex: 1, paddingHorizontal: 28 },
  brandSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 76, height: 76, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 54, fontFamily: 'System', fontWeight: '700', color: '#fff', letterSpacing: -2 },
  tagline: { fontSize: 17, fontFamily: 'System', color: 'rgba(255,255,255,0.85)', marginTop: 8, textAlign: 'center' },
  featuresContainer: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 22, padding: 20, marginBottom: 32, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontFamily: 'System', fontSize: 15, fontWeight: '600', color: '#fff' },
  featureDesc: { fontFamily: 'System', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  ctaSection: { paddingBottom: 8 },
  getStartedBtn: { backgroundColor: '#fff', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  getStartedText: { fontFamily: 'System', fontSize: 16, fontWeight: '700', color: '#FF1E2D' },
  signInLink: { alignItems: 'center' },
  signInText: { fontFamily: 'System', fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  signInBold: { fontFamily: 'System', fontWeight: '700', color: '#fff' },
});
