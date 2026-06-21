import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChapterCard } from '../src/components/ChapterCard';
import { chapters } from '../src/data/chapters';
import { useProgress } from '../src/store/progress';
import { COLORS, FONTS, SPACING } from '../src/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { isDone, totalDone } = useProgress();
  const total = chapters.length;
  const done = totalDone();

  return (
    <View style={styles.bg}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <LinearGradient
            colors={['#3730a3', '#1e1b4b', '#0d0b21']}
            style={styles.headerGradient}
          >
            <Text style={styles.snake}>🐍</Text>
            <Text style={styles.title}>Python для{'\n'}початківців</Text>
            <Text style={styles.subtitle}>Видання для 7 класу</Text>

            {/* Progress bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: `${(done / total) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {done} / {total} розділів завершено
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Chapter grid */}
        <View style={styles.grid}>
          {chapters.map((ch, i) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              index={i}
              isDone={isDone(ch.id)}
              onPress={() => router.push(`/chapter/${ch.id}` as any)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  snake: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressWrap: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
});
