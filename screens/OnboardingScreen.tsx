import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { useAppTheme } from '../lib/theme';
import { PrimaryButton } from '../components/PrimaryButton';

const SLIDES = [
  {
    icon: 'barcode-outline' as const,
    title: 'Scan any barcode',
    body: 'Point FoodLens at a packaged food and get ingredients, allergens, and a health grade in seconds.',
  },
  {
    icon: 'pulse-outline' as const,
    title: 'A–F health ratings',
    body: 'We combine Nutri-Score with fibre, protein, sugar, salt and sat-fat to grade every product at a glance.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Allergen-aware',
    body: 'Set your dietary alerts once. We’ll flag gluten, dairy, nuts and more before you take a bite.',
  },
];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const { completeOnboarding } = useApp();
  const { width } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];

  const next = async () => {
    if (idx < SLIDES.length - 1) setIdx(idx + 1);
    else await completeOnboarding();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Ionicons name="leaf" size={22} color="#fff" />
          </View>
          <Text style={[styles.brand, { color: theme.text }]}>FoodLens</Text>
        </View>
        <Pressable onPress={completeOnboarding}>
          <Text style={[styles.skip, { color: theme.textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View
          style={[
            styles.orb,
            {
              backgroundColor: theme.primarySoft,
              width: Math.min(280, width * 0.7),
              height: Math.min(280, width * 0.7),
            },
          ]}
        >
          <View style={[styles.orbInner, { backgroundColor: theme.primary }]}>
            <Ionicons name={slide.icon} size={72} color="#fff" />
          </View>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{slide.title}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === idx ? theme.primary : theme.border, width: i === idx ? 22 : 8 },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={idx === SLIDES.length - 1 ? 'Start scanning' : 'Continue'}
          icon={idx === SLIDES.length - 1 ? 'scan-outline' : 'arrow-forward'}
          onPress={next}
        />
        <Text style={[styles.legal, { color: theme.textMuted }]}>
          10 free scans / day · Unlimited from $4.99 / month
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: {
    paddingHorizontal: 22,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  skip: { fontSize: 15, fontWeight: '600' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  orb: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  orbInner: {
    width: 140,
    height: 140,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.6 },
  body: { fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 22, paddingBottom: 18, gap: 12 },
  legal: { textAlign: 'center', fontSize: 12 },
});
