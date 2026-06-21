import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';
import { Chapter } from '../data/chapters';

const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.md * 3) / 2;

interface Props {
  chapter: Chapter;
  index: number;
  isDone: boolean;
  onPress: () => void;
}

export function ChapterCard({ chapter, index, isDone, onPress }: Props) {
  const color = COLORS.chapters[chapter.id - 1];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.94, { damping: 15 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 12 });
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={[styles.wrapper, animStyle]}
    >
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <LinearGradient
          colors={[color, color + 'aa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {isDone && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>✓</Text>
            </View>
          )}

          <Text style={styles.num}>{chapter.id.toString().padStart(2, '0')}</Text>
          <Text style={styles.emoji}>{chapter.emoji}</Text>
          <Text style={styles.title} numberOfLines={2}>{chapter.title}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_W,
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  num: {
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  emoji: {
    fontSize: 36,
    marginTop: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
    marginTop: 8,
    lineHeight: 20,
  },
  doneBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
});
