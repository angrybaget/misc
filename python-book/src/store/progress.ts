import { create } from 'zustand';
import { GradeId, SubjectId } from '../data/types';
import { auth } from '../lib/firebase';
import { addUserProgressEntry } from '../lib/db';

type Key = string; // `${gradeId}:${subjectId}:${lessonId}`

function makeKey(gradeId: GradeId, subjectId: SubjectId, lessonId: number): Key {
  return `${gradeId}:${subjectId}:${lessonId}`;
}

interface ProgressState {
  completed: Set<Key>;
  markDone: (gradeId: GradeId, subjectId: SubjectId, lessonId: number) => void;
  isDone: (gradeId: GradeId, subjectId: SubjectId, lessonId: number) => boolean;
  countDone: (gradeId: GradeId, subjectId: SubjectId) => number;
  totalDone: () => number;
  load: (keys: string[]) => void;
  clear: () => void;
}

export const useProgress = create<ProgressState>((set, get) => ({
  completed: new Set(),

  markDone: (gradeId, subjectId, lessonId) => {
    const key = makeKey(gradeId, subjectId, lessonId);
    set((s) => ({ completed: new Set([...s.completed, key]) }));
    const uid = auth.currentUser?.uid;
    if (uid) addUserProgressEntry(uid, key);
  },

  isDone: (gradeId, subjectId, lessonId) =>
    get().completed.has(makeKey(gradeId, subjectId, lessonId)),

  countDone: (gradeId, subjectId) =>
    [...get().completed].filter((k) => k.startsWith(`${gradeId}:${subjectId}:`)).length,

  totalDone: () => get().completed.size,

  load: (keys: string[]) => set({ completed: new Set(keys) }),

  clear: () => set({ completed: new Set() }),
}));
