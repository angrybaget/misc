import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

const THRESHOLD = 1.8;
const COOLDOWN_MS = 1500;

export function useShake(onShake: () => void) {
  const lastShake = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(80);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (total > THRESHOLD && now - lastShake.current > COOLDOWN_MS) {
        lastShake.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onShake();
      }
    });
    return () => sub.remove();
  }, [onShake]);
}
