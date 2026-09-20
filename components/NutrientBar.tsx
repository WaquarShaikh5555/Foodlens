import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { dailyValue, DV } from '../lib/grading';
import type { Theme } from '../lib/theme';

const ITEMS: { key: keyof typeof DV; label: string; unit: string }[] = [
  { key: 'kcal', label: 'Calories', unit: 'kcal' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'satFat', label: 'Sat. fat', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'sugars', label: 'Sugars', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'salt', label: 'Salt', unit: 'g' },
];

function barColor(pct: number, invert: boolean) {
  if (invert) {
    if (pct >= 70) return '#2ECC71';
    if (pct >= 35) return '#F1C40F';
    return '#E67E22';
  }
  if (pct >= 80) return '#E74C3C';
  if (pct >= 50) return '#E67E22';
  if (pct >= 25) return '#F1C40F';
  return '#2ECC71';
}

export function NutrientBars({
  nutriments,
  theme,
}: {
  nutriments: Record<string, number | null>;
  theme: Theme;
}) {
  return (
    <View style={styles.wrap}>
      {ITEMS.map((item) => {
        const value = nutriments[item.key];
        const pct = dailyValue(value ?? null, DV[item.key]);
        const invert = item.key === 'fiber' || item.key === 'protein';
        const color = barColor(pct, invert);
        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.meta}>
              <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.value, { color: theme.textSecondary }]}>
                {value == null ? '—' : `${Number(value).toFixed(item.key === 'kcal' ? 0 : 1)} ${item.unit}`}
                <Text style={{ color: theme.textMuted }}>  {pct}% DV</Text>
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.bgAlt }]}>
              <View style={[styles.fill, { width: `${Math.max(4, pct)}%` as any, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
      <Text style={[styles.note, { color: theme.textMuted }]}>Values per 100g · %DV based on a 2,000 kcal diet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { gap: 6 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontSize: 13, fontWeight: '700' },
  value: { fontSize: 12, fontWeight: '600' },
  track: { height: 8, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 8 },
  note: { fontSize: 11, marginTop: 4 },
});
