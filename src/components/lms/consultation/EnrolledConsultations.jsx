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

  const { isLoading: isLoadingPrograms, data: consultationResponse } = useQuery({
    queryFn: () => {
      console.log('API Call with filters:', filters);
      return getEnrolledConsultations(filters);
    },
    queryKey: [queryKeys.customerEnrolledConsultations, selectedStatus, JSON.stringify(filters)],
  });

  // Extract categories from the API response
  const categories = useMemo(
    () => consultationResponse?.data?.results?.data?.['all-categories'] || [],
    [consultationResponse?.data?.results?.data]
  );

  const consultations = consultationResponse?.data?.results?.data?.['all-events'] || [];

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
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-12 px-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Your Consultations</h1>
                <p className="text-green-100 text-sm">One-on-one sessions with experts</p>
              </div>
            </div>
            <p className="text-green-100 text-lg leading-relaxed">
              Access your scheduled consultations and connect with wellness experts for personalized guidance
            </p>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-[16/9]">
              <Image
                src="/images/content/Wellness_Workshops.png"
                alt="Hero Image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full rounded-lg shadow-lg object-cover"
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
