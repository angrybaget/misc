import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSubjectContent } from '../../../../src/hooks/useSubjectContent';
import { useColors } from '../../../../src/hooks/useColors';
import { SUBJECTS } from '../../../../src/data/subjects';
import { GradeId, SubjectId } from '../../../../src/data/types';
import { FONTS, RADIUS, SPACING } from '../../../../src/theme';

export default function AdminLessonList() {
  const { grade, subject } = useLocalSearchParams<{ grade: string; subject: string }>();
  const router = useRouter();
  const C = useColors();
  const gradeId = Number(grade) as GradeId;
  const subjectId = subject as SubjectId;
  const { data, loading } = useSubjectContent(gradeId, subjectId);
  const subjectDef = SUBJECTS[subjectId];

  return (
    <View style={[s.bg, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textMuted }]}>← Назад</Text>
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>
          {subjectDef?.emoji} {subjectDef?.title} · {grade} кл
        </Text>
        <Pressable
          style={[s.addBtn, { backgroundColor: '#4F46E5' }]}
          onPress={() => router.push(`/admin/${grade}/${subject}/new/edit` as any)}
        >
          <Text style={s.addBtnText}>+ Урок</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.center}>
          <Text style={[s.muted, { color: C.textMuted }]}>Завантаження…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          {(data?.lessons ?? []).map((lesson, i) => (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [
                s.card, { backgroundColor: C.surface, borderColor: C.border },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => router.push(`/admin/${grade}/${subject}/${lesson.id}/edit` as any)}
            >
              <View style={[s.num, { borderColor: C.border }]}>
                <Text style={[s.numText, { color: C.textMuted }]}>{i + 1}</Text>
              </View>
              <View style={s.lessonInfo}>
                <Text style={[s.lessonTitle, { color: C.text }]}>{lesson.title}</Text>
                <Text style={[s.lessonIntro, { color: C.textMuted }]} numberOfLines={1}>
                  {lesson.intro}
                </Text>
                <Text style={[s.blocksCount, { color: C.textMuted }]}>
                  {lesson.blocks.length} блоків
                </Text>
              </View>
              <Text style={[s.arrow, { color: C.textMuted }]}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
    borderBottomWidth: 1, gap: 8,
  },
  back: { fontFamily: FONTS.bold, fontSize: 14 },
  title: { fontFamily: FONTS.bold, fontSize: 15, flex: 1, textAlign: 'center' },
  addBtn: { borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { fontFamily: FONTS.regular, fontSize: 15 },
  scroll: { padding: SPACING.md, gap: 10, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  num: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  numText: { fontFamily: FONTS.bold, fontSize: 14 },
  lessonInfo: { flex: 1, gap: 2 },
  lessonTitle: { fontFamily: FONTS.bold, fontSize: 14 },
  lessonIntro: { fontFamily: FONTS.regular, fontSize: 12 },
  blocksCount: { fontFamily: FONTS.regular, fontSize: 11, marginTop: 2 },
  arrow: { fontFamily: FONTS.bold, fontSize: 22 },
});
