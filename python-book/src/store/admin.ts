import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AdminStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  init: () => () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Помилка входу';
      set({ error: msg.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, '') });
    }
  },

  signOut: async () => {
    await fbSignOut(auth);
    set({ user: null });
  },

  init: () => onAuthStateChanged(auth, (user) => set({ user, loading: false })),
}));
