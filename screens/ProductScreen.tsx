import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../lib/AppContext';
import { matchesUserAllergen, prettyAllergen } from '../lib/allergens';
import { fetchByBarcode } from '../lib/openFoodFacts';
import { gradeLabels, useAppTheme } from '../lib/theme';
import type { FoodProduct } from '../lib/types';
import { GradeBadge } from '../components/GradeBadge';
import { NutrientBars } from '../components/NutrientBar';
import { PrimaryButton } from '../components/PrimaryButton';

export default function ProductScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const barcode: string = route.params?.barcode;
  const fromHistory: boolean = !!route.params?.fromHistory;
  const { getCached, cacheProduct, addHistory, consumeScan, canScan, isPremium, allergens } = useApp();

  const [product, setProduct] = useState<FoodProduct | undefined>(getCached(barcode));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (product) {
        cacheProduct(product);
        if (!fromHistory) {
          const ok = await consumeScan();
          if (!ok) {
            nav.replace('Paywall', { reason: 'limit' });
            return;
          }
          await addHistory(product);
        }
        return;
      }
      try {
        setLoading(true);
        const p = await fetchByBarcode(barcode);
        if (cancelled) return;
        if (!p) {
          setError('No product found for this barcode in Open Food Facts.');
          setLoading(false);
          return;
        }
        cacheProduct(p);
        setProduct(p);
        if (!fromHistory) {
          const ok = await consumeScan();
          if (!ok) {
            nav.replace('Paywall', { reason: 'limit' });
            return;
          }
          await addHistory(p);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Could not reach Open Food Facts.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode]);

  const hits = useMemo(
    () => (product ? matchesUserAllergen(product.allergensTags, allergens) : []),
    [product, allergens]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={[styles.loadTxt, { color: theme.textMuted }]}>Analysing barcode {barcode}…</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.bg }]} edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
        <Text style={[styles.errTitle, { color: theme.text }]}>Product not found</Text>
        <Text style={[styles.errBody, { color: theme.textMuted }]}>{error || 'Unknown barcode'}</Text>
        <Text style={[styles.code, { color: theme.textSecondary }]}>{barcode}</Text>
        <View style={{ width: '80%', marginTop: 18 }}>
          <PrimaryButton title="Scan another" icon="scan-outline" onPress={() => nav.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const aiSummary = isPremium
    ? product.highlights.join(' ')
    : product.highlights.slice(0, 1).join(' ') + ' Unlock FoodLens Pro for the full AI health brief.';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.navRow}>
        <Pressable onPress={() => nav.goBack()} style={[styles.iconBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text }]}>Nutrition analysis</Text>
        <Pressable onPress={() => nav.navigate('Scan')} style={[styles.iconBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="scan-outline" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.imgBox, { backgroundColor: theme.bgAlt }]}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.img} contentFit="contain" />
            ) : (
              <Ionicons name="nutrition-outline" size={48} color={theme.textMuted} />
            )}
          </View>
          <View style={styles.heroMeta}>
            <GradeBadge grade={product.grade} size="lg" />
            <Text style={[styles.gradeLbl, { color: theme.text }]}>{gradeLabels[product.grade]}</Text>
            <Text style={[styles.gradeSrc, { color: theme.textMuted }]}>
              {product.gradeSource === 'nutriscore' ? 'Nutri-Score mapped' : 'FoodLens computed'}
            </Text>
          </View>
        </View>

        <Text style={[styles.name, { color: theme.text }]}>{product.name}</Text>
        <Text style={[styles.brand, { color: theme.textSecondary }]}>
          {product.brand}
          {product.quantity ? ` · ${product.quantity}` : ''}
        </Text>
        <Text style={[styles.barcode, { color: theme.textMuted }]}>GTIN {product.barcode}</Text>

        {hits.length > 0 ? (
          <View style={[styles.alert, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}>
            <Ionicons name="warning" size={20} color={theme.danger} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: theme.danger }]}>Allergen match</Text>
              <Text style={[styles.alertBody, { color: theme.text }]}>
                Contains {hits.map(prettyAllergen).join(', ')} based on your profile.
              </Text>
            </View>
          </View>
        ) : allergens.length > 0 ? (
          <View style={[styles.alert, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
            <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
            <Text style={[styles.alertBody, { color: theme.text, flex: 1 }]}>
              No match with your saved allergen list.
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHead}>
            <Ionicons name="sparkles" size={18} color={theme.accent} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>AI health summary</Text>
            {!isPremium ? (
              <Pressable onPress={() => nav.navigate('Paywall', { reason: 'ai' })}>
                <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 12 }}>PRO</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.summary, { color: theme.textSecondary }]}>{aiSummary}</Text>
          <View style={styles.chips}>
            {product.highlights.map((h) => (
              <View key={h} style={[styles.chip, { backgroundColor: theme.bgAlt }]}>
                <Text style={[styles.chipTxt, { color: theme.text }]}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 12 }]}>Nutrition facts</Text>
          <NutrientBars nutriments={product.nutriments} theme={theme} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Ingredients</Text>
          <Text style={[styles.ing, { color: theme.textSecondary }]}>
            {product.ingredients || 'Ingredients not provided by the manufacturer.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Allergens & traces</Text>
          <View style={styles.chips}>
            {product.allergensTags.length ? (
              product.allergensTags.map((t) => (
                <View
                  key={t}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: hits.includes(t) ? theme.dangerSoft : theme.bgAlt,
                      borderColor: hits.includes(t) ? theme.danger : theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: hits.includes(t) ? theme.danger : theme.text, fontWeight: '700', fontSize: 12 }}>
                    {prettyAllergen(t)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: theme.textMuted }}>No allergen tags listed.</Text>
            )}
          </View>
          {product.traces ? (
            <Text style={[styles.trace, { color: theme.textMuted }]}>May contain: {product.traces}</Text>
          ) : null}
        </View>

        <View style={styles.metaGrid}>
          <Meta theme={theme} label="NOVA" value={product.novaGroup ? `Group ${product.novaGroup}` : '—'} />
          <Meta theme={theme} label="Additives" value={String(product.additives.length)} />
          <Meta theme={theme} label="Serving" value={product.servingSize || '—'} />
          <Meta theme={theme} label="Origin" value={product.countries.split(',')[0] || '—'} />
        </View>

        {!canScan && !isPremium ? (
          <PrimaryButton title="Unlock unlimited scans" icon="diamond-outline" color="#3498DB" onPress={() => nav.navigate('Paywall', { reason: 'limit' })} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ theme, label, value }: { theme: any; label: string; value: string }) {
  return (
    <View style={[styles.meta, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.metaLbl, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.metaVal, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  loadTxt: { marginTop: 12, fontWeight: '600' },
  errTitle: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  errBody: { textAlign: 'center', marginTop: 8, lineHeight: 20 },
  code: { marginTop: 8, fontWeight: '700' },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, fontWeight: '800', fontSize: 16 },
  scroll: { padding: 18, paddingBottom: 48 },
  heroCard: { flexDirection: 'row', borderRadius: 22, borderWidth: 1, padding: 14, gap: 14 },
  imgBox: { width: 120, height: 120, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%' },
  heroMeta: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  gradeLbl: { fontSize: 18, fontWeight: '800' },
  gradeSrc: { fontSize: 11 },
  name: { fontSize: 24, fontWeight: '800', marginTop: 16, letterSpacing: -0.4 },
  brand: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  barcode: { fontSize: 12, marginTop: 4, marginBottom: 14 },
  alert: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12, alignItems: 'center' },
  alertTitle: { fontWeight: '800', fontSize: 13 },
  alertBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', flex: 1 },
  summary: { fontSize: 14, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, maxWidth: '100%' },
  chipTxt: { fontSize: 12, lineHeight: 16 },
  ing: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  trace: { marginTop: 10, fontSize: 12 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  meta: { width: '48%' as any, flexGrow: 1, borderRadius: 16, borderWidth: 1, padding: 12 },
  metaLbl: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  metaVal: { fontSize: 15, fontWeight: '800', marginTop: 4 },
});
