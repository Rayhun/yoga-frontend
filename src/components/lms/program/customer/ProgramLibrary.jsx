'use client';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaFilter } from 'react-icons/fa';
import useToggle from '@/hooks/useToggle';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import Popup from '@/components/common/popup';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import ProgramLibraryFilter from './ProgramLibraryFilter';
import ProgramCard from './ProgramCard';
import { getProgramsList } from '@/services/private/customer/program';
import queryKeys from '@/utils/query-keys';

const ProgramsLibrary = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();

  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  // Get selected tag from URL params (tag name)
  const selectedTag = searchParams.get('tags') || '';

  // Create stable filters object that combines URL params and filter modal values (names for API)
  const stableFilters = useMemo(() => {
    const combinedFilters = { ...filters };
    if (selectedTag) {
      combinedFilters.tags = [selectedTag];
    }
    if (!combinedFilters.tags?.length && !filters.tags?.length) {
      combinedFilters.tags = [];
    }
    return combinedFilters;
  }, [selectedTag, filters]);

  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: () => getProgramsList(stableFilters),
    queryKey: [queryKeys.customerPrograms, JSON.stringify(stableFilters)],
  });

  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.includes(searchText)
      ),
    [programsResponse?.data?.results?.data, searchText]
  );

  // Categories and tags from program list API (static lists for filters)
  const apiCategories = programsResponse?.data?.results?.data?.categories ?? [];
  const apiTags = programsResponse?.data?.results?.data?.tags ?? [];

  // Format tags for FeaturedCategories: [{ id, name }] (use name as id for name-based API)
  const tags = useMemo(
    () =>
      apiTags.map(name => ({
        id: name,
        name,
      })),
    [apiTags]
  );

  const handleApplyFilter = values => {
    setFilters(values);
    toggleFilterModal(false);
  };

  const handleSelectFeaturedTag = selected => {
    // If clicking the same tag, remove it from URL
    if (selectedTag === (selected?.name ?? selected?.id)) {
      searchParams.remove('tags');
    } else {
      // Otherwise, set the new tag name in URL
      searchParams.set('tags', selected?.name ?? selected?.id ?? '');
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      <Popup heading="Program Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <ProgramLibraryFilter
          filters={filters}
          onApplyFilter={handleApplyFilter}
          categoryOptions={apiCategories.map(name => ({ label: name, value: name }))}
          tagOptions={apiTags.map(name => ({ label: name, value: name }))}
        />
      </Popup>

      {/* Hero Section */}
      <div className="bg-white text-gray-800 portal-hero rounded-2xl shadow-2xl mb-6 md:mb-8 relative overflow-hidden border border-gray-100">
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-800 rounded-sm rotate-45 flex items-center justify-center">
                <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Journey Starts Here</h1>
                <p className="text-gray-600 text-sm">Curated wellness plans for your goals</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Achieve your personal goals with curated wellness plans developed by our expert team
            </p>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 aspect-[16/9]">
            <div className="relative">
              <Image
                src="/images/content/Wellness_program.png"
                alt="Hero Image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        {/* Tags */}
        <FeaturedCategories
          categories={tags}
          selected={selectedTag ? [selectedTag] : []}
          onSelect={handleSelectFeaturedTag}
        />

        <div className="portal-search-row">
          <input
            className="portal-search-input rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Programs"
            onChange={e => setSearchText(e.target.value || '')}
          />
          <FaFilter className="cursor-pointer dark:text-white" onClick={() => toggleFilterModal()} />
        </div>

        {/* Programs Grid */}
        <section>
          {isLoadingPrograms ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              {filteredPrograms.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredPrograms.map(program => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      onClick={() => router.push(`/portal/customer/lms/program/${program.id}/details`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex justify-center items-center text-gray-500">
                  {searchText || selectedTag ? 'No programs found matching your criteria' : 'No programs found'}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProgramsLibrary;
