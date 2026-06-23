import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADES } from '../src/data/grades';
import { useProgress } from '../src/store/progress';
import { useColors } from '../src/hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { totalDone } = useProgress();
  const done = totalDone();
  const C = useColors();
  const { width } = useWindowDimensions();
  const CARD_W = (width - SPACING.md * 2 - 12) / 2;

  return (
    <View style={[s.bg, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={[C.accent, C.accent + 'bb', C.bg]}
            style={s.header}
          >
            <Text style={s.flagRow}>🇺🇦</Text>
            <Text style={[s.title, { color: '#fff' }]}>Навчайся{'\n'}разом з нами</Text>
            <Text style={s.subtitle}>НУШ · 5–9 клас · 2025–2026</Text>
            {done > 0 && (
              <View style={[s.badge, { backgroundColor: C.green + '33', borderColor: C.green + '66' }]}>
                <Text style={[s.badgeText, { color: C.green }]}>✓ {done} уроків завершено</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Grade cards */}
        <Text style={[s.sectionTitle, { color: C.text }]}>Обери клас</Text>
        <View style={s.grid}>
          {GRADES.map((grade, i) => (
            <Animated.View
              key={grade.id}
              entering={FadeInDown.delay(i * 80).springify()}
              style={{ width: CARD_W }}
            >
              <Pressable
                style={({ pressed }) => [s.card, { borderColor: C.border }, pressed && { opacity: 0.85 }]}
                onPress={() => router.push(`/grade/${grade.id}` as any)}
              >
                <LinearGradient
                  colors={[grade.color + 'cc', grade.color + '44', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.cardGrad}
                >
                  <Text style={s.cardEmoji}>{grade.emoji}</Text>
                  <Text style={[s.cardLabel, { color: C.text }]}>{grade.label}</Text>
                  <Text style={s.cardSubs}>
                    {grade.subjects.length} предмет{grade.subjects.length > 1 ? 'и' : ''}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { paddingBottom: SPACING.xxl },
  header: {
    paddingTop: 72,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  flagRow: { fontSize: 40, marginBottom: SPACING.sm },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 34,
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badge: {
    marginTop: SPACING.md,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 13 },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardGrad: {
    padding: SPACING.md,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  cardEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  cardLabel: { fontFamily: FONTS.extraBold, fontSize: 22 },
  cardSubs: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
