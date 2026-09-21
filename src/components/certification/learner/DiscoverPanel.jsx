'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaFilter } from 'react-icons/fa';
import useToggle from '@/hooks/useToggle';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import Popup from '@/components/common/popup';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import CertificationLibraryFilter from './CertificationLibraryFilter';
import ProgramCard from './ProgramCard';
import { getCertificationCatalog } from '@/services/private/certification/catalog';
import queryKeys from '@/utils/query-keys';

const DiscoverPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamUtils = useSearchParamUtils();
  const enrolledProgramId = searchParams.get('enrolled');

  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  const selectedTag = searchParamUtils.get('tags') || '';

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

  const { isFetching, data: response } = useQuery({
    queryFn: () => getCertificationCatalog(stableFilters),
    queryKey: [queryKeys.certificationCatalog, JSON.stringify(stableFilters)],
  });

  const filteredPrograms = useMemo(
    () =>
      (response?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title?.toLowerCase().includes(searchText.toLowerCase())
      ),
    [response?.data?.results?.data, searchText]
  );

  const apiCategories = response?.data?.results?.data?.categories ?? [];
  const apiTags = response?.data?.results?.data?.tags ?? [];

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
    if (selectedTag === (selected?.name ?? selected?.id)) {
      searchParamUtils.remove('tags');
    } else {
      searchParamUtils.set('tags', selected?.name ?? selected?.id ?? '');
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {enrolledProgramId && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center justify-between">
          {"You're enrolled! Head to My Certifications to get started."}
          <button onClick={() => router.replace('/portal/customer/certification')} className="text-green-500 hover:text-green-700">
            &times;
          </button>
        </div>
      )}

      <Popup heading="Certification Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <CertificationLibraryFilter
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Certification Programs</h1>
                <p className="text-gray-600 text-sm">Earn recognized certifications from expert coaches</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Advance your career with certified programs designed by industry experts and accredited institutions
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
            placeholder="Search Certifications"
            onChange={e => setSearchText(e.target.value || '')}
          />
          <FaFilter className="cursor-pointer dark:text-white" onClick={() => toggleFilterModal()} />
        </div>

        {/* Programs Grid */}
        <section>
          {isFetching ? (
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
                      onClick={() => router.push(`/portal/customer/certification/${program.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex justify-center items-center text-gray-500">
                  {searchText || selectedTag ? 'No certifications found matching your criteria' : 'No certifications found'}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DiscoverPanel;
