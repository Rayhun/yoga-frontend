'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FaPlus } from 'react-icons/fa6';
import Spinner from '@/components/common/loader/Spinner';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import queryKeys from '@/utils/query-keys';
import { getMyPrograms } from '@/services/private/certification/program';
import MyProgramCard from '@/components/certification/mine/MyProgramCard';

/**
 * Creator-owned program list/grid (any status — draft/private/public/archived), each card
 * linking into the builder to resume editing. ``getMyPrograms`` hits ``programs/mine/``, a
 * separate endpoint from the learner-facing catalog (``programs/catalog/``, public-only).
 */
const MyProgramsList = () => {
  const {
    data: response,
    isFetching,
    failureReason,
  } = useQuery({
    queryFn: getMyPrograms,
    queryKey: [queryKeys.certificationMyPrograms],
  });

  useHandleApiResponse(failureReason);

  const programs = response?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Certification Programs</h1>
          <p className="text-gray-600 dark:text-gray-400">Programs you&apos;ve created, at any stage.</p>
        </div>
        <Link
          href="/portal/teacher/certification/programs/builder/new"
          className="whitespace-nowrap flex items-center gap-2 text-sm font-medium bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
        >
          <FaPlus className="text-xs" /> Create New Program
        </Link>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : programs.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {programs.map(program => (
            <MyProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="w-full h-[200px] flex flex-col gap-2 justify-center items-center text-gray-500">
          <p>You haven&apos;t created any programs yet.</p>
          <Link href="/portal/teacher/certification/programs/builder/new" className="text-green-700 font-medium underline">
            Create your first program
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyProgramsList;
