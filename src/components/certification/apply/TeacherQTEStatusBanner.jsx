'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FaAward } from 'react-icons/fa';
import queryKeys from '@/utils/query-keys';
import { getMyQTEApplication } from '@/services/private/certification/application';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';

/**
 * Shown at the top of the Teacher dashboard (KAN-88). Every Expert has a row with
 * ``creator_type='expert'``/``application_status='draft'`` by default until they apply for
 * QTE — in that state we show a CTA instead of a status card.
 */
const TeacherQTEStatusBanner = () => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.myQTEApplication],
    queryFn: getMyQTEApplication,
    select: res => res?.data,
    retry: false,
  });

  if (isLoading || !data) return null;

  if (data.creator_type !== 'qte' || data.application_status === 'draft') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FaAward className="text-2xl text-green-700 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-800">Become a Qualified Teaching Expert</h3>
            <p className="text-sm text-gray-700 mt-1">
              Apply for QTE status to unlock certification-program building and issuance tools.
            </p>
          </div>
        </div>
        <Link
          href="/portal/teacher/apply-qte"
          className="whitespace-nowrap text-sm font-medium bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
        >
          Apply Now
        </Link>
      </div>
    );
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
