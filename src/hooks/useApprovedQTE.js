'use client';
import { useQuery } from '@tanstack/react-query';
import useAuthContext from '@/hooks/useAuthContext';
import queryKeys from '@/utils/query-keys';
import { getQteTrackState } from '@/utils/qteTrack';
import { getMyQTEApplication } from '@/services/private/certification/application';
import { getMyPrograms } from '@/services/private/certification/program';

export const NEW_CERTIFICATION_PROGRAM_HREF = '/portal/teacher/certification/programs/builder/new';

/**
 * The signed-in user's QTE-track state — the one place the "is this a QTE / is it locked / is it approved"
 * predicate lives (sidebar, /portal, the /portal/teacher guard, the dashboards and the program-builder guard
 * all read it).
 *
 * It comes straight from the auth payload (`profile.creator_type` / `application_status` / `rejected_reason`),
 * so there is no request and no loading flash. Only against a backend that does not send those keys yet does
 * it fall back to `GET /certification/apply/expert-qte/me/` (same queryKey as before).
 *
 * Returned (see utils/qteTrack.js): `view` ('loading' | 'not-qte' | 'locked' | 'suspended' | 'unlocked'),
 * `isQteTrack`, `isApproved`, `isRejected`, `applicationStatus`, `rejectedReason`, plus:
 * - `isApprovedQTE`: creator_type 'qte' AND status 'approved' — the creator-tools check, unchanged.
 * - `isLoading`: the profile (or the fallback answer) is not here yet; callers hold back role-specific UI.
 * - `needsFirstProgram`: with `withPrograms`, an approved QTE that has no program yet.
 *
 * `application_status` is only read when creator_type is 'qte' (a plain Expert reports "draft" by default).
 * `enabled: false` only switches off the fallback request.
 */
const useApprovedQTE = ({ enabled = true, withPrograms = false } = {}) => {
  const { user } = useAuthContext();
  const profile = user?.profile;
  const profileHasQteFields = Boolean(profile) && 'creator_type' in profile;
  const needsFallback = enabled && profile?.role === 'Teacher' && !profileHasQteFields;

  const { data: application, isLoading: isFallbackLoading } = useQuery({
    queryKey: [queryKeys.myQTEApplication],
    queryFn: getMyQTEApplication,
    select: res => res?.data,
    retry: false,
    enabled: needsFallback,
  });

  let source = profile;
  if (needsFallback) source = application ? { role: profile.role, ...application } : isFallbackLoading ? null : profile;
  const qte = getQteTrackState(source);
  const isApprovedQTE = qte.isQteTrack && qte.isApproved;

  const { data: programs } = useQuery({
    queryKey: [queryKeys.certificationMyPrograms],
    queryFn: getMyPrograms,
    select: res => res?.data,
    enabled: withPrograms && isApprovedQTE,
    retry: false,
  });
  const needsFirstProgram = isApprovedQTE && Array.isArray(programs) && programs.length === 0;

  return { ...qte, isApprovedQTE, needsFirstProgram };
};

export default useApprovedQTE;
