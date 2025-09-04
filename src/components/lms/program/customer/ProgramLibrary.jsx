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

  // Get selected category from URL params
  const selectedCategory = searchParams.get('categories') || '';

  // Update filters when URL params change
  useEffect(() => {
    if (selectedCategory) {
      setFilters(prev => ({ ...prev, categories: [parseInt(selectedCategory)] }));
    } else {
      setFilters(prev => ({ ...prev, categories: [] }));
    }
  }, [selectedCategory]);

  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: () => getProgramsList(filters),
    queryKey: [queryKeys.customerPrograms, JSON.stringify(filters)],
  });

  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.includes(searchText)
      ),
    [programsResponse?.data?.results?.data, searchText]
  );

  // Extract categories from the API response
  const categories = useMemo(
    () => programsResponse?.data?.results?.data?.['all-categories'] || [],
    [programsResponse?.data?.results?.data]
  );

  const handleApplyFilter = values => {
    setFilters(values);
    toggleFilterModal(false);
  };

  const handleSelectFeaturedCategory = selected => {
    // If clicking the same category, remove it from URL
    if (selectedCategory === selected.id?.toString()) {
      searchParams.remove('categories');
    } else {
      // Otherwise, set the new category in URL
      searchParams.set('categories', selected.id);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      <Popup heading="Program Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <ProgramLibraryFilter filters={filters} onApplyFilter={handleApplyFilter} />
      </Popup>

      {/* Hero Section */}
      <div className="bg-white rounded-md py-12 px-6 md:px-12 flex flex-col md:flex-row items-center dark:bg-boxdark dark:text-white">
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Your Journey Starts Here</h1>
          <p className="break-words line-clamp-2 dark:text-gray-300">
            Achieve your personal goals with curated wellness plans developed by our expert
          </p>
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

      <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        {/* Categories */}
        <FeaturedCategories 
          categories={categories}
          selected={selectedCategory ? [parseInt(selectedCategory)] : []} 
          onSelect={handleSelectFeaturedCategory} 
        />

        <div className="flex gap-4 items-center justify-end">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  {searchText || selectedCategory ? 'No programs found matching your criteria' : 'No programs found'}
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
