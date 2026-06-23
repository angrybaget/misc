import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GRADES } from '../data/grades';
import { COLOR_SCHEMES } from '../data/themes';
import { useThemeStore } from '../store/theme';
import { useAdminStore } from '../store/admin';
import { useColors } from '../hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../theme';

const DRAWER_W = 264;
const HEADER_H = 52;
const SCHEMES = Object.values(COLOR_SCHEMES);

// ── Shared drawer / sidebar content ──────────────────────────────────────────
function NavContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const C = useColors();
  const { schemeId, setScheme } = useThemeStore();
  const { user } = useAdminStore();
  const insets = useSafeAreaInsets();

  function go(path: string) {
    router.push(path as any);
    onClose?.();
  }

  return (
    <View style={[nav.wrap, { backgroundColor: C.surface, borderRightColor: C.border }]}>
      {/* Logo row */}
      <View style={[nav.head, { borderBottomColor: C.border, paddingTop: insets.top + 18 }]}>
        <Pressable onPress={() => go('/')} style={nav.logoBtn}>
          <Text style={[nav.logoTxt, { color: C.accent }]}>🇺🇦 НУШ Навчання</Text>
        </Pressable>
        {onClose && (
          <Pressable onPress={onClose} hitSlop={12} style={[nav.closeBtn, { backgroundColor: C.card }]}>
            <Text style={[nav.closeTxt, { color: C.textMuted }]}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Grades */}
      <Text style={[nav.label, { color: C.textMuted }]}>КЛАСИ</Text>
      <View style={{ flex: 1 }}>
        {GRADES.map((g) => (
          <Pressable
            key={g.id}
            style={({ pressed }) => [nav.item, pressed && { opacity: 0.7 }]}
            onPress={() => go(`/grade/${g.id}`)}
          >
            <View style={[nav.gradeCircle, { backgroundColor: g.color + '28', borderColor: g.color + '88' }]}>
              <Text style={[nav.gradeNum, { color: g.color }]}>{g.id}</Text>
            </View>
            <Text style={[nav.itemTxt, { color: C.text }]}>{g.emoji} {g.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Admin link */}
      <Text style={[nav.label, { color: C.textMuted }]}>АДМІН</Text>
      <Pressable
        style={({ pressed }) => [nav.item, pressed && { opacity: 0.7 }]}
        onPress={() => go(user ? '/admin/dashboard' : '/admin')}
      >
        <View style={[nav.gradeCircle, { backgroundColor: '#4F46E520', borderColor: '#4F46E588' }]}>
          <Text style={{ fontSize: 14 }}>{user ? '⚙️' : '🔐'}</Text>
        </View>
        <Text style={[nav.itemTxt, { color: C.text }]}>
          {user ? 'Панель керування' : 'Вхід для вчителя'}
        </Text>
      </Pressable>

      {/* Theme */}
      <View style={[nav.themeArea, { borderTopColor: C.border }]}>
        <Text style={[nav.label, { color: C.textMuted, paddingTop: SPACING.md }]}>ТЕМА</Text>
        {SCHEMES.map((sc) => {
          const active = sc.id === schemeId;
          return (
            <Pressable
              key={sc.id}
              style={[nav.themeItem, active && { backgroundColor: C.accentSoft, borderRadius: RADIUS.md }]}
              onPress={() => setScheme(sc.id)}
            >
              <View style={[nav.themeDot, { backgroundColor: sc.accent }]} />
              <Text style={[nav.itemTxt, { color: C.text }]}>{sc.emoji} {sc.name}</Text>
              {active && <Text style={[nav.check, { color: C.accent }]}>✓</Text>}
            </Pressable>
          );
        })}
        <View style={{ height: Math.max(insets.bottom, SPACING.md) }} />
      </View>
    </View>
  );
}

// ── Wide / tablet header ──────────────────────────────────────────────────────
function WideHeader() {
  const router = useRouter();
  const C = useColors();
  const { schemeId, setScheme } = useThemeStore();
  const { user } = useAdminStore();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      wide.header,
      { backgroundColor: C.surface, borderBottomColor: C.border, height: HEADER_H + insets.top, paddingTop: insets.top },
    ]}>
      <Pressable onPress={() => router.push('/')} style={wide.logoBtn}>
        <Text style={[wide.logoTxt, { color: C.accent }]}>🇺🇦 НУШ</Text>
      </Pressable>

      <View style={wide.grades}>
        {GRADES.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => router.push(`/grade/${g.id}` as any)}
            style={({ pressed }) => [wide.gradeBtn, pressed && { backgroundColor: C.card }]}
          >
            <Text style={[wide.gradeTxt, { color: C.text }]}>{g.emoji} {g.id} кл</Text>
          </Pressable>
        ))}
      </View>

      <View style={wide.themes}>
        {SCHEMES.map((sc) => (
          <Pressable key={sc.id} onPress={() => setScheme(sc.id)} hitSlop={10} style={wide.themeBtn}>
            <View style={[
              wide.themeDot,
              { backgroundColor: sc.accent },
              sc.id === schemeId && { transform: [{ scale: 1.25 }], borderWidth: 2.5, borderColor: C.text },
            ]} />
          </Pressable>
        ))}
        <Pressable
          onPress={() => router.push((user ? '/admin/dashboard' : '/admin') as any)}
          style={({ pressed }) => [wide.adminBtn, { backgroundColor: C.surface, borderColor: C.border }, pressed && { opacity: 0.7 }]}
          hitSlop={6}
        >
          <Text style={[wide.adminTxt, { color: C.text }]}>
            {user ? '⚙️ Адмін' : '🔐 Вхід'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── App shell (root) ──────────────────────────────────────────────────────────
export function AppShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const C = useColors();
  const insets = useSafeAreaInsets();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerX = useSharedValue(-DRAWER_W);
  const overlayOp = useSharedValue(0);

  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
    drawerX.value = withSpring(0, { damping: 18, stiffness: 220 });
    overlayOp.value = withTiming(1, { duration: 230 });
  }, []);

  const closeDrawer = useCallback(() => {
    drawerX.value = withSpring(-DRAWER_W, { damping: 20, stiffness: 220 });
    overlayOp.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setDrawerVisible)(false);
    });
  }, []);

  const drawerAnim = useAnimatedStyle(() => ({ transform: [{ translateX: drawerX.value }] }));
  const overlayAnim = useAnimatedStyle(() => ({ opacity: overlayOp.value }));

  if (isWide) {
    return (
      <View style={[shell.root, { backgroundColor: C.bg }]}>
        <WideHeader />
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[shell.root, { backgroundColor: C.bg }]}>
      {children}

      {/* Floating hamburger button */}
      <Pressable
        style={[shell.burger, { top: insets.top + 10 }]}
        onPress={openDrawer}
        hitSlop={10}
      >
        <Text style={shell.burgerIcon}>☰</Text>
      </Pressable>

      {/* Slide-in drawer */}
      {drawerVisible && (
        <>
          <Animated.View style={[shell.overlay, overlayAnim]}>
            <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
          </Animated.View>
          <Animated.View style={[shell.drawer, drawerAnim]}>
            <NavContent onClose={closeDrawer} />
          </Animated.View>
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const nav = StyleSheet.create({
  wrap: { flex: 1, borderRightWidth: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  logoBtn: {},
  logoTxt: { fontFamily: FONTS.extraBold, fontSize: 16 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontFamily: FONTS.bold, fontSize: 14 },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 4,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.md, paddingVertical: 10 },
  gradeCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  gradeNum: { fontFamily: FONTS.extraBold, fontSize: 14 },
  itemTxt: { flex: 1, fontFamily: FONTS.bold, fontSize: 15 },
  themeArea: { borderTopWidth: 1 },
  themeItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.md, paddingVertical: 10 },
  themeDot: { width: 22, height: 22, borderRadius: 11 },
  check: { fontFamily: FONTS.bold, fontSize: 15 },
});

const wide = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: SPACING.sm,
    zIndex: 50,
  },
  logoBtn: { marginRight: SPACING.sm },
  logoTxt: { fontFamily: FONTS.extraBold, fontSize: 17 },
  grades: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gradeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.sm },
  gradeTxt: { fontFamily: FONTS.bold, fontSize: 13 },
  themes: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  themeBtn: { padding: 4 },
  themeDot: { width: 20, height: 20, borderRadius: 10 },
  adminBtn: { borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 },
  adminTxt: { fontFamily: FONTS.bold, fontSize: 13 },
});

const shell = StyleSheet.create({
  root: { flex: 1 },
  burger: {
    position: 'absolute',
    right: 14,
    zIndex: 100,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  burgerIcon: { fontSize: 18, color: '#fff' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.46)',
    zIndex: 200,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_W,
    zIndex: 300,
  },
});
