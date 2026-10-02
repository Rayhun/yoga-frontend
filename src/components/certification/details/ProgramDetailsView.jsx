/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaRegClock,
  FaPlayCircle,
  FaFileAlt,
  FaFilePdf,
  FaQuestionCircle,
  FaClipboardList,
  FaLink,
  FaRegFileImage,
} from 'react-icons/fa';
import Spinner from '@/components/common/loader/Spinner';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { getProgramCatalogDetail } from '@/services/private/certification/catalog';
import { checkoutCertificationProgram } from '@/services/private/certification/enrollment';

const CREATOR_TYPE_LABELS = { qte: 'Coach', expert: 'Coach', institution: 'Institution' };

const TARGET_AUDIENCE_LABELS = {
  career: 'Career Track',
  professional: 'Professional Track',
  both: 'Career & Professional',
};

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-600',
  private: 'bg-amber-100 text-amber-700',
  public: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-600',
};

const LESSON_ICON = {
  video: FaPlayCircle,
  text: FaFileAlt,
  pdf: FaFilePdf,
  quiz: FaQuestionCircle,
  assignment: FaClipboardList,
  link: FaLink,
};

const DetailSection = ({ title, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white dark:border-strokedark dark:bg-boxdark p-6">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{title}</h2>
    {children}
  </section>
);

/**
 * Single-program details page, shared by the customer-facing "view before you enroll" route
 * (``mode="learner"``, Discover grid cards link here now instead of enrolling directly) and the
 * QTE/Institution creator's read-only "preview" of their own program from their My Programs list
 * (``mode="preview"``). Both hit the same ``catalog-detail`` endpoint — a public program is
 * visible to anyone, a non-public one only to the creator who owns it (enforced server-side, so
 * a 404 here just means "not visible to you", not a bug).
 */
const ProgramDetailsView = ({ programId, mode = 'learner' }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: response,
    isFetching,
    failureReason,
  } = useQuery({
    queryFn: () => getProgramCatalogDetail({ id: programId }),
    queryKey: [queryKeys.certificationProgramCatalogDetail, programId],
    enabled: !!programId,
    retry: false,
  });

  useHandleApiResponse(failureReason);

  const { mutateAsync: checkout, isPending: isEnrolling } = useMutation({
    mutationFn: checkoutCertificationProgram,
  });

  const program = response?.data;

  const handleEnroll = async () => {
    if (isEnrolling || !program) return;

    if (program.payment_type === 'free') {
      try {
        await checkout({ id: program.id });
        queryClient.invalidateQueries({ queryKey: [queryKeys.certificationCatalog] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.certificationProgramCatalogDetail, program.id] });
        toast.success('Enrolled successfully!');
        router.push(`/portal/customer/certification?enrolled=${program.id}`);
      } catch (error) {
        toastApiError(error);
      }
      return;
    }

    router.push(`/payment/certification/${program.id}`);
  };

  if (isFetching) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        This program isn&apos;t available.
      </div>
    );
  }

  const isFree = program.payment_type === 'free';
  const isFull = program.seat_limit !== null && program.seats_remaining === 0;
  const hasPolicies = program.refund_policy || program.completion_deadline_days || program.code_of_conduct || program.disclaimer;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {mode === 'preview' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
          Preview — this is how learners will see this program.
        </div>
      ) : null}

      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-strokedark shadow-lg bg-white dark:bg-boxdark">
        <div className="h-56 w-full bg-gray-100 dark:bg-form-input flex items-center justify-center overflow-hidden">
          {program.thumbnail ? (
            <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
          ) : (
            <FaRegFileImage className="text-5xl text-gray-300" />
          )}
        </div>

        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {program.creator_type ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                {CREATOR_TYPE_LABELS[program.creator_type] || 'Coach'}
              </span>
            ) : null}
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {TARGET_AUDIENCE_LABELS[program.target_audience] || program.target_audience}
            </span>
            {mode === 'preview' ? (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[program.status] || 'bg-gray-100 text-gray-600'}`}>
                {program.status}
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{program.title}</h1>
          {program.subtitle ? <p className="text-gray-500 dark:text-gray-400">{program.subtitle}</p> : null}
          {program.creator_display_name ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">By {program.creator_display_name}</p>
          ) : null}
          {program.short_description ? <p className="text-gray-700 dark:text-gray-300">{program.short_description}</p> : null}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {program.duration_estimate ? (
              <span className="flex items-center gap-1.5">
                <FaRegClock /> {program.duration_estimate}
              </span>
            ) : null}
            {program.level ? <span className="capitalize">{program.level}</span> : null}
            {program.language ? <span>{program.language}</span> : null}
            {program.module_count ? (
              <span>
                {program.module_count} module{program.module_count === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>

          {mode === 'learner' ? (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-strokedark">
              <span className="text-xl font-bold text-green-600">
                {isFree ? 'Free' : `${program.currency} ${program.price}`}
              </span>
              {isFull ? (
                <span className="text-sm font-semibold text-red-500">Full</span>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-60"
                >
                  {isEnrolling ? 'Processing…' : 'Enroll'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {program.full_description ? (
        <DetailSection title="About this program">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{program.full_description}</p>
        </DetailSection>
      ) : null}

      {program.modules?.length > 0 ? (
        <DetailSection title="Curriculum">
          <div className="flex flex-col gap-4">
            {program.modules.map(module => (
              <div key={module.id}>
                <h4 className="font-semibold text-gray-800 dark:text-white">{module.title}</h4>
                {module.description ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{module.description}</p>
                ) : null}
                <ul className="mt-2 flex flex-col gap-1.5">
                  {module.lessons.map(lesson => {
                    const LessonIcon = LESSON_ICON[lesson.lesson_type] || FaFileAlt;
                    return (
                      <li key={lesson.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <LessonIcon className="text-gray-400 flex-shrink-0" />
                        <span>{lesson.title}</span>
                        {lesson.duration ? <span className="text-gray-400">· {lesson.duration}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {program.certificate_setting ? (
        <DetailSection title="Certificate">
          <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">{program.certificate_setting.certificate_title}</p>
            {program.certificate_setting.completion_rules ? <p>{program.certificate_setting.completion_rules}</p> : null}
            {program.certificate_setting.primary_issuer_name ? (
              <p>Issued by {program.certificate_setting.primary_issuer_name}</p>
            ) : null}
            {program.certificate_setting.expiry_period_days ? (
              <p>Valid for {program.certificate_setting.expiry_period_days} days after issuance</p>
            ) : null}
          </div>
        </DetailSection>
      ) : null}

      {hasPolicies ? (
        <DetailSection title="Policies">
          <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
            {program.refund_policy ? (
              <p>
                <strong>Refund Policy:</strong> {program.refund_policy}
              </p>
            ) : null}
            {program.completion_deadline_days ? (
              <p>
                <strong>Completion Deadline:</strong> {program.completion_deadline_days} days after enrollment
              </p>
            ) : null}
            {program.code_of_conduct ? (
              <p>
                <strong>Code of Conduct:</strong> {program.code_of_conduct}
              </p>
            ) : null}
            {program.disclaimer ? <p className="text-xs text-gray-400">{program.disclaimer}</p> : null}
          </div>
        </DetailSection>
      ) : null}
    </div>
  );
};

export default ProgramDetailsView;
