import { Tabs } from 'expo-router';
import { LayoutDashboard, Package, ClipboardList, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VendorLayout() {
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
      <Tabs.Screen name="inventory" options={{ title: 'Inventory', tabBarIcon: ({ color, size }) => <Package size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
