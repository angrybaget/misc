import React from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';

export interface PlaygroundModalProps {
  visible: boolean;
  onClose: () => void;
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  running: boolean;
  output: string;
  isError: boolean;
  accentColor: string;
}

const IS_WEB = Platform.OS === 'web';
const CODE_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function PlaygroundModal({
  visible, onClose, code, onCodeChange, onRun, running, output, isError, accentColor,
}: PlaygroundModalProps) {
  const insets = useSafeAreaInsets();
  const C = useColors();

  const editorAndRun = (
    <View style={s.editorSection}>
      <Text style={[s.colLabel, { color: C.textMuted }]}>КОД</Text>
      <TextInput
        style={[s.editor, { color: C.codeText, backgroundColor: C.codeBg }]}
        value={code}
        onChangeText={onCodeChange}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder="# Напиши свій код тут..."
        placeholderTextColor={C.textMuted}
        textAlignVertical="top"
      />
      <Pressable
        style={[s.runBtn, { backgroundColor: running ? '#333' : accentColor }]}
        onPress={onRun}
        disabled={running}
      >
        {running
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={s.runTxt}>▶ Запустити</Text>}
      </Pressable>
    </View>
  );

  const outputPane = (
    <View style={[s.outputSection, { backgroundColor: C.card }, isError && s.outputSectionErr]}>
      <Text style={[s.colLabel, { color: isError ? C.red : C.textMuted }]}>
        {isError ? '✗ ПОМИЛКА' : '✓ ВИВІД'}
      </Text>
      <ScrollView style={s.outputScroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.outputTxt, { color: isError ? C.red : C.green }]}>
          {output || 'Натисни ▶ Запустити…'}
        </Text>
      </ScrollView>
    </View>
  );

  const divider = (
    <View style={[
      IS_WEB ? s.vDivider : s.hDivider,
      { borderColor: isError ? C.red + '66' : C.border },
    ]} />
  );

  const header = (
    <View style={[s.header, { backgroundColor: C.card, borderBottomColor: C.border }]}>
      <Text style={[s.title, { color: C.text }]}>🐍 Python Майданчик</Text>
      <Pressable style={[s.closeBtn, { backgroundColor: C.border }]} onPress={onClose} hitSlop={12}>
        <Text style={[s.closeTxt, { color: C.textMuted }]}>✕ Закрити</Text>
      </Pressable>
    </View>
  );

  const body = (
    <View style={[s.body, IS_WEB && s.bodyRow]}>
      {editorAndRun}
      {divider}
      {outputPane}
    </View>
  );

  if (IS_WEB) {
    return (
      <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent>
        <View style={s.backdrop}>
          <View style={[s.sheet, { backgroundColor: C.bg, borderColor: C.border }]}>
            {header}
            {body}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={[s.root, { backgroundColor: C.bg }]} behavior="padding">
        <View style={[s.root, { backgroundColor: C.bg, paddingTop: Math.max(insets.top, 16) }]}>
          {header}
          {body}
          <View style={{ height: Math.max(insets.bottom, 8) }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 960,
    height: '85%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontFamily: FONTS.bold, fontSize: 16 },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
  closeTxt: { fontFamily: FONTS.bold, fontSize: 13 },
  body: { flex: 1, flexDirection: 'column' },
  bodyRow: { flexDirection: 'row' },
  editorSection: { flex: 6 },
  colLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 4,
  },
  editor: {
    flex: 1,
    fontFamily: CODE_FONT,
    fontSize: 14,
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    lineHeight: 22,
  },
  runBtn: {
    marginHorizontal: SPACING.md,
    marginVertical: 10,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runTxt: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
  vDivider: { width: 1, borderLeftWidth: 1 },
  hDivider: { height: 1, borderTopWidth: 1, marginHorizontal: SPACING.md },
  outputSection: { flex: 4 },
  outputSectionErr: { backgroundColor: 'rgba(239,68,68,0.06)' },
  outputScroll: { flex: 1 },
  outputTxt: { fontFamily: CODE_FONT, fontSize: 13, padding: SPACING.md, lineHeight: 21 },
});
