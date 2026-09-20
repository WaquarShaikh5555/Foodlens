import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ALLERGEN_OPTIONS } from '../lib/allergens';
import { useApp } from '../lib/AppContext';
import { useAppTheme } from '../lib/theme';
import { PrimaryButton } from '../components/PrimaryButton';

export default function AllergensScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const { allergens, setAllergens } = useApp();
  const [selected, setSelected] = useState<string[]>(allergens);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    await setAllergens(selected);
    nav.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.nav}>
        <Pressable onPress={() => nav.goBack()} style={[styles.iconBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Allergen radar</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={[styles.sub, { color: theme.textMuted }]}>
        We’ll highlight these on every product card. Data comes from Open Food Facts allergen tags.
      </Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ALLERGEN_OPTIONS.map((a) => {
          const on = selected.includes(a.id);
          return (
            <Pressable
              key={a.id}
              onPress={() => toggle(a.id)}
              style={[
                styles.row,
                {
                  backgroundColor: on ? theme.primarySoft : theme.card,
                  borderColor: on ? theme.primary : theme.border,
                },
              ]}
            >
              <View style={[styles.icon, { backgroundColor: on ? theme.primary : theme.bgAlt }]}>
                <Ionicons name={a.icon as any} size={18} color={on ? '#fff' : theme.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>{a.label}</Text>
                <Text style={[styles.hint, { color: theme.textMuted }]}>{a.hint}</Text>
              </View>
              <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={on ? theme.primary : theme.border} />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={`Save ${selected.length} alert${selected.length === 1 ? '' : 's'}`} icon="shield-checkmark-outline" onPress={save} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  sub: { paddingHorizontal: 20, marginTop: 8, marginBottom: 8, lineHeight: 20 },
  list: { padding: 16, paddingBottom: 24, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '800', fontSize: 15 },
  hint: { fontSize: 12, marginTop: 2 },
  footer: { padding: 16 },
});
