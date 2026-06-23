import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SUBJECTS } from '../../../src/data/subjects';
import { useSubjectContent } from '../../../src/hooks/useSubjectContent';
import { useProgress } from '../../../src/store/progress';
import { useColors } from '../../../src/hooks/useColors';
import { GradeId, SubjectId } from '../../../src/data/types';
import { FONTS, RADIUS, SPACING } from '../../../src/theme';

export default function SubjectScreen() {
  const { grade, subject } = useLocalSearchParams<{ grade: string; subject: string }>();
  const router = useRouter();
  const C = useColors();
  const gradeId = Number(grade) as GradeId;
  const subjectId = subject as SubjectId;

  const subjectDef = SUBJECTS[subjectId];
  const { data: content, loading } = useSubjectContent(gradeId, subjectId);
  const { isDone, countDone } = useProgress();

  if (!subjectDef) return null;
  if (loading) return (
    <View style={[s.bg, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontFamily: FONTS.regular, color: C.textMuted, fontSize: 16 }}>Завантаження…</Text>
    </View>
  );
  if (!content) return null;

  const done = countDone(gradeId, subjectId);
  const total = content.lessons.length;

  return (
    <View style={[s.bg, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[subjectDef.color + 'dd', subjectDef.color + '33', C.bg]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={s.header}
        >
          <Pressable
            style={s.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          >
            <Text style={s.backText}>← Назад</Text>
          </Pressable>
          <Animated.View entering={FadeIn.duration(400)} style={s.headerContent}>
            <Text style={s.emoji}>{subjectDef.emoji}</Text>
            <Text style={[s.subjectTitle, { color: C.text }]}>{subjectDef.title}</Text>
            <Text style={s.subtitle}>{grade} клас · {content.totalHours} год/рік</Text>
            <View style={s.progressRow}>
              <View style={[s.progressBar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={[s.progressFill, { width: `${(done / total) * 100}%`, backgroundColor: subjectDef.color }]} />
              </View>
              <Text style={s.progressLabel}>{done}/{total} уроків</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Lesson list */}
        <View style={s.list}>
          {content.lessons.map((lesson, i) => {
            const lessonDone = isDone(gradeId, subjectId, lesson.id);
            return (
              <Animated.View key={lesson.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, borderColor: C.border }, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push(`/grade/${gradeId}/${subjectId}/${lesson.id}` as any)}
                >
                  <View style={[s.lessonNum, { borderColor: C.border, backgroundColor: 'rgba(0,0,0,0.03)' },
                    lessonDone && { backgroundColor: subjectDef.color + '28', borderColor: subjectDef.color }]}>
                    {lessonDone
                      ? <Text style={[s.lessonNumText, { color: subjectDef.color }]}>✓</Text>
                      : <Text style={[s.lessonNumText, { color: C.textMuted }]}>{i + 1}</Text>}
                  </View>
                  <View style={s.lessonText}>
                    <Text style={[s.lessonTitle, { color: C.text }]} numberOfLines={2}>{lesson.title}</Text>
                    <Text style={[s.lessonIntro, { color: C.textMuted }]} numberOfLines={1}>{lesson.intro}</Text>
                  </View>
                  <Text style={[s.arrow, { color: C.textMuted }]}>›</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { paddingBottom: SPACING.xxl },
  header: { paddingBottom: SPACING.xl },
  backBtn: { paddingTop: 56, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  backText: { fontFamily: FONTS.bold, fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  headerContent: { paddingHorizontal: SPACING.md },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  subjectTitle: { fontFamily: FONTS.extraBold, fontSize: 32 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: SPACING.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontFamily: FONTS.bold, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  list: { padding: SPACING.md, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    gap: 12,
  },
  lessonNum: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: { fontFamily: FONTS.extraBold, fontSize: 16 },
  lessonText: { flex: 1 },
  lessonTitle: { fontFamily: FONTS.bold, fontSize: 15, lineHeight: 21 },
  lessonIntro: { fontFamily: FONTS.regular, fontSize: 13, marginTop: 2 },
  arrow: { fontFamily: FONTS.bold, fontSize: 22 },
});
