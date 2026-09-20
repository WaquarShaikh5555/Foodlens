import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GradeBadge } from './GradeBadge';
import type { Theme } from '../lib/theme';
import type { Grade } from '../lib/types';

export function ProductCard({
  name,
  brand,
  image,
  grade,
  subtitle,
  theme,
  onPress,
}: {
  name: string;
  brand?: string;
  image?: string;
  grade: Grade | string;
  subtitle?: string;
  theme: Theme;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.86 : 1,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: theme.bgAlt }]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.img} contentFit="cover" />
        ) : (
          <Ionicons name="nutrition-outline" size={28} color={theme.textMuted} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.brand, { color: theme.textMuted }]} numberOfLines={1}>
          {brand || 'Unknown brand'}
        </Text>
        {subtitle ? (
          <Text style={[styles.sub, { color: theme.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <GradeBadge grade={grade} size="sm" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  brand: { fontSize: 12, marginTop: 2 },
  sub: { fontSize: 11, marginTop: 4, fontWeight: '600' },
});
