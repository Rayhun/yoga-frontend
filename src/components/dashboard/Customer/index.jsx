'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import { getProgramsList } from '@/services/private/customer/program';
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
            <div className="mt-10 flex justify-between items-center gap-4 pr-3">
              <Chip
                className="mt-10 !capitalize w-full"
                label="Start Journey"
                color="primary"
                onClick={() => console.log('See Details')}
              />
              <Chip
                variant="outlined"
                className="mt-10 !capitalize w-full"
                label="Resume"
                color="primary"
                onClick={() => console.log('Resume')}
              />
            </div>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0 aspect-[16/9]">
            <Image
              src="/images/content/default.png"
              alt="Hero Image"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        <div className="flex items-center mt-6">
          <WeeklyProgressCard />
        </div>
      </div>
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
