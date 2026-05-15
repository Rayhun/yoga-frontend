'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FaFilter } from 'react-icons/fa';
import useToggle from '@/hooks/useToggle';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import Popup from '@/components/common/popup';
import queryKeys from '@/utils/query-keys';
import ListFilter from '../../common/ListFilters';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import { getCustomerExpertsList } from '@/services/private/customer/expert';
import ExpertCard from './ExpertCard';

const ExpertsList = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const observerRef = useRef();
  const loadingRef = useRef();

  // Get selected category from URL params
  const selectedCategory = searchParams.get('categories') || '';

  // Create stable filters object that combines URL params and filter modal values
  const stableFilters = useMemo(() => {
    const combinedFilters = { ...filters };
    if (selectedCategory) {
      combinedFilters.categories = [parseInt(selectedCategory)];
    } else if (!filters.categories) {
      // Only clear categories if not set by filter modal
      combinedFilters.categories = [];
    }
    return combinedFilters;
  }, [selectedCategory, filters]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingExperts,
  } = useInfiniteQuery({
    queryKey: [queryKeys.customerExperts, JSON.stringify(stableFilters)],
    queryFn: ({ pageParam = 0 }) => getCustomerExpertsList({
      ...stableFilters,
      limit: 10,
      offset: pageParam 
    }),
    getNextPageParam: (lastPage, allPages) => {
      const meta = lastPage?.data?.data || {};
      const totalRecords = meta.total_records || 0;
      const currentOffset = allPages.length * 10;
      const nextOffset = currentOffset;
      
      return nextOffset < totalRecords ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });

  const allExperts = useMemo(() => {
    const experts = data?.pages?.flatMap(page => page?.data?.data.data || []) || [];
    console.log('All experts:', experts); // Debug log
    return experts;
  }, [data?.pages]);

  // Extract categories from the API response
  const categories = useMemo(() => {
    const lastPage = data?.pages?.[data.pages.length - 1];
    return lastPage?.data?.data?.['all-categories'] || [];
  }, [data?.pages]);

  const filteredExperts = useMemo(
    () => {
      const filtered = allExperts.filter(expert => {
        const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();
        return fullName.toLowerCase().includes(searchText.toLowerCase()) ||
               expert.specialization?.toLowerCase().includes(searchText.toLowerCase());
      });
      console.log('Filtered experts:', filtered); // Debug log
      return filtered;
    },
    [allExperts, searchText]
  );

  // Debug pagination info
  const paginationInfo = useMemo(() => {
    const lastPage = data?.pages?.[data.pages.length - 1];
    const totalRecords = lastPage?.data?.total_records || 0; // <-- nested
    const loadedRecords = allExperts.length;
    const limit = 10;
    const hasMore = loadedRecords < totalRecords;
    return { totalRecords, loadedRecords, limit, hasMore };
  }, [data?.pages, allExperts.length]);

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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {/* Filter Modal */}
      <Popup isOpen={isFilterModalOpen} onClose={toggleFilterModal} title="Filter Experts">
        <ListFilter
          filters={filters}
          onApplyFilter={handleApplyFilter}
        />
      </Popup>

      {/* Hero Section */}
      <div className="bg-white text-gray-800 py-12 px-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden border border-gray-100">
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-800 rounded-sm rotate-45 flex items-center justify-center">
                <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Meet Our Coaches</h1>
                <p className="text-gray-600 text-sm">Connect with certified wellness professionals</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Connect with certified wellness professionals who are here to guide you on your journey to better health
            </p>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src="/images/content/wellness_experts.jpg"
                alt="Hero Image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
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
            placeholder="Search Experts"
            onChange={e => setSearchText(e.target.value || '')}
          />
          <FaFilter className="cursor-pointer dark:text-white" onClick={() => toggleFilterModal()} />
        </div>

        {/* Content Cards */}
        <section className="min-h-[50vh]">
          {isLoadingExperts ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredExperts?.map((expert, idx) => (
                    <ExpertCard
                        key={expert.id ?? `expert-${idx}`}
                        expert={expert}
                        onClick={() => router.push(`/portal/customer/lms/expert/${expert.id}/profile?active_tab=about`)}
                    />
                ))}
                </div>
              
              {/* Infinite Scroll Loading */}
              {hasNextPage && (
                <div ref={loadingRef} className="flex justify-center mt-8">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2">
                      <Spinner />
                      <span className="text-gray-500">
                        Loading more experts...
                      </span>
                    </div>
                  ) : (
                    <div className="h-4" /> // Invisible element for intersection observer
                  )}
                </div>
              )}
              
              {/* Pagination Info */}
              {!isLoadingExperts && filteredExperts.length > 0 && (
                <div className="flex justify-center mt-4 text-sm text-gray-500">
                  {/* Showing {paginationInfo.loadedRecords} of {paginationInfo.totalRecords} experts
                  {paginationInfo.hasMore && !hasNextPage && (
                    <span className="ml-2">(Scroll down to load more)</span>
                  )} */}
                </div>
              )}
            </>
          )}
          
          {!isLoadingExperts && filteredExperts.length === 0 && (
            <div className="w-full h-[300px] flex justify-center items-center text-gray-500">
              No experts found
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ExpertsList;
