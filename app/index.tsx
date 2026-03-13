import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace('/(auth)/welcome');
      return;
    }

    switch (user.role) {
      case 'organizer':
        router.replace('/(organizer)');
        break;
      case 'vendor':
        router.replace('/(vendor)');
        break;
      case 'admin':
        router.replace('/(admin)');
        break;
      default:
        router.replace('/(participant)');
    }
  }, [initialized, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF1E2D" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  text: { marginTop: 16, fontSize: 14, color: '#64748B' },
});
