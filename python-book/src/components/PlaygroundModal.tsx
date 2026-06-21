import React from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

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

  const editorAndRun = (
    <View style={styles.editorSection}>
      <Text style={styles.colLabel}>КОД</Text>
      <TextInput
        style={styles.editor}
        value={code}
        onChangeText={onCodeChange}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder="# Напиши свій код тут..."
        placeholderTextColor={COLORS.textMuted}
        textAlignVertical="top"
      />
      <Pressable
        style={[styles.runBtn, { backgroundColor: running ? '#333' : accentColor }]}
        onPress={onRun}
        disabled={running}
      >
        {running
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.runTxt}>▶ Запустити</Text>}
      </Pressable>
    </View>
  );

  const outputPane = (
    <View style={[styles.outputSection, isError && styles.outputSectionErr]}>
      <Text style={[styles.colLabel, isError && { color: COLORS.red }]}>
        {isError ? '✗ ПОМИЛКА' : '✓ ВИВІД'}
      </Text>
      <ScrollView style={styles.outputScroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.outputTxt, isError && styles.outputTxtErr]}>
          {output || 'Натисни ▶ Запустити…'}
        </Text>
      </ScrollView>
    </View>
  );

  const divider = (
    <View style={[
      IS_WEB ? styles.vDivider : styles.hDivider,
      { borderColor: isError ? COLORS.red + '66' : COLORS.border },
    ]} />
  );

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>🐍 Python Майданчик</Text>
      <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
        <Text style={styles.closeTxt}>✕ Закрити</Text>
      </Pressable>
    </View>
  );

  const body = (
    <View style={[styles.body, IS_WEB && styles.bodyRow]}>
      {editorAndRun}
      {divider}
      {outputPane}
    </View>
  );

  if (IS_WEB) {
    return (
      <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            {body}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior="padding">
        <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
          {header}
          {body}
          <View style={{ height: Math.max(insets.bottom, 8) }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  // Web only — backdrop + centered dialog
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
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeTxt: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  bodyRow: {
    flexDirection: 'row',
  },
  // Editor column — 60%
  editorSection: {
    flex: 6,
  },
  colLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 4,
  },
  editor: {
    flex: 1,
    fontFamily: CODE_FONT,
    fontSize: 14,
    color: '#c8d3f5',
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    lineHeight: 22,
    backgroundColor: '#0a0818',
  },
  runBtn: {
    marginHorizontal: SPACING.md,
    marginVertical: 10,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runTxt: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
  },
  // Dividers
  vDivider: {
    width: 1,
    borderLeftWidth: 1,
  },
  hDivider: {
    height: 1,
    borderTopWidth: 1,
    marginHorizontal: SPACING.md,
  },
  // Output column — 40%
  outputSection: {
    flex: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  outputSectionErr: {
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  outputScroll: {
    flex: 1,
  },
  outputTxt: {
    fontFamily: CODE_FONT,
    fontSize: 13,
    color: '#a3e635',
    padding: SPACING.md,
    lineHeight: 21,
  },
  outputTxtErr: {
    color: COLORS.red,
  },
});
