import { Tabs } from 'expo-router';
import { BarChart3, Shield, Users } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#FF1E2D',
        tabBarInactiveTintColor: colors.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          tabBarIcon: ({ size, color }) => <Shield size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
