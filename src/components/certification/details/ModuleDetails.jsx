'use client';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FaTv } from 'react-icons/fa';
import { FiLock } from 'react-icons/fi';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import ModuleOutlinePanel from '@/components/certification/session/ModuleOutlinePanel';
import { getLearnerModuleDetail, getLearnerProgramDetail } from '@/services/private/certification/catalog';
import queryKeys from '@/utils/query-keys';
import ContentCard from './ContentCard';

const TABS = {
  JOURNEY: 'journey',
  DESCRIPTION: 'description',
  OUTCOMES: 'outcomes',
};

// Program.outcomes is a newline-separated list (same convention as LMS Program.benefits).
const toOutcomeList = outcomes => (outcomes ? outcomes.split('\n').map(line => line.trim()).filter(Boolean) : []);

const ModuleDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const programId = searchParams.get('program');
  const [selectedTab, setSelectedTab] = useState(TABS.JOURNEY);

  const moduleQuery = useQuery({
    queryFn: () => getLearnerModuleDetail({ programId, moduleId: params.id }),
    queryKey: [queryKeys.certificationLearnerModuleDetail, programId, params.id],
    enabled: !!programId && !!params.id,
    retry: false,
  });
  // Program detail (shared cache with the lesson page) supplies the breadcrumb title and outcomes.
  const programQuery = useQuery({
    queryFn: () => getLearnerProgramDetail({ id: programId }),
    queryKey: [queryKeys.certificationLearnerDetail, programId],
    enabled: !!programId,
    retry: false,
  });

  useHandleApiResponse(moduleQuery.failureReason);

  if (moduleQuery.isLoading || programQuery.isLoading) return <PageLoader />;

  const moduleDetails = moduleQuery.data?.data || {};
  const program = programQuery.data?.data;
  const lessons = moduleDetails.lessons || [];
  const isLocked = Boolean(moduleDetails.is_locked);
  const outcomes = toOutcomeList(program?.outcomes);
  const activeTab = selectedTab === TABS.OUTCOMES && outcomes.length === 0 ? TABS.JOURNEY : selectedTab;

  const breadcrumbs = [
    { label: 'Certifications', href: '/portal/customer/certification' },
    { label: program?.title || 'Program', href: `/portal/customer/certification/${programId}` },
    { label: moduleDetails.title || 'Module' },
  ];

  return (
    <div>
      <Breadcrumbs data={breadcrumbs} className="!mb-4" />

      {/* Details Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        <div className="w-full md:w-1/2">
          <Image
            src={moduleDetails.image || '/images/content/default.png'}
            alt={moduleDetails.title || 'Module image'}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{moduleDetails.title}</h3>
          <div className="flex items-center gap-3 text-gray-600 dark:text-white">
            <FaTv size={24} className="text-primary" />
            <span>
              {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
            </span>
          </div>
          {isLocked ? (
            <div className="flex items-start gap-2 rounded-md bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <FiLock className="mt-0.5 shrink-0" />
              <span>{moduleDetails.lock_reason || 'This module is locked.'}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Module Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:bg-boxdark dark:text-gray-200 flex flex-col md:flex-row gap-6 md:gap-12">
        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onChange={(_, value) => setSelectedTab(value)}>
            <Tab value={TABS.JOURNEY} label="Curriculum" />
            <Tab value={TABS.DESCRIPTION} label="About" />
            {outcomes.length > 0 ? <Tab value={TABS.OUTCOMES} label="Outcomes" /> : null}
          </Tabs>
          <div className="py-5">
            <div hidden={activeTab !== TABS.JOURNEY}>
              {lessons.length === 0 ? (
                <p className="text-gray-500">No lessons in this module yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map(lesson => (
                    <ContentCard
                      key={lesson.id}
                      item={{
                        ...lesson,
                        content_type: 'lesson',
                        completed: Boolean(lesson.is_completed),
                        locked: isLocked,
                        lock_reason: moduleDetails.lock_reason,
                      }}
                      isEnrolled
                      programId={programId}
                    />
                  ))}
                </div>
              )}
            </div>

            <div hidden={activeTab !== TABS.DESCRIPTION}>
              <ControllableRichText className="dark:text-white">
                {moduleDetails.description || 'No description provided'}
              </ControllableRichText>
            </div>

            {outcomes.length > 0 ? (
              <div hidden={activeTab !== TABS.OUTCOMES}>
                <h5 className="text-black-2 font-bold mb-3">What you will learn</h5>
                <ol className="list-tick list-inside grid grid-cols-1 sm:grid-cols-2 gap-2 dark:text-white">
                  {outcomes.map(outcome => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </div>

        <ModuleOutlinePanel module={moduleDetails} programId={programId} />
      </div>
    </div>
  );
};

export default ModuleDetails;
