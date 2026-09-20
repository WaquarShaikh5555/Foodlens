import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FREE_DAILY_LIMIT, useApp } from '../lib/AppContext';
import { prettyAllergen } from '../lib/allergens';
import { useAppTheme } from '../lib/theme';
import { PrimaryButton } from '../components/PrimaryButton';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const {
    displayName,
    setDisplayName,
    isPremium,
    remainingScans,
    allergens,
    history,
    scansToday,
  } = useApp();
  const [name, setName] = useState(displayName);
  const [haptics, setHaptics] = useState(true);
  const [alerts, setAlerts] = useState(true);

  const saveName = () => {
    const trimmed = name.trim() || 'FoodLens Explorer';
    setDisplayName(trimmed);
    Alert.alert('Saved', 'Your display name was updated.');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>You</Text>

        <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.initials}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroName, { color: theme.text }]}>{displayName}</Text>
            <Text style={[styles.heroSub, { color: theme.textMuted }]}>
              {isPremium ? 'FoodLens Pro member' : 'Free plan · 10 scans / day'}
            </Text>
          </View>
          {isPremium ? (
            <View style={[styles.proPill, { backgroundColor: theme.primarySoft }]}>
              <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 11 }}>PRO</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.kpis}>
          <Kpi theme={theme} value={String(history.length)} label="Logged" />
          <Kpi theme={theme} value={isPremium ? '∞' : String(remainingScans)} label="Left today" />
          <Kpi theme={theme} value={String(scansToday)} label="Used today" />
        </View>

        {!isPremium ? (
          <View style={{ marginBottom: 16 }}>
            <PrimaryButton
              title="Upgrade · $4.99 / month"
              icon="diamond-outline"
              color="#3498DB"
              onPress={() => nav.navigate('Paywall', { reason: 'upgrade' })}
            />
          </View>
        ) : (
          <View style={[styles.note, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
            <Text style={{ color: theme.text, flex: 1, fontWeight: '600' }}>
              Unlimited scans are active on this device.
            </Text>
          </View>
        )}

        <Text style={[styles.section, { color: theme.text }]}>Profile</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Display name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.input }]}
            placeholder="Your name"
            placeholderTextColor={theme.textMuted}
            returnKeyType="done"
            onSubmitEditing={saveName}
          />
          <Pressable onPress={saveName}>
            <Text style={{ color: theme.primary, fontWeight: '800', marginTop: 8 }}>Save name</Text>
          </Pressable>
        </View>

        <Text style={[styles.section, { color: theme.text }]}>Allergen radar</Text>
        <Pressable
          onPress={() => nav.navigate('Allergens')}
          style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: theme.dangerSoft }]}>
            <Ionicons name="warning-outline" size={18} color={theme.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>Dietary alerts</Text>
            <Text style={[styles.rowSub, { color: theme.textMuted }]}>
              {allergens.length
                ? allergens.map(prettyAllergen).join(', ')
                : 'None set — tap to choose'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>

        <Text style={[styles.section, { color: theme.text }]}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ToggleRow theme={theme} label="Haptic feedback" value={haptics} onValueChange={setHaptics} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ToggleRow theme={theme} label="Allergen banners" value={alerts} onValueChange={setAlerts} />
        </View>

        <Text style={[styles.section, { color: theme.text }]}>Data sources</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Source title="Open Food Facts" body="Product identity, ingredients, Nutri-Score, NOVA." theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Source title="USDA FoodData Central" body="Reference nutrient densities used in grading." theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Source title="On-device scanner" body="ML Kit / camera barcode recognition stays on your phone." theme={theme} />
        </View>

        <Text style={[styles.foot, { color: theme.textMuted }]}>
          FoodLens {isPremium ? 'Pro' : 'Free'} · {FREE_DAILY_LIMIT} complimentary scans daily · Not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ theme, value, label }: { theme: any; value: string; label: string }) {
  return (
    <View style={[styles.kpi, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.kpiVal, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.kpiLbl, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function ToggleRow({
  theme,
  label,
  value,
  onValueChange,
}: {
  theme: any;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#2ECC71' }} />
    </View>
  );
}

function Source({ title, body, theme }: { title: string; body: string; theme: any }) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Text style={{ color: theme.text, fontWeight: '800' }}>{title}</Text>
      <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 13, lineHeight: 18 }}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, marginBottom: 16 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 20, padding: 14 },
  avatar: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '800', fontSize: 22 },
  heroName: { fontSize: 18, fontWeight: '800' },
  heroSub: { fontSize: 13, marginTop: 2 },
  proPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  kpis: { flexDirection: 'row', gap: 10, marginVertical: 14 },
  kpi: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  kpiVal: { fontSize: 20, fontWeight: '800' },
  kpiLbl: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  note: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 8, marginTop: 8 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, height: 44, paddingHorizontal: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontWeight: '800', fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 4 },
  toggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  foot: { fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
