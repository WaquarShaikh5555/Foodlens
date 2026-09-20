import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { FoodProduct, HistoryItem } from './types';
import {
  incrementScanCount,
  loadAllergens,
  loadDisplayName,
  loadHistory,
  loadOnboarding,
  loadPremium,
  loadScanState,
  saveAllergens,
  saveDisplayName,
  saveHistory,
  saveOnboarding,
  savePremium,
} from './storage';

const FREE_DAILY_LIMIT = 10;

type AppContextValue = {
  ready: boolean;
  seenOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  isPremium: boolean;
  activatePremium: () => Promise<void>;
  scansToday: number;
  remainingScans: number;
  canScan: boolean;
  consumeScan: () => Promise<boolean>;
  allergens: string[];
  setAllergens: (ids: string[]) => Promise<void>;
  history: HistoryItem[];
  addHistory: (product: FoodProduct) => Promise<void>;
  clearHistory: () => Promise<void>;
  displayName: string;
  setDisplayName: (name: string) => Promise<void>;
  cacheProduct: (p: FoodProduct) => void;
  getCached: (barcode: string) => FoodProduct | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [scansToday, setScansToday] = useState(0);
  const [allergens, setAllergensState] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [displayName, setDisplayNameState] = useState('FoodLens Explorer');
  const [cache, setCache] = useState<Record<string, FoodProduct>>({});

  useEffect(() => {
    (async () => {
      const [onb, prem, scans, al, hist, name] = await Promise.all([
        loadOnboarding(),
        loadPremium(),
        loadScanState(),
        loadAllergens(),
        loadHistory(),
        loadDisplayName(),
      ]);
      setSeenOnboarding(onb);
      setIsPremium(prem);
      setScansToday(scans.count);
      setAllergensState(al);
      setHistory(hist);
      setDisplayNameState(name);
      setReady(true);
    })();
  }, []);

  const remainingScans = isPremium ? 999 : Math.max(0, FREE_DAILY_LIMIT - scansToday);
  const canScan = isPremium || scansToday < FREE_DAILY_LIMIT;

  const completeOnboarding = useCallback(async () => {
    await saveOnboarding();
    setSeenOnboarding(true);
  }, []);

  const activatePremium = useCallback(async () => {
    await savePremium(true);
    setIsPremium(true);
  }, []);

  const consumeScan = useCallback(async () => {
    if (isPremium) return true;
    if (scansToday >= FREE_DAILY_LIMIT) return false;
    const next = await incrementScanCount();
    setScansToday(next);
    return true;
  }, [isPremium, scansToday]);

  const setAllergens = useCallback(async (ids: string[]) => {
    setAllergensState(ids);
    await saveAllergens(ids);
  }, []);

  const addHistory = useCallback(async (product: FoodProduct) => {
    setHistory((prev) => {
      const item: HistoryItem = {
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        image: product.image,
        grade: product.grade,
        scannedAt: Date.now(),
        calories: product.nutriments.kcal,
      };
      const next = [item, ...prev.filter((h) => h.barcode !== product.barcode)].slice(0, 200);
      saveHistory(next);
      return next;
    });
    setCache((c) => ({ ...c, [product.barcode]: product }));
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await saveHistory([]);
  }, []);

  const setDisplayName = useCallback(async (name: string) => {
    setDisplayNameState(name);
    await saveDisplayName(name);
  }, []);

  const cacheProduct = useCallback((p: FoodProduct) => {
    setCache((c) => ({ ...c, [p.barcode]: p }));
  }, []);

  const getCached = useCallback((barcode: string) => cache[barcode], [cache]);

  const value = useMemo(
    () => ({
      ready,
      seenOnboarding,
      completeOnboarding,
      isPremium,
      activatePremium,
      scansToday,
      remainingScans,
      canScan,
      consumeScan,
      allergens,
      setAllergens,
      history,
      addHistory,
      clearHistory,
      displayName,
      setDisplayName,
      cacheProduct,
      getCached,
    }),
    [
      ready,
      seenOnboarding,
      completeOnboarding,
      isPremium,
      activatePremium,
      scansToday,
      remainingScans,
      canScan,
      consumeScan,
      allergens,
      setAllergens,
      history,
      addHistory,
      clearHistory,
      displayName,
      setDisplayName,
      cacheProduct,
      getCached,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { FREE_DAILY_LIMIT };
