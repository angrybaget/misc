import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAdminStore } from '../../src/store/admin';

export default function AdminLayout() {
  const { user, loading } = useAdminStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const segs = segments as string[];
    if (!user && segs[0] === 'admin') {
      router.replace('/' as any);
    }
  }, [user, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
