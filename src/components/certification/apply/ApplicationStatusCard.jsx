'use client';
import React from 'react';
import Link from 'next/link';
import { FaRegClock, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';

const STATUS_CONFIG = {
  submitted: {
    Icon: FaRegClock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    title: 'Application under review',
    message: "We've received your application and it's in the queue for review. We'll notify you as soon as a decision is made.",
  },
  under_review: {
    Icon: FaSearch,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: 'Application under review',
    message: 'Our team is reviewing your application. This usually takes a few business days.',
  },
  approved: {
    Icon: FaCheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    title: 'Application approved',
    message: "Congratulations! You now have full access to the certification builder tools.",
  },
  rejected: {
    Icon: FaTimesCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    title: 'Application not approved',
    message: 'Your application was not approved this time.',
  },
};

/**
 * Pending-review / approved / rejected status card for a QTE or Institution creator
 * application (KAN-88). ``rejectedReason`` and ``reapplyHref`` only apply to the rejected
 * state; ``approvedCtaHref``/``approvedCtaLabel`` only apply to the approved state.
 */
const ApplicationStatusCard = ({ applicationStatus, rejectedReason, reapplyHref, approvedCtaHref, approvedCtaLabel }) => {
  const config = STATUS_CONFIG[applicationStatus];
  if (!config) return null;

  const { Icon, color, bg, title, message } = config;

  return (
    <div className={`rounded-xl border p-5 flex gap-4 items-start ${bg}`}>
      <Icon className={`text-2xl mt-1 flex-shrink-0 ${color}`} />
      <div>
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <p className="text-sm text-gray-700 mt-1">{message}</p>
        {applicationStatus === 'rejected' && rejectedReason ? (
          <p className="text-sm text-gray-800 bg-white border border-red-200 rounded-lg px-3 py-2 mt-3">
            <strong>Reason:</strong> {rejectedReason}
          </p>
        ) : null}
        {applicationStatus === 'rejected' && reapplyHref ? (
          <Link
            href={reapplyHref}
            className="inline-block mt-3 text-sm font-medium text-green-700 hover:text-green-800 underline"
          >
            Update and re-apply
          </Link>
        ) : null}
        {applicationStatus === 'approved' && approvedCtaHref ? (
          <Link
            href={approvedCtaHref}
            className="inline-block mt-3 text-sm font-medium bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
          >
            {approvedCtaLabel || 'Get started'}
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default ApplicationStatusCard;
