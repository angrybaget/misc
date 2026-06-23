import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Image, Pressable } from 'react-native';
import { Block } from '../data/types';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';
import { QuizBlock } from './QuizBlock';
import { QuizMultiBlock } from './QuizMultiBlock';
import { FillInBlock } from './FillInBlock';
import { ImageViewer } from './ImageViewer';

const CODE_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// ─── Inline text with **bold** and `code` ────────────────────────────────────

function InlineText({ text, style }: { text: string; style?: object }) {
  const C = useColors();
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <Text key={i} style={[s.bold, { color: C.text }]}>{part.slice(2, -2)}</Text>;
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <Text key={i} style={[s.inlineCode, { color: C.accent, backgroundColor: C.accentSoft }]}>
              {part.slice(1, -1)}
            </Text>
          );
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

// ─── H3 — accent left bar ────────────────────────────────────────────────────

function BlockH3({ text }: { text: string }) {
  const C = useColors();
  return (
    <View style={[s.h3Wrap, { borderLeftColor: C.accent }]}>
      <Text style={[s.h3, { color: C.text }]}>{text}</Text>
    </View>
  );
}

// ─── Paragraph ───────────────────────────────────────────────────────────────

function BlockP({ text }: { text: string }) {
  const C = useColors();
  return <InlineText text={text} style={[s.p, { color: C.text }]} />;
}

// ─── Code block — macOS-style header ─────────────────────────────────────────

function BlockCode({ text }: { text: string }) {
  const C = useColors();
  return (
    <View style={[s.codeWrap, { backgroundColor: C.codeBg, borderColor: C.border }]}>
      <View style={[s.codeHeader, { backgroundColor: C.codeLabelBg }]}>
        <View style={s.codeDots}>
          <View style={[s.codeDot, s.dotRed]} />
          <View style={[s.codeDot, s.dotYellow]} />
          <View style={[s.codeDot, s.dotGreen]} />
        </View>
        <Text style={[s.codeLabel, { color: C.accent }]}>КОД</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={[s.code, { color: C.codeText }]}>{text}</Text>
      </ScrollView>
    </View>
  );
}

// ─── Callout — semi-transparent, theme-aware ─────────────────────────────────

const CALLOUT_CONFIG = {
  tip:     { accent: '#10b981', label: 'Порада',    icon: '💡' },
  note:    { accent: '#3b82f6', label: 'Примітка',  icon: '📘' },
  warning: { accent: '#f59e0b', label: 'Увага',     icon: '⚠️' },
} as const;

function BlockCallout({ variant, text }: { variant: 'tip' | 'note' | 'warning'; text: string }) {
  const C = useColors();
  const { accent, label, icon } = CALLOUT_CONFIG[variant];
  return (
    <View style={[s.callout, { borderLeftColor: accent, backgroundColor: accent + '12' }]}>
      <View style={s.calloutHead}>
        <View style={[s.calloutIconWrap, { backgroundColor: accent + '28' }]}>
          <Text style={s.calloutIcon}>{icon}</Text>
        </View>
        <Text style={[s.calloutLabel, { color: accent }]}>{label.toUpperCase()}</Text>
      </View>
      <Text style={[s.calloutBody, { color: C.text }]}>{text}</Text>
    </View>
  );
}

// ─── Table — aligned columns via flex ────────────────────────────────────────
// Each cell uses flex:1 so every column in every row has the same width.
// No per-cell content sizing → headers and body always align perfectly.

function BlockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const C = useColors();
  const n = headers.length;
  return (
    <View style={[s.tableWrap, { borderColor: C.border }]}>
      {/* Header */}
      <View style={[s.tableHead, { backgroundColor: C.accent }]}>
        {headers.map((h, i) => (
          <View
            key={i}
            style={[
              s.tHeadCell,
              i < n - 1 && { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.18)' },
            ]}
          >
            <Text style={s.tHeadTxt}>{h}</Text>
          </View>
        ))}
      </View>
      {/* Body rows */}
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[
            s.tableRow,
            { borderBottomColor: C.border },
            ri % 2 === 1 && { backgroundColor: C.card },
            ri === rows.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={[
                s.tBodyCell,
                ci < n - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.border },
              ]}
            >
              <Text style={[s.tCellTxt, { color: C.text }, ci === 0 && { fontFamily: FONTS.bold }]}>
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── List — circle dots ───────────────────────────────────────────────────────

function BlockList({ items }: { items: string[] }) {
  const C = useColors();
  return (
    <View style={s.listBlock}>
      {items.map((item, i) => (
        <View key={i} style={s.listItem}>
          <View style={[s.listDot, { backgroundColor: C.accent }]} />
          <InlineText text={item} style={[s.listText, { color: C.text }]} />
        </View>
      ))}
    </View>
  );
}

// ─── Image — caption strip ────────────────────────────────────────────────────

function BlockImage({ uri, caption }: { uri: string; caption: string }) {
  const C = useColors();
  const [error, setError] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <>
      <Pressable
        style={[s.imgWrap, { borderColor: C.border, backgroundColor: C.card }]}
        onPress={() => !error && setViewerOpen(true)}
      >
        {error ? (
          <View style={s.imgErrWrap}>
            <Text style={[s.imgErrTxt, { color: C.textMuted }]}>🖼️  Зображення недоступне</Text>
          </View>
        ) : (
          <>
            <Image
              source={{ uri }}
              style={s.img}
              resizeMode="contain"
              onError={() => setError(true)}
            />
            <View style={s.zoomHint}>
              <Text style={s.zoomHintText}>🔍</Text>
            </View>
          </>
        )}
        {!!caption && (
          <View style={[s.imgCaptionWrap, { borderTopColor: C.border, backgroundColor: C.surface }]}>
            <Text style={[s.imgCaption, { color: C.textMuted }]}>{caption}</Text>
          </View>
        )}
      </Pressable>

      <ImageViewer
        uri={uri}
        caption={caption}
        visible={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

// ─── Renderer ────────────────────────────────────────────────────────────────

export function ContentRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h3':      return <BlockH3 key={i} text={block.text} />;
          case 'p':       return <BlockP key={i} text={block.text} />;
          case 'code':    return <BlockCode key={i} text={block.text} />;
          case 'tip':
          case 'note':
          case 'warning': return <BlockCallout key={i} variant={block.type} text={block.text} />;
          case 'table':   return <BlockTable key={i} headers={block.headers} rows={block.rows} />;
          case 'list':    return <BlockList key={i} items={block.items} />;
          case 'image':   return <BlockImage key={i} uri={block.uri} caption={block.caption} />;
          case 'quiz':       return <QuizBlock key={i} {...block} />;
          case 'quiz-multi': return <QuizMultiBlock key={i} {...block} />;
          case 'fill':       return <FillInBlock key={i} {...block} />;
          default:        return null;
        }
      })}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── inline ──
  bold: { fontFamily: FONTS.bold },
  inlineCode: { fontFamily: CODE_FONT, fontSize: 13, borderRadius: 4 },

  // ── h3 ──
  h3Wrap: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginTop: SPACING.lg,
    marginBottom: 10,
  },
  h3: { fontFamily: FONTS.extraBold, fontSize: 19 },

  // ── p ──
  p: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 24, marginBottom: SPACING.sm },

  // ── code ──
  codeWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
    borderWidth: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: 12,
  },
  codeDots: { flexDirection: 'row', gap: 5 },
  codeDot: { width: 10, height: 10, borderRadius: 5 },
  dotRed:    { backgroundColor: '#ff5f57' },
  dotYellow: { backgroundColor: '#febc2e' },
  dotGreen:  { backgroundColor: '#28c840' },
  codeLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  code: { fontFamily: CODE_FONT, fontSize: 13, padding: SPACING.md, lineHeight: 22 },

  // ── callout ──
  callout: {
    borderLeftWidth: 5,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  calloutHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 6,
  },
  calloutIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutIcon: { fontSize: 14 },
  calloutLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.3,
  },
  calloutBody: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
    paddingBottom: 14,
  },

  // ── table ──
  tableWrap: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  tableHead: { flexDirection: 'row' },
  tHeadCell: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tHeadTxt: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tBodyCell: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tCellTxt: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },

  // ── list ──
  listBlock: { marginVertical: SPACING.sm },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  listDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 9,
    flexShrink: 0,
  },
  listText: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 24, flex: 1 },

  // ── image ──
  imgWrap: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  img: { width: '100%', height: 220 },
  zoomHint: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  zoomHintText: { fontSize: 12 },
  imgErrWrap: { height: 100, alignItems: 'center', justifyContent: 'center' },
  imgErrTxt: { fontFamily: FONTS.regular, fontSize: 13 },
  imgCaptionWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  imgCaption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
