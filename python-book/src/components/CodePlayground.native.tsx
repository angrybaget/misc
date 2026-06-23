import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';
import { PlaygroundModal } from './PlaygroundModal';

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

const CODE_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  initialCode: string;
  accentColor: string;
}

export function CodePlayground({ initialCode, accentColor }: Props) {
  const C = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [running, setRunning] = useState(false);
  const webviewRef = useRef<InstanceType<typeof WebView>>(null);

  const preview = initialCode.split('\n').slice(0, 3).join('\n');

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; text: string };
      setRunning(false);
      if (msg.type === 'success') {
        setIsError(false);
        setOutput(msg.text.trim() || '(немає виводу)');
      } else {
        setIsError(true);
        setOutput(msg.text);
      }
    } catch {}
  }, []);

  const handleRun = useCallback(() => {
    if (running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRunning(true);
    setOutput('');
    setIsError(false);
    webviewRef.current?.injectJavaScript(
      `handleMsg({data: ${JSON.stringify(JSON.stringify({ type: 'run', code }))}})`,
    );
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

      {/* Hidden WebView — Python execution engine */}
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
  previewCode: { fontFamily: CODE_FONT, fontSize: 13, lineHeight: 22 },
  previewMore: { fontFamily: CODE_FONT, fontSize: 13, marginTop: 2 },
  openBtn: { margin: SPACING.md, borderRadius: RADIUS.md, paddingVertical: 13, alignItems: 'center' },
  openBtnTxt: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
});
