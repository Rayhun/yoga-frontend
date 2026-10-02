'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getMyQTEApplication } from '@/services/private/certification/application';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';

/**
 * Shown at the top of the Teacher dashboard (KAN-88). Renders nothing for an Expert who
 * hasn't applied for QTE yet (creator_type='expert'/application_status='draft', the default
 * row) — QTE signup now happens only via the ?type=qte link the client sends directly
 * (KAN-120), not an in-app discovery CTA. Once an application exists, shows its
 * submitted/under_review/rejected status.
 */
const TeacherQTEStatusBanner = () => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.myQTEApplication],
    queryFn: getMyQTEApplication,
    select: res => res?.data,
    retry: false,
  });

  if (isLoading || !data) return null;

  // "Not yet applied" state (creator_type='expert'/application_status='draft', the default
  // row) previously showed an in-app "Apply Now" CTA here. Per client instruction, that
  // discovery CTA is removed — QTE signup now happens only via the ?type=qte link the client
  // sends directly (KAN-120). Every other state (submitted/under_review/rejected/approved)
  // is unaffected since creator_type flips to 'qte' as soon as an application is submitted
  // and never reverts (see ExpertQTEApplyAPI), so this branch never overlaps those.
  if (data.creator_type !== 'qte' || data.application_status === 'draft') {
    return null;
  }

  // Once approved, the "Certification Programs" sidebar link (KAN-86/88) is the permanent
  // entry point to program creation — don't keep showing the approved banner on every
  // dashboard visit indefinitely.
  if (data.application_status === 'approved') return null;

  return (
    <div className="mb-4">
      <ApplicationStatusCard
        applicationStatus={data.application_status}
        rejectedReason={data.rejected_reason}
        reapplyHref="/portal/teacher/apply-qte"
      />
    </div>
  );
};

export default TeacherQTEStatusBanner;
