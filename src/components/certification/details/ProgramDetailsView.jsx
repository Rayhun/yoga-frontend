/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import LinearProgress from '@mui/material/LinearProgress';
import {
  FaRegClock,
  FaPlayCircle,
  FaFileAlt,
  FaFilePdf,
  FaQuestionCircle,
  FaClipboardList,
  FaLink,
  FaRegFileImage,
  FaBookOpen,
  FaUser,
  FaPlay,
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

const LESSON_ICON = {
  video: FaPlayCircle,
  text: FaFileAlt,
  pdf: FaFilePdf,
  quiz: FaQuestionCircle,
  assignment: FaClipboardList,
  link: FaLink,
};

const DETAIL_TABS = {
  JOURNEY: 'journey',
  DESCRIPTION: 'description',
  BENEFITS: 'benefits',
};

const ProgramDetailsView = ({ programId, mode = 'learner' }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(DETAIL_TABS.JOURNEY);

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
  const outcomes = program.outcomes ? program.outcomes.split('\n').filter(Boolean) : [];
  const benefits = program.outcomes ? program.outcomes.split('\n').filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {mode === 'preview' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
          Preview — this is how learners will see this program.
        </div>
      ) : null}

      {/* Hero Card */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-strokedark shadow-lg bg-white dark:bg-boxdark">
        <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-form-input overflow-hidden">
          {program.thumbnail ? (
            <Image
              src={program.thumbnail}
              alt={program.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaRegFileImage className="text-5xl text-gray-300" />
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col gap-3">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {program.creator_type ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                {CREATOR_TYPE_LABELS[program.creator_type] || 'Coach'}
              </span>
            ) : null}
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {TARGET_AUDIENCE_LABELS[program.target_audience] || program.target_audience}
            </span>
          </div>

          {/* Title & Info */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{program.title}</h1>
          {program.subtitle ? <p className="text-gray-500 dark:text-gray-400">{program.subtitle}</p> : null}
          {program.creator_display_name ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaUser size={12} className="text-purple-500" />
              <span>By {program.creator_display_name}</span>
            </div>
          ) : null}
          {program.short_description ? <p className="text-gray-700 dark:text-gray-300">{program.short_description}</p> : null}

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {program.duration_estimate ? (
              <span className="flex items-center gap-1.5">
                <FaRegClock /> {program.duration_estimate}
              </span>
            ) : null}
            {program.level ? <span className="capitalize">{program.level}</span> : null}
            {program.language ? <span>{program.language}</span> : null}
            {program.module_count ? (
              <span className="flex items-center gap-1">
                <FaBookOpen size={12} className="text-green-500" />
                {program.module_count} module{program.module_count === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>

          {/* Price and Action */}
          {mode === 'learner' ? (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-strokedark">
              <span className="text-xl font-bold text-green-600">
                {isFree ? 'Free' : `${program.currency} ${program.price}`}
                {!isFree && <span className="text-sm font-normal text-gray-500 ml-2">one-time</span>}
              </span>
              {isFull ? (
                <span className="text-sm font-semibold text-red-500">Full</span>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-60 shadow-lg hover:shadow-xl"
                >
                  {isEnrolling ? 'Processing...' : 'Enroll Now'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-boxdark rounded-2xl shadow-lg border border-gray-100 dark:border-strokedark overflow-hidden">
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
          <Tab value={DETAIL_TABS.JOURNEY} label="Journey" />
          <Tab value={DETAIL_TABS.DESCRIPTION} label="Description" />
          <Tab value={DETAIL_TABS.BENEFITS} label="Benefits" />
        </Tabs>

        <div className="p-6">
          {/* Journey Tab */}
          <div hidden={selectedTab !== DETAIL_TABS.JOURNEY}>
            {program.modules?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {program.modules.map((module, mIdx) => (
                  <div key={module.id} className="rounded-xl border border-gray-200 dark:border-strokedark p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                        {mIdx + 1}
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{module.title}</h4>
                    </div>
                    {module.description ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 ml-11 mb-2">{module.description}</p>
                    ) : null}
                    <ul className="ml-11 flex flex-col gap-2">
                      {module.lessons?.map(lesson => {
                        const LessonIcon = LESSON_ICON[lesson.lesson_type] || FaFileAlt;
                        return (
                          <li key={lesson.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <LessonIcon className="text-gray-400 flex-shrink-0" />
                            <span>{lesson.title}</span>
                            {lesson.duration ? <span className="text-gray-400">&middot; {lesson.duration}</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No curriculum available yet.</div>
            )}
          </div>

          {/* Description Tab */}
          <div hidden={selectedTab !== DETAIL_TABS.DESCRIPTION}>
            {program.full_description ? (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {program.full_description}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No description available.</div>
            )}
          </div>

          {/* Benefits Tab */}
          <div hidden={selectedTab !== DETAIL_TABS.BENEFITS}>
            {benefits.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="mt-1 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{benefit.trim()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-8">No benefits listed yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Section */}
      {program.certificate_setting ? (
        <div className="rounded-2xl border border-gray-100 dark:border-strokedark shadow-lg bg-white dark:bg-boxdark p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Certificate</h2>
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
        </div>
      ) : null}

      {/* Policies Section */}
      {(program.refund_policy || program.completion_deadline_days || program.code_of_conduct || program.disclaimer) ? (
        <div className="rounded-2xl border border-gray-100 dark:border-strokedark shadow-lg bg-white dark:bg-boxdark p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Policies</h2>
          <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
            {program.refund_policy ? (
              <p><strong>Refund Policy:</strong> {program.refund_policy}</p>
            ) : null}
            {program.completion_deadline_days ? (
              <p><strong>Completion Deadline:</strong> {program.completion_deadline_days} days after enrollment</p>
            ) : null}
            {program.code_of_conduct ? (
              <p><strong>Code of Conduct:</strong> {program.code_of_conduct}</p>
            ) : null}
            {program.disclaimer ? <p className="text-xs text-gray-400">{program.disclaimer}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProgramDetailsView;
