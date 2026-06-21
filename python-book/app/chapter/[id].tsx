import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle, withSequence,
  withSpring, withTiming, withRepeat,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { chapters } from '../../src/data/chapters';
import { useProgress } from '../../src/store/progress';
import { useShake } from '../../src/hooks/useShake';
import { ContentRenderer } from '../../src/components/ContentRenderer';
import { CodePlayground } from '../../src/components/CodePlayground';
import { COLORS, FONTS, RADIUS, SPACING } from '../../src/theme';

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const chapterId = Number(id);
  const chapter = chapters.find((c) => c.id === chapterId);
  const { markDone, isDone } = useProgress();
  const [celebrated, setCelebrated] = useState(false);

  const celebrateScale = useSharedValue(1);
  const celebrateStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrateScale.value }],
  }));

  const celebrate = useCallback(() => {
    if (celebrated) return;
    setCelebrated(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    celebrateScale.value = withSequence(
      withSpring(1.15, { damping: 5 }),
      withSpring(0.95, { damping: 8 }),
      withSpring(1, { damping: 12 }),
    );
  }, [celebrated]);

  useShake(celebrate);

  if (!chapter) {
    return (
      <View style={styles.bg}>
        <Text style={styles.notFound}>Розділ не знайдено</Text>
      </View>
    );
  }

  const color = COLORS.chapters[chapter.id - 1];
  const isFirst = chapter.id === 1;
  const isLast = chapter.id === chapters.length;
  const alreadyDone = isDone(chapter.id);

  // Swipe left→next, right→prev
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (e.translationX < -60 && !isLast) {
        router.replace(`/chapter/${chapter.id + 1}` as any);
      } else if (e.translationX > 60 && !isFirst) {
        router.replace(`/chapter/${chapter.id - 1}` as any);
      }
    });

  function handleComplete() {
    markDone(chapter!.id);
    celebrate();
    if (!isLast) {
      setTimeout(() => router.replace(`/chapter/${chapter!.id + 1}` as any), 600);
    } else {
      Alert.alert('🎉 Вітаємо!', 'Ти пройшов усі 10 розділів! Ти справжній Python-програміст!');
    }
  }

  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.bg}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={[color, color + '88', '#0d0b21']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerGrad}
          >
            <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
              <Text style={styles.backText}>← Назад</Text>
            </Pressable>

            <Animated.View entering={FadeIn.duration(400)} style={styles.headerContent}>
              <Animated.Text style={[styles.emoji, celebrateStyle]}>
                {chapter.emoji}
              </Animated.Text>
              <Text style={styles.badge}>
                Розділ {chapter.id} з {chapters.length}
              </Text>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.intro}>{chapter.intro}</Text>
            </Animated.View>
          </LinearGradient>

          {/* Content */}
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.body}>
            <ContentRenderer blocks={chapter.blocks} />

            {/* Playground */}
            <CodePlayground initialCode={chapter.initialCode} accentColor={color} />

            {/* Swipe hint */}
            <Text style={styles.swipeHint}>← Свайп для навігації →</Text>

            {/* Next / Complete button */}
            <Pressable
              style={[styles.nextBtn, { backgroundColor: alreadyDone ? COLORS.green : color }]}
              onPress={handleComplete}
            >
              <Text style={styles.nextText}>
                {alreadyDone
                  ? '✓ Завершено'
                  : isLast
                  ? '🏆 Завершити книгу!'
                  : 'Далі →'}
              </Text>
            </Pressable>

            {!isFirst && (
              <Pressable
                style={styles.prevBtn}
                onPress={() => router.replace(`/chapter/${chapter.id - 1}` as any)}
              >
                <Text style={styles.prevText}>← Попередній розділ</Text>
              </Pressable>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </GestureDetector>
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
  notFound: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  headerGrad: {
    paddingBottom: SPACING.xl,
  },
  backBtn: {
    paddingTop: 56,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  badge: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  chapterTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 30,
    color: '#fff',
    marginBottom: SPACING.sm,
    lineHeight: 36,
  },
  intro: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 24,
  },
  body: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  swipeHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  nextBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nextText: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#fff',
  },
  prevBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  prevText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
