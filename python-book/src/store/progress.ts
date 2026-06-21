import { create } from 'zustand';

interface ProgressState {
  completed: Set<number>;
  markDone: (id: number) => void;
  isDone: (id: number) => boolean;
  totalDone: () => number;
}

export const useProgress = create<ProgressState>((set, get) => ({
  completed: new Set(),
  markDone: (id) => set((s) => ({ completed: new Set([...s.completed, id]) })),
  isDone: (id) => get().completed.has(id),
  totalDone: () => get().completed.size,
}));
