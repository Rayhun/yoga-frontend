'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import { getProgramsList } from '@/services/private/customer/program';
import { getOnboardingRecommendations } from '@/services/private/onboarding/quiz';
import queryKeys from '@/utils/query-keys';
import ChatWithAI from '@/components/common/SearchField';
import WeeklyProgressCard from '../WeeklyProgress/ProgressCard';
import QuickLearningsSection from '../QuickLearnings/QuickLearnings';
import QuickLinks from '../QuickLinks/QuickLinks';
import { Chip } from '@mui/material';

const CustomerDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const selectedCategory = searchParams.get('category');
  const [searchText, setSearchText] = useState('');
  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: () => getProgramsList({ categories: selectedCategory }),
    queryKey: [queryKeys.customerPrograms, selectedCategory],
  });

  const { data: recommendationsResponse } = useQuery({
    queryFn: getOnboardingRecommendations,
    queryKey: [queryKeys.onboardingRecommendations],
  });

  const recommendedProgram = recommendationsResponse?.data?.data?.recommended_programs;
  const userInterests = recommendationsResponse?.data?.data?.user_interests || [];
  
  console.log('Recommendations Response:', recommendationsResponse?.data?.data);
  console.log('Recommended Program:', recommendedProgram);

  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.includes(searchText)
      ),
    [programsResponse?.data?.results?.data, searchText]
  );

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {/* Hero Section */}
      <div className="bg-white rounded-md py-12 px-6 md:px-12  dark:bg-boxdark dark:text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Your Journey Starts Here</h1>
            <p className="break-words line-clamp-2 dark:text-gray-300">
              Achieve your personal goals with curated wellness plans developed by our expert
            </p>
            <div className="mt-10 flex justify-center items-center">
              {recommendedProgram ? (
                recommendedProgram.is_enroll ? (
                  <button
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors duration-200"
                    onClick={() => router.push(`/portal/customer/lms/program/${recommendedProgram.id}/details`)}
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors duration-200"
                    onClick={() => router.push(`/portal/customer/lms/program/${recommendedProgram.id}/details`)}
                  >
                    Start Journey
                  </button>
                )
              ) : (
                <button
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors duration-200"
                  onClick={() => router.push('/portal/customer/lms/program')}
                >
                  Browse Programs
                </button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0 aspect-[16/9]">
            <Image
              src={recommendedProgram?.image || "/images/content/default.png"}
              alt={recommendedProgram?.title || "Hero Image"}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        <div className="flex items-center mt-6">
          <WeeklyProgressCard />
        </div>                                                                 
      </div> */}
      <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        {/* Content Cards */}
        <section className="space-x-8">
          {isLoadingPrograms ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <QuickLearningsSection items={filteredPrograms} title={'Daily Dose'} viewAllLink={'/portal'} />
          )}
        </section>
        <div className="flex items-center mt-6">
          <ChatWithAI />
        </div>
        <section className="mt-10">
          {isLoadingPrograms ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <QuickLearningsSection items={filteredPrograms} title={'Quick Relief'} viewAllLink={'/portal'} />
          )}
        </section>
        <section className="mt-10">
          {isLoadingPrograms ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <QuickLearningsSection items={filteredPrograms} title={'Live Sessions'} viewAllLink={'/portal'} />
          )}
        </section>
        <QuickLinks />
      </div>
    </div>
  );
};

export default CustomerDashboard;
