import { useThemeStore } from '../store/theme';
import { ColorScheme } from '../data/themes';

export function useColors(): ColorScheme {
  return useThemeStore((s) => s.colors);
}
