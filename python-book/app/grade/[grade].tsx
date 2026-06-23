import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADES } from '../../src/data/grades';
import { SUBJECTS } from '../../src/data/subjects';
import { getContent } from '../../src/data/curriculum';
import { useProgress } from '../../src/store/progress';
import { GradeId, SubjectId } from '../../src/data/types';
import { COLORS, FONTS, RADIUS, SPACING } from '../../src/theme';

export default function GradeScreen() {
  const { grade } = useLocalSearchParams<{ grade: string }>();
  const router = useRouter();
  const gradeId = Number(grade) as GradeId;
  const gradeDef = GRADES.find((g) => g.id === gradeId);
  const { countDone } = useProgress();

  if (!gradeDef) return null;

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[gradeDef.color + 'dd', gradeDef.color + '44', '#0d0b21']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <Pressable
            style={styles.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          >
            <Text style={styles.backText}>← Головна</Text>
          </Pressable>
          <Animated.View entering={FadeIn.duration(400)} style={styles.headerContent}>
            <Text style={styles.emoji}>{gradeDef.emoji}</Text>
            <Text style={styles.gradeLabel}>{gradeDef.label}</Text>
            <Text style={styles.subtitle}>Обери предмет</Text>
          </Animated.View>
        </LinearGradient>

        {/* Subject cards */}
        <View style={styles.list}>
          {gradeDef.subjects.map((subjectId, i) => {
            const subject = SUBJECTS[subjectId as SubjectId];
            const content = getContent(gradeId, subjectId as SubjectId);
            const total = content?.lessons.length ?? 0;
            const done = countDone(gradeId, subjectId as SubjectId);

            return (
              <Animated.View key={subjectId} entering={FadeInDown.delay(i * 100).springify()}>
                <Pressable
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push(`/grade/${gradeId}/${subjectId}` as any)}
                >
                  <View style={[styles.cardAccent, { backgroundColor: subject.color }]} />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardEmoji}>{subject.emoji}</Text>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{subject.title}</Text>
                      <Text style={styles.cardDesc}>{subject.description}</Text>
                      <View style={styles.progressRow}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${total > 0 ? (done / total) * 100 : 0}%`, backgroundColor: subject.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressLabel}>{done}/{total}</Text>
                      </View>
                    </View>
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
  headerContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-start',
  },
  emoji: { fontSize: 52, marginBottom: SPACING.sm },
  gradeLabel: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  list: {
    padding: SPACING.md,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: 12,
  },
  cardEmoji: { fontSize: 36 },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  arrow: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.textMuted,
    paddingRight: SPACING.md,
  },
});
