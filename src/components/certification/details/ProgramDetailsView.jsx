/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
  FaCheckCircle,
  FaLock,
} from 'react-icons/fa';
import Spinner from '@/components/common/loader/Spinner';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  getProgramCatalogDetail,
  getLearnerProgramDetail,
  checkoutCertificationProgram,
} from '@/services/private/certification/catalog';

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
const DETAIL_TABS = { JOURNEY: 'journey', DESCRIPTION: 'description', BENEFITS: 'benefits' };

const ProgramDetailsView = ({ programId, mode = 'learner' }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(DETAIL_TABS.JOURNEY);

  const {
    data: catalogResponse,
    isFetching: isCatalogLoading,
    failureReason: catalogError,
  } = useQuery({
    queryFn: () => getProgramCatalogDetail({ id: programId }),
    queryKey: [queryKeys.certificationProgramCatalogDetail, programId],
    enabled: !!programId,
    retry: false,
  });

  useHandleApiResponse(catalogError);

  const catalogProgram = catalogResponse?.data;
  const isEnrolled = catalogProgram?.is_enrolled || false;

  const {
    data: learnerResponse,
    isFetching: isLearnerLoading,
  } = useQuery({
    queryFn: () => getLearnerProgramDetail({ id: programId }),
    queryKey: [queryKeys.certificationLearnerDetail, programId],
    enabled: !!programId && isEnrolled,
    retry: false,
  });

  const program = isEnrolled ? learnerResponse?.data : catalogProgram;

  const { mutateAsync: checkout, isPending: isEnrolling } = useMutation({
    mutationFn: checkoutCertificationProgram,
  });

  const handleEnroll = async () => {
    if (isEnrolling || !catalogProgram) return;
    try {
      await checkout({ id: catalogProgram.id });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationCatalog] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationProgramCatalogDetail, programId] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationEnrolledCertifications] });
      toast.success('Enrolled successfully! Start learning now.');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleLessonClick = (lesson, module) => {
    if (lesson.is_completed) {
      router.push(`/portal/customer/certification/${programId}/lesson/${lesson.id}?module=${module.id}`);
      return;
    }
    if (lesson.lesson_type === 'quiz') {
      toast.info('Quiz content will be available soon.');
      return;
    }
    router.push(`/portal/customer/certification/${programId}/lesson/${lesson.id}?module=${module.id}`);
  };

  if (isCatalogLoading || (isEnrolled && isLearnerLoading)) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!catalogProgram) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        This program isn&apos;t available.
      </div>
    );
  }

  const isFree = catalogProgram.payment_type === 'free';
  const isFull = catalogProgram.seat_limit !== null && catalogProgram.seats_remaining === 0;
  const benefits = catalogProgram.outcomes ? catalogProgram.outcomes.split('\n').filter(Boolean) : [];
  const progressPercent = program?.progress_percent || 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {mode === 'preview' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
          Preview — this is how learners will see this program.
        </div>
      ) : null}

      {/* Hero Card */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-lg bg-white">
        <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
          {catalogProgram.thumbnail ? (
            <Image src={catalogProgram.thumbnail} alt={catalogProgram.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaRegFileImage className="text-5xl text-gray-300" />
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {catalogProgram.creator_type && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                {CREATOR_TYPE_LABELS[catalogProgram.creator_type] || 'Coach'}
              </span>
            )}
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {TARGET_AUDIENCE_LABELS[catalogProgram.target_audience] || catalogProgram.target_audience}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{catalogProgram.title}</h1>
          {catalogProgram.subtitle && <p className="text-gray-500">{catalogProgram.subtitle}</p>}
          {catalogProgram.creator_display_name && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaUser size={12} className="text-purple-500" />
              <span>By {catalogProgram.creator_display_name}</span>
            </div>
          )}
          {catalogProgram.short_description && (
            <p className="text-gray-700">{catalogProgram.short_description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {catalogProgram.duration_estimate && (
              <span className="flex items-center gap-1.5">
                <FaRegClock /> {catalogProgram.duration_estimate}
              </span>
            )}
            {catalogProgram.level && <span className="capitalize">{catalogProgram.level}</span>}
            {catalogProgram.language && <span>{catalogProgram.language}</span>}
            {catalogProgram.module_count && (
              <span className="flex items-center gap-1">
                <FaBookOpen size={12} className="text-green-500" />
                {catalogProgram.module_count} module{catalogProgram.module_count === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Progress bar for enrolled users */}
          {isEnrolled && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Your progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} />
            </div>
          )}

          {/* Action Button */}
          {mode === 'learner' && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xl font-bold text-green-600">
                {isFree ? 'Free' : `${catalogProgram.currency} ${catalogProgram.price}`}
                {!isFree && <span className="text-sm font-normal text-gray-500 ml-2">one-time</span>}
              </span>
              {isEnrolled ? (
                <button
                  onClick={() => {
                    const firstModule = program?.modules?.[0];
                    const firstLesson = firstModule?.lessons?.[0];
                    if (firstLesson) handleLessonClick(firstLesson, firstModule);
                  }}
                  className="py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Continue Learning
                </button>
              ) : isFull ? (
                <span className="text-sm font-semibold text-red-500">Full</span>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-60 shadow-lg hover:shadow-xl"
                >
                  {isEnrolling ? 'Enrolling...' : 'Start Program'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
          <Tab value={DETAIL_TABS.JOURNEY} label="Curriculum" />
          <Tab value={DETAIL_TABS.DESCRIPTION} label="About" />
          <Tab value={DETAIL_TABS.BENEFITS} label="Outcomes" />
        </Tabs>

        <div className="p-6">
          {/* Curriculum Tab */}
          <div hidden={selectedTab !== DETAIL_TABS.JOURNEY}>
            {(isEnrolled ? program?.modules : catalogProgram?.modules_in_outline || program?.modules)?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {(isEnrolled ? program?.modules : catalogProgram?.modules_in_outline || program?.modules)?.map(
                  (module, mIdx) => (
                    <div key={module.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                          {mIdx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{module.title}</h4>
                          {module.description && (
                            <p className="text-sm text-gray-500">{module.description}</p>
                          )}
                        </div>
                        {isEnrolled && module.completed_count !== undefined && (
                          <span className="text-xs text-gray-400">
                            {module.completed_count}/{module.total_count}
                          </span>
                        )}
                      </div>
                      <ul className="ml-11 flex flex-col gap-1">
                        {module.lessons?.map(lesson => {
                          const LessonIcon = LESSON_ICON[lesson.lesson_type] || FaFileAlt;
                          return (
                            <li
                              key={lesson.id}
                              className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg transition-colors ${
                                isEnrolled
                                  ? 'cursor-pointer hover:bg-gray-50 text-gray-700'
                                  : 'text-gray-400'
                              } ${lesson.is_completed ? 'text-green-600' : ''}`}
                              onClick={() => isEnrolled && handleLessonClick(lesson, module)}
                            >
                              {lesson.is_completed ? (
                                <FaCheckCircle size={14} className="text-green-500 flex-shrink-0" />
                              ) : !isEnrolled && mode === 'learner' ? (
                                <FaLock size={14} className="text-gray-300 flex-shrink-0" />
                              ) : (
                                <LessonIcon className="text-gray-400 flex-shrink-0" />
                              )}
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-gray-400 text-xs">{lesson.duration}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Curriculum will be available soon.</div>
            )}
          </div>

          {/* About Tab */}
          <div hidden={selectedTab !== DETAIL_TABS.DESCRIPTION}>
            {catalogProgram.full_description ? (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {catalogProgram.full_description}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No description available.</div>
            )}
          </div>

          {/* Outcomes Tab */}
          <div hidden={selectedTab !== DETAIL_TABS.BENEFITS}>
            {benefits.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
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
              <div className="text-center text-gray-500 py-8">Outcomes will be listed soon.</div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Section */}
      {catalogProgram.certificate_setting && (
        <div className="rounded-2xl border border-gray-100 shadow-lg bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Certificate</h2>
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">{catalogProgram.certificate_setting.certificate_title}</p>
            {catalogProgram.certificate_setting.completion_rules && (
              <p>{catalogProgram.certificate_setting.completion_rules}</p>
            )}
            {catalogProgram.certificate_setting.primary_issuer_name && (
              <p>Issued by {catalogProgram.certificate_setting.primary_issuer_name}</p>
            )}
            {catalogProgram.certificate_setting.expiry_period_days && (
              <p>Valid for {catalogProgram.certificate_setting.expiry_period_days} days after issuance</p>
            )}
          </div>
        </div>
      )}

      {/* Policies Section */}
      {(catalogProgram.refund_policy || catalogProgram.completion_deadline_days || catalogProgram.code_of_conduct || catalogProgram.disclaimer) && (
        <div className="rounded-2xl border border-gray-100 shadow-lg bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Policies</h2>
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            {catalogProgram.refund_policy && (
              <p><strong>Refund Policy:</strong> {catalogProgram.refund_policy}</p>
            )}
            {catalogProgram.completion_deadline_days && (
              <p><strong>Completion Deadline:</strong> {catalogProgram.completion_deadline_days} days after enrollment</p>
            )}
            {catalogProgram.code_of_conduct && (
              <p><strong>Code of Conduct:</strong> {catalogProgram.code_of_conduct}</p>
            )}
            {catalogProgram.disclaimer && <p className="text-xs text-gray-400">{catalogProgram.disclaimer}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetailsView;
