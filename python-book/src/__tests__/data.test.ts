import { GRADES } from '../data/grades';
import { SUBJECTS } from '../data/subjects';
import { ALL_CONTENT } from '../data/curriculum/index';
import type { Block, Lesson, GradeId, SubjectId } from '../data/types';

// ── GRADES ───────────────────────────────────────────────────────────────────

describe('GRADES', () => {
  it('has 5 grades (5–9)', () => {
    expect(GRADES.map(g => g.id)).toEqual([5, 6, 7, 8, 9]);
  });

  it('every grade has required fields', () => {
    for (const g of GRADES) {
      expect(g.id).toBeGreaterThanOrEqual(5);
      expect(g.label).toBeTruthy();
      expect(g.emoji).toBeTruthy();
      expect(g.color).toMatch(/^#/);
      expect(Array.isArray(g.subjects)).toBe(true);
      expect(g.subjects.length).toBeGreaterThan(0);
    }
  });

  it('grades 5–6 have matematyka, grades 7–9 have algebra + geometriya', () => {
    const lower = GRADES.filter(g => g.id <= 6);
    const upper = GRADES.filter(g => g.id >= 7);
    for (const g of lower) expect(g.subjects).toContain('matematyka');
    for (const g of upper) {
      expect(g.subjects).toContain('algebra');
      expect(g.subjects).toContain('geometriya');
    }
  });

  it('all grades have informatyka', () => {
    for (const g of GRADES) expect(g.subjects).toContain('informatyka');
  });
});

// ── SUBJECTS ─────────────────────────────────────────────────────────────────

describe('SUBJECTS', () => {
  const EXPECTED_SUBJECTS: SubjectId[] = ['informatyka', 'matematyka', 'algebra', 'geometriya'];

  it('has all expected subject keys', () => {
    for (const id of EXPECTED_SUBJECTS) expect(SUBJECTS[id]).toBeDefined();
  });

  it('every subject has title, emoji and color', () => {
    for (const id of EXPECTED_SUBJECTS) {
      const s = SUBJECTS[id];
      expect(s.title).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(s.color).toMatch(/^#/);
    }
  });
});

// ── ALL_CONTENT ───────────────────────────────────────────────────────────────

describe('ALL_CONTENT', () => {
  it('has at least 13 subject-grade combinations', () => {
    expect(ALL_CONTENT.length).toBeGreaterThanOrEqual(13);
  });

  it('every entry has gradeId, subjectId, lessons array', () => {
    for (const c of ALL_CONTENT) {
      expect([5, 6, 7, 8, 9]).toContain(c.gradeId);
      expect(c.subjectId).toBeTruthy();
      expect(Array.isArray(c.lessons)).toBe(true);
      expect(c.lessons.length).toBeGreaterThan(0);
      expect(c.totalHours).toBeGreaterThan(0);
    }
  });

  it('lesson ids are unique within each subject', () => {
    for (const c of ALL_CONTENT) {
      const ids = c.lessons.map(l => l.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });

  it('every lesson has title, intro and non-empty blocks', () => {
    for (const c of ALL_CONTENT) {
      for (const lesson of c.lessons) {
        expect(lesson.title).toBeTruthy();
        expect(lesson.intro).toBeTruthy();
        expect(lesson.blocks.length).toBeGreaterThan(0);
      }
    }
  });

  it('every block has a valid type', () => {
    const VALID_TYPES = new Set<Block['type']>([
      'h3', 'p', 'code', 'tip', 'note', 'warning',
      'list', 'table', 'quiz', 'quiz-multi', 'fill', 'image',
    ]);
    for (const c of ALL_CONTENT) {
      for (const lesson of c.lessons) {
        for (const block of lesson.blocks) {
          expect(VALID_TYPES.has(block.type)).toBe(true);
        }
      }
    }
  });

  it('quiz blocks have 4 options and valid correct index', () => {
    for (const c of ALL_CONTENT) {
      for (const lesson of c.lessons) {
        for (const block of lesson.blocks) {
          if (block.type === 'quiz') {
            expect(block.options.length).toBe(4);
            expect(block.correct).toBeGreaterThanOrEqual(0);
            expect(block.correct).toBeLessThan(block.options.length);
            expect(block.explanation).toBeTruthy();
          }
        }
      }
    }
  });

  it('table blocks have matching header and row column counts', () => {
    for (const c of ALL_CONTENT) {
      for (const lesson of c.lessons) {
        for (const block of lesson.blocks) {
          if (block.type === 'table') {
            expect(block.headers.length).toBeGreaterThan(0);
            for (const row of block.rows) {
              expect(row.length).toBe(block.headers.length);
            }
          }
        }
      }
    }
  });
});
