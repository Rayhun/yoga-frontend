'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import queryKeys from '@/utils/query-keys';
import { getEnrolledConsultations } from '@/services/private/customer/consultation';
import ConsultationCard from '../common/ConsultationCard';

const EnrolledConsultations = () => {
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

  const { isLoading: isLoadingPrograms, data: consultationResponse } = useQuery({
    queryFn: () => getEnrolledConsultations(filters),
    queryKey: [queryKeys.customerEnrolledConsultations, selectedStatus, JSON.stringify(filters)],
  });

  // Extract categories and consultations from the API response
  const responseData = consultationResponse?.data?.results?.data;
  
  const categories = useMemo(
    () => responseData?.['all-categories'] || [],
    [responseData]
  );

  const consultations = useMemo(
    () => responseData?.['all-events'] || [],
    [responseData]
  );

  // Filter consultations based on search text only (category filtering is now handled by API)
  const filteredConsultations = useMemo(() => {
    if (!searchText) return consultations;
    
    return consultations.filter(consultation => {
      return consultation.title.toLowerCase().includes(searchText.toLowerCase()) ||
             consultation.description?.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [consultations, searchText]);

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
      <div className="bg-white text-gray-800 portal-hero rounded-2xl shadow-2xl mb-8 relative overflow-hidden border border-gray-100">
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-800 rounded-sm rotate-45 flex items-center justify-center">
                <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Consultations</h1>
                <p className="text-gray-600 text-sm">One-on-one sessions with experts</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Access your scheduled consultations and connect with wellness experts for personalized guidance
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

      <div className="min-h-[60vh] flex flex-col gap-4 md:gap-7 p-4 sm:p-6 bg-white rounded-lg shadow-md">
        {/* Categories */}
        <FeaturedCategories 
          categories={categories}
          selected={selectedCategory ? [parseInt(selectedCategory)] : []} 
          onSelect={handleSelectFeaturedCategory} 
        />

        {/* Search */}
        <div className="portal-search-row">
          <input
            className="portal-search-input rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Consultations"
            onChange={e => setSearchText(e.target.value || '')}
          />
        </div>

        {/* Content Cards */}
        <section>
          {isLoadingPrograms ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              {filteredConsultations.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredConsultations.map(consultation => (
                    <ConsultationCard
                      key={consultation.id}
                      consultation={consultation}
                      onClick={() => router.push(`/portal/customer/lms/consultation/${consultation.id}/details`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex justify-center items-center text-gray-500">
                  {searchText || selectedCategory ? 'No consultations found matching your criteria' : 'No consultations found'}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EnrolledConsultations;
