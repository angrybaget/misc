import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FillInBlock } from '../components/FillInBlock';

jest.mock('../hooks/useColors', () => ({
  useColors: () => ({
    surface: '#fff', card: '#eee', border: '#ddd', text: '#000', textMuted: '#888',
    accent: '#6366f1', accentSoft: '#e0e0fd', green: '#059669', red: '#dc2626',
    codeBg: '#000', codeText: '#fff', codeLabelBg: '#111',
  }),
}));

const PROPS = {
  problem: 'Яке значення x: x + 3 = 7?',
  hint: 'Від 7 відніми 3',
  answer: '4',
};

describe('FillInBlock', () => {
  it('renders the problem text', () => {
    render(<FillInBlock {...PROPS} />);
    expect(screen.getByText(PROPS.problem)).toBeTruthy();
  });

  it('renders input and check button', () => {
    render(<FillInBlock {...PROPS} />);
    expect(screen.getByPlaceholderText('Введи відповідь...')).toBeTruthy();
    expect(screen.getByText('Перевірити')).toBeTruthy();
  });

  it('does not show feedback before checking', () => {
    render(<FillInBlock {...PROPS} />);
    expect(screen.queryByText(/Правильно/)).toBeNull();
    expect(screen.queryByText(/Не зовсім/)).toBeNull();
  });

  it('shows correct feedback for right answer', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), '4');
    fireEvent.press(screen.getByText('Перевірити'));
    expect(screen.getByText(/Правильно/)).toBeTruthy();
  });

  it('shows wrong feedback for incorrect answer', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), '5');
    fireEvent.press(screen.getByText('Перевірити'));
    expect(screen.getByText(/Не зовсім/)).toBeTruthy();
  });

  it('is case-insensitive', () => {
    render(<FillInBlock {...{ ...PROPS, answer: 'Python' }} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), 'python');
    fireEvent.press(screen.getByText('Перевірити'));
    expect(screen.getByText(/Правильно/)).toBeTruthy();
  });

  it('trims whitespace before checking', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), '  4  ');
    fireEvent.press(screen.getByText('Перевірити'));
    expect(screen.getByText(/Правильно/)).toBeTruthy();
  });

  it('does not check when input is empty', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.press(screen.getByText('Перевірити'));
    expect(screen.queryByText(/Правильно/)).toBeNull();
    expect(screen.queryByText(/Не зовсім/)).toBeNull();
  });

  it('shows "Ще раз" and hint button after wrong answer', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), '99');
    fireEvent.press(screen.getByText('Перевірити'));
    expect(screen.getByText('Ще раз')).toBeTruthy();
    expect(screen.getByText('💡 Підказка')).toBeTruthy();
  });

  it('shows hint text after pressing hint button', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), '99');
    fireEvent.press(screen.getByText('Перевірити'));
    fireEvent.press(screen.getByText('💡 Підказка'));
    expect(screen.getByText(PROPS.hint)).toBeTruthy();
  });

  it('"Ще раз" clears input and feedback', () => {
    render(<FillInBlock {...PROPS} />);
    fireEvent.changeText(screen.getByPlaceholderText('Введи відповідь...'), '99');
    fireEvent.press(screen.getByText('Перевірити'));
    fireEvent.press(screen.getByText('Ще раз'));
    expect(screen.queryByText(/Не зовсім/)).toBeNull();
    expect(screen.getByPlaceholderText('Введи відповідь...').props.value).toBe('');
  });
});
