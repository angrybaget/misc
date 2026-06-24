import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QuizBlock } from '../components/QuizBlock';

jest.mock('../hooks/useColors');

const PROPS = {
  question: 'Яка команда виводить текст?',
  options: ['input()', 'print()', 'echo()', 'write()'],
  correct: 1,
  explanation: 'print() використовується для виводу.',
};

describe('QuizBlock', () => {
  it('renders question and all 4 options', () => {
    render(<QuizBlock {...PROPS} />);
    expect(screen.getByText(PROPS.question)).toBeTruthy();
    for (const opt of PROPS.options) {
      expect(screen.getByText(opt)).toBeTruthy();
    }
  });

  it('does not show explanation before answering', () => {
    render(<QuizBlock {...PROPS} />);
    expect(screen.queryByText(PROPS.explanation)).toBeNull();
  });

  it('shows explanation after selecting any answer', () => {
    render(<QuizBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[0]));
    expect(screen.getByText(PROPS.explanation)).toBeTruthy();
  });

  it('shows ✓ mark on the correct option after answering', () => {
    render(<QuizBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[0]));
    // correct option (index 1) should show ✓
    expect(screen.getByText('✓')).toBeTruthy();
    expect(screen.getByText('✗')).toBeTruthy();
  });

  it('pressing the correct option shows ✓ without ✗', () => {
    render(<QuizBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[PROPS.correct]));
    expect(screen.getByText('✓')).toBeTruthy();
    expect(screen.queryByText('✗')).toBeNull();
  });

  it('prevents re-answering after selection', () => {
    render(<QuizBlock {...PROPS} />);
    fireEvent.press(screen.getByText(PROPS.options[0]));
    // Pressing another option should not cause errors (isAnswered guard)
    fireEvent.press(screen.getByText(PROPS.options[2]));
    // explanation still shown
    expect(screen.getByText(PROPS.explanation)).toBeTruthy();
  });

  it('renders ABCD labels', () => {
    render(<QuizBlock {...PROPS} />);
    for (const label of ['A', 'B', 'C', 'D']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});
