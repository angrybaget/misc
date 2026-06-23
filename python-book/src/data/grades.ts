import { GradeId, SubjectId } from './types';

export interface GradeDef {
  id: GradeId;
  label: string;
  emoji: string;
  color: string;
  subjects: SubjectId[];
}

export const GRADES: GradeDef[] = [
  {
    id: 5,
    label: '5 клас',
    emoji: '🌱',
    color: '#10b981',
    subjects: ['informatyka', 'matematyka'],
  },
  {
    id: 6,
    label: '6 клас',
    emoji: '📐',
    color: '#3b82f6',
    subjects: ['informatyka', 'matematyka'],
  },
  {
    id: 7,
    label: '7 клас',
    emoji: '⚡',
    color: '#8b5cf6',
    subjects: ['informatyka', 'algebra', 'geometriya'],
  },
  {
    id: 8,
    label: '8 клас',
    emoji: '🔥',
    color: '#f59e0b',
    subjects: ['informatyka', 'algebra', 'geometriya'],
  },
  {
    id: 9,
    label: '9 клас',
    emoji: '🚀',
    color: '#ef4444',
    subjects: ['informatyka', 'algebra', 'geometriya'],
  },
];
