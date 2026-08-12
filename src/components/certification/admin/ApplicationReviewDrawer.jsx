'use client';
import React from 'react';
import Drawer from '@mui/material/Drawer';
import { MdClose } from 'react-icons/md';
import { BsPersonCheck, BsPersonX } from 'react-icons/bs';
import Button from '@/components/common/Button';

const STATUS_BADGE = {
  submitted: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
};

const Field = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 break-words">{String(value)}</p>
    </div>
  );
};

const DocumentLink = ({ label, url }) => {
  if (!url) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-green-700 hover:text-green-800 underline break-all"
      >
        View document
      </a>
    </div>
  );
};

/**
 * Read-only detail view for a QTE or Institution application (KAN-87/88 follow-up).
 * Renders directly off the row data already returned by the admin list endpoint
 * (AdminExpertQTEApplicationSerializer / AdminInstitutionApplicationSerializer already
 * return every submitted field, including the private document links) — no separate
 * fetch-by-id call needed.
 */
const ApplicationReviewDrawer = ({ application, applicationType, onClose, onApprove, onReject }) => {
  const open = !!application;
  const isQTE = applicationType === 'qte';
  const status = application?.application_status;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="w-[420px] max-w-[90vw] h-full flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isQTE ? 'QTE Application' : 'Institution Application'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <MdClose size={22} />
          </button>
        </div>

        {application ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {status ? (
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize mb-4 ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace('_', ' ')}
              </span>
            ) : null}

            {status === 'rejected' && application.rejected_reason ? (
              <div className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <strong>Rejected reason:</strong> {application.rejected_reason}
              </div>
            ) : null}

            {isQTE ? (
              <>
                <Field label="Name" value={`${application.first_name || ''} ${application.last_name || ''}`.trim()} />
                <Field label="Email" value={application.email} />
                <Field label="Legal Name" value={application.legal_name} />
                <Field label="Public Name" value={application.public_name} />
                <Field label="LinkedIn" value={application.linkedin} />
              </>
            ) : (
              <>
                <Field label="Legal Organization Name" value={application.legal_organization_name} />
                <Field label="Email" value={application.email} />
                <Field label="Registration Number" value={application.registration_number} />
                <Field label="Website" value={application.website} />
                <Field label="Contact Person" value={application.contact_person} />
                <Field label="Authorized Signer" value={application.authorized_signer} />
                <Field label="Tax ID" value={application.tax_id} />
              </>
            )}

            <Field label="Country" value={application.country} />
            <Field label="Timezone" value={application.timezone} />
            <Field label="Teaching Experience (years)" value={application.teaching_experience_years} />
            <Field label="Prior Student Count" value={application.prior_student_count} />
            <Field label="Sample Curriculum" value={application.sample_curriculum} />
            <Field label="Sample Lecture Link" value={application.sample_lecture_link} />
            <Field label="Agreement Accepted" value={application.agreement_accepted ? 'Yes' : 'No'} />
            <Field label="Submitted" value={application.created_at} />

            {isQTE ? (
              <>
                <DocumentLink label="Government ID" url={application.government_id_file} />
                <DocumentLink label="Resume" url={application.resume_file} />
              </>
            ) : (
              <DocumentLink label="Incorporation Document" url={application.incorporation_document} />
            )}
          </div>
        ) : null}

        {application && ['submitted', 'under_review'].includes(status) ? (
          <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => onReject(application)} className="flex-1">
              <BsPersonX className="mr-1" /> Reject
            </Button>
            <Button onClick={() => onApprove(application)} className="flex-1">
              <BsPersonCheck className="mr-1" /> Approve
            </Button>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
};

export default ApplicationReviewDrawer;
