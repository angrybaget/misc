import { SubjectContent, GradeId, SubjectId } from '../types';
import { INFORMATYKA } from './informatyka';
import { MATEMATYKA } from './matematyka';
import { ALGEBRA } from './algebra';
import { GEOMETRIYA } from './geometriya';

export const ALL_CONTENT: SubjectContent[] = [
  ...INFORMATYKA,
  ...MATEMATYKA,
  ...ALGEBRA,
  ...GEOMETRIYA,
];

export function getContent(gradeId: GradeId, subjectId: SubjectId): SubjectContent | undefined {
  return ALL_CONTENT.find(
    (c) => c.gradeId === gradeId && c.subjectId === subjectId,
  );
}
