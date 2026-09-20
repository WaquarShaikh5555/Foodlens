import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HistoryItem } from './types';

const KEYS = {
  history: 'foodlens.history.v1',
  allergens: 'foodlens.allergens.v1',
  premium: 'foodlens.premium.v1',
  onboarding: 'foodlens.onboarding.v1',
  scans: 'foodlens.scans.v1',
  displayName: 'foodlens.displayName.v1',
};

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.history);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(items: HistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(items.slice(0, 200)));
}

export async function loadAllergens(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.allergens);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function saveAllergens(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.allergens, JSON.stringify(ids));
}

export async function loadPremium(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.premium);
  return v === '1';
}

export async function savePremium(on: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.premium, on ? '1' : '0');
}

export async function loadOnboarding(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.onboarding);
  return v === '1';
}

export async function saveOnboarding(): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarding, '1');
}

export async function loadDisplayName(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.displayName)) || 'FoodLens Explorer';
}

export async function saveDisplayName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.displayName, name);
}

type ScanState = { date: string; count: number };

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function loadScanState(): Promise<ScanState> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.scans);
    const parsed: ScanState = raw ? JSON.parse(raw) : { date: todayKey(), count: 0 };
    if (parsed.date !== todayKey()) return { date: todayKey(), count: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

export async function incrementScanCount(): Promise<number> {
  const state = await loadScanState();
  const next = { date: todayKey(), count: state.count + 1 };
  await AsyncStorage.setItem(KEYS.scans, JSON.stringify(next));
  return next.count;
}

export { KEYS };
