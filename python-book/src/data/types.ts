export type Block =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'code'; text: string }
  | { type: 'tip' | 'note' | 'warning'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quiz'; question: string; options: string[]; correct: number; explanation: string }
  | { type: 'fill'; problem: string; hint: string; answer: string }
  | { type: 'image'; uri: string; caption: string };

export interface TeacherNote {
  summary: string;
  mustKnow: string[];
  lessonPlan: string[];
}

export interface Lesson {
  id: number;
  title: string;
  intro: string;
  blocks: Block[];
  initialCode?: string;
  teacher?: TeacherNote;
}

export type SubjectId = 'informatyka' | 'matematyka' | 'algebra' | 'geometriya';
export type GradeId = 5 | 6 | 7 | 8 | 9;

export interface SubjectContent {
  gradeId: GradeId;
  subjectId: SubjectId;
  totalHours: number;
  lessons: Lesson[];
}
