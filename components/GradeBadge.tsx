import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { gradeColors, gradeLabels } from '../lib/theme';
import type { Grade } from '../lib/types';

export function GradeBadge({
  grade,
  size = 'md',
}: {
  grade: Grade | string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const g = (grade || 'C').toUpperCase();
  const dim = size === 'lg' ? 72 : size === 'sm' ? 28 : 44;
  const font = size === 'lg' ? 32 : size === 'sm' ? 14 : 20;
  return (
    <View
      style={[
        styles.badge,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: gradeColors[g] || '#95A5A6',
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: font }]}>{g}</Text>
    </View>
  );
}

export function GradeChip({ grade }: { grade: Grade | string }) {
  const g = (grade || 'C').toUpperCase();
  return (
    <View style={[styles.chip, { backgroundColor: (gradeColors[g] || '#95A5A6') + '22' }]}>
      <View style={[styles.dot, { backgroundColor: gradeColors[g] || '#95A5A6' }]} />
      <Text style={[styles.chipText, { color: gradeColors[g] || '#95A5A6' }]}>
        {g} · {gradeLabels[g] || 'Rated'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  letter: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 12, fontWeight: '700' },
});
