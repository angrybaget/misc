import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADES } from '../../src/data/grades';
import { SUBJECTS } from '../../src/data/subjects';
import { getContent } from '../../src/data/curriculum';
import { useProgress } from '../../src/store/progress';
import { useColors } from '../../src/hooks/useColors';
import { useSounds } from '../../src/hooks/useSounds';
import { GradeId, SubjectId } from '../../src/data/types';
import { FONTS, RADIUS, SPACING } from '../../src/theme';

export default function GradeScreen() {
  const { grade } = useLocalSearchParams<{ grade: string }>();
  const router = useRouter();
  const C = useColors();
  const { playSelect } = useSounds();
  const gradeId = Number(grade) as GradeId;
  const gradeDef = GRADES.find((g) => g.id === gradeId);
  const { countDone } = useProgress();

  if (!gradeDef) return null;

  return (
    <View style={[s.bg, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[gradeDef.color + 'dd', gradeDef.color + '44', C.bg]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={s.header}
        >
          <Pressable
            style={s.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          >
            <Text style={s.backText}>← Головна</Text>
          </Pressable>
          <Animated.View entering={FadeIn.duration(400)} style={s.headerContent}>
            <Text style={s.emoji}>{gradeDef.emoji}</Text>
            <Text style={[s.gradeLabel, { color: C.text }]}>{gradeDef.label}</Text>
            <Text style={s.subtitle}>Обери предмет</Text>
          </Animated.View>
        </LinearGradient>

        {/* Subject cards */}
        <View style={s.list}>
          {gradeDef.subjects.map((subjectId, i) => {
            const subject = SUBJECTS[subjectId as SubjectId];
            const content = getContent(gradeId, subjectId as SubjectId);
            const total = content?.lessons.length ?? 0;
            const done = countDone(gradeId, subjectId as SubjectId);

            return (
              <Animated.View key={subjectId} entering={FadeInDown.delay(i * 100).springify()}>
                <Pressable
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, borderColor: C.border }, pressed && { opacity: 0.85 }]}
                  onPress={() => { playSelect(); router.push(`/grade/${gradeId}/${subjectId}` as any); }}
                >
                  <View style={[s.cardAccent, { backgroundColor: subject.color }]} />
                  <View style={s.cardBody}>
                    <Text style={s.cardEmoji}>{subject.emoji}</Text>
                    <View style={s.cardText}>
                      <Text style={[s.cardTitle, { color: C.text }]}>{subject.title}</Text>
                      <Text style={[s.cardDesc, { color: C.textMuted }]}>{subject.description}</Text>
                      <View style={s.progressRow}>
                        <View style={[s.progressBar, { backgroundColor: C.border }]}>
                          <View
                            style={[
                              s.progressFill,
                              { width: `${total > 0 ? (done / total) * 100 : 0}%`, backgroundColor: subject.color },
                            ]}
                          />
                        </View>
                        <Text style={[s.progressLabel, { color: C.textMuted }]}>{done}/{total}</Text>
                      </View>
                    </View>
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
  headerContent: { paddingHorizontal: SPACING.md, alignItems: 'flex-start' },
  emoji: { fontSize: 52, marginBottom: SPACING.sm },
  gradeLabel: { fontFamily: FONTS.extraBold, fontSize: 36 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  list: { padding: SPACING.md, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: 12 },
  cardEmoji: { fontSize: 36 },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: FONTS.extraBold, fontSize: 18, marginBottom: 2 },
  cardDesc: { fontFamily: FONTS.regular, fontSize: 13, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressLabel: { fontFamily: FONTS.bold, fontSize: 11 },
  arrow: { fontFamily: FONTS.bold, fontSize: 24, paddingRight: SPACING.md },
});
