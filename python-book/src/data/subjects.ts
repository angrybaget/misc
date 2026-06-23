import { SubjectId } from './types';

export interface SubjectDef {
  id: SubjectId;
  title: string;
  emoji: string;
  color: string;
  description: string;
}

export const SUBJECTS: Record<SubjectId, SubjectDef> = {
  informatyka: {
    id: 'informatyka',
    title: 'Інформатика',
    emoji: '💻',
    color: '#6366f1',
    description: 'Алгоритми, програмування, цифрові технології',
  },
  matematyka: {
    id: 'matematyka',
    title: 'Математика',
    emoji: '🔢',
    color: '#0ea5e9',
    description: 'Числа, функції, рівняння, геометрія',
  },
  algebra: {
    id: 'algebra',
    title: 'Алгебра',
    emoji: '📊',
    color: '#f59e0b',
    description: 'Вирази, рівняння, функції, прогресії',
  },
  geometriya: {
    id: 'geometriya',
    title: 'Геометрія',
    emoji: '📐',
    color: '#10b981',
    description: 'Фігури, теореми, площі, вектори',
  },
};
