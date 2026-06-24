import {
  collection, doc, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc,
  arrayUnion, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Block, Lesson, SubjectContent, GradeId, SubjectId } from '../data/types';

// ── Collection helpers ───────────────────────────────────────────────────────

function lessonsCol(gradeId: GradeId, subjectId: SubjectId) {
  return collection(db, 'lessons', `${gradeId}_${subjectId}`, 'items');
}

// ── Public reads (no auth) ───────────────────────────────────────────────────

export async function fetchSubjectContent(
  gradeId: GradeId,
  subjectId: SubjectId,
): Promise<SubjectContent | null> {
  const metaRef = doc(db, 'lessons', `${gradeId}_${subjectId}`);
  const metaSnap = await getDoc(metaRef);
  if (!metaSnap.exists()) return null;

  const q = query(lessonsCol(gradeId, subjectId), orderBy('order'));
  const snap = await getDocs(q);
  const lessons: Lesson[] = snap.docs.map(d => docToLesson(d.data()));

  return {
    gradeId,
    subjectId,
    totalHours: metaSnap.data().totalHours ?? 0,
    lessons,
  };
}

export async function fetchLesson(
  gradeId: GradeId,
  subjectId: SubjectId,
  lessonId: number,
): Promise<Lesson | null> {
  const ref = doc(lessonsCol(gradeId, subjectId), String(lessonId));
  const snap = await getDoc(ref);
  return snap.exists() ? docToLesson(snap.data()) : null;
}

function docToLesson(data: Record<string, unknown>): Lesson {
  const blocks: Block[] = data.blocksJson
    ? JSON.parse(data.blocksJson as string)
    : (data.blocks as Block[] ?? []);
  return {
    id: data.id as number,
    title: data.title as string,
    intro: data.intro as string,
    blocks,
    ...(data.initialCode !== undefined ? { initialCode: data.initialCode as string } : {}),
  };
}

// ── Admin writes (require auth) ──────────────────────────────────────────────

export async function saveLesson(
  gradeId: GradeId,
  subjectId: SubjectId,
  lesson: Lesson,
): Promise<void> {
  const ref = doc(lessonsCol(gradeId, subjectId), String(lesson.id));
  // blocks stored as JSON string — Firestore rejects nested arrays (table rows: string[][])
  await setDoc(ref, {
    id: lesson.id,
    title: lesson.title,
    intro: lesson.intro,
    order: lesson.id,
    blocksJson: JSON.stringify(lesson.blocks),
    ...(lesson.initialCode !== undefined ? { initialCode: lesson.initialCode } : {}),
  });
}

export async function deleteLesson(
  gradeId: GradeId,
  subjectId: SubjectId,
  lessonId: number,
): Promise<void> {
  await deleteDoc(doc(lessonsCol(gradeId, subjectId), String(lessonId)));
}

// ── User progress ────────────────────────────────────────────────────────────

export async function loadUserProgress(userId: string): Promise<string[]> {
  const snap = await getDoc(doc(db, 'userProgress', userId));
  return snap.exists() ? (snap.data().completed as string[] ?? []) : [];
}

export async function addUserProgressEntry(userId: string, key: string): Promise<void> {
  await setDoc(
    doc(db, 'userProgress', userId),
    { completed: arrayUnion(key) },
    { merge: true },
  );
}

// ── Admin writes (require auth) — lesson meta ────────────────────────────────

export async function updateLessonMeta(
  gradeId: GradeId,
  subjectId: SubjectId,
  data: Partial<Lesson>,
): Promise<void> {
  const ref = doc(db, 'lessons', `${gradeId}_${subjectId}`);
  await updateDoc(ref, data as Record<string, unknown>);
}
