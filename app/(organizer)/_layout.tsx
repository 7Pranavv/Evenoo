import { Tabs } from 'expo-router';
import { LayoutDashboard, CalendarDays, PlusCircle, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrganizerLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF1E2D',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, height: 60 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: 'System', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <Tabs.Screen name="events" options={{ title: 'My Events', tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
      <Tabs.Screen name="event/[id]" options={{ href: null }} />
    </Tabs>
  );
}
