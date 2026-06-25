import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, FadeIn,
} from 'react-native-reanimated';
import { useColors } from '../hooks/useColors';
import { useSounds } from '../hooks/useSounds';
import { FONTS, RADIUS, SPACING } from '../theme';

interface Props {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const LABELS = ['A', 'B', 'C', 'D'];

export function QuizBlock({ question, options, correct, explanation }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const C = useColors();
  const { playCorrect, playWrong } = useSounds();
  const isAnswered = selected !== null;

  function optionBg(i: number) {
    if (!isAnswered) return C.card;
    if (i === correct) return 'rgba(16,185,129,0.15)';
    if (i === selected) return 'rgba(239,68,68,0.15)';
    return C.card;
  }
  function optionBorder(i: number) {
    if (!isAnswered) return C.border;
    if (i === correct) return C.green;
    if (i === selected) return C.red;
    return C.border;
  }
  function optionTextColor(i: number) {
    if (!isAnswered) return C.text;
    if (i === correct) return C.green;
    if (i === selected) return C.red;
    return C.textMuted;
  }
  function optionOpacity(i: number) {
    if (!isAnswered) return 1;
    if (i === correct || i === selected) return 1;
    return 0.4;
  }

  return (
    <View style={[s.wrap, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.header}>
        <Text style={[s.label, { color: C.textMuted }]}>❓ Запитання</Text>
      </View>
      <Text style={[s.question, { color: C.text }]}>{question}</Text>

      <View style={s.options}>
        {options.map((opt, i) => {
          const scale = useSharedValue(1);
          const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
          return (
            <Animated.View key={i} style={[animStyle, { opacity: optionOpacity(i) }]}>
              <Pressable
                style={[s.option, { backgroundColor: optionBg(i), borderColor: optionBorder(i) }]}
                onPress={() => {
                  if (isAnswered) return;
                  scale.value = withSequence(withSpring(0.95), withSpring(1));
                  if (i === correct) playCorrect(); else playWrong();
                  setSelected(i);
                }}
              >
                <View style={[
                  s.badge,
                  { backgroundColor: isAnswered && i === correct ? C.green : isAnswered && i === selected && i !== correct ? C.red : C.border },
                ]}>
                  <Text style={[s.badgeText, { color: isAnswered && (i === correct || i === selected) ? '#fff' : C.text }]}>
                    {LABELS[i]}
                  </Text>
                </View>
                <Text style={[s.optionText, { color: optionTextColor(i) }]}>{opt}</Text>
                {isAnswered && i === correct && <Text style={[s.mark, { color: C.green }]}>✓</Text>}
                {isAnswered && i === selected && i !== correct && <Text style={[s.mark, { color: C.red }]}>✗</Text>}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {isAnswered && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            s.explanation,
            selected === correct
              ? { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: C.green + '66' }
              : { backgroundColor: C.accentSoft + '88', borderColor: C.accent + '66' },
          ]}
        >
          <Text style={s.explanationIcon}>{selected === correct ? '🎉' : '💡'}</Text>
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
  options: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
  },
  badge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: FONTS.bold, fontSize: 12 },
  optionText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  mark: { fontSize: 16 },
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
