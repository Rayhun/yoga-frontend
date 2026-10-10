'use client';
import { useCallback, useEffect, useRef } from 'react';
import useSectionAutosave from '@/hooks/useSectionAutosave';

/**
 * One autosave lane of an edit pane (a module's fields, a lesson's fields, a lesson's quiz): the
 * shared debounce / skip-if-unchanged / retry hook, started from the values the pane was opened with
 * so the first blur doesn't re-save them. `exists()` guards a save that fires after the item was
 * deleted, and `discard()` drops everything still pending for an item the user chose to abandon.
 */
const usePaneAutosave = ({ save, baseline, exists = () => true }) => {
  const discardedRef = useRef(false);
  const saveRef = useRef(save);
  const existsRef = useRef(exists);
  saveRef.current = save;
  existsRef.current = exists;

  const autosave = useSectionAutosave(async payload => {
    if (discardedRef.current || !existsRef.current()) return undefined;
    return saveRef.current(payload);
  });

  const { markSaved } = autosave;
  useEffect(() => {
    markSaved(baseline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discard = useCallback(() => {
    discardedRef.current = true;
  }, []);

  return { ...autosave, discard };
};

export default usePaneAutosave;
