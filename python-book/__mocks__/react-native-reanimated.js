const { View, Text } = require('react-native');
const React = require('react');

const noop = () => {};
const identity = (x) => x;

const useSharedValue = (init) => ({ value: init });
const useAnimatedStyle = (fn) => { try { return fn(); } catch { return {}; } };
const withSpring = identity;
const withTiming = identity;
const withSequence = (...args) => args[args.length - 1];
const withDelay = (_d, v) => v;
const withDecay = identity;
const withRepeat = identity;
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;

// All entering/exiting animations share the same chainable-builder shape
const makeAnimation = () => {
  const a = {};
  ['duration', 'delay', 'springify', 'damping', 'mass', 'stiffness'].forEach(k => { a[k] = () => a; });
  return a;
};

const AnimatedView = ({ style, children, ...props }) => React.createElement(View, { style, ...props }, children);
const AnimatedText = ({ style, children, ...props }) => React.createElement(Text, { style, ...props }, children);
AnimatedView.displayName = 'Animated.View';
AnimatedText.displayName = 'Animated.Text';

module.exports = {
  default: { View: AnimatedView, Text: AnimatedText, Image: View, ScrollView: View, createAnimatedComponent: identity },
  View: AnimatedView,
  Text: AnimatedText,
  Image: View,
  ScrollView: View,
  FlatList: View,
  createAnimatedComponent: identity,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler: () => noop,
  useAnimatedRef: () => ({ current: null }),
  useAnimatedReaction: noop,
  useDerivedValue: (fn) => ({ value: fn() }),
  useAnimatedProps: (fn) => fn(),
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withDecay,
  withRepeat,
  runOnJS,
  runOnUI,
  cancelAnimation: noop,
  measure: () => null,
  interpolate: (value, input, output) => {
    const i = input.findIndex((v, idx) => idx < input.length - 1 && value >= v && value <= input[idx + 1]);
    return i === -1 ? output[output.length - 1] : output[i] + ((value - input[i]) / (input[i + 1] - input[i])) * (output[i + 1] - output[i]);
  },
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: { linear: identity, ease: identity, in: identity, out: identity, inOut: identity, bezier: () => identity, circle: identity, quad: identity, cubic: identity },
  FadeIn: makeAnimation(),
  FadeOut: makeAnimation(),
  SlideInRight: makeAnimation(),
  SlideOutLeft: makeAnimation(),
  ZoomIn: makeAnimation(),
  ZoomOut: makeAnimation(),
  Layout: makeAnimation(),
  LinearTransition: makeAnimation(),
  enableLayoutAnimations: noop,
  getReanimatedVersion: () => '3.0.0',
  makeMutable: useSharedValue,
  makeShareable: identity,
};
