import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  useFrameworkReady();

  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore
      }
      setIsReady(true);
    };

    hideSplash();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {isReady && (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(participant)" />
              <Stack.Screen name="(organizer)" />
              <Stack.Screen name="(vendor)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          )}
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
