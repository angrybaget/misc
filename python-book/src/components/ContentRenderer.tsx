import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { Block } from '../data/types';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';
import { QuizBlock } from './QuizBlock';
import { FillInBlock } from './FillInBlock';

function InlineText({ text, style }: { text: string; style?: object }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <Text key={i} style={styles.inlineCode}>{part.slice(1, -1)}</Text>;
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

function BlockH3({ text }: { text: string }) {
  return <Text style={styles.h3}>{text}</Text>;
}

function BlockP({ text }: { text: string }) {
  return <InlineText text={text} style={styles.p} />;
}

function BlockCode({ text }: { text: string }) {
  return (
    <View style={styles.codeBlock}>
      <Text style={styles.codeLabel}>код</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={styles.code}>{text}</Text>
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
    <View style={[styles.callout, { backgroundColor: config.bg, borderLeftColor: config.border }]}>
      <Text style={[styles.calloutTitle, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.calloutBody, { color: config.color }]}>{text}</Text>
    </View>
  );
}

function BlockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
      <View>
        <View style={[styles.tableRow, styles.tableHeader]}>
          {headers.map((h, i) => (
            <Text key={i} style={[styles.tableCell, styles.tableHeadCell]}>{h}</Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.tableRow, ri % 2 === 1 && styles.tableRowAlt]}>
            {row.map((cell, ci) => (
              <Text key={ci} style={styles.tableCell}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function BlockList({ items }: { items: string[] }) {
  return (
    <View style={styles.listBlock}>
      {items.map((item, i) => (
        <View key={i} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <InlineText text={item} style={styles.listText} />
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
          case 'quiz':    return <QuizBlock key={i} {...block} />;
          case 'fill':    return <FillInBlock key={i} {...block} />;
          default:        return null;
        }
      })}
    </>
  );
}

const CODE_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  h3: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  p: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#ccc8f0',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  bold: { fontFamily: FONTS.bold, color: COLORS.text },
  inlineCode: {
    fontFamily: CODE_FONT,
    fontSize: 13,
    color: '#a5b4fc',
    backgroundColor: '#1e1a4a',
    borderRadius: 4,
  },
  codeBlock: {
    backgroundColor: '#0d0b1e',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#6366f1',
    backgroundColor: '#13113a',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: CODE_FONT,
    fontSize: 13,
    color: '#c8d3f5',
    padding: SPACING.md,
    lineHeight: 22,
  },
  callout: {
    borderLeftWidth: 4,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  calloutTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  calloutBody: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  tableScroll: { marginVertical: SPACING.sm },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: { backgroundColor: '#1a1744' },
  tableHeader: { backgroundColor: '#221f50' },
  tableCell: {
    fontFamily: CODE_FONT,
    fontSize: 12,
    color: COLORS.textMuted,
    padding: 10,
    minWidth: 100,
    maxWidth: 240,
  },
  tableHeadCell: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listBlock: { marginVertical: SPACING.sm },
  listItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { color: COLORS.accent, fontSize: 16, lineHeight: 24 },
  listText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#ccc8f0',
    lineHeight: 24,
    flex: 1,
  },
});
