import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

interface Props {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function QuizBlock({ question, options, correct, explanation }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = selected !== null;

  function handleSelect(i: number) {
    if (isAnswered) return;
    setSelected(i);
  }

  function optionStyle(i: number) {
    if (!isAnswered) return styles.option;
    if (i === correct) return [styles.option, styles.optionCorrect];
    if (i === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  }

  function optionTextStyle(i: number) {
    if (!isAnswered) return styles.optionText;
    if (i === correct) return [styles.optionText, styles.optionTextCorrect];
    if (i === selected) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDim];
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>❓ Запитання</Text>
      </View>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.options}>
        {options.map((opt, i) => {
          const scale = useSharedValue(1);
          const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
          return (
            <Animated.View key={i} style={animStyle}>
              <Pressable
                style={optionStyle(i)}
                onPress={() => {
                  scale.value = withSequence(withSpring(0.95), withSpring(1));
                  handleSelect(i);
                }}
              >
                <View style={[styles.badge, isAnswered && i === correct && styles.badgeCorrect, isAnswered && i === selected && i !== correct && styles.badgeWrong]}>
                  <Text style={styles.badgeText}>{['A', 'B', 'C', 'D'][i]}</Text>
                </View>
                <Text style={optionTextStyle(i)}>{opt}</Text>
                {isAnswered && i === correct && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {isAnswered && i === selected && i !== correct && (
                  <Text style={styles.cross}>✗</Text>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {isAnswered && (
        <Animated.View entering={FadeIn.duration(400)} style={[styles.explanation, selected === correct ? styles.explanationCorrect : styles.explanationWrong]}>
          <Text style={styles.explanationIcon}>{selected === correct ? '🎉' : '💡'}</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 4,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  question: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    lineHeight: 22,
  },
  options: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionCorrect: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: COLORS.green,
  },
  optionWrong: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: COLORS.red,
  },
  optionDim: {
    opacity: 0.4,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCorrect: { backgroundColor: COLORS.green },
  badgeWrong: { backgroundColor: COLORS.red },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
  },
  optionText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  optionTextCorrect: { color: COLORS.green },
  optionTextWrong: { color: COLORS.red },
  optionTextDim: { color: COLORS.textMuted },
  checkmark: { fontSize: 16, color: COLORS.green },
  cross: { fontSize: 16, color: COLORS.red },
  explanation: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  explanationCorrect: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: COLORS.green + '66',
  },
  explanationWrong: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: COLORS.accent + '66',
  },
  explanationIcon: { fontSize: 20 },
  explanationText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
});
