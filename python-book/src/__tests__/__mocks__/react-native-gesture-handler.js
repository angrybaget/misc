const { View, TouchableOpacity, ScrollView, FlatList, Switch } = require('react-native');
const React = require('react');

// Chainable gesture builder — every method returns the same builder
function makeGesture() {
  const handler = {};
  const chain = new Proxy(handler, {
    get: (_t, prop) => {
      if (prop === '__isGesture') return true;
      return (..._args) => chain;
    },
  });
  return chain;
}

const Gesture = {
  Tap:         makeGesture,
  Pan:         makeGesture,
  Pinch:       makeGesture,
  Rotation:    makeGesture,
  LongPress:   makeGesture,
  Fling:       makeGesture,
  Simultaneous: (..._g) => makeGesture(),
  Exclusive:   (..._g) => makeGesture(),
  Race:        (..._g) => makeGesture(),
};

const GestureDetector = ({ children }) => children;
GestureDetector.displayName = 'GestureDetector';

module.exports = {
  GestureHandlerRootView: View,
  GestureDetector,
  Gesture,
  PanGestureHandler: View,
  TapGestureHandler: View,
  PinchGestureHandler: View,
  ScrollView,
  FlatList,
  Switch,
  TouchableOpacity,
  TouchableHighlight: TouchableOpacity,
  TouchableNativeFeedback: TouchableOpacity,
  TouchableWithoutFeedback: View,
  NativeViewGestureHandler: View,
  RawButton: TouchableOpacity,
  BaseButton: TouchableOpacity,
  RectButton: TouchableOpacity,
  BorderlessButton: TouchableOpacity,
  State: { BEGAN: 'BEGAN', ACTIVE: 'ACTIVE', END: 'END', FAILED: 'FAILED', CANCELLED: 'CANCELLED' },
  Directions: { RIGHT: 1, LEFT: 2, UP: 4, DOWN: 8 },
};
