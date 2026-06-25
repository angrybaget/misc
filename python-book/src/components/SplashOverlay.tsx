import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FONTS } from '../theme';

export function SplashOverlay() {
  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      exiting={FadeOut.duration(200)}
      style={s.overlay}
    >
      <View style={s.content}>
        <Text style={s.flag}>🇺🇦</Text>
        <Text style={s.title}>НУШ Навчання</Text>
        <ActivityIndicator color="#fff" size="large" style={{ marginTop: 24 }} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  flag:  { fontSize: 52, marginBottom: 8 },
  title: { color: '#fff', fontFamily: FONTS.extraBold, fontSize: 24, letterSpacing: 0.5 },
});
