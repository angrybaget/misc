import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QuizMultiBlock } from '../components/QuizMultiBlock';

jest.mock('../hooks/useColors');

const PROPS = {
  question: 'Які з цих є типами даних Python?',
  options: ['int', 'str', 'bool', 'run'],
  correct: [0, 1, 2],
  explanation: 'int, str, bool — базові типи. run — не тип.',
};

describe('QuizMultiBlock', () => {
  it('renders question and all options', () => {
    render(<QuizMultiBlock {...PROPS} />);
    expect(screen.getByText(PROPS.question)).toBeTruthy();
    for (const opt of PROPS.options) {
      expect(screen.getByText(opt)).toBeTruthy();
    }
  });

  it('shows ABCD badges', () => {
    render(<QuizMultiBlock {...PROPS} />);
    for (const label of ['A', 'B', 'C', 'D']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('shows submit button before answering', () => {
    render(<QuizMultiBlock {...PROPS} />);
    expect(screen.getByText('Перевірити →')).toBeTruthy();
  });

  it('hides explanation before submitting', () => {
    render(<QuizMultiBlock {...PROPS} />);
    expect(screen.queryByText(PROPS.explanation)).toBeNull();
  });

  it('does not submit with no selection', () => {
    render(<QuizMultiBlock {...PROPS} />);
    fireEvent.press(screen.getByText('Перевірити →'));
    expect(screen.queryByText(PROPS.explanation)).toBeNull();
  });

  it('shows explanation after submitting a selection', () => {
    render(<QuizMultiBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[0]));
    fireEvent.press(screen.getByText('Перевірити →'));
    expect(screen.getByText(PROPS.explanation)).toBeTruthy();
  });

  it('hides submit button after submitting', () => {
    render(<QuizMultiBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[0]));
    fireEvent.press(screen.getByText('Перевірити →'));
    expect(screen.queryByText('Перевірити →')).toBeNull();
  });

  it('toggling the same option twice deselects it', () => {
    render(<QuizMultiBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[0]));
    fireEvent.press(screen.getByText(PROPS.options[0]));
    // still no submission — button should still be present
    expect(screen.getByText('Перевірити →')).toBeTruthy();
  });

  it('selecting all correct options shows 🎉 icon', () => {
    render(<QuizMultiBlock {...PROPS} />);
    for (const i of PROPS.correct) {
      fireEvent.press(screen.getByText(PROPS.options[i]));
    }
    fireEvent.press(screen.getByText('Перевірити →'));
    expect(screen.getByText('🎉')).toBeTruthy();
  });

  it('selecting wrong options shows 💡 icon', () => {
    render(<QuizMultiBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[3])); // wrong
    fireEvent.press(screen.getByText('Перевірити →'));
    expect(screen.getByText('💡')).toBeTruthy();
  });
});
