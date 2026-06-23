import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput, Image,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useColors } from '../hooks/useColors';
import { TeacherNote, Block } from '../data/types';
import { useLessonEditsStore } from '../store/lessonEdits';
import { FONTS, RADIUS, SPACING } from '../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPT_LABELS = ['A', 'B', 'C', 'D'];

function blockIcon(block: Block): string {
  switch (block.type) {
    case 'h3': return '📌';
    case 'p': return '📝';
    case 'code': return '💻';
    case 'tip': return '💡';
    case 'note': return '🔵';
    case 'warning': return '⚠️';
    case 'list': return '📋';
    case 'table': return '📊';
    case 'quiz': return '❓';
    case 'quiz-multi': return '☑️';
    case 'fill': return '✏️';
    case 'image': return '🖼️';
    default: return '🔷';
  }
}

function blockSummary(block: Block): string {
  switch (block.type) {
    case 'h3':
    case 'p':
    case 'tip':
    case 'note':
    case 'warning': return block.text.slice(0, 45);
    case 'code': return block.text.slice(0, 30) + '…';
    case 'list': return `${block.items.length} пунктів`;
    case 'table': return `${block.headers.length} стовп. × ${block.rows.length} рядків`;
    case 'quiz':
    case 'quiz-multi': return block.question.slice(0, 45);
    case 'fill': return block.problem.slice(0, 45);
    case 'image': return (block.caption || block.uri).slice(0, 45);
    default: return '';
  }
}

