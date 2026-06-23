import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

interface Props {
  problem: string;
  hint: string;
  answer: string;
}

export function FillInBlock({ problem, hint, answer }: Props) {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = checked && value.trim().toLowerCase() === answer.trim().toLowerCase();
  const isWrong = checked && !isCorrect;

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  function handleCheck() {
    if (!value.trim()) return;
    setChecked(true);
    if (value.trim().toLowerCase() !== answer.trim().toLowerCase()) {
      shake.value = withSequence(
        withSpring(8), withSpring(-8), withSpring(6),
        withSpring(-6), withSpring(0),
      );
    }
  }

  function handleRetry() {
    setValue('');
    setChecked(false);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>✏️ Завдання</Text>
      </View>
      <Text style={styles.problem}>{problem}</Text>

      <Animated.View style={[styles.inputRow, shakeStyle]}>
        <TextInput
          style={[
            styles.input,
            isCorrect && styles.inputCorrect,
            isWrong && styles.inputWrong,
          ]}
          value={value}
          onChangeText={(t) => { setValue(t); setChecked(false); }}
          placeholder="Введи відповідь..."
          placeholderTextColor={COLORS.textMuted}
          editable={!isCorrect}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleCheck}
        />

        {isCorrect ? (
          <View style={styles.resultBadge}>
            <Text style={styles.resultCorrect}>✓</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.checkBtn, !value.trim() && styles.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!value.trim()}
          >
            <Text style={styles.checkBtnText}>Перевірити</Text>
          </Pressable>
        )}
      </Animated.View>

      {isCorrect && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.feedbackCorrect}>
          <Text style={styles.feedbackText}>🎉 Правильно! Відповідь: {answer}</Text>
        </Animated.View>
      )}

      {isWrong && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.feedbackWrong}>
          <Text style={styles.feedbackText}>❌ Не зовсім. Спробуй ще раз!</Text>
          <View style={styles.feedbackActions}>
            <Pressable onPress={handleRetry} style={styles.retryBtn}>
              <Text style={styles.retryText}>Ще раз</Text>
            </Pressable>
            <Pressable onPress={() => setShowHint(true)} style={styles.hintBtn}>
              <Text style={styles.hintBtnText}>💡 Підказка</Text>
            </Pressable>
          </View>
          {showHint && (
            <Animated.Text entering={FadeIn} style={styles.hintText}>
              {hint}
            </Animated.Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(99,102,241,0.06)',
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
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
    color: COLORS.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  problem: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },
  inputCorrect: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  inputWrong: {
    borderColor: COLORS.red,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  checkBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkBtnDisabled: {
    opacity: 0.4,
  },
  checkBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#fff',
  },
  resultBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.green + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCorrect: {
    fontSize: 20,
    color: COLORS.green,
  },
  feedbackCorrect: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.green + '44',
  },
  feedbackWrong: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.red + '44',
  },
  feedbackText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  retryText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
  },
  hintBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  hintBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.accent,
  },
  hintText: {
    marginTop: 8,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    fontStyle: 'italic',
  },
});
