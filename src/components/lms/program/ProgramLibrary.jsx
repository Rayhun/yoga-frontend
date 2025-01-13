'use client';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { GoDotFill } from 'react-icons/go';
import Spinner from '@/components/common/loader/Spinner';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import { getProgramsList } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const ProgramsLibrary = () => {
  const { isLoading: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: getProgramsList,
    queryKey: [queryKeys.lmsPrograms],
  });

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {/* Categories */}
      <FeaturedCategories />

      {/* Content Cards */}
      <section>
        {isLoadingPrograms ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {programsResponse?.data?.map(program => (
              <div
                key={program.id}
                className="rounded-lg border border-stroke bg-white shadow-default overflow-hidden dark:bg-boxdark"
              >
                <Image
                  width={200}
                  height={200}
                  src={program.image}
                  alt="image"
                  className="w-full h-52 object-cover rounded-t-lg"
                />

                <div className="p-4 flex flex-col gap-1">
                  <h4 className="text-xl font-semibold block truncate text-black dark:text-white">
                    {program.title}
                  </h4>
                  <div className="flex gap-2 items-center text-gray-400">
                    <p>5 modules</p>
                    <GoDotFill size={10} />
                    <p>25 sessions</p>
                  </div>
                  <p className="break-words line-clamp-2 text-gray-400" title={program.description}>
                    {program.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProgramsLibrary;
