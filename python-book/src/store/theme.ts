import { create } from 'zustand';
import { SchemeId, ColorScheme, COLOR_SCHEMES } from '../data/themes';

interface ThemeStore {
  schemeId: SchemeId;
  colors: ColorScheme;
  setScheme: (id: SchemeId) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  schemeId: 'indigo',
  colors: COLOR_SCHEMES.indigo,
  setScheme: (schemeId) => set({ schemeId, colors: COLOR_SCHEMES[schemeId] }),
}));
