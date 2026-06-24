import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ImageViewer } from '../components/ImageViewer';

const PROPS = {
  uri: 'https://example.com/photo.png',
  caption: 'Підпис зображення',
  visible: true,
  onClose: jest.fn(),
};

describe('ImageViewer', () => {
  beforeEach(() => PROPS.onClose.mockClear());

  it('renders nothing when not visible', () => {
    const { queryByText } = render(<ImageViewer {...PROPS} visible={false} />);
    expect(queryByText('✕')).toBeNull();
  });

  it('renders close button when visible', () => {
    render(<ImageViewer {...PROPS} />);
    expect(screen.getByText('✕')).toBeTruthy();
  });

  it('renders caption when provided', () => {
    render(<ImageViewer {...PROPS} />);
    expect(screen.getByText(PROPS.caption)).toBeTruthy();
  });

  it('does not render caption area when no caption', () => {
    render(<ImageViewer {...PROPS} caption={undefined} />);
    expect(screen.queryByText(PROPS.caption)).toBeNull();
  });

  it('calls onClose when close button is pressed', () => {
    render(<ImageViewer {...PROPS} />);
    fireEvent.press(screen.getByText('✕'));
    expect(PROPS.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders zoom hint text', () => {
    render(<ImageViewer {...PROPS} />);
    expect(screen.getByText(/Двічі торкніться/)).toBeTruthy();
  });
});
