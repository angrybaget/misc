import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';

interface Props {
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
}

const LABELS = ['A', 'B', 'C', 'D'];

export function QuizMultiBlock({ question, options, correct, explanation }: Props) {
  const C = useColors();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggle(i: number) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const isCorrect = (i: number) => correct.includes(i);
  const isSelected = (i: number) => selected.has(i);

  const isFullyCorrect =
    submitted &&
    [...selected].every(isCorrect) &&
    correct.every((i) => selected.has(i));

  function optionBg(i: number) {
    if (!submitted) return isSelected(i) ? C.accentSoft : C.card;
    if (isCorrect(i)) return 'rgba(16,185,129,0.15)';
    if (isSelected(i)) return 'rgba(239,68,68,0.15)';
    return C.card;
  }
  function optionBorder(i: number) {
    if (!submitted) return isSelected(i) ? C.accent : C.border;
    if (isCorrect(i)) return C.green;
    if (isSelected(i)) return C.red;
    return C.border;
  }
  function optionTextColor(i: number) {
    if (!submitted) return C.text;
    if (isCorrect(i)) return C.green;
    if (isSelected(i) && !isCorrect(i)) return C.red;
    return C.textMuted;
  }

  return (
    <View style={[s.wrap, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.header}>
        <Text style={[s.label, { color: C.textMuted }]}>☑️ Декілька правильних відповідей</Text>
      </View>
      <Text style={[s.question, { color: C.text }]}>{question}</Text>

      <View style={s.options}>
        {options.map((opt, i) => (
          <Pressable
            key={i}
            style={[s.option, { backgroundColor: optionBg(i), borderColor: optionBorder(i) }]}
            onPress={() => toggle(i)}
          >
            <View style={[
              s.checkbox,
              {
                borderColor: submitted
                  ? isCorrect(i) ? C.green : isSelected(i) ? C.red : C.border
                  : isSelected(i) ? C.accent : C.border,
                backgroundColor: isSelected(i) && !submitted
                  ? C.accent
                  : submitted && isCorrect(i)
                  ? C.green
                  : submitted && isSelected(i) && !isCorrect(i)
                  ? C.red
                  : 'transparent',
              },
            ]}>
              {(isSelected(i) || (submitted && isCorrect(i))) && (
                <Text style={s.checkmark}>✓</Text>
              )}
            </View>
            <View style={[s.badge, { backgroundColor: C.accentSoft }]}>
              <Text style={[s.badgeText, { color: C.accent }]}>{LABELS[i]}</Text>
            </View>
            <Text style={[s.optionText, { color: optionTextColor(i) }]}>{opt}</Text>
            {submitted && isCorrect(i) && <Text style={[s.mark, { color: C.green }]}>✓</Text>}
            {submitted && isSelected(i) && !isCorrect(i) && <Text style={[s.mark, { color: C.red }]}>✗</Text>}
          </Pressable>
        ))}
      </View>

      {!submitted && (
        <Pressable
          style={[s.submitBtn, { backgroundColor: selected.size > 0 ? C.accent : C.border }]}
          onPress={() => selected.size > 0 && setSubmitted(true)}
        >
          <Text style={s.submitText}>Перевірити →</Text>
        </Pressable>
      )}

      {submitted && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            s.explanation,
            isFullyCorrect
              ? { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: C.green + '66' }
              : { backgroundColor: C.accentSoft + '88', borderColor: C.accent + '66' },
          ]}
        >
          <Text style={s.explanationIcon}>{isFullyCorrect ? '🎉' : '💡'}</Text>
          <Text style={[s.explanationText, { color: C.text }]}>{explanation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: RADIUS.lg, borderWidth: 1, marginTop: SPACING.lg, overflow: 'hidden' },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 4 },
  label: { fontFamily: FONTS.bold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  question: { fontFamily: FONTS.bold, fontSize: 15, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, lineHeight: 22 },
  options: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  badge: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: FONTS.bold, fontSize: 11 },
  optionText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  mark: { fontSize: 15 },
  submitBtn: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },
  explanation: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  explanationIcon: { fontSize: 20 },
  explanationText: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20 },
});
