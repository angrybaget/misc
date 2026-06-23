import { create } from 'zustand';
import { GradeId, SubjectId } from '../data/types';

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
}

export const useProgress = create<ProgressState>((set, get) => ({
  completed: new Set(),
  markDone: (gradeId, subjectId, lessonId) =>
    set((s) => ({ completed: new Set([...s.completed, makeKey(gradeId, subjectId, lessonId)]) })),
  isDone: (gradeId, subjectId, lessonId) =>
    get().completed.has(makeKey(gradeId, subjectId, lessonId)),
  countDone: (gradeId, subjectId) =>
    [...get().completed].filter((k) => k.startsWith(`${gradeId}:${subjectId}:`)).length,
  totalDone: () => get().completed.size,
}));
