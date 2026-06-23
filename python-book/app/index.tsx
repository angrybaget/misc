import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADES } from '../src/data/grades';
import { useProgress } from '../src/store/progress';
import { COLORS, FONTS, RADIUS, SPACING } from '../src/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.md * 2 - 12) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { totalDone } = useProgress();
  const done = totalDone();

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={['#3730a3', '#1e1b4b', '#0d0b21']}
            style={styles.header}
          >
            <Text style={styles.flagRow}>🇺🇦</Text>
            <Text style={styles.title}>Навчайся{'\n'}разом з нами</Text>
            <Text style={styles.subtitle}>НУШ · 5–9 клас · 2025–2026</Text>
            {done > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ {done} уроків завершено</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Grade cards */}
        <Text style={styles.sectionTitle}>Обери клас</Text>
        <View style={styles.grid}>
          {GRADES.map((grade, i) => (
            <Animated.View
              key={grade.id}
              entering={FadeInDown.delay(i * 80).springify()}
              style={{ width: CARD_W }}
            >
              <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() => router.push(`/grade/${grade.id}` as any)}
              >
                <LinearGradient
                  colors={[grade.color + 'cc', grade.color + '44', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGrad}
                >
                  <Text style={styles.cardEmoji}>{grade.emoji}</Text>
                  <Text style={styles.cardLabel}>{grade.label}</Text>
                  <Text style={styles.cardSubs}>
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

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: SPACING.xxl },
  header: {
    paddingTop: 64,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  flagRow: { fontSize: 40, marginBottom: SPACING.sm },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 34,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badge: {
    marginTop: SPACING.md,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: COLORS.green + '66',
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.green,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textMuted,
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
    borderColor: COLORS.border,
  },
  cardGrad: {
    padding: SPACING.md,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  cardEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  cardLabel: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: COLORS.text,
  },
  cardSubs: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
