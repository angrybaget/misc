export type SchemeId = 'indigo' | 'pine' | 'amber';

export interface ColorScheme {
  id: SchemeId;
  name: string;
  emoji: string;
  // backgrounds
  bg: string;
  surface: string;
  card: string;
  border: string;
  // text
  text: string;
  textMuted: string;
  // accents
  accent: string;
  accentSoft: string;
  green: string;
  red: string;
  // code block (always dark, independent of theme)
  codeBg: string;
  codeText: string;
  codeLabelBg: string;
}

export const COLOR_SCHEMES: Record<SchemeId, ColorScheme> = {
  indigo: {
    id: 'indigo',
    name: 'Індіго',
    emoji: '💜',
    bg: '#f5f4ff',
    surface: '#ffffff',
    card: '#eeedfb',
    border: '#dddcf5',
    text: '#1e1b4b',
    textMuted: '#7876aa',
    accent: '#6366f1',
    accentSoft: '#e0e0fd',
    green: '#059669',
    red: '#dc2626',
    codeBg: '#0d0b1e',
    codeText: '#c8d3f5',
    codeLabelBg: '#13113a',
  },
  pine: {
    id: 'pine',
    name: 'Сосна',
    emoji: '🌿',
    bg: '#f2f9f4',
    surface: '#ffffff',
    card: '#e3f1e8',
    border: '#bfd8c8',
    text: '#163322',
    textMuted: '#567d66',
    accent: '#2c7a50',
    accentSoft: '#d4eadc',
    green: '#1a6640',
    red: '#c03535',
    codeBg: '#0a1e12',
    codeText: '#b8f0cc',
    codeLabelBg: '#0d2a18',
  },
  amber: {
    id: 'amber',
    name: 'Янтар',
    emoji: '🍂',
    bg: '#fdf8ee',
    surface: '#ffffff',
    card: '#f5edd8',
    border: '#e4d0a8',
    text: '#3a2000',
    textMuted: '#936f3a',
    accent: '#b87020',
    accentSoft: '#fae0b0',
    green: '#3a6520',
    red: '#b53028',
    codeBg: '#1e1400',
    codeText: '#f5dda8',
    codeLabelBg: '#2a1c00',
  },
};
