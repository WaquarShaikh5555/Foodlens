import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { searchProducts } from '../lib/openFoodFacts';
import { useAppTheme } from '../lib/theme';
import type { FoodProduct } from '../lib/types';
import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';

const SUGGESTIONS = ['yogurt', 'oat milk', 'protein bar', 'olive oil', 'granola', 'orange juice'];

export default function SearchScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const { cacheProduct } = useApp();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    async (term: string) => {
      const t = term.trim();
      if (t.length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const list = await searchProducts(t);
        list.forEach(cacheProduct);
        setResults(list);
        setSearched(true);
      } catch (e: any) {
        setError(e?.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [cacheProduct]
  );

  const onChange = (text: string) => {
    setQ(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => run(text), 450);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.text }]}>Discover</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>Search Open Food Facts by name or brand</Text>

      <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textMuted} />
        <TextInput
          value={q}
          onChangeText={onChange}
          placeholder="Try “greek yogurt”"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="search"
          onSubmitEditing={() => {
            Keyboard.dismiss();
            run(q);
          }}
        />
        {q ? (
          <Pressable onPress={() => { setQ(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {!searched && !loading ? (
        <View style={styles.sugs}>
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                setQ(s);
                run(s);
              }}
              style={[styles.sug, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Ionicons name="arrow-forward-circle-outline" size={16} color={theme.primary} />
              <Text style={{ color: theme.text, fontWeight: '700' }}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {loading ? <ActivityIndicator color={theme.primary} style={{ marginTop: 24 }} /> : null}
      {error ? <Text style={[styles.err, { color: theme.danger }]}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item, i) => item.barcode || String(i)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ProductCard
            name={item.name}
            brand={item.brand}
            image={item.image}
            grade={item.grade}
            subtitle={item.nutriments.kcal != null ? `${Math.round(item.nutriments.kcal)} kcal / 100g` : item.categories.split(',')[0]}
            theme={theme}
            onPress={() => {
              cacheProduct(item);
              nav.navigate('Product', { barcode: item.barcode, fromHistory: true });
            }}
          />
        )}
        ListEmptyComponent={
          searched && !loading ? (
            <EmptyState
              icon="search-outline"
              title="No products"
              body="Open Food Facts may not have that item yet. Try a simpler term or scan the barcode."
              theme={theme}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, paddingHorizontal: 20, paddingTop: 8 },
  sub: { paddingHorizontal: 20, marginTop: 4, fontSize: 13 },
  search: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '600' },
  sugs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  sug: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  list: { padding: 16, paddingBottom: 40 },
  err: { paddingHorizontal: 20, marginTop: 8 },
});
