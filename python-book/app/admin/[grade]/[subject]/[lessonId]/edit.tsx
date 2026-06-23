import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, Alert, ActivityIndicator, Image, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchLesson, saveLesson } from '../../../../../src/lib/db';
import { uploadLessonImage } from '../../../../../src/lib/storage';
import { useColors } from '../../../../../src/hooks/useColors';
import { GradeId, SubjectId, Block, Lesson } from '../../../../../src/data/types';
import { FONTS, RADIUS, SPACING } from '../../../../../src/theme';

const BLOCK_TYPES: Block['type'][] = [
  'h3', 'p', 'code', 'tip', 'note', 'warning', 'list', 'table', 'quiz', 'fill', 'image',
];

const BLOCK_LABELS: Record<Block['type'], string> = {
  h3: 'Заголовок', p: 'Абзац', code: 'Код', tip: 'Порада', note: 'Нотатка',
  warning: 'Попередження', list: 'Список', table: 'Таблиця',
  quiz: 'Тест', 'quiz-multi': 'Тест (мульти)', fill: 'Заповни', image: 'Зображення',
};

function defaultBlock(type: Block['type']): Block {
  switch (type) {
    case 'h3': case 'p': case 'code': case 'tip': case 'note': case 'warning':
      return { type, text: '' } as Block;
    case 'list': return { type: 'list', items: [''] };
    case 'table': return { type: 'table', headers: [''], rows: [['']] };
    case 'quiz': return { type: 'quiz', question: '', options: ['', '', '', ''], correct: 0, explanation: '' };
    case 'fill': return { type: 'fill', problem: '', hint: '', answer: '' };
    case 'image': return { type: 'image', uri: '', caption: '' };
    default: return { type: 'p', text: '' };
  }
}

// ── Image block editor ────────────────────────────────────────────────────────

type ImageBlock = Extract<Block, { type: 'image' }>;

function ImageBlockEditor({
  block, onChange, gradeId, subjectId, lessonId,
}: {
  block: ImageBlock;
  onChange: (b: Block) => void;
  gradeId: GradeId;
  subjectId: SubjectId;
  lessonId: number | string;
}) {
  const C = useColors();
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pickFile = () => {
    if (Platform.OS !== 'web') return;
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleUpload(file);
      };
      fileInputRef.current = input;
    }
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleUpload = (file: File) => {
    setUploading(true);
    setPercent(0);
    uploadLessonImage(file, gradeId, subjectId, lessonId, (p) => {
      if (p.state === 'running') {
        setPercent(p.percent);
      } else if (p.state === 'done') {
        onChange({ ...block, uri: p.url });
        setUploading(false);
      } else {
        Alert.alert('Помилка завантаження', p.message);
        setUploading(false);
      }
    });
  };

  const inp = [s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }] as const;

  return (
    <View style={{ gap: 10 }}>
      {/* Preview */}
      {block.uri ? (
        <View style={[s.imgPreviewWrap, { borderColor: C.border }]}>
          <Image
            source={{ uri: block.uri }}
            style={s.imgPreview}
            resizeMode="contain"
          />
          <Pressable
            style={[s.imgRemoveBtn, { backgroundColor: C.surface }]}
            onPress={() => onChange({ ...block, uri: '' })}
          >
            <Text style={{ color: '#e53e3e', fontFamily: FONTS.bold, fontSize: 13 }}>✕ Видалити</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[s.imgUploadArea, { borderColor: C.border, backgroundColor: C.surface }]}
          onPress={pickFile}
          disabled={uploading}
        >
          {uploading ? (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#4F46E5" />
              <Text style={{ color: C.textMuted, fontFamily: FONTS.regular, fontSize: 13 }}>
                {percent}%
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 32 }}>🖼️</Text>
              <Text style={{ color: '#4F46E5', fontFamily: FONTS.bold, fontSize: 14 }}>
                Вибрати зображення
              </Text>
              <Text style={{ color: C.textMuted, fontFamily: FONTS.regular, fontSize: 12 }}>
                JPG, PNG, WebP — до 5 МБ
              </Text>
            </View>
          )}
        </Pressable>
      )}

      {/* Caption */}
      <TextInput
        style={[...inp]}
        value={block.caption}
        onChangeText={t => onChange({ ...block, caption: t })}
        placeholder="Підпис до зображення"
        placeholderTextColor={C.textMuted}
      />
    </View>
  );
}