function animateLayout() {
  LayoutAnimation.configureNext({
    duration: 240,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const C = useColors();
  return (
    <View style={[sec.wrap, { borderTopColor: C.border }]}>
      <Text style={[sec.label, { color: C.accent }]}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Image panel ──────────────────────────────────────────────────────────────

function ImagePanel({ onAdd, onCancel }: {
  onAdd: (block: Block) => void;
  onCancel: () => void;
}) {
  const C = useColors();
  const [uri, setUri] = useState('');
  const [caption, setCaption] = useState('');
  const [imgError, setImgError] = useState(false);

  const trimUri = uri.trim();
  const hasUri = trimUri.length > 10;

  function handleUriChange(t: string) {
    setUri(t);
    setImgError(false);
  }

  function handleAdd() {
    if (!hasUri || imgError) return;
    onAdd({ type: 'image', uri: trimUri, caption: caption.trim() });
  }

  return (
    <View style={[pn.wrap, { backgroundColor: C.card, borderColor: C.border }]}>
      <Text style={[pn.title, { color: C.accent }]}>🖼️ Додати зображення</Text>

      <Text style={[pn.fieldLabel, { color: C.textMuted }]}>URL зображення</Text>
      <TextInput
        style={[pn.input, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
        value={uri}
        onChangeText={handleUriChange}
        placeholder="https://upload.wikimedia.org/…"
        placeholderTextColor={C.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      {hasUri && (
        <View style={[pn.previewWrap, { borderColor: C.border }]}>
          {imgError ? (
            <Text style={[pn.previewError, { color: C.red }]}>⚠️ Зображення не завантажилось — перевір URL</Text>
          ) : (
            <Image
              source={{ uri: trimUri }}
              style={pn.preview}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          )}
        </View>
      )}

      <Text style={[pn.fieldLabel, { color: C.textMuted }]}>Підпис (необов'язково)</Text>
      <TextInput
        style={[pn.input, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
        value={caption}
        onChangeText={setCaption}
        placeholder="Коротке пояснення до зображення…"
        placeholderTextColor={C.textMuted}
      />

      <View style={pn.actions}>
        <Pressable style={[pn.btn, pn.btnCancel, { borderColor: C.border }]} onPress={onCancel}>
          <Text style={[pn.btnTxt, { color: C.textMuted }]}>Скасувати</Text>
        </Pressable>
        <Pressable
          style={[pn.btn, pn.btnConfirm, { backgroundColor: hasUri && !imgError ? C.accent : C.border }]}
          onPress={handleAdd}
        >
          <Text style={[pn.btnTxt, { color: '#fff' }]}>✓ Додати</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Quiz constructor panel ───────────────────────────────────────────────────

function QuizPanel({ onAdd, onCancel }: {
  onAdd: (block: Block) => void;
  onCancel: () => void;
}) {
  const C = useColors();
  const [question, setQuestion] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [multiMode, setMultiMode] = useState(false);
  const [singleCorrect, setSingleCorrect] = useState<number | null>(null);
  const [multiCorrect, setMultiCorrect] = useState([false, false, false, false]);
  const [explanation, setExplanation] = useState('');

  function updateOpt(i: number, val: string) {
    setOpts((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  }

  function toggleMultiCorrect(i: number) {
    setMultiCorrect((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const canSave =
    question.trim().length > 0 &&
    opts.every((o) => o.trim().length > 0) &&
    (multiMode ? multiCorrect.some(Boolean) : singleCorrect !== null);

  function save() {
    if (!canSave) return;
    if (multiMode) {
      const correct = multiCorrect.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
      onAdd({
        type: 'quiz-multi',
        question: question.trim(),
        options: opts.map((o) => o.trim()),
        correct,
        explanation: explanation.trim(),
      });
    } else {
      onAdd({
        type: 'quiz',
        question: question.trim(),
        options: opts.map((o) => o.trim()),
        correct: singleCorrect!,
        explanation: explanation.trim(),
      });
    }
  }

  return (
    <View style={[pn.wrap, { backgroundColor: C.card, borderColor: C.border }]}>
      <Text style={[pn.title, { color: C.accent }]}>❓ Конструктор тесту</Text>

      <Text style={[pn.fieldLabel, { color: C.textMuted }]}>Запитання</Text>
      <TextInput
        style={[pn.input, pn.inputTall, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
        value={question}
        onChangeText={setQuestion}
        placeholder="Введіть запитання…"
        placeholderTextColor={C.textMuted}
        multiline
      />

      {/* Mode toggle */}
      <Text style={[pn.fieldLabel, { color: C.textMuted }]}>Тип відповіді</Text>
      <View style={pn.modeRow}>
        <Pressable
          style={[pn.modeBtn, !multiMode && { backgroundColor: C.accentSoft, borderColor: C.accent }]}
          onPress={() => { setMultiMode(false); setMultiCorrect([false, false, false, false]); }}
        >
          <Text style={[pn.modeTxt, { color: multiMode ? C.textMuted : C.accent }]}>● Одна правильна</Text>
        </Pressable>
        <Pressable
          style={[pn.modeBtn, multiMode && { backgroundColor: C.accentSoft, borderColor: C.accent }]}
          onPress={() => { setMultiMode(true); setSingleCorrect(null); }}
        >
          <Text style={[pn.modeTxt, { color: !multiMode ? C.textMuted : C.accent }]}>☑ Декілька правильних</Text>
        </Pressable>
      </View>

      {/* Options */}
      <Text style={[pn.fieldLabel, { color: C.textMuted }]}>Варіанти відповідей</Text>
      {opts.map((opt, i) => {
        const isMarked = multiMode ? multiCorrect[i] : singleCorrect === i;
        return (
          <View key={i} style={pn.optRow}>
            <View style={[pn.optBadge, { backgroundColor: isMarked ? C.accent : C.accentSoft }]}>
              <Text style={[pn.optBadgeTxt, { color: isMarked ? '#fff' : C.accent }]}>
                {OPT_LABELS[i]}
              </Text>
            </View>
            <TextInput
              style={[pn.optInput, { color: C.text, borderColor: isMarked ? C.accent : C.border, backgroundColor: C.surface }]}
              value={opt}
              onChangeText={(t) => updateOpt(i, t)}
              placeholder={`Варіант ${OPT_LABELS[i]}…`}
              placeholderTextColor={C.textMuted}
            />
            <Pressable
              style={[
                pn.correctToggle,
                {
                  borderColor: isMarked ? C.accent : C.border,
                  backgroundColor: isMarked ? C.accent : 'transparent',
                  borderRadius: multiMode ? 4 : 12,
                },
              ]}
              onPress={() => {
                if (multiMode) toggleMultiCorrect(i);
                else setSingleCorrect(i);
              }}
            >
              <Text style={{ color: isMarked ? '#fff' : C.textMuted, fontSize: 13 }}>
                {isMarked ? '✓' : ''}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Text style={[pn.fieldLabel, { color: C.textMuted }]}>Пояснення (після відповіді)</Text>
      <TextInput
        style={[pn.input, pn.inputTall, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
        value={explanation}
        onChangeText={setExplanation}
        placeholder="Чому ця відповідь правильна?…"
        placeholderTextColor={C.textMuted}
        multiline
      />

      <View style={pn.actions}>
        <Pressable style={[pn.btn, pn.btnCancel, { borderColor: C.border }]} onPress={onCancel}>
          <Text style={[pn.btnTxt, { color: C.textMuted }]}>Скасувати</Text>
        </Pressable>
        <Pressable
          style={[pn.btn, pn.btnConfirm, { backgroundColor: canSave ? C.accent : C.border }]}
          onPress={save}
        >
          <Text style={[pn.btnTxt, { color: '#fff' }]}>✓ Зберегти тест</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  teacher: TeacherNote;
  lessonKey: string;
  originalBlocks: Block[];
}

export function TeacherAccordion({ teacher, lessonKey, originalBlocks }: Props) {
  const C = useColors();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<'none' | 'image' | 'quiz'>('none');
  const rot = useSharedValue(0);

  const store = useLessonEditsStore();
  const blocks = store.getBlocks(lessonKey, originalBlocks);
  const modified = store.hasOverride(lessonKey);

  function toggle() {
    animateLayout();
    const next = !open;
    setOpen(next);
    if (!next) setPanel('none');
    rot.value = withTiming(next ? 1 : 0, { duration: 240 });
  }

  function openPanel(p: 'image' | 'quiz') {
    animateLayout();
    setPanel(p);
  }

  function closePanel() {
    animateLayout();
    setPanel('none');
  }

  function handleAddBlock(block: Block) {
    animateLayout();
    store.addBlock(lessonKey, block, originalBlocks);
    setPanel('none');
  }

  function handleRemoveBlock(index: number) {
    animateLayout();
    store.removeBlock(lessonKey, index, originalBlocks);
  }

  function handleReset() {
    animateLayout();
    store.reset(lessonKey);
    setPanel('none');
  }

  const arrowAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 180}deg` }],
  }));

  return (
    <View style={[s.wrap, { borderColor: C.border, backgroundColor: C.surface }]}>
      {/* ── Header ── */}
      <Pressable
        style={[s.header, open && { borderBottomColor: C.border, borderBottomWidth: 1 }]}
        onPress={toggle}
        accessibilityRole="button"
      >
        <View style={[s.pill, { backgroundColor: C.accentSoft }]}>
          <Text style={s.pillIcon}>👩‍🏫</Text>
          <Text style={[s.pillText, { color: C.accent }]}>Для вчителя</Text>
        </View>
        {modified && (
          <View style={[s.badge, { backgroundColor: C.accent }]}>
            <Text style={s.badgeText}>змінено</Text>
          </View>
        )}
        <Text style={[s.meta, { color: C.textMuted }]}>зміст · знання · план · редагування</Text>
        <Animated.Text style={[s.arrow, { color: C.textMuted }, arrowAnim]}>▾</Animated.Text>
      </Pressable>

      {open && (
        <View>
          {/* ── 1. Summary ── */}
          <Section label="📋 Зміст уроку">
            <Text style={[s.summaryText, { color: C.text }]}>{teacher.summary}</Text>
          </Section>

          {/* ── 2. Must-Know ── */}
          <Section label="⭐ Кожен учень має знати">
            {teacher.mustKnow.map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={[s.bullet, { color: C.accent }]}>•</Text>
                <Text style={[s.bulletText, { color: C.text }]}>{item}</Text>
              </View>
            ))}
          </Section>

          {/* ── 3. Lesson Plan ── */}
          <Section label="🗓️ Хід уроку">
            {teacher.lessonPlan.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={[s.stepNum, { backgroundColor: C.accentSoft, borderColor: C.accent + '55' }]}>
                  <Text style={[s.stepNumTxt, { color: C.accent }]}>{i + 1}</Text>
                </View>
                <Text style={[s.stepText, { color: C.text }]}>{step}</Text>
              </View>
            ))}
          </Section>

          {/* ── 4. Edit ── */}
          <Section label="✏️ Редагування уроку">
            {/* Block list */}
            {blocks.map((block, i) => (
              <View key={i} style={[s.blockRow, { borderColor: C.border }]}>
                <Text style={s.blockIcon}>{blockIcon(block)}</Text>
                <Text style={[s.blockSummary, { color: C.text }]} numberOfLines={1}>
                  {blockSummary(block)}
                </Text>
                <Pressable
                  hitSlop={10}
                  style={[s.deleteBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
                  onPress={() => handleRemoveBlock(i)}
                >
                  <Text style={[s.deleteTxt, { color: C.red }]}>🗑</Text>
                </Pressable>
              </View>
            ))}

            {/* Add buttons — hidden when a panel is open */}
            {panel === 'none' && (
              <View style={s.addRow}>
                <Pressable
                  style={[s.addBtn, { backgroundColor: C.accentSoft, borderColor: C.accent + '44' }]}
                  onPress={() => openPanel('image')}
                >
                  <Text style={[s.addBtnTxt, { color: C.accent }]}>🖼️  Зображення</Text>
                </Pressable>
                <Pressable
                  style={[s.addBtn, { backgroundColor: C.accentSoft, borderColor: C.accent + '44' }]}
                  onPress={() => openPanel('quiz')}
                >
                  <Text style={[s.addBtnTxt, { color: C.accent }]}>❓  Тест</Text>
                </Pressable>
              </View>
            )}

            {/* Inline panels */}
            {panel === 'image' && (
              <ImagePanel onAdd={handleAddBlock} onCancel={closePanel} />
            )}
            {panel === 'quiz' && (
              <QuizPanel onAdd={handleAddBlock} onCancel={closePanel} />
            )}

            {/* Reset — only when modified and no panel is open */}
            {modified && panel === 'none' && (
              <Pressable
                style={[s.resetBtn, { borderColor: C.red + '55' }]}
                onPress={handleReset}
              >
                <Text style={[s.resetTxt, { color: C.red }]}>↩ Скинути зміни</Text>
              </Pressable>
            )}
          </Section>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sec = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
});

const pn = StyleSheet.create({
  wrap: { borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.md, marginTop: SPACING.sm },
  title: { fontFamily: FONTS.bold, fontSize: 14, marginBottom: SPACING.sm },
  fieldLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  inputTall: { height: 72, textAlignVertical: 'top' },
  previewWrap: { borderWidth: 1, borderRadius: RADIUS.sm, overflow: 'hidden', marginTop: SPACING.sm },
  preview: { width: '100%', height: 150 },
  previewError: { fontFamily: FONTS.regular, fontSize: 12, padding: SPACING.md, textAlign: 'center' },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeTxt: { fontFamily: FONTS.bold, fontSize: 12 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  optBadge: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  optBadgeTxt: { fontFamily: FONTS.bold, fontSize: 13 },
  optInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  correctToggle: {
    width: 30,
    height: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: SPACING.md },
  btn: { flex: 1, borderRadius: RADIUS.md, paddingVertical: 11, alignItems: 'center' },
  btnCancel: { borderWidth: 1 },
  btnConfirm: {},
  btnTxt: { fontFamily: FONTS.bold, fontSize: 13 },
});

const s = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  pillIcon: { fontSize: 14 },
  pillText: { fontFamily: FONTS.bold, fontSize: 13 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.sm },
  badgeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },
  meta: { flex: 1, fontFamily: FONTS.regular, fontSize: 10, letterSpacing: 0.2 },
  arrow: { fontFamily: FONTS.bold, fontSize: 16 },
  // teacher notes
  summaryText: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 16, lineHeight: 22 },
  bulletText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumTxt: { fontFamily: FONTS.bold, fontSize: 12 },
  stepText: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22 },
  // block list
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  blockIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  blockSummary: { flex: 1, fontFamily: FONTS.regular, fontSize: 12 },
  deleteBtn: { width: 30, height: 30, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  deleteTxt: { fontSize: 14 },
  // add buttons
  addRow: { flexDirection: 'row', gap: 8, marginTop: SPACING.sm },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 9,
  },
  addBtnTxt: { fontFamily: FONTS.bold, fontSize: 13 },
  // reset
  resetBtn: { marginTop: SPACING.sm, borderWidth: 1, borderRadius: RADIUS.md, paddingVertical: 10, alignItems: 'center' },
  resetTxt: { fontFamily: FONTS.bold, fontSize: 13 },
});
