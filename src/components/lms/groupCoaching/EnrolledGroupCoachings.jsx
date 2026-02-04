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

  // Get selected category from URL params using Next.js useSearchParams for stability
  const selectedCategory = nextSearchParams.get('categories') || '';

  // Create stable filters object using useMemo to prevent unnecessary re-renders
  const filters = useMemo(() => {
    const baseFilters = {};
    if (selectedCategory) {
      baseFilters.categories = [parseInt(selectedCategory)];
    }
    return baseFilters;
  }, [selectedCategory]);

  const { isLoading: isLoadingCoachings, data: coachingsResponse } = useQuery({
    queryFn: () => getEnrolledGroupCoachings(filters),
    queryKey: [queryKeys.customerEnrolledGroupCoachings, selectedStatus, JSON.stringify(filters)],
  });

  // Extract categories and coachings from the API response
  const responseData = coachingsResponse?.data?.results?.data;
  
  const categories = useMemo(
    () => responseData?.['all-categories'] || [],
    [responseData]
  );

  const coachings = useMemo(
    () => responseData?.['all-events'] || [],
    [responseData]
  );

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
      <div className="bg-white text-gray-800 py-12 px-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden border border-gray-100">
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-800 rounded-sm rotate-45 flex items-center justify-center">
                <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Guided Experiences</h1>
                <p className="text-gray-600 text-sm">Join group sessions with wellness experts</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Join group sessions and workshops led by expert coaches to enhance your wellness journey
            </p>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 aspect-[16/9]">
            <div className="relative">
              <Image
                src="/images/content/Wellness_Workshops.png"
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
            placeholder="Search Guided Experiences"
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
                  {searchText || selectedCategory ? 'No guided experiences found matching your criteria' : 'No guided experiences found'}
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
