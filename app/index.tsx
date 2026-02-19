import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);
  const initialize = useAuthStore((state) => state.initialize);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    console.log('[Index] Mounting, initializing auth');
    initialize();

    const timer = setTimeout(() => {
      console.log('[Index] Auth initialization timeout - proceeding to welcome');
      setTimedOut(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [initialize]);

  useEffect(() => {
    console.log('[Index] Auth state changed:', { initialized, hasSession: !!session, hasUser: !!user });
    if (!initialized && !timedOut) {
      console.log('[Index] Still initializing...');
      return;
    }

    if (!session || !user) {
      console.log('[Index] No session/user, routing to welcome');
      router.replace('/(auth)/welcome');
      return;
    }

    const role = user.role;
    console.log('[Index] Routing based on role:', role);
    switch (role) {
      case 'organizer':
        router.replace('/(organizer)');
        break;
      case 'vendor':
        router.replace('/(vendor)');
        break;
      default:
        router.replace('/(participant)');
    }
  }, [initialized, user, session, timedOut]);

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
