import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SUBJECTS } from '../../../src/data/subjects';
import { getContent } from '../../../src/data/curriculum';
import { useProgress } from '../../../src/store/progress';
import { GradeId, SubjectId } from '../../../src/data/types';
import { COLORS, FONTS, RADIUS, SPACING } from '../../../src/theme';

export default function SubjectScreen() {
  const { grade, subject } = useLocalSearchParams<{ grade: string; subject: string }>();
  const router = useRouter();
  const gradeId = Number(grade) as GradeId;
  const subjectId = subject as SubjectId;

  const subjectDef = SUBJECTS[subjectId];
  const content = getContent(gradeId, subjectId);
  const { isDone, countDone } = useProgress();

  if (!content || !subjectDef) return null;

  const done = countDone(gradeId, subjectId);
  const total = content.lessons.length;

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[subjectDef.color + 'dd', subjectDef.color + '33', '#0d0b21']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <Pressable
            style={styles.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          >
            <Text style={styles.backText}>← Назад</Text>
          </Pressable>
          <Animated.View entering={FadeIn.duration(400)} style={styles.headerContent}>
            <Text style={styles.emoji}>{subjectDef.emoji}</Text>
            <Text style={styles.subjectTitle}>{subjectDef.title}</Text>
            <Text style={styles.subtitle}>{grade} клас · {content.totalHours} год/рік</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(done / total) * 100}%`, backgroundColor: subjectDef.color }]} />
              </View>
              <Text style={styles.progressLabel}>{done}/{total} уроків</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Lesson list */}
        <View style={styles.list}>
          {content.lessons.map((lesson, i) => {
            const done = isDone(gradeId, subjectId, lesson.id);
            return (
              <Animated.View key={lesson.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  style={({ pressed }) => [styles.lessonCard, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push(`/grade/${gradeId}/${subjectId}/${lesson.id}` as any)}
                >
                  <View style={[styles.lessonNum, done && { backgroundColor: subjectDef.color + '33', borderColor: subjectDef.color }]}>
                    {done
                      ? <Text style={[styles.lessonNumText, { color: subjectDef.color }]}>✓</Text>
                      : <Text style={styles.lessonNumText}>{i + 1}</Text>}
                  </View>
                  <View style={styles.lessonText}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                    <Text style={styles.lessonIntro} numberOfLines={1}>{lesson.intro}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: SPACING.xxl },
  header: { paddingBottom: SPACING.xl },
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
  headerContent: { paddingHorizontal: SPACING.md },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  subjectTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  list: { padding: SPACING.md, gap: 10 },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 12,
  },
  lessonNum: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  lessonNumText: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  lessonText: { flex: 1 },
  lessonTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
  },
  lessonIntro: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.textMuted,
  },
});
