import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle, withSequence, withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SUBJECTS } from '../../../../src/data/subjects';
import { getContent } from '../../../../src/data/curriculum';
import { useProgress } from '../../../../src/store/progress';
import { useShake } from '../../../../src/hooks/useShake';
import { ContentRenderer } from '../../../../src/components/ContentRenderer';
import { TeacherAccordion } from '../../../../src/components/TeacherAccordion';
import { CodePlayground } from '../../../../src/components/CodePlayground';
import { useColors } from '../../../../src/hooks/useColors';
import { GradeId, SubjectId } from '../../../../src/data/types';
import { FONTS, RADIUS, SPACING } from '../../../../src/theme';

export default function LessonScreen() {
  const { grade, subject, lesson } = useLocalSearchParams<{
    grade: string; subject: string; lesson: string;
  }>();
  const router = useRouter();
  const C = useColors();

  const gradeId = Number(grade) as GradeId;
  const subjectId = subject as SubjectId;
  const lessonId = Number(lesson);

  const subjectDef = SUBJECTS[subjectId];
  const content = getContent(gradeId, subjectId);
  const lessonData = content?.lessons.find((l) => l.id === lessonId);

  const { markDone, isDone } = useProgress();
  const [celebrated, setCelebrated] = useState(false);

  const celebrateScale = useSharedValue(1);
  const celebrateStyle = useAnimatedStyle(() => ({ transform: [{ scale: celebrateScale.value }] }));

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

  if (!lessonData || !subjectDef || !content) {
    return (
      <View style={[s.bg, { backgroundColor: C.bg }]}>
        <Text style={[s.notFound, { color: C.text }]}>Урок не знайдено</Text>
      </View>
    );
  }

  const lessonIndex = content.lessons.findIndex((l) => l.id === lessonId);
  const isFirst = lessonIndex === 0;
  const isLast = lessonIndex === content.lessons.length - 1;
  const prevLesson = !isFirst ? content.lessons[lessonIndex - 1] : null;
  const nextLesson = !isLast ? content.lessons[lessonIndex + 1] : null;
  const alreadyDone = isDone(gradeId, subjectId, lessonId);
  const color = subjectDef.color;

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (e.translationX < -60 && nextLesson)
        router.replace(`/grade/${gradeId}/${subjectId}/${nextLesson.id}` as any);
      else if (e.translationX > 60 && prevLesson)
        router.replace(`/grade/${gradeId}/${subjectId}/${prevLesson.id}` as any);
    });

  function handleComplete() {
    markDone(gradeId, subjectId, lessonId);
    celebrate();
    if (!isLast) {
      setTimeout(() => router.replace(`/grade/${gradeId}/${subjectId}/${nextLesson!.id}` as any), 600);
    } else {
      Alert.alert(
        '🎉 Предмет завершено!',
        `Ти опрацював всі уроки з ${subjectDef.title} за ${gradeId} клас!`,
        [{ text: 'До предметів', onPress: () => router.replace(`/grade/${gradeId}/${subjectId}` as any) }],
      );
    }
  }

  return (
    <GestureDetector gesture={swipe}>
      <View style={[s.bg, { backgroundColor: C.bg }]}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={[color, color + '88', C.bg]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={s.headerGrad}
          >
            <Pressable
              style={s.backBtn}
              onPress={() => router.canGoBack() ? router.back() : router.replace(`/grade/${gradeId}/${subjectId}` as any)}
            >
              <Text style={s.backText}>← Назад</Text>
            </Pressable>

            <Animated.View entering={FadeIn.duration(400)} style={s.headerContent}>
              <Animated.Text style={[s.subjectEmoji, celebrateStyle]}>
                {subjectDef.emoji}
              </Animated.Text>
              <Text style={s.breadcrumb}>
                {gradeId} клас · {subjectDef.title} · Урок {lessonIndex + 1}/{content.lessons.length}
              </Text>
              <Text style={s.lessonTitle}>{lessonData.title}</Text>
              <Text style={s.intro}>{lessonData.intro}</Text>
            </Animated.View>
          </LinearGradient>

          {/* Body */}
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={s.body}>
            {lessonData.teacher && <TeacherAccordion teacher={lessonData.teacher} />}
            <ContentRenderer blocks={lessonData.blocks} />

            {lessonData.initialCode && (
              <CodePlayground initialCode={lessonData.initialCode} accentColor={color} />
            )}

            <Text style={[s.swipeHint, { color: C.textMuted }]}>← Свайп для переходу між уроками →</Text>

            <Pressable
              style={[s.nextBtn, { backgroundColor: alreadyDone ? C.green : color }]}
              onPress={handleComplete}
            >
              <Text style={s.nextText}>
                {alreadyDone ? '✓ Завершено' : isLast ? '🏆 Завершити предмет' : 'Далі →'}
              </Text>
            </Pressable>

            {prevLesson && (
              <Pressable
                style={s.prevBtn}
                onPress={() => router.replace(`/grade/${gradeId}/${subjectId}/${prevLesson.id}` as any)}
              >
                <Text style={[s.prevText, { color: C.textMuted }]}>← Попередній урок</Text>
              </Pressable>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { paddingBottom: SPACING.xxl },
  notFound: { fontFamily: FONTS.bold, fontSize: 18, textAlign: 'center', marginTop: 100 },
  headerGrad: { paddingBottom: SPACING.xl },
  backBtn: { paddingTop: 56, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  backText: { fontFamily: FONTS.bold, fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  headerContent: { paddingHorizontal: SPACING.md, alignItems: 'flex-start' },
  subjectEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  breadcrumb: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  lessonTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    color: '#fff',
    lineHeight: 34,
    marginBottom: SPACING.sm,
  },
  intro: { fontFamily: FONTS.regular, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 24 },
  body: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },
  swipeHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  nextBtn: { borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginBottom: SPACING.sm },
  nextText: { fontFamily: FONTS.bold, fontSize: 17, color: '#fff' },
  prevBtn: { paddingVertical: 14, alignItems: 'center' },
  prevText: { fontFamily: FONTS.bold, fontSize: 15 },
});
