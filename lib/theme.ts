import { useColorScheme } from 'react-native';

export const palette = {
  green: '#2ECC71',
  greenDark: '#27AE60',
  greenDeep: '#1E8449',
  greenSoft: '#E8F8F0',
  blue: '#3498DB',
  blueDark: '#2980B9',
  blueSoft: '#EBF5FB',
  navy: '#0F1F17',
  ink: '#122018',
  cream: '#F4FBF6',
  white: '#FFFFFF',
  gold: '#F1C40F',
};

export const gradeColors: Record<string, string> = {
  A: '#2ECC71',
  B: '#52C41A',
  C: '#F1C40F',
  D: '#E67E22',
  F: '#E74C3C',
};

export const gradeLabels: Record<string, string> = {
  A: 'Excellent',
  B: 'Good',
  C: 'Average',
  D: 'Poor',
  F: 'Avoid',
};

export type Theme = {
  dark: boolean;
  bg: string;
  bgAlt: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  success: string;
  overlay: string;
  tabBar: string;
  input: string;
  shadow: string;
};

export const lightTheme: Theme = {
  dark: false,
  bg: '#F3F8F4',
  bgAlt: '#E8F4EC',
  card: '#FFFFFF',
  cardAlt: '#F7FBF8',
  text: '#122018',
  textSecondary: '#3D5346',
  textMuted: '#7A8F83',
  border: '#D7E8DC',
  primary: '#2ECC71',
  primarySoft: '#E8F8F0',
  accent: '#3498DB',
  accentSoft: '#EBF5FB',
  danger: '#E74C3C',
  dangerSoft: '#FDEDEC',
  warning: '#F39C12',
  success: '#27AE60',
  overlay: 'rgba(15, 31, 23, 0.55)',
  tabBar: '#FFFFFF',
  input: '#F4FBF6',
  shadow: '#1E3A2B',
};

export const darkTheme: Theme = {
  dark: true,
  bg: '#0C1611',
  bgAlt: '#122018',
  card: '#16241C',
  cardAlt: '#1B2C22',
  text: '#F2FBF5',
  textSecondary: '#B7C9BD',
  textMuted: '#7F9488',
  border: '#24362C',
  primary: '#2ECC71',
  primarySoft: '#163226',
  accent: '#5DADE2',
  accentSoft: '#163044',
  danger: '#E74C3C',
  dangerSoft: '#3A1C1A',
  warning: '#F5B041',
  success: '#2ECC71',
  overlay: 'rgba(0, 0, 0, 0.7)',
  tabBar: '#122018',
  input: '#1B2C22',
  shadow: '#000000',
};

export function useAppTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
