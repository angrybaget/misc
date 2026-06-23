import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export type UploadProgress = { state: 'running'; percent: number } | { state: 'done'; url: string } | { state: 'error'; message: string };

export function uploadLessonImage(
  file: File,
  gradeId: number,
  subjectId: string,
  lessonId: number | string,
  onProgress: (p: UploadProgress) => void,
): () => void {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `lesson-images/${gradeId}_${subjectId}/${lessonId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

  task.on(
    'state_changed',
    snap => onProgress({ state: 'running', percent: Math.round((snap.bytesTransferred / snap.totalBytes) * 100) }),
    err => onProgress({ state: 'error', message: err.message }),
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      onProgress({ state: 'done', url });
    },
  );

  return () => task.cancel();
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // ignore — file may already be deleted
  }
}
