import { Tabs } from 'expo-router';
import { House, Search, Ticket, Wallet, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParticipantLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF1E2D',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: 'System', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }} />
      <Tabs.Screen name="tickets" options={{ title: 'Tickets', tabBarIcon: ({ color, size }) => <Ticket size={size} color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="event/[id]" options={{ href: null }} />
    </Tabs>
  );
}
