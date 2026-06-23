import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, memoryLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Offline persistence: IndexedDB on web, memory on native
export const db = initializeFirestore(app, {
  localCache: Platform.OS === 'web' ? persistentLocalCache() : memoryLocalCache(),
});

export const auth = getAuth(app);
