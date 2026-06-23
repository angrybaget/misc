import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';

interface Props {
  problem: string;
  hint: string;
  answer: string;
}

export function FillInBlock({ problem, hint, answer }: Props) {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const C = useColors();

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
    <View style={[s.wrap, { backgroundColor: C.surface, borderColor: C.accent + '55' }]}>
      <View style={s.header}>
        <Text style={[s.label, { color: C.accent }]}>✏️ Завдання</Text>
      </View>
      <Text style={[s.problem, { color: C.text }]}>{problem}</Text>

      <Animated.View style={[s.inputRow, shakeStyle]}>
        <TextInput
          style={[
            s.input,
            { backgroundColor: C.card, borderColor: C.border, color: C.text },
            isCorrect && { borderColor: C.green, backgroundColor: C.green + '18' },
            isWrong && { borderColor: C.red, backgroundColor: C.red + '12' },
          ]}
          value={value}
          onChangeText={(t) => { setValue(t); setChecked(false); }}
          placeholder="Введи відповідь..."
          placeholderTextColor={C.textMuted}
          editable={!isCorrect}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleCheck}
        />

        {isCorrect ? (
          <View style={[s.resultBadge, { backgroundColor: C.green + '33' }]}>
            <Text style={[s.resultCorrect, { color: C.green }]}>✓</Text>
          </View>
        ) : (
          <Pressable
            style={[s.checkBtn, { backgroundColor: C.accent }, !value.trim() && s.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!value.trim()}
          >
            <Text style={s.checkBtnText}>Перевірити</Text>
          </Pressable>
        )}
      </Animated.View>

      {isCorrect && (
        <Animated.View entering={FadeIn.duration(300)} style={[s.feedbackCorrect, { borderColor: C.green + '44' }]}>
          <Text style={[s.feedbackText, { color: C.text }]}>🎉 Правильно! Відповідь: {answer}</Text>
        </Animated.View>
      )}

      {isWrong && (
        <Animated.View entering={FadeIn.duration(300)} style={[s.feedbackWrong, { borderColor: C.red + '44' }]}>
          <Text style={[s.feedbackText, { color: C.text }]}>❌ Не зовсім. Спробуй ще раз!</Text>
          <View style={s.feedbackActions}>
            <Pressable onPress={handleRetry} style={[s.retryBtn, { backgroundColor: C.border }]}>
              <Text style={[s.retryText, { color: C.text }]}>Ще раз</Text>
            </Pressable>
            <Pressable onPress={() => setShowHint(true)} style={[s.hintBtn, { backgroundColor: C.accentSoft }]}>
              <Text style={[s.hintBtnText, { color: C.accent }]}>💡 Підказка</Text>
            </Pressable>
          </View>
          {showHint && (
            <Animated.Text entering={FadeIn} style={[s.hintText, { color: C.textMuted }]}>
              {hint}
            </Animated.Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: RADIUS.lg, borderWidth: 1, marginTop: SPACING.lg, overflow: 'hidden' },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 4 },
  label: { fontFamily: FONTS.bold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  problem: { fontFamily: FONTS.bold, fontSize: 15, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, lineHeight: 22 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  checkBtn: { borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 10 },
  checkBtnDisabled: { opacity: 0.4 },
  checkBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: '#fff' },
  resultBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  resultCorrect: { fontSize: 20 },
  feedbackCorrect: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
  },
  feedbackWrong: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
  },
  feedbackText: { fontFamily: FONTS.bold, fontSize: 13, lineHeight: 20 },
  feedbackActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.sm },
  retryText: { fontFamily: FONTS.bold, fontSize: 13 },
  hintBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.sm },
  hintBtnText: { fontFamily: FONTS.bold, fontSize: 13 },
  hintText: { marginTop: 8, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
});
