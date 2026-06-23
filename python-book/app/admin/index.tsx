import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdminStore } from '../../src/store/admin';
import { useColors } from '../../src/hooks/useColors';
import { FONTS, RADIUS, SPACING } from '../../src/theme';

export default function AdminLoginScreen() {
  const { user, loading, signIn, error, init } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const C = useColors();

  useEffect(() => init(), []);

  useEffect(() => {
    if (!loading && user) router.replace('/admin/dashboard' as any);
  }, [user, loading]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setBusy(true);
    await signIn(email, password);
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView
      style={[s.bg, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.card}>
        <Text style={[s.title, { color: C.text }]}>Адмін-панель</Text>
        <Text style={[s.subtitle, { color: C.textMuted }]}>Вхід для вчителя</Text>

        <TextInput
          style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          placeholder="Email"
          placeholderTextColor={C.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          placeholder="Пароль"
          placeholderTextColor={C.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={s.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [s.btn, { opacity: pressed || busy ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={busy}
        >
          <Text style={s.btnText}>{busy ? 'Вхід…' : 'Увійти'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  card: { width: '100%', maxWidth: 400, gap: SPACING.md },
  title: { fontFamily: FONTS.extraBold, fontSize: 28 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1, borderRadius: RADIUS.md,
    padding: SPACING.md, fontFamily: FONTS.regular, fontSize: 15,
  },
  error: { color: '#e53e3e', fontFamily: FONTS.regular, fontSize: 13 },
  btn: {
    backgroundColor: '#4F46E5', borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
  },
  btnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
});
