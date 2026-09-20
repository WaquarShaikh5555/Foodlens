import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { useAppTheme } from '../lib/theme';
import { PrimaryButton } from '../components/PrimaryButton';

const PERKS = [
  { icon: 'infinite-outline' as const, title: 'Unlimited daily scans', body: 'No 10-scan cap. Log every meal.' },
  { icon: 'sparkles-outline' as const, title: 'Full AI health briefs', body: 'Sugar, salt, fibre and processing in plain English.' },
  { icon: 'shield-checkmark-outline' as const, title: 'Priority allergen radar', body: 'Instant flags against your saved profile.' },
  { icon: 'stats-chart-outline' as const, title: 'Richer history insights', body: 'Keep 200 products with grades on device.' },
];

export default function PaywallScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { activatePremium, isPremium, remainingScans } = useApp();
  const [busy, setBusy] = useState(false);
  const reason: string = route.params?.reason || 'upgrade';

  const headline =
    reason === 'limit'
      ? 'You’ve used today’s free scans'
      : reason === 'ai'
        ? 'Unlock the full AI brief'
        : 'FoodLens Pro';

  const subscribe = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    await activatePremium();
    setBusy(false);
    nav.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <Pressable onPress={() => nav.goBack()} style={[styles.close, { backgroundColor: theme.card }]}>
        <Ionicons name="close" size={22} color={theme.text} />
      </Pressable>

      <View style={styles.hero}>
        <View style={[styles.diamond, { backgroundColor: theme.accent }]}>
          <Ionicons name="diamond" size={32} color="#fff" />
        </View>
        <Text style={[styles.kicker, { color: theme.accent }]}>$4.99 / month</Text>
        <Text style={[styles.title, { color: theme.text }]}>{headline}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {isPremium
            ? 'Pro is already active on this device.'
            : `Free plan includes 10 scans per day · ${remainingScans} remaining. Subscribe for unlimited barcode analysis.`}
        </Text>
      </View>

      <View style={styles.perks}>
        {PERKS.map((p) => (
          <View key={p.title} style={[styles.perk, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.perkIcon, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name={p.icon} size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.perkTitle, { color: theme.text }]}>{p.title}</Text>
              <Text style={[styles.perkBody, { color: theme.textMuted }]}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        {isPremium ? (
          <PrimaryButton title="You’re all set" icon="checkmark" onPress={() => nav.goBack()} />
        ) : (
          <PrimaryButton
            title="Start Pro · $4.99 / month"
            icon="diamond-outline"
            color="#3498DB"
            loading={busy}
            onPress={subscribe}
          />
        )}
        <Text style={[styles.legal, { color: theme.textMuted }]}>
          Demo checkout — no real charge. Restore is local to this device. Cancel anytime in a production store build.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  close: { margin: 16, width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  hero: { alignItems: 'center', paddingHorizontal: 28 },
  diamond: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  kicker: { fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 6, letterSpacing: -0.6 },
  body: { textAlign: 'center', marginTop: 10, lineHeight: 21, fontSize: 15 },
  perks: { padding: 18, gap: 10, flex: 1 },
  perk: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  perkIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  perkTitle: { fontWeight: '800', fontSize: 14 },
  perkBody: { fontSize: 12, marginTop: 2 },
  footer: { padding: 18, gap: 10 },
  legal: { textAlign: 'center', fontSize: 11, lineHeight: 16 },
});
