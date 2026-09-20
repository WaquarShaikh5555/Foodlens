import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { gradeColors, useAppTheme } from '../lib/theme';
import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';

export default function HistoryScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const { history, clearHistory } = useApp();
  const [q, setQ] = useState('');
  const [grade, setGrade] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const matchQ = !q || h.name.toLowerCase().includes(q.toLowerCase()) || h.brand.toLowerCase().includes(q.toLowerCase());
      const matchG = !grade || h.grade === grade;
      return matchQ && matchG;
    });
  }, [history, q, grade]);

  const confirmClear = () => {
    Alert.alert('Clear history?', 'This removes all locally stored scans.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearHistory() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: theme.text }]}>History</Text>
        {history.length > 0 ? (
          <Pressable onPress={confirmClear}>
            <Text style={{ color: theme.danger, fontWeight: '700' }}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search scanned foods"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filters}>
        {['A', 'B', 'C', 'D', 'F'].map((g) => (
          <Pressable
            key={g}
            onPress={() => setGrade(grade === g ? null : g)}
            style={[
              styles.filter,
              {
                backgroundColor: grade === g ? gradeColors[g] : theme.card,
                borderColor: grade === g ? gradeColors[g] : theme.border,
              },
            ]}
          >
            <Text style={{ color: grade === g ? '#fff' : theme.text, fontWeight: '800' }}>{g}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.barcode + item.scannedAt}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <ProductCard
            name={item.name}
            brand={item.brand}
            image={item.image}
            grade={item.grade}
            subtitle={new Date(item.scannedAt).toLocaleString()}
            theme={theme}
            onPress={() => nav.navigate('Product', { barcode: item.barcode, fromHistory: true })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title={history.length ? 'No matches' : 'Your log is empty'}
            body={
              history.length
                ? 'Try another search or grade filter.'
                : 'Scan a barcode and every product will appear here for quick recaps.'
            }
            theme={theme}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  search: {
    margin: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '600' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filter: { width: 40, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
});
