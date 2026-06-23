import { useState, useEffect } from 'react';
import { fetchSubjectContent } from '../lib/db';
import type { SubjectContent, GradeId, SubjectId } from '../data/types';

type State = { data: SubjectContent | null; loading: boolean; error: string | null };

export function useSubjectContent(gradeId: GradeId, subjectId: SubjectId): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetchSubjectContent(gradeId, subjectId)
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(e => { if (!cancelled) setState({ data: null, loading: false, error: e.message }); });
    return () => { cancelled = true; };
  }, [gradeId, subjectId]);

  return state;
}
