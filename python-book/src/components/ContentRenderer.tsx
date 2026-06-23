import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Image } from 'react-native';
import { Block } from '../data/types';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';
import { QuizBlock } from './QuizBlock';
import { QuizMultiBlock } from './QuizMultiBlock';
import { FillInBlock } from './FillInBlock';

const CODE_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

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

function BlockH3({ text }: { text: string }) {
  const C = useColors();
  return <Text style={[s.h3, { color: C.text }]}>{text}</Text>;
}

function BlockP({ text }: { text: string }) {
  const C = useColors();
  return <InlineText text={text} style={[s.p, { color: C.text }]} />;
}

function BlockCode({ text }: { text: string }) {
  const C = useColors();
  return (
    <View style={[s.codeBlock, { backgroundColor: C.codeBg, borderColor: C.border }]}>
      <Text style={[s.codeLabel, { color: C.accent, backgroundColor: C.codeLabelBg }]}>код</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={[s.code, { color: C.codeText }]}>{text}</Text>
      </ScrollView>
    </View>
  );
}

function BlockCallout({ variant, text }: { variant: 'tip' | 'note' | 'warning'; text: string }) {
  const config = {
    tip:     { bg: '#052e16', border: '#10b981', color: '#6ee7b7', icon: '💡 Порада' },
    note:    { bg: '#0c1a3d', border: '#3b82f6', color: '#93c5fd', icon: '📝 Примітка' },
    warning: { bg: '#2d1500', border: '#f59e0b', color: '#fcd34d', icon: '⚠️ Увага' },
  }[variant];
  return (
    <View style={[s.callout, { backgroundColor: config.bg, borderLeftColor: config.border }]}>
      <Text style={[s.calloutTitle, { color: config.color }]}>{config.icon}</Text>
      <Text style={[s.calloutBody, { color: config.color }]}>{text}</Text>
    </View>
  );
}

function BlockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const C = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tableScroll}>
      <View>
        <View style={[s.tableRow, { backgroundColor: C.accentSoft, borderBottomColor: C.border }]}>
          {headers.map((h, i) => (
            <Text key={i} style={[s.tableCell, s.tableHeadCell, { color: C.text }]}>{h}</Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={[s.tableRow, { borderBottomColor: C.border }, ri % 2 === 1 && { backgroundColor: C.card }]}>
            {row.map((cell, ci) => (
              <Text key={ci} style={[s.tableCell, { color: C.text }]}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function BlockImage({ uri, caption }: { uri: string; caption: string }) {
  const C = useColors();
  const [error, setError] = useState(false);
  return (
    <View style={[s.imgWrap, { backgroundColor: C.card, borderColor: C.border }]}>
      {error ? (
        <Text style={[s.imgError, { color: C.textMuted }]}>🖼️ Зображення недоступне</Text>
      ) : (
        <Image
          source={{ uri }}
          style={s.img}
          resizeMode="contain"
          onError={() => setError(true)}
        />
      )}
      {!!caption && <Text style={[s.imgCaption, { color: C.textMuted }]}>{caption}</Text>}
    </View>
  );
}

function BlockList({ items }: { items: string[] }) {
  const C = useColors();
  return (
    <View style={s.listBlock}>
      {items.map((item, i) => (
        <View key={i} style={s.listItem}>
          <Text style={[s.bullet, { color: C.accent }]}>•</Text>
          <InlineText text={item} style={[s.listText, { color: C.text }]} />
        </View>
      ))}
    </View>
  );
}

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

const s = StyleSheet.create({
  h3: { fontFamily: FONTS.extraBold, fontSize: 20, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  p: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 24, marginBottom: SPACING.sm },
  bold: { fontFamily: FONTS.bold },
  inlineCode: { fontFamily: CODE_FONT, fontSize: 13, borderRadius: 4 },
  codeBlock: { borderRadius: RADIUS.md, overflow: 'hidden', marginVertical: SPACING.sm, borderWidth: 1 },
  codeLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  code: { fontFamily: CODE_FONT, fontSize: 13, padding: SPACING.md, lineHeight: 22 },
  callout: { borderLeftWidth: 4, borderRadius: RADIUS.sm, padding: SPACING.md, marginVertical: SPACING.sm },
  calloutTitle: { fontFamily: FONTS.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  calloutBody: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22 },
  tableScroll: { marginVertical: SPACING.sm },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tableCell: { fontFamily: CODE_FONT, fontSize: 12, padding: 10, minWidth: 100, maxWidth: 240 },
  tableHeadCell: { fontFamily: FONTS.bold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  listBlock: { marginVertical: SPACING.sm },
  listItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 16, lineHeight: 24 },
  listText: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 24, flex: 1 },
  // image block
  imgWrap: { borderRadius: RADIUS.md, borderWidth: 1, marginVertical: SPACING.sm, overflow: 'hidden' },
  img: { width: '100%', height: 200 },
  imgError: { fontFamily: FONTS.regular, fontSize: 13, padding: SPACING.md, textAlign: 'center' },
  imgCaption: { fontFamily: FONTS.regular, fontSize: 12, textAlign: 'center', padding: SPACING.sm, fontStyle: 'italic' },
});
