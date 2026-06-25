import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AppShell } from '../src/components/AppShell';
import { SplashOverlay } from '../src/components/SplashOverlay';
import { useThemeStore } from '../src/store/theme';
import { useAdminStore } from '../src/store/admin';
import { useUserStore } from '../src/store/user';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <ThemedApp />;
}

function ThemedApp() {
  const { colors } = useThemeStore();
  const { user: adminUser, loading: adminLoading, init: initAdmin } = useAdminStore();
  const { user: studentUser, loading: userLoading, init: initUser } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => initAdmin(), []);
  useEffect(() => initUser(), []);

  const authLoading = adminLoading || userLoading;
  const isAuthenticated = !!(adminUser || studentUser);

  useEffect(() => {
    if (authLoading) return;
    const segs = segments as string[];
    const needsAuth = ['home', 'grade'].includes(segs[0]);
    if (!isAuthenticated && needsAuth) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AppShell>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        />
      </AppShell>
      {authLoading && <SplashOverlay />}
    </GestureHandlerRootView>
  );
}
