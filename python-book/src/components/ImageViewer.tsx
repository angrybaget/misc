import React, { useEffect } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet,
  useWindowDimensions, StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Props {
  uri: string;
  caption?: string;
  visible: boolean;
  onClose: () => void;
}

export function ImageViewer({ uri, caption, visible, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const imgH = caption ? height - 80 : height;

  const scale        = useSharedValue(1);
  const savedScale   = useSharedValue(1);
  const tx           = useSharedValue(0);
  const ty           = useSharedValue(0);
  const savedTx      = useSharedValue(0);
  const savedTy      = useSharedValue(0);
  const opacity      = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      reset();
    }
  }, [visible]);

  function reset() {
    scale.value       = withSpring(1, { damping: 20 });
    tx.value          = withSpring(0, { damping: 20 });
    ty.value          = withSpring(0, { damping: 20 });
    savedScale.value  = 1;
    savedTx.value     = 0;
    savedTy.value     = 0;
  }

  // ── Gestures ────────────────────────────────────────────────────────────────

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.min(6, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        scale.value = withSpring(1); tx.value = withSpring(0); ty.value = withSpring(0);
        savedScale.value = 1; savedTx.value = 0; savedTy.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(e => {
      if (scale.value > 1) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd(() => {
      if (scale.value > 1.5) {
        scale.value = withSpring(1); tx.value = withSpring(0); ty.value = withSpring(0);
        savedScale.value = 1; savedTx.value = 0; savedTy.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const singleTap = Gesture.Tap()
    .maxDuration(200)
    .onEnd(() => {
      if (scale.value <= 1) runOnJS(onClose)();
    });

  const composed = Gesture.Simultaneous(
    pinch,
    pan,
    Gesture.Exclusive(doubleTap, singleTap),
  );

  // ── Animated styles ──────────────────────────────────────────────────────────

  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: tx.value }, { translateY: ty.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <Animated.View style={[s.bg, bgStyle]}>
        {/* Close button */}
        <Pressable style={s.closeBtn} onPress={onClose} hitSlop={16}>
          <Text style={s.closeText}>✕</Text>
        </Pressable>

        {/* Zoom hint */}
        <Text style={s.hint}>Двічі торкніться для збільшення · Pinch для zoom</Text>

        {/* Image */}
        <GestureDetector gesture={composed}>
          <Animated.View style={{ width, height: imgH, overflow: 'hidden' }}>
            <Animated.Image
              source={{ uri }}
              style={[{ width, height: imgH }, imgStyle]}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        {/* Caption */}
        {!!caption && (
          <View style={s.captionWrap}>
            <Text style={s.caption} numberOfLines={2}>{caption}</Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 60,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  captionWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
  },
  caption: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 19,
  },
});
