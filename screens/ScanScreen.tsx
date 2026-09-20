import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useApp } from '../lib/AppContext';
import { useAppTheme } from '../lib/theme';
import { PrimaryButton } from '../components/PrimaryButton';

const SAMPLES = [
  { code: '3017620422003', label: 'Nutella' },
  { code: '5449000000996', label: 'Coca-Cola' },
  { code: '5000159407236', label: 'Mars bar' },
  { code: '3228857000166', label: 'Evian' },
];

export default function ScanScreen() {
  const theme = useAppTheme();
  const nav = useNavigation<any>();
  const isFocused = useIsFocused();
  const { canScan, remainingScans, isPremium } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [torch, setTorch] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    if (isFocused) lock.current = false;
  }, [isFocused]);

  const goToProduct = async (barcode: string) => {
    const code = barcode.replace(/\s/g, '');
    if (!code) return;
    if (!canScan) {
      nav.navigate('Paywall', { reason: 'limit' });
      return;
    }
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* web */
    }
    nav.navigate('Product', { barcode: code });
  };

  const onBarcode = (result: { data: string }) => {
    if (lock.current || !isFocused) return;
    if (!result?.data) return;
    lock.current = true;
    goToProduct(result.data);
  };

  const submitManual = () => {
    const code = manual.trim();
    if (code.length < 6) {
      Alert.alert('Invalid barcode', 'Enter a GTIN / EAN of at least 6 digits.');
      return;
    }
    goToProduct(code);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#07140C' }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Scanner</Text>
          <View style={[styles.quota, { backgroundColor: isPremium ? '#2ECC71' : 'rgba(255,255,255,0.14)' }]}>
            <Ionicons name={isPremium ? 'infinite' : 'flash'} size={14} color="#fff" />
            <Text style={styles.quotaText}>{isPremium ? 'Pro unlimited' : `${remainingScans} left today`}</Text>
          </View>
        </View>

        <View style={styles.cameraWrap}>
          {Platform.OS !== 'web' && permission?.granted && isFocused ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torch}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] }}
              onBarcodeScanned={onBarcode}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.camFallback]}>
              <Ionicons name="camera-outline" size={48} color="#7F9488" />
              <Text style={styles.camFallbackText}>
                {Platform.OS === 'web'
                  ? 'Live camera scanning is available in the Android APK. Enter a barcode or tap a demo product below.'
                  : permission?.granted
                    ? 'Camera paused'
                    : 'Camera access is needed to scan barcodes on device.'}
              </Text>
              {Platform.OS !== 'web' && !permission?.granted ? (
                <Pressable onPress={requestPermission} style={styles.permBtn}>
                  <Text style={styles.permBtnText}>Enable camera</Text>
                </Pressable>
              ) : null}
            </View>
          )}

          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.reticle}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
            </View>
            <Text style={styles.hint}>Align the barcode inside the frame</Text>
          </View>

          <Pressable onPress={() => setTorch((t) => !t)} style={styles.torch}>
            <Ionicons name={torch ? 'flash' : 'flash-outline'} size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>Enter barcode manually</Text>
          <Text style={[styles.sheetSub, { color: theme.textMuted }]}>
            Works anywhere — even without a camera. Try a sample below.
          </Text>
          <View style={[styles.inputRow, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <Ionicons name="keypad-outline" size={18} color={theme.textMuted} />
            <TextInput
              value={manual}
              onChangeText={setManual}
              placeholder="e.g. 3017620422003"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              returnKeyType="search"
              onSubmitEditing={submitManual}
              style={[styles.input, { color: theme.text }]}
            />
          </View>
          <PrimaryButton title="Look up product" icon="search-outline" onPress={submitManual} />

          <Text style={[styles.sampleLbl, { color: theme.textMuted }]}>Demo barcodes</Text>
          <View style={styles.samples}>
            {SAMPLES.map((s) => (
              <Pressable
                key={s.code}
                onPress={() => goToProduct(s.code)}
                style={[styles.sample, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.sampleName, { color: theme.text }]}>{s.label}</Text>
                <Text style={[styles.sampleCode, { color: theme.textMuted }]}>{s.code}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  quota: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  quotaText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cameraWrap: { height: 280, marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0C1611' },
  camFallback: { alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#122018' },
  camFallbackText: { color: '#B7C9BD', textAlign: 'center', marginTop: 10, fontSize: 13, lineHeight: 18 },
  permBtn: { marginTop: 12, backgroundColor: '#2ECC71', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  permBtnText: { color: '#fff', fontWeight: '800' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  reticle: { width: 230, height: 140, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#2ECC71' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  hint: { color: '#fff', marginTop: 16, fontWeight: '600', fontSize: 13, textShadowColor: '#000', textShadowRadius: 6 },
  torch: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
  sheetSub: { fontSize: 13, marginTop: 4, marginBottom: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  sampleLbl: { marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sample: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, minWidth: '47%' as any, flexGrow: 1 },
  sampleName: { fontWeight: '800', fontSize: 13 },
  sampleCode: { fontSize: 11, marginTop: 2 },
});
