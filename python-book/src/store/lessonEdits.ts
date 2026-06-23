import { create } from 'zustand';
import { Block } from '../data/types';

interface LessonEditsStore {
  overrides: Record<string, Block[]>;
  getBlocks: (key: string, original: Block[]) => Block[];
  hasOverride: (key: string) => boolean;
  addBlock: (key: string, block: Block, original: Block[]) => void;
  removeBlock: (key: string, index: number, original: Block[]) => void;
  reset: (key: string) => void;
}

export function makeLessonKey(gradeId: number, subjectId: string, lessonId: number): string {
  return `${gradeId}:${subjectId}:${lessonId}`;
}

export const useLessonEditsStore = create<LessonEditsStore>((set, get) => ({
  overrides: {},

  getBlocks: (key, original) => get().overrides[key] ?? original,

  hasOverride: (key) => key in get().overrides,

  addBlock: (key, block, original) =>
    set((s) => ({
      overrides: {
        ...s.overrides,
        [key]: [...(s.overrides[key] ?? original), block],
      },
    })),

  removeBlock: (key, index, original) =>
    set((s) => {
      const current = s.overrides[key] ?? original;
      return {
        overrides: {
          ...s.overrides,
          [key]: current.filter((_, i) => i !== index),
        },
      };
    }),

  reset: (key) =>
    set((s) => {
      const next = { ...s.overrides };
      delete next[key];
      return { overrides: next };
    }),
}));
