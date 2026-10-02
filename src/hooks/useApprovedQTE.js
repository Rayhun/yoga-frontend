'use client';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getMyQTEApplication } from '@/services/private/certification/application';
import { getMyPrograms } from '@/services/private/certification/program';

export const NEW_CERTIFICATION_PROGRAM_HREF = '/portal/teacher/certification/programs/builder/new';

/**
 * Whether the signed-in Expert is an approved QTE (the same check, and the same queryKey, as the
 * sidebar and the program-builder route guard — so this is normally a cache hit).
 *
 * Approved QTEs don't use Guided Experiences (hidden from their sidebar), so the onboarding screens
 * use this to swap that step for creating a Certification Program and to stop requiring one.
 *
 * - `enabled`: pass false for roles that can't be a QTE (the /portal landing page serves every role).
 * - `withPrograms`: also load the creator's programs, to fill in `needsFirstProgram`.
 * - `isLoading`: the QTE status is still being fetched, so callers can hold back steps that depend
 *   on the answer instead of flashing the wrong one.
 */
const useApprovedQTE = ({ enabled = true, withPrograms = false } = {}) => {
  const { data: application, isLoading } = useQuery({
    queryKey: [queryKeys.myQTEApplication],
    queryFn: getMyQTEApplication,
    select: res => res?.data,
    retry: false,
    enabled,
  });
  const isApprovedQTE = application?.creator_type === 'qte' && application?.application_status === 'approved';

  const { data: programs } = useQuery({
    queryKey: [queryKeys.certificationMyPrograms],
    queryFn: getMyPrograms,
    select: res => res?.data,
    enabled: withPrograms && isApprovedQTE,
    retry: false,
  });
  const needsFirstProgram = isApprovedQTE && Array.isArray(programs) && programs.length === 0;

  return { isApprovedQTE, isLoading, needsFirstProgram };
};

export default useApprovedQTE;
