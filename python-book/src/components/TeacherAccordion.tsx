import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useColors } from '../hooks/useColors';
import { TeacherNote } from '../data/types';
import { FONTS, RADIUS, SPACING } from '../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const C = useColors();
  return (
    <View style={[sec.wrap, { borderTopColor: C.border }]}>
      <Text style={[sec.label, { color: C.accent }]}>{label}</Text>
      {children}
    </View>
  );
}

export function TeacherAccordion({ teacher }: { teacher: TeacherNote }) {
  const C = useColors();
  const [open, setOpen] = useState(false);
  const rot = useSharedValue(0);

  function toggle() {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    const next = !open;
    setOpen(next);
    rot.value = withTiming(next ? 1 : 0, { duration: 250 });
  }

  const arrowAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 180}deg` }],
  }));

  return (
    <View style={[s.wrap, { borderColor: C.border, backgroundColor: C.surface }]}>
      <Pressable
        style={[s.header, open && { borderBottomColor: C.border, borderBottomWidth: 1 }]}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel="Секція для вчителя"
      >
        <View style={[s.pill, { backgroundColor: C.accentSoft }]}>
          <Text style={s.pillIcon}>👩‍🏫</Text>
          <Text style={[s.pillText, { color: C.accent }]}>Для вчителя</Text>
        </View>
        <Text style={[s.meta, { color: C.textMuted }]}>зміст · знання · план</Text>
        <Animated.Text style={[s.arrow, { color: C.textMuted }, arrowAnim]}>▾</Animated.Text>
      </Pressable>

      {open && (
        <View>
          <Section label="📋 Зміст уроку">
            <Text style={[s.summaryText, { color: C.text }]}>{teacher.summary}</Text>
          </Section>

          <Section label="⭐ Кожен учень має знати">
            {teacher.mustKnow.map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={[s.bullet, { color: C.accent }]}>•</Text>
                <Text style={[s.bulletText, { color: C.text }]}>{item}</Text>
              </View>
            ))}
          </Section>

          <Section label="🗓️ Хід уроку">
            {teacher.lessonPlan.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={[s.stepNum, { backgroundColor: C.accentSoft, borderColor: C.accent + '55' }]}>
                  <Text style={[s.stepNumText, { color: C.accent }]}>{i + 1}</Text>
                </View>
                <Text style={[s.stepText, { color: C.text }]}>{step}</Text>
              </View>
            ))}
          </Section>
        </View>
      )}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  label: { fontFamily: FONTS.bold, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: SPACING.sm },
});

const s = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  pillIcon: { fontSize: 14 },
  pillText: { fontFamily: FONTS.bold, fontSize: 13 },
  meta: { flex: 1, fontFamily: FONTS.regular, fontSize: 11, letterSpacing: 0.3 },
  arrow: { fontFamily: FONTS.bold, fontSize: 16 },
  summaryText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 16, lineHeight: 22 },
  bulletText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { fontFamily: FONTS.bold, fontSize: 12 },
  stepText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22 },
});
