import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ContentRenderer } from '../components/ContentRenderer';
import type { Block } from '../data/types';

jest.mock('../hooks/useColors');

// ImageViewer uses gestures + reanimated — stub it out
jest.mock('../components/ImageViewer', () => ({
  ImageViewer: ({ visible, caption }: { visible: boolean; caption?: string }) => {
    const { Text } = require('react-native');
    if (!visible) return null;
    return <Text>IMAGE_VIEWER:{caption}</Text>;
  },
}));

describe('ContentRenderer', () => {
  it('renders h3 text', () => {
    const blocks: Block[] = [{ type: 'h3', text: 'Заголовок' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Заголовок')).toBeTruthy();
  });

  it('renders paragraph text', () => {
    const blocks: Block[] = [{ type: 'p', text: 'Простий текст' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Простий текст')).toBeTruthy();
  });

  it('renders code block with КОД label', () => {
    const blocks: Block[] = [{ type: 'code', text: 'print("hello")' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('print("hello")')).toBeTruthy();
    expect(screen.getByText('КОД')).toBeTruthy();
  });

  it('renders tip callout with label', () => {
    const blocks: Block[] = [{ type: 'tip', text: 'Корисна порада' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Корисна порада')).toBeTruthy();
    expect(screen.getByText('ПОРАДА')).toBeTruthy();
  });

  it('renders note callout', () => {
    const blocks: Block[] = [{ type: 'note', text: 'Примітка тут' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('ПРИМІТКА')).toBeTruthy();
  });

  it('renders warning callout', () => {
    const blocks: Block[] = [{ type: 'warning', text: 'Увага!' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('УВАГА')).toBeTruthy();
  });

  it('renders list items', () => {
    const blocks: Block[] = [{ type: 'list', items: ['Перший', 'Другий', 'Третій'] }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Перший')).toBeTruthy();
    expect(screen.getByText('Другий')).toBeTruthy();
    expect(screen.getByText('Третій')).toBeTruthy();
  });

  it('renders table headers and cells', () => {
    const blocks: Block[] = [{
      type: 'table',
      headers: ['Тип', 'Приклад'],
      rows: [['int', '42'], ['str', '"text"']],
    }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Тип')).toBeTruthy();
    expect(screen.getByText('Приклад')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('"text"')).toBeTruthy();
  });

  it('renders image with 🔍 zoom hint and caption', () => {
    const blocks: Block[] = [{ type: 'image', uri: 'https://example.com/img.png', caption: 'Підпис' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('🔍')).toBeTruthy();
    expect(screen.getByText('Підпис')).toBeTruthy();
  });

  it('opens ImageViewer when tapping the image', () => {
    const blocks: Block[] = [{ type: 'image', uri: 'https://example.com/img.png', caption: 'Підпис' }];
    render(<ContentRenderer blocks={blocks} />);
    fireEvent.press(screen.getByText('🔍').parent!);
    expect(screen.getByText('IMAGE_VIEWER:Підпис')).toBeTruthy();
  });

  it('renders inline bold via **text**', () => {
    const blocks: Block[] = [{ type: 'p', text: 'Звичайний **жирний** текст' }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('жирний')).toBeTruthy();
  });

  it('renders multiple block types together', () => {
    const blocks: Block[] = [
      { type: 'h3', text: 'Розділ 1' },
      { type: 'p', text: 'Параграф.' },
      { type: 'list', items: ['A', 'B'] },
    ];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Розділ 1')).toBeTruthy();
    expect(screen.getByText('Параграф.')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('renders quiz block', () => {
    const blocks: Block[] = [{
      type: 'quiz',
      question: 'Питання?',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'Пояснення',
    }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('Питання?')).toBeTruthy();
  });

  it('renders fill block', () => {
    const blocks: Block[] = [{
      type: 'fill',
      problem: 'x = ?',
      hint: 'Підказка',
      answer: '5',
    }];
    render(<ContentRenderer blocks={blocks} />);
    expect(screen.getByText('x = ?')).toBeTruthy();
  });
});
