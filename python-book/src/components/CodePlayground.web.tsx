import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

declare global {
  interface Window {
    Sk: any;
  }
}

// Skulpt CDN loading — singleton promise so we only load once
let skulptReady: Promise<void> | null = null;

function loadSkulpt(): Promise<void> {
  if (skulptReady) return skulptReady;
  skulptReady = new Promise<void>((resolve, reject) => {
    function loadScript(src: string): Promise<void> {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'))
      .then(resolve)
      .catch(reject);
  });
  return skulptReady;
}

async function runPython(code: string): Promise<{ ok: boolean; output: string }> {
  await loadSkulpt();
  const Sk = window.Sk;
  let buf = '';

  Sk.configure({
    output: (t: string) => { buf += t; },
    read: (x: string) => {
      if (!Sk.builtinFiles?.files[x]) throw `File not found: '${x}'`;
      return Sk.builtinFiles.files[x];
    },
    inputfun: (prompt: string): string => window.prompt(prompt) ?? '',
    inputfunTakesPrompt: true,
    __future__: Sk.python3,
  });

  try {
    await Sk.misceval.asyncToPromise(() =>
      Sk.importMainWithBody('<stdin>', false, code, true),
    );
    return { ok: true, output: buf };
  } catch (e: any) {
    return { ok: false, output: String(e) };
  }
}

interface Props {
  initialCode: string;
  accentColor: string;
}

export function CodePlayground({ initialCode, accentColor }: Props) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [isError, setIsError] = useState(false);

  const scale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setOutput('');
    setIsError(false);
    scale.value = withSequence(withSpring(0.92), withSpring(1));

    const result = await runPython(code);
    setRunning(false);
    setIsError(!result.ok);
    setOutput(result.output.trim() || (result.ok ? '(немає виводу)' : ''));
  }, [code, running]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.headerText}>▶ Редактор Python</Text>
      </View>

      <TextInput
        style={styles.editor}
        multiline
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder="# Напиши свій код тут..."
        placeholderTextColor={COLORS.textMuted}
      />

      <Animated.View style={btnStyle}>
        <Pressable
          style={[styles.runBtn, { backgroundColor: accentColor }]}
          onPress={handleRun}
          disabled={running}
        >
          {running
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.runText}>▶ Запустити</Text>}
        </Pressable>
      </Animated.View>

      {output !== '' && (
        <View style={[styles.outputWrap, isError && styles.outputError]}>
          <Text style={styles.outputLabel}>{isError ? '✗ Помилка' : '✓ Вивід'}</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            <Text style={[styles.outputText, isError && styles.outputTextError]}>
              {output}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xl,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  editor: {
    minHeight: 140,
    padding: SPACING.md,
    fontFamily: 'monospace',
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  runBtn: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  runText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
  },
  outputWrap: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  outputError: {
    borderColor: COLORS.red + '88',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  outputLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  outputTextError: {
    color: COLORS.red,
  },
});
