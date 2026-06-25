import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import type { AVPlaybackSource } from 'expo-av';

// Native — expo-av with bundled WAV files

const FILES: Record<string, AVPlaybackSource> = {
  tap:      require('../../assets/sounds/tap.wav'),
  select:   require('../../assets/sounds/select.wav'),
  correct:  require('../../assets/sounds/correct.wav'),
  wrong:    require('../../assets/sounds/wrong.wav'),
  complete: require('../../assets/sounds/complete.wav'),
};

async function playFile(source: AVPlaybackSource) {
  try {
    const { sound } = await Audio.Sound.createAsync(source, { volume: 0.7 });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('didJustFinish' in status && status.didJustFinish) sound.unloadAsync();
    });
  } catch {}
}

export function useSounds() {
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: false }).catch(() => {});
  }, []);

  const playTap      = useCallback(() => playFile(FILES.tap),      []);
  const playSelect   = useCallback(() => playFile(FILES.select),   []);
  const playCorrect  = useCallback(() => playFile(FILES.correct),  []);
  const playWrong    = useCallback(() => playFile(FILES.wrong),    []);
  const playComplete = useCallback(() => playFile(FILES.complete), []);

  return { playTap, playSelect, playCorrect, playWrong, playComplete };
}
