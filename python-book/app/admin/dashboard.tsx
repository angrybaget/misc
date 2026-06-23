import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdminStore } from '../../src/store/admin';
import { useColors } from '../../src/hooks/useColors';
import { GRADES } from '../../src/data/grades';
import { SUBJECTS } from '../../src/data/subjects';
import { FONTS, RADIUS, SPACING } from '../../src/theme';

const SUBJECT_ORDER = ['informatyka', 'matematyka', 'algebra', 'geometriya'] as const;

export default function AdminDashboard() {
  const { user, signOut } = useAdminStore();
  const router = useRouter();
  const C = useColors();

  return (
    <View style={[s.bg, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <Text style={[s.title, { color: C.text }]}>Адмін-панель</Text>
        <Pressable onPress={signOut}>
          <Text style={[s.logout, { color: C.textMuted }]}>Вийти</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.hint, { color: C.textMuted }]}>
          Оберіть клас та предмет для редагування уроків
        </Text>

        {GRADES.map(grade => {
          const gradeSubjects = SUBJECT_ORDER.filter(sid =>
            grade.subjects.includes(sid)
          );
          return (
            <View key={grade.id} style={s.gradeBlock}>
              <Text style={[s.gradeLabel, { color: C.text }]}>
                {grade.emoji} {grade.label}
              </Text>
              <View style={s.subjectRow}>
                {gradeSubjects.map(sid => {
                  const subj = SUBJECTS[sid];
                  return (
                    <Pressable
                      key={sid}
                      style={({ pressed }) => [
                        s.subjectCard,
                        { backgroundColor: C.surface, borderColor: C.border },
                        pressed && { opacity: 0.75 },
                      ]}
                      onPress={() => router.push(`/admin/${grade.id}/${sid}` as any)}
                    >
                      <Text style={s.subjEmoji}>{subj.emoji}</Text>
                      <Text style={[s.subjName, { color: C.text }]}>{subj.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  title: { fontFamily: FONTS.extraBold, fontSize: 22 },
  logout: { fontFamily: FONTS.regular, fontSize: 14 },
  scroll: { padding: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  hint: { fontFamily: FONTS.regular, fontSize: 13, marginBottom: SPACING.sm },
  gradeBlock: { gap: SPACING.sm },
  gradeLabel: { fontFamily: FONTS.bold, fontSize: 17 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectCard: {
    borderWidth: 1, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', gap: 6, minWidth: 100,
  },
  subjEmoji: { fontSize: 28 },
  subjName: { fontFamily: FONTS.bold, fontSize: 13, textAlign: 'center' },
});
