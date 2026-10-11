'use client';
import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  builderUrl,
  getBuilderBasePath,
  getResumePosition,
  parseBuilderUrl,
  replaceUrlAfterCreate,
  resolvePosition,
} from '@/components/certification/builder/builderUrlState';

/**
 * The Program Builder's position (step / Basics part / selected curriculum item), read from the URL — the
 * single source of truth, so reload, shared links and back/forward all work (see builderUrlState.js).
 *
 * - A URL with a valid `step` is used as is. Without one, an existing program opens at its first incomplete
 *   publish check; that answer is computed ONCE (frozen) — otherwise the screen would jump around as the creator
 *   completes checks — and written into the URL with a replace. A new program starts at the beginning.
 * - Moving between steps / Basics parts pushes a history entry (Back/Forward walk through them); picking a
 *   curriculum item only replaces the URL, so it doesn't flood the history.
 * - When the draft is created the URL changes from /new to the real id; the position is carried over in the
 *   same replace, and the id is remembered immediately (a ref) so a move made in the same tick targets the
 *   new URL instead of /new.
 */
const useBuilderPosition = ({ liveId, program }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Captured once: the pathname changes from …/new to …/<id> while this component may stay mounted.
  const basePathRef = useRef(null);
  if (basePathRef.current === null) basePathRef.current = getBuilderBasePath(pathname);
  const programIdRef = useRef(liveId);
  if (liveId) programIdRef.current = liveId;

  const parsed = parseBuilderUrl(searchParams);
  const resumeRef = useRef(null);
  if (liveId && program && !parsed.step && !resumeRef.current) resumeRef.current = getResumePosition(program);
  const position = resolvePosition(parsed, { hasProgram: Boolean(liveId), resume: resumeRef.current });
  const positionRef = useRef(position);
  positionRef.current = position;

  // Write the resume point into the URL so a reload (or a copied link) lands in the same place.
  const needsNormalizing = Boolean(liveId && resumeRef.current && !parsed.step);
  useEffect(() => {
    if (!needsNormalizing) return;
    router.replace(builderUrl({ basePath: basePathRef.current, programId: programIdRef.current, position: positionRef.current }));
  }, [needsNormalizing, router]);

  const navigate = useCallback(
    (next, { replace = false } = {}) => {
      const target = builderUrl({
        basePath: basePathRef.current,
        programId: programIdRef.current,
        position: { ...positionRef.current, ...next },
      });
      if (replace) router.replace(target);
      else router.push(target);
    },
    [router]
  );

  const goTo = useCallback(next => navigate(next), [navigate]);
  // Only meaningful (and only written) while the curriculum is the open step.
  const selectItem = useCallback(
    item => {
      if (positionRef.current.step === 'curriculum') navigate({ item }, { replace: true });
    },
    [navigate]
  );
  const adoptCreatedProgram = useCallback(
    programId => {
      programIdRef.current = programId;
      replaceUrlAfterCreate({ router, basePath: basePathRef.current, programId, position: positionRef.current });
    },
    [router]
  );

  return { position, goTo, selectItem, adoptCreatedProgram };
};

export default useBuilderPosition;