// ── Block editor ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange, gradeId, subjectId, lessonId }: {
  block: Block;
  onChange: (b: Block) => void;
  gradeId: GradeId;
  subjectId: SubjectId;
  lessonId: number | string;
}) {
  const C = useColors();
  const inp = [s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }];

  if (block.type === 'h3' || block.type === 'p' || block.type === 'code'
    || block.type === 'tip' || block.type === 'note' || block.type === 'warning') {
    return (
      <TextInput
        style={[...inp, s.multiline]}
        value={block.text}
        onChangeText={t => onChange({ ...block, text: t })}
        placeholder="Текст…"
        placeholderTextColor={C.textMuted}
        multiline
      />
    );
  }

  if (block.type === 'list') {
    return (
      <View style={{ gap: 6 }}>
        {block.items.map((item, i) => (
          <View key={i} style={s.row}>
            <TextInput
              style={[inp[0], inp[1], inp[2], { flex: 1 }]}
              value={item}
              onChangeText={t => {
                const items = [...block.items]; items[i] = t;
                onChange({ ...block, items });
              }}
              placeholder={`Пункт ${i + 1}`}
              placeholderTextColor={C.textMuted}
            />
            <Pressable onPress={() => {
              const items = block.items.filter((_, j) => j !== i);
              onChange({ ...block, items });
            }}>
              <Text style={[s.del, { color: '#e53e3e' }]}>✕</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => onChange({ ...block, items: [...block.items, ''] })}>
          <Text style={[s.addItem, { color: '#4F46E5' }]}>+ Пункт</Text>
        </Pressable>
      </View>
    );
  }

  if (block.type === 'quiz') {
    return (
      <View style={{ gap: 8 }}>
        <TextInput style={[...inp, s.multiline]} value={block.question}
          onChangeText={t => onChange({ ...block, question: t })}
          placeholder="Запитання" placeholderTextColor={C.textMuted} multiline />
        {block.options.map((opt, i) => (
          <View key={i} style={s.row}>
            <Pressable onPress={() => onChange({ ...block, correct: i })}
              style={[s.radio, block.correct === i && s.radioActive]} />
            <TextInput style={[inp[0], inp[1], inp[2], { flex: 1 }]}
              value={opt}
              onChangeText={t => {
                const options = [...block.options]; options[i] = t;
                onChange({ ...block, options });
              }}
              placeholder={`Варіант ${i + 1}`} placeholderTextColor={C.textMuted} />
          </View>
        ))}
        <TextInput style={[...inp, s.multiline]} value={block.explanation}
          onChangeText={t => onChange({ ...block, explanation: t })}
          placeholder="Пояснення правильної відповіді" placeholderTextColor={C.textMuted} multiline />
      </View>
    );
  }

  if (block.type === 'fill') {
    return (
      <View style={{ gap: 6 }}>
        <TextInput style={inp} value={block.problem} onChangeText={t => onChange({ ...block, problem: t })}
          placeholder="Завдання (наприклад: x + 3 = 7, x = ?)" placeholderTextColor={C.textMuted} />
        <TextInput style={inp} value={block.hint} onChangeText={t => onChange({ ...block, hint: t })}
          placeholder="Підказка" placeholderTextColor={C.textMuted} />
        <TextInput style={inp} value={block.answer} onChangeText={t => onChange({ ...block, answer: t })}
          placeholder="Правильна відповідь" placeholderTextColor={C.textMuted} />
      </View>
    );
  }

  if (block.type === 'image') {
    return <ImageBlockEditor block={block} onChange={onChange} gradeId={gradeId} subjectId={subjectId} lessonId={lessonId} />;
  }

  if (block.type === 'table') {
    return (
      <View style={{ gap: 6 }}>
        <Text style={{ color: C.textMuted, fontFamily: FONTS.regular, fontSize: 12 }}>
          Заголовки (через кому):
        </Text>
        <TextInput style={inp} value={block.headers.join(', ')}
          onChangeText={t => onChange({ ...block, headers: t.split(',').map(h => h.trim()) })}
          placeholder="Заголовок 1, Заголовок 2" placeholderTextColor={C.textMuted} />
        <Text style={{ color: C.textMuted, fontFamily: FONTS.regular, fontSize: 12 }}>
          Рядки (кожна клітинка через |, рядки через нові рядки):
        </Text>
        <TextInput
          style={[...inp, s.multiline]}
          value={block.rows.map(r => r.join(' | ')).join('\n')}
          onChangeText={t => {
            const rows = t.split('\n').map(r => r.split('|').map(c => c.trim()));
            onChange({ ...block, rows });
          }}
          placeholder="Значення 1 | Значення 2"
          placeholderTextColor={C.textMuted}
          multiline
        />
      </View>
    );
  }

  return null;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LessonEditScreen() {
  const { grade, subject, lessonId } = useLocalSearchParams<{
    grade: string; subject: string; lessonId: string;
  }>();
  const router = useRouter();
  const C = useColors();

  const gradeId = Number(grade) as GradeId;
  const subjectId = subject as SubjectId;
  const isNew = lessonId === 'new';

  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [initialCode, setInitialCode] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetchLesson(gradeId, subjectId, Number(lessonId)).then(l => {
      if (l) {
        setTitle(l.title);
        setIntro(l.intro);
        setBlocks(l.blocks);
        setInitialCode(l.initialCode ?? '');
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Вкажіть назву уроку'); return; }
    setSaving(true);
    const lesson: Lesson = {
      id: isNew ? Date.now() : Number(lessonId),
      title: title.trim(),
      intro: intro.trim(),
      blocks,
      ...(initialCode.trim() ? { initialCode: initialCode.trim() } : {}),
    };
    await saveLesson(gradeId, subjectId, lesson);
    setSaving(false);
    router.back();
  };

  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };

  if (loading) {
    return (
      <View style={[s.bg, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[s.bg, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textMuted }]}>← Назад</Text>
        </Pressable>
        <Text style={[s.headerTitle, { color: C.text }]}>
          {isNew ? 'Новий урок' : 'Редагувати урок'}
        </Text>
        <Pressable
          style={[s.saveBtn, { opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>{saving ? 'Збереження…' : 'Зберегти'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Lesson meta */}
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[s.label, { color: C.textMuted }]}>Назва уроку</Text>
          <TextInput
            style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Назва…"
            placeholderTextColor={C.textMuted}
          />
          <Text style={[s.label, { color: C.textMuted }]}>Короткий опис</Text>
          <TextInput
            style={[s.input, s.multiline, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
            value={intro}
            onChangeText={setIntro}
            placeholder="Опис…"
            placeholderTextColor={C.textMuted}
            multiline
          />
          {subjectId === 'informatyka' && (
            <>
              <Text style={[s.label, { color: C.textMuted }]}>Початковий код (Python)</Text>
              <TextInput
                style={[s.input, s.multiline, s.code, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
                value={initialCode}
                onChangeText={setInitialCode}
                placeholder={'print("Hello!")'}
                placeholderTextColor={C.textMuted}
                multiline
                autoCapitalize="none"
              />
            </>
          )}
        </View>

        {/* Blocks */}
        <Text style={[s.sectionTitle, { color: C.text }]}>
          Блоки контенту ({blocks.length})
        </Text>

        {blocks.map((block, i) => (
          <View key={i} style={[s.blockCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={s.blockHeader}>
              <View style={[s.blockType, { backgroundColor: '#4F46E520' }]}>
                <Text style={[s.blockTypeText, { color: '#4F46E5' }]}>
                  {BLOCK_LABELS[block.type] ?? block.type}
                </Text>
              </View>
              <View style={s.blockActions}>
                <Pressable onPress={() => moveBlock(i, -1)} disabled={i === 0}>
                  <Text style={[s.actionBtn, { color: i === 0 ? C.border : C.textMuted }]}>↑</Text>
                </Pressable>
                <Pressable onPress={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}>
                  <Text style={[s.actionBtn, { color: i === blocks.length - 1 ? C.border : C.textMuted }]}>↓</Text>
                </Pressable>
                <Pressable onPress={() => setBlocks(blocks.filter((_, j) => j !== i))}>
                  <Text style={[s.actionBtn, { color: '#e53e3e' }]}>✕</Text>
                </Pressable>
              </View>
            </View>
            <BlockEditor
              block={block}
              gradeId={gradeId}
              subjectId={subjectId}
              lessonId={isNew ? 'new' : lessonId}
              onChange={updated => {
                const next = [...blocks]; next[i] = updated; setBlocks(next);
              }}
            />
          </View>
        ))}

        {/* Add block */}
        <Pressable
          style={[s.addBlockBtn, { borderColor: C.border }]}
          onPress={() => setShowAddMenu(!showAddMenu)}
        >
          <Text style={[s.addBlockText, { color: '#4F46E5' }]}>+ Додати блок</Text>
        </Pressable>

        {showAddMenu && (
          <View style={[s.addMenu, { backgroundColor: C.surface, borderColor: C.border }]}>
            {BLOCK_TYPES.map(type => (
              <Pressable
                key={type}
                style={({ pressed }) => [s.addMenuItem, { borderBottomColor: C.border }, pressed && { opacity: 0.6 }]}
                onPress={() => {
                  setBlocks([...blocks, defaultBlock(type)]);
                  setShowAddMenu(false);
                }}
              >
                <Text style={[s.addMenuText, { color: C.text }]}>{BLOCK_LABELS[type] ?? type}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, borderBottomWidth: 1,
  },
  back: { fontFamily: FONTS.bold, fontSize: 14 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 15, flex: 1, textAlign: 'center' },
  saveBtn: { backgroundColor: '#4F46E5', borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 13 },
  scroll: { padding: SPACING.md, gap: SPACING.md },
  section: { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  label: { fontFamily: FONTS.regular, fontSize: 12 },
  input: {
    borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm,
    fontFamily: FONTS.regular, fontSize: 14,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  code: { fontFamily: 'monospace', minHeight: 100 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, marginTop: SPACING.sm },
  blockCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  blockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockType: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
  blockTypeText: { fontFamily: FONTS.bold, fontSize: 11 },
  blockActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { fontFamily: FONTS.bold, fontSize: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  del: { fontFamily: FONTS.bold, fontSize: 16, padding: 4 },
  addItem: { fontFamily: FONTS.bold, fontSize: 13 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#4F46E5' },
  radioActive: { backgroundColor: '#4F46E5' },
  addBlockBtn: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center',
  },
  addBlockText: { fontFamily: FONTS.bold, fontSize: 15 },
  addMenu: {
    borderWidth: 1, borderRadius: RADIUS.lg, overflow: 'hidden',
  },
  addMenuItem: { padding: SPACING.md, borderBottomWidth: 1 },
  addMenuText: { fontFamily: FONTS.regular, fontSize: 14 },
  imgUploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', minHeight: 140,
  },
  imgPreviewWrap: {
    borderWidth: 1, borderRadius: RADIUS.lg, overflow: 'hidden',
  },
  imgPreview: { width: '100%', height: 200 },
  imgRemoveBtn: {
    padding: SPACING.sm, alignItems: 'center', borderTopWidth: 1,
  },
});
