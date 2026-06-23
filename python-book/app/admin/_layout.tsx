import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAdminStore } from '../../src/store/admin';

export default function AdminLayout() {
  const { user, loading, init } = useAdminStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => init(), []);

  useEffect(() => {
    if (loading) return;
    const segs = segments as string[];
    const inAdmin = segs[0] === 'admin';
    const onLogin = segs[1] === undefined || segs[1] === 'index';
    if (!user && inAdmin && !onLogin) {
      router.replace('/admin' as any);
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
