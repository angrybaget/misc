const { View, Text, Animated, Platform } = require('react-native');
const React = require('react');

const stub = () => {};
const identity = (x) => x;
const noop = () => {};

const useSharedValue = (init) => ({ value: init });
const useAnimatedStyle = (fn) => {
  try { return fn(); } catch { return {}; }
};
const withSpring = identity;
const withTiming = identity;
const withSequence = (...args) => args[args.length - 1];
const withDelay = (_d, v) => v;
const withDecay = identity;
const withRepeat = identity;
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;
const cancelAnimation = noop;
const measure = () => null;
const interpolate = (value, input, output) => {
  if (input.length === 0) return 0;
  const i = input.findIndex((v, idx) => idx < input.length - 1 && value >= v && value <= input[idx + 1]);
  if (i === -1) return output[output.length - 1];
  const t = (value - input[i]) / (input[i + 1] - input[i]);
  return output[i] + t * (output[i + 1] - output[i]);
};

const FadeIn = { duration: () => FadeIn, delay: () => FadeIn, springify: () => FadeIn };
const FadeOut = { duration: () => FadeOut };
const SlideInRight = { duration: () => SlideInRight };
const SlideOutLeft = { duration: () => SlideOutLeft };
const ZoomIn = { duration: () => ZoomIn };
const ZoomOut = { duration: () => ZoomOut };

const AnimatedView = ({ style, children, ...props }) => React.createElement(View, { style, ...props }, children);
const AnimatedText = ({ style, children, ...props }) => React.createElement(Text, { style, ...props }, children);

AnimatedView.displayName = 'Animated.View';
AnimatedText.displayName = 'Animated.Text';

module.exports = {
  default: {
    View: AnimatedView,
    Text: AnimatedText,
    Image: View,
    ScrollView: View,
    FlatList: View,
    createAnimatedComponent: identity,
  },
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
  useAnimatedGestureHandler: () => noop,
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
  cancelAnimation,
  measure,
  interpolate,
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: { linear: identity, ease: identity, in: identity, out: identity, inOut: identity, bezier: () => identity, circle: identity, quad: identity, cubic: identity },
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  Layout: { duration: () => ({}) },
  LinearTransition: {},
  enableLayoutAnimations: noop,
  setNativeProps: noop,
  useScrollViewOffset: () => ({ value: 0 }),
  useEvent: () => noop,
  useHandler: () => ({ handlers: {}, context: {} }),
  useWorkletCallback: (fn) => fn,
  makeMutable: useSharedValue,
  makeRemote: () => ({}),
  makeShareable: identity,
  getReanimatedVersion: () => '3.0.0',
};
