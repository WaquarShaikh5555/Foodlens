import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useApp } from '../lib/AppContext';
import { FEATURED_BARCODES, fetchByBarcode } from '../lib/openFoodFacts';
import { gradeColors, useAppTheme } from '../lib/theme';
import type { FoodProduct } from '../lib/types';
import { GradeBadge } from '../components/GradeBadge';
import { ProductCard } from '../components/ProductCard';

export default function HomeScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const { displayName, remainingScans, isPremium, history, canScan, cacheProduct } = useApp();
  const [featured, setFeatured] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const results = await Promise.all(
        FEATURED_BARCODES.slice(0, 6).map(async (code) => {
          try {
            return await fetchByBarcode(code);
          } catch {
            return null;
          }
        })
      );
      const list = results.filter(Boolean) as FoodProduct[];
      list.forEach(cacheProduct);
      setFeatured(list);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheProduct]);

  useEffect(() => {
    load();
  }, [load]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const first = displayName.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greet, { color: theme.textMuted }]}>{greet}</Text>
            <Text style={[styles.name, { color: theme.text }]}>{first}</Text>
          </View>
          <Pressable onPress={() => nav.navigate('Profile')} style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="person" size={20} color={theme.primary} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => (canScan ? nav.navigate('Scan') : nav.navigate('Paywall', { reason: 'limit' }))}
          style={[styles.hero, { backgroundColor: theme.primary }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>AI barcode scanner</Text>
            <Text style={styles.heroTitle}>Scan a product{'\n'}for instant insight</Text>
            <View style={styles.heroCta}>
              <Ionicons name="scan" size={16} color="#fff" />
              <Text style={styles.heroCtaText}>Open scanner</Text>
            </View>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="barcode-outline" size={54} color="#fff" />
          </View>
        </Pressable>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name={isPremium ? 'infinite' : 'flash-outline'} size={18} color={theme.primary} />
            <Text style={[styles.statVal, { color: theme.text }]}>{isPremium ? 'Unlimited' : remainingScans}</Text>
            <Text style={[styles.statLbl, { color: theme.textMuted }]}>{isPremium ? 'FoodLens Pro' : 'scans left today'}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={18} color={theme.accent} />
            <Text style={[styles.statVal, { color: theme.text }]}>{history.length}</Text>
            <Text style={[styles.statLbl, { color: theme.textMuted }]}>products logged</Text>
          </View>
        </View>

        {!isPremium ? (
          <Pressable
            onPress={() => nav.navigate('Paywall', { reason: 'upgrade' })}
            style={[styles.pro, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}
          >
            <Ionicons name="diamond-outline" size={20} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.proTitle, { color: theme.text }]}>Go unlimited · $4.99/mo</Text>
              <Text style={[styles.proBody, { color: theme.textSecondary }]}>
                Skip the 10-scan cap, unlock AI summaries & allergen radar.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.accent} />
          </Pressable>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={[styles.section, { color: theme.text }]}>Recent scans</Text>
          {history.length > 0 ? (
            <Pressable onPress={() => nav.navigate('History')}>
              <Text style={[styles.link, { color: theme.primary }]}>See all</Text>
            </Pressable>
          ) : null}
        </View>

        {history.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="sparkles-outline" size={22} color={theme.primary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No scans yet. Point the camera at a barcode to start your nutrition log.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {history.slice(0, 4).map((h) => (
              <ProductCard
                key={h.barcode + h.scannedAt}
                name={h.name}
                brand={h.brand}
                image={h.image}
                grade={h.grade}
                subtitle={h.calories != null ? `${Math.round(h.calories)} kcal / 100g` : undefined}
                theme={theme}
                onPress={() => nav.navigate('Product', { barcode: h.barcode, fromHistory: true })}
              />
            ))}
          </View>
        )}

        <View style={styles.sectionHead}>
          <Text style={[styles.section, { color: theme.text }]}>Trending in Open Food Facts</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginVertical: 24 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
            {featured.map((p) => (
              <Pressable
                key={p.barcode}
                onPress={() => {
                  cacheProduct(p);
                  nav.navigate('Product', { barcode: p.barcode, fromHistory: true });
                }}
                style={[styles.feat, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.featImg, { backgroundColor: theme.bgAlt }]}>
                  {p.image ? (
                    <Image source={{ uri: p.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <Ionicons name="cube-outline" size={28} color={theme.textMuted} />
                  )}
                  <View style={styles.featGrade}>
                    <GradeBadge grade={p.grade} size="sm" />
                  </View>
                </View>
                <Text style={[styles.featName, { color: theme.text }]} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={[styles.featBrand, { color: theme.textMuted }]} numberOfLines={1}>
                  {p.brand}
                </Text>
                <View style={[styles.kcalPill, { backgroundColor: (gradeColors[p.grade] || theme.primary) + '22' }]}>
                  <Text style={[styles.kcalTxt, { color: gradeColors[p.grade] || theme.primary }]}>
                    {p.nutriments.kcal != null ? `${Math.round(p.nutriments.kcal)} kcal` : 'Nutrition'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greet: { fontSize: 13, fontWeight: '600' },
  name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hero: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 150,
    overflow: 'hidden',
  },
  heroKicker: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6, lineHeight: 30 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  heroCtaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroIcon: { opacity: 0.9, marginLeft: 8 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 14 },
  stat: { flex: 1, borderRadius: 18, padding: 14, borderWidth: 1, gap: 4 },
  statVal: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statLbl: { fontSize: 12, fontWeight: '600' },
  pro: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proTitle: { fontWeight: '800', fontSize: 14 },
  proBody: { fontSize: 12, marginTop: 2 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  section: { fontSize: 18, fontWeight: '800' },
  link: { fontWeight: '700', fontSize: 13 },
  list: { gap: 10 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'center' },
  emptyText: { flex: 1, fontSize: 13, lineHeight: 18 },
  hlist: { gap: 12, paddingRight: 8 },
  feat: { width: 160, borderRadius: 18, borderWidth: 1, padding: 10 },
  featImg: { height: 110, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  featGrade: { position: 'absolute', top: 8, right: 8 },
  featName: { fontWeight: '700', fontSize: 13, marginTop: 8, minHeight: 34 },
  featBrand: { fontSize: 11, marginTop: 2 },
  kcalPill: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  kcalTxt: { fontSize: 11, fontWeight: '700' },
});
