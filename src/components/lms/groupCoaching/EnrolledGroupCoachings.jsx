'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import queryKeys from '@/utils/query-keys';
import ConsultationCard from '../common/ConsultationCard';
import { getEnrolledGroupCoachings } from '@/services/private/customer/groupCoaching';
import EventCard from '../common/EventCard';

const EnrolledGroupCoachings = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const nextSearchParams = useSearchParams();
  const selectedStatus = searchParams.get('status') || '';
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  // Get selected category from URL params using Next.js useSearchParams for stability
  const selectedCategory = nextSearchParams.get('categories') || '';

  // Update filters when URL params change
  useEffect(() => {
    if (selectedCategory) {
      setFilters(prev => ({ ...prev, categories: [parseInt(selectedCategory)] }));
    } else {
      setFilters(prev => ({ ...prev, categories: [] }));
    }
  }, [selectedCategory]);

  // Debug: Log filters and selected category
  useEffect(() => {
    console.log('Selected Category:', selectedCategory);
    console.log('Filters:', filters);
  }, [selectedCategory, filters]);

  const { isLoading: isLoadingCoachings, data: coachingsResponse } = useQuery({
    queryFn: () => {
      console.log('API Call with filters:', filters);
      return getEnrolledGroupCoachings(filters);
    },
    queryKey: [queryKeys.customerEnrolledGroupCoachings, selectedStatus, JSON.stringify(filters)],
  });

  // Extract categories from the API response
  const categories = useMemo(
    () => coachingsResponse?.data?.results?.data?.['all-categories'] || [],
    [coachingsResponse?.data?.results?.data]
  );

  const coachings = coachingsResponse?.data?.results?.data?.['all-events'] || [];

  // Filter coachings based on search text only (category filtering is now handled by API)
  const filteredCoachings = useMemo(() => {
    if (!searchText) return coachings;
    
    return coachings.filter(coaching => {
      return coaching.title.toLowerCase().includes(searchText.toLowerCase()) ||
             coaching.description?.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [coachings, searchText]);

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
      {/* Hero Section */}
      <div className="bg-white rounded-md py-12 px-6 md:px-12 flex flex-col md:flex-row items-center dark:bg-boxdark dark:text-white">
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Your Group Coachings</h1>
          <p className="break-words line-clamp-2 dark:text-gray-300">
            Join group sessions and workshops led by expert coaches to enhance your wellness journey
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

      <div className="min-h-[60vh] flex flex-col gap-4 md:gap-7 p-6 bg-white rounded-lg shadow-md">
        {/* Categories */}
        <FeaturedCategories 
          categories={categories}
          selected={selectedCategory ? [parseInt(selectedCategory)] : []} 
          onSelect={handleSelectFeaturedCategory} 
        />

        {/* Search */}
        <div className="flex gap-4 items-center justify-end">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Group Coachings"
            onChange={e => setSearchText(e.target.value || '')}
          />
        </div>

        {/* Content Cards */}
        <section>
          {isLoadingCoachings ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              {filteredCoachings.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredCoachings.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => router.push(`/portal/customer/group_coaching/${event.id}/details`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex justify-center items-center text-gray-500">
                  {searchText || selectedCategory ? 'No group coachings found matching your criteria' : 'No group coachings found'}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EnrolledGroupCoachings;
