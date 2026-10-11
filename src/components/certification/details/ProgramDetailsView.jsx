'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BiCheck } from 'react-icons/bi';
import { FiLock } from 'react-icons/fi';
import LinearProgress from '@mui/material/LinearProgress';
import { MdViewModule } from 'react-icons/md';
import { FaTv } from 'react-icons/fa';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import PageLoader from '@/components/common/loader/PageLoader';
import BuilderTabs from '@/components/certification/builder/BuilderTabs';
import { CredentialsPanel, CurriculumPanel, OverviewPanel } from './ProgramTabPanels';
import { DEFAULT_TAB, DETAIL_TABS, TAB_PARAM, parseTab, tabPanelId } from './detailTabs';
import { getProgramCatalogDetail, getLearnerProgramDetail, checkoutCertificationProgram } from '@/services/private/certification/catalog';
import queryKeys from '@/utils/query-keys';

const TABLIST_CLASS = 'flex gap-1 overflow-x-auto border-b border-stroke dark:border-strokedark';
const TABS = DETAIL_TABS.map(tab => ({ ...tab, panelId: tabPanelId(tab.id) }));

const ProgramDetailsView = ({ programId, mode = 'learner' }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParamUtils = useSearchParamUtils();
  // The selected tab lives in the URL (?tab=credentials), so a reload or a shared link keeps it.
  const selectedTab = parseTab(searchParamUtils.get(TAB_PARAM));
  const handleSelectTab = tabId => searchParamUtils.set(TAB_PARAM, tabId === DEFAULT_TAB ? '' : tabId);

  const {
    data: catalogResponse,
    isLoading: isCatalogLoading,
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
    isLoading: isLearnerLoading,
  } = useQuery({
    queryFn: () => getLearnerProgramDetail({ id: programId }),
    queryKey: [queryKeys.certificationLearnerDetail, programId],
    enabled: !!programId && isEnrolled,
    retry: false,
  });

  // Enrolled learners get the lock-aware module list; everyone else the outline-only catalog detail.
  const program = isEnrolled ? learnerResponse?.data : catalogProgram;

  const { mutateAsync: checkout, isPending: isEnrolling } = useMutation({
    mutationFn: checkoutCertificationProgram,
  });

  const handleEnrollProgram = async () => {
    if (isEnrolling || !catalogProgram) return;
    try {
      const response = await checkout({ id: catalogProgram.id });
      const data = response?.data;

      if (data?.status === 'success' && data?.data?.enrolled === false && data?.data?.checkout_session_client_secret) {
        router.push(`/payment/certification/${catalogProgram.id}?client_secret=${data.data.checkout_session_client_secret}`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationCatalog] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationProgramCatalogDetail, programId] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationEnrolledCertifications] });
      toast.success(data?.message || 'Enrolled successfully! Start learning now.');
    } catch (error) {
      toast.error('Something went wrong in enrolling the program');
    }
  };

  const isProgramCompleted = program?.enrollment_status === 'completed' || program?.enrollment_status === 'Completed';
  const programProgress = Math.round(program?.progress_percent || 0);

  if (isCatalogLoading || (isEnrolled && isLearnerLoading)) return <PageLoader />;

  if (!catalogProgram) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        This program isn&apos;t available.
      </div>
    );
  }

  const handleCompleteProgram = async () => {
    toast.success('Program completed successfully!');
  };

  // Overview and Credentials read the catalog detail (public-safe fields); Curriculum reads `program`.
  const panels = {
    overview: <OverviewPanel program={catalogProgram} />,
    curriculum: <CurriculumPanel program={program || catalogProgram} isEnrolled={isEnrolled} programId={programId} />,
    credentials: <CredentialsPanel program={catalogProgram} />,
  };

  return (
    <div>
      {/* Details Card - Matching Programs Module */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full md:w-1/2">
          <Image
            src={catalogProgram?.thumbnail || '/images/content/default.png'}
            alt="Program Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{catalogProgram.title}</h3>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white">
            <div className="flex items-center gap-3">
              <FaTv size={24} className="text-primary" />
              <span>{catalogProgram?.lesson_count || 0} Lessons</span>
            </div>
            <div className="flex items-center gap-3">
              <MdViewModule size={24} className="text-primary" />
              <span>{catalogProgram?.module_count} Modules</span>
            </div>
          </div>

          {/* Enrollment */}
          {isEnrolled ? (
            <>
              <div className={`!absolute !top-3 !right-0 px-4 py-2 rounded-tl-xl rounded-bl-xl text-white ${
                isProgramCompleted ? 'bg-primary' : 'bg-orange-500'
              }`}>
                {isProgramCompleted ? 'Completed' : 'In Progress'}
              </div>
              {/* Completion Button */}
              {programProgress === 100 && !isProgramCompleted && (
                <button
                  className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 rounded-md shadow hover:bg-primary/80"
                  onClick={handleCompleteProgram}
                >
                  Mark Program as Complete
                </button>
              )}
            </>
          ) : (
            <button
              className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 rounded-md shadow hover:bg-primary/80"
              disabled={isEnrolling}
              onClick={handleEnrollProgram}
            >
              {isEnrolling ? 'Enrolling...' : 'Begin Certificate'}
            </button>
          )}
        </div>
      </div>

      {/* Program Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col md:flex-row gap-6 md:gap-12">
        <div className={`w-full ${isEnrolled ? 'md:w-3/4' : 'md:w-full'}`}>
          <BuilderTabs
            tabs={TABS}
            activeTab={selectedTab}
            onSelect={handleSelectTab}
            ariaLabel="Program sections"
            className={TABLIST_CLASS}
            tabClassName="min-h-[44px] !px-5 md:text-base"
          />
          {/* All three panels stay in the DOM (hidden), so the tabs' aria-controls always resolve. */}
          {TABS.map(tab => (
            <div
              key={tab.id}
              id={tab.panelId}
              role="tabpanel"
              aria-labelledby={`${tab.panelId}-tab`}
              hidden={tab.id !== selectedTab}
              tabIndex={0}
              className="py-5 outline-none"
            >
              {panels[tab.id]}
            </div>
          ))}
        </div>

        {/* Program Details Sidebar */}
        {isEnrolled && (
          <div className="w-full md:w-1/4 flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg text-primary font-bold">Program Progress</h3>
              <div className="flex flex-col gap-2">
                <LinearProgress className="rounded-full !h-2" value={programProgress} />
                <span className="text-sm text-right dark:text-white">{programProgress}% Complete</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg text-primary font-bold">Program Navigation</h3>
              <ol className="relative p-5 border-s-4 border-gray-200 dark:border-gray-700">
                {program?.modules?.map(module => {
                  const locked = module.is_locked;
                  return (
                    <li key={module.id} className="ms-6 mb-6">
                      <div className="absolute -start-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                        {locked ? (
                          <FiLock size={20} className="text-gray-500 dark:text-gray-400" />
                        ) : (
                          <BiCheck
                            size={20}
                            className={`rounded-full text-white ${module.completed_count === module.total_count && module.total_count > 0 ? 'bg-secondary' : 'bg-white dark:bg-gray-600'}`}
                          />
                        )}
                      </div>
                      <h5 className={`mb-1 text-md font-semibold ${locked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {module.title}
                        {locked && <span className="ml-1 text-xs font-normal">(Locked)</span>}
                      </h5>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Policies Section */}
      {(catalogProgram.refund_policy || catalogProgram.code_of_conduct || catalogProgram.disclaimer) && (
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
          <h3 className="text-lg font-bold dark:text-white mb-3">Policies</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300">
            {catalogProgram.refund_policy && (
              <p><strong>Refund Policy:</strong> {catalogProgram.refund_policy}</p>
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
