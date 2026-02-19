import { useColorScheme } from 'react-native';
import { COLORS } from '@/lib/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;
  return { isDark, colors, scheme };
}
