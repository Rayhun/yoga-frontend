'use client';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { FaArrowRight } from 'react-icons/fa';
import { IoNewspaper } from 'react-icons/io5';
import { GoDotFill } from 'react-icons/go';
import useBreadcrumbs from '@/hooks/useBreadcrumbs';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Spinner from '@/components/common/loader/Spinner';
import SelectableCategories from '@/components/lms/category/SelectableCategories';
import { getProgramsList } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const ProgramsLibrary = () => {
  const { isLoading: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: getProgramsList,
    queryKey: [queryKeys.lmsPrograms],
  });
  const breadcrumbs = useBreadcrumbs({
    data: [
      {
        label: 'Programs',
        href: '/app/programs',
        Icon: IoNewspaper,
      },
      {
        label: 'Library',
      },
    ],
    isAppBreadcrumb: true,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[url('/images/program/hero-01.jpg')] bg-cover bg-center w-full mx-auto py-4 px-4 md:px-8 md:py-20">
        <div className="max-w-xl">
          <div className="py-4">
            <h3 className="text-3xl text-white font-semibold md:text-4xl">
              Here you can find <span className="text-primary">most popular programs</span>
            </h3>
            <p className="text-gray-300 leading-relaxed mt-3">
              Nam erat risus, sodales sit amet lobortis ut, finibus eget metus. Cras aliquam ante ut tortor
              posuere feugiat. Duis sodales nisi id porta lacinia.
            </p>
          </div>
          <span className="group px-8 py-2 text-primary cursor-pointer font-medium bg-indigo-50 rounded-full inline-flex items-center">
            Lets Explore
            <FaArrowRight size={16} className="ml-1 duration-150 group-hover:translate-x-1" />
          </span>
        </div>
      </section>

      <main className="p-2 md:p-7 flex flex-col gap-4 md:gap-7">
        {/* Breadcrumbs */}
        <section>
          <Breadcrumbs data={breadcrumbs} />
        </section>

        {/* Categories */}
        <section>
          <SelectableCategories />
        </section>

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
                  className="rounded-lg border border-stroke bg-white shadow-default overflow-hidden"
                >
                  <Image
                    width={200}
                    height={200}
                    src={program.image}
                    alt="image"
                    className="w-full h-52 object-cover rounded-t-lg"
                  />

                  <div className="p-4 flex flex-col gap-1">
                    <h4 className="text-xl font-semibold block truncate text-black">{program.title}</h4>
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
      </main>
    </div>
  );
};

export default ProgramsLibrary;
