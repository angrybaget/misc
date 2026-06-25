import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, TextInput, StyleSheet,
  useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdminStore } from '../src/store/admin';
import { useUserStore } from '../src/store/user';
import { useColors } from '../src/hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../src/theme';

const EMAIL_ERRORS: Record<string, string> = {
  'auth/user-not-found':      'Акаунт не знайдено',
  'auth/wrong-password':      'Невірний пароль',
  'auth/invalid-email':       'Невірний формат email',
  'auth/invalid-credential':  'Невірний email або пароль',
  'auth/too-many-requests':   'Забагато спроб — спробуй пізніше',
};

export default function AuthGate() {
  const { user: adminUser, loading: adminLoading } = useAdminStore();
  const { user: studentUser, loading: userLoading, signInWithGoogle, signInWithEmail } = useUserStore();
  const router = useRouter();
  const C = useColors();
  const { width } = useWindowDimensions();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  const loading = adminLoading || userLoading;

  useEffect(() => {
    if (loading) return;
    if (adminUser)  { router.replace('/admin/dashboard' as any); return; }
    if (studentUser){ router.replace('/home' as any); return; }
  }, [adminUser, studentUser, loading]);

  if (loading || adminUser || studentUser) return null;

  const narrow = width < 500;

  const handleEmailLogin = async () => {
    if (!email || !password) return;
    setError('');
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e: any) {
      setError(EMAIL_ERRORS[e?.code] ?? 'Помилка входу');
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={[C.accent + 'ee', C.accent + '88', C.bg]} style={s.fill}>
      <KeyboardAvoidingView
        style={s.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, narrow && s.scrollNarrow]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <Animated.View entering={FadeInDown.duration(400).springify()} style={s.header}>
            <Text style={s.flag}>🇺🇦</Text>
            <Text style={[s.title, { color: C.text }]}>НУШ Навчання</Text>
            <Text style={[s.sub, { color: C.textMuted }]}>5–9 клас · 2025–2026</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={s.card}>
            {/* Google */}
            <Pressable
              style={({ pressed }) => [s.googleBtn, pressed && { opacity: 0.8 }]}
              onPress={signInWithGoogle}
            >
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.googleTxt}>Увійти через Google</Text>
            </Pressable>

            {/* Divider */}
            <View style={s.divider}>
              <View style={[s.dividerLine, { backgroundColor: C.border }]} />
              <Text style={[s.dividerTxt, { color: C.textMuted }]}>або</Text>
              <View style={[s.dividerLine, { backgroundColor: C.border }]} />
            </View>

            {/* Email form */}
            <TextInput
              style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
              placeholder="Email"
              placeholderTextColor={C.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
              placeholder="Пароль"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {!!error && <Text style={s.error}>{error}</Text>}

            <Pressable
              style={({ pressed }) => [
                s.emailBtn,
                { backgroundColor: C.accent, opacity: pressed || busy ? 0.75 : 1 },
              ]}
              onPress={handleEmailLogin}
              disabled={busy}
            >
              <Text style={s.emailBtnTxt}>{busy ? 'Входжу…' : 'Увійти'}</Text>
            </Pressable>

            <Text style={[s.hint, { color: C.textMuted }]}>
              Вперше? Після входу через Google перевір пошту — там буде посилання для встановлення пароля
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  scrollNarrow: { paddingHorizontal: SPACING.md },
  header: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  flag:  { fontSize: 64 },
  title: { fontFamily: FONTS.extraBold, fontSize: 32, textAlign: 'center' },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  card: { width: '100%', maxWidth: 420, gap: SPACING.md },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  googleIcon: { fontFamily: FONTS.extraBold, fontSize: 18, color: '#4285F4' },
  googleTxt:  { fontFamily: FONTS.bold, fontSize: 16, color: '#1f2937' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dividerLine: { flex: 1, height: 1 },
  dividerTxt: { fontFamily: FONTS.regular, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  error: { color: '#ef4444', fontFamily: FONTS.regular, fontSize: 13 },
  emailBtn: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  emailBtnTxt: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
