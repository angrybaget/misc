import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, Pressable, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

const SKULPT_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>
<script>
var buf = '';
function outf(t){ buf += t; }
function builtinRead(x){
  if(Sk.builtinFiles===undefined||Sk.builtinFiles['files'][x]===undefined)
    throw "File not found: '"+x+"'";
  return Sk.builtinFiles['files'][x];
}
function run(code){
  buf = '';
  Sk.configure({
    output: outf,
    read: builtinRead,
    inputfun: function(p){ return window.prompt(p)||''; },
    inputfunTakesPrompt: true,
    __future__: Sk.python3
  });
  Sk.misceval.asyncToPromise(function(){
    return Sk.importMainWithBody('<stdin>',false,code,true);
  }).then(function(){
    post('success', buf);
  }).catch(function(e){
    post('error', e.toString());
  });
}
function post(type, text){
  var msg = JSON.stringify({type:type, text:text});
  if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
  else window.parent.postMessage(msg,'*');
}
function handleMsg(e){
  try{ var d=JSON.parse(e.data); if(d.type==='run') run(d.code); }catch(err){}
}
document.addEventListener('message', handleMsg);
window.addEventListener('message', handleMsg);
</script>
</head><body style="background:transparent"></body></html>`;

interface Props {
  initialCode: string;
  accentColor: string;
}

export function CodePlayground({ initialCode, accentColor }: Props) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState(false);
  const [running, setRunning] = useState(false);
  const webviewRef = useRef<InstanceType<typeof WebView>>(null);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; text: string };
      setRunning(false);
      if (msg.type === 'success') {
        setError(false);
        setOutput(msg.text.trim() || '(немає виводу)');
      } else {
        setError(true);
        setOutput(msg.text);
      }
    } catch {}
  }, []);

  function runCode() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    btnScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 12 }),
    );
    setRunning(true);
    setOutput('');
    setError(false);
    webviewRef.current?.injectJavaScript(
      `handleMsg({data: ${JSON.stringify(JSON.stringify({ type: 'run', code }))}})`,
    );
  }

  function resetCode() {
    setCode(initialCode);
    setOutput('');
    setError(false);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.headerTitle}>Python Майданчик</Text>
        <Pressable onPress={resetCode} style={styles.resetBtn}>
          <Text style={styles.resetText}>Скинути</Text>
        </Pressable>
      </View>

      {/* Editor */}
      <TextInput
        style={styles.editor}
        value={code}
        onChangeText={setCode}
        multiline
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        placeholderTextColor="#444"
      />

      {/* Run button */}
      <Animated.View style={[styles.runWrap, btnStyle]}>
        <Pressable
          style={[styles.runBtn, { backgroundColor: running ? '#444' : accentColor }]}
          onPress={runCode}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.runText}>▶ Запустити</Text>
          )}
        </Pressable>
      </Animated.View>

      {/* Output */}
      <View style={styles.outputWrap}>
        <Text style={styles.outputLabel}>Результат</Text>
        <ScrollView style={styles.outputScroll} nestedScrollEnabled>
          <Text style={[styles.outputText, error && styles.outputError]}>
            {output || 'Натисни Запустити, щоб побачити результат…'}
          </Text>
        </ScrollView>
      </View>

      {/* Hidden WebView for Python execution */}
      <View style={{ height: 0, overflow: 'hidden' }}>
        <WebView
          ref={webviewRef}
          source={{ html: SKULPT_HTML }}
          onMessage={onMessage}
          javaScriptEnabled
          originWhitelist={['*']}
          style={{ width: 1, height: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
    backgroundColor: '#0d0b1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#13113a',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resetText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  editor: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#c8d3f5',
    padding: SPACING.md,
    minHeight: 140,
    lineHeight: 22,
    textAlignVertical: 'top',
    backgroundColor: '#0a0818',
  },
  runWrap: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  runBtn: {
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
  },
  outputWrap: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  outputLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#4a4880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  outputScroll: {
    maxHeight: 120,
  },
  outputText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#a3e635',
    padding: SPACING.md,
    lineHeight: 21,
  },
  outputError: {
    color: '#f87171',
  },
});
