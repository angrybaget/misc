import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';
import { PlaygroundModal } from './PlaygroundModal';

declare global {
  interface Window { Sk: any; }
}

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
  const C = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [isError, setIsError] = useState(false);

  const preview = initialCode.split('\n').slice(0, 3).join('\n');

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setOutput('');
    setIsError(false);
    const result = await runPython(code);
    setRunning(false);
    setIsError(!result.ok);
    setOutput(result.output.trim() || (result.ok ? '(немає виводу)' : ''));
  }, [code, running]);

  return (
    <>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={[s.cardHeader, { backgroundColor: C.card, borderBottomColor: C.border }]}>
          <View style={[s.dot, { backgroundColor: accentColor }]} />
          <Text style={[s.cardTitle, { color: C.textMuted }]}>Python Майданчик</Text>
        </View>

        <View style={[s.previewWrap, { backgroundColor: C.codeBg }]}>
          <Text style={[s.previewCode, { color: C.codeText, opacity: 0.55 }]} numberOfLines={3}>{preview}</Text>
          {initialCode.split('\n').length > 3 && (
            <Text style={[s.previewMore, { color: C.textMuted }]}>…</Text>
          )}
        </View>

        <Pressable
          style={[s.openBtn, { backgroundColor: accentColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={s.openBtnTxt}>▶ Відкрити редактор</Text>
        </Pressable>
      </View>

      <PlaygroundModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        code={code}
        onCodeChange={setCode}
        onRun={handleRun}
        running={running}
        output={output}
        isError={isError}
        accentColor={accentColor}
      />
    </>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, borderWidth: 1, marginTop: SPACING.xl, overflow: 'hidden' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 13 },
  previewWrap: { padding: SPACING.md, minHeight: 72 },
  previewCode: { fontFamily: 'monospace', fontSize: 13, lineHeight: 22 },
  previewMore: { fontFamily: 'monospace', fontSize: 13, marginTop: 2 },
  openBtn: { margin: SPACING.md, borderRadius: RADIUS.md, paddingVertical: 13, alignItems: 'center' },
  openBtnTxt: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
});
