import { create } from 'zustand';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { Platform, Linking } from 'react-native';
import { auth } from '../lib/firebase';
import { loadUserProgress } from '../lib/db';
import { useProgress } from './progress';

const GOOGLE_PROVIDER = new GoogleAuthProvider();

interface UserStore {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  init: () => () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,

  signInWithGoogle: async () => {
    if (Platform.OS !== 'web') {
      Linking.openURL('https://school28-d2877.web.app');
      return;
    }
    await signInWithPopup(auth, GOOGLE_PROVIDER);
  },

  signOut: async () => {
    await fbSignOut(auth);
  },

  init: () =>
    onAuthStateChanged(auth, async (user) => {
      set({ user, loading: false });
      if (user) {
        const keys = await loadUserProgress(user.uid);
        useProgress.getState().load(keys);
      } else {
        useProgress.getState().clear();
      }
    }),
}));
