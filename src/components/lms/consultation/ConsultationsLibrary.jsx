'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaFilter } from 'react-icons/fa';
import useToggle from '@/hooks/useToggle';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import Popup from '@/components/common/popup';
import queryKeys from '@/utils/query-keys';
import EventCard from '../common/EventCard';
import ListFilter from '../common/ListFilters';
import { getCustomerConsultationsList } from '@/services/private/customer/consultation';
import ConsultationCard from '../common/ConsultationCard';

const ConsultationsLibrary = () => {
  const router = useRouter();

  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  const { isFetching: isLoadingCoachings, data: consultationResponse } = useQuery({
    queryFn: () => getCustomerConsultationsList(filters),
    queryKey: [queryKeys.customerConsultations, JSON.stringify(filters)],
    onError: (err) => {
      console.error('Error fetching group coaching list:', err);
    },
  });



  const filteredConsultations = useMemo(
    () =>
      (consultationResponse?.data?.results?.data?.['all-events'] || []).filter(event =>
        event.title.includes(searchText)
      ),
    [consultationResponse?.data?.results?.data, searchText]
  );

  const handleApplyFilter = values => {
    setFilters(values);
    toggleFilterModal(false);
  };

  const handleSelectFeaturedCategory = selected => {
    setFilters(prevState => {
      const existingCategories = selected.id
        ? [...new Set([...(prevState.categories || []), selected.id])]
        : [];

      return { ...prevState, categories: existingCategories };
    });
  };

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      <Popup heading="Group Coaching Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <ListFilter filters={filters} onApplyFilter={handleApplyFilter} />
      </Popup>

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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Personal Consultations</h1>
                <p className="text-gray-600 text-sm">One-on-one sessions with experts</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Achieve your personal goals with personal consultations arranged by our experts
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

      <div className="p-4 sm:p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        {/* Categories */}
        {/* <FeaturedCategories selected={filters.categories} onSelect={handleSelectFeaturedCategory} /> */}

        <div className="portal-search-row">
          <input
            className="portal-search-input rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Programs"
            onChange={e => setSearchText(e.target.value || '')}
          />
          <FaFilter className="cursor-pointer dark:text-white" onClick={() => toggleFilterModal()} />
        </div>

        {/* Content Cards */}
        <section className="min-h-[50vh]">
          {isLoadingCoachings ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredConsultations?.map(consultation => (
                <ConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                  onClick={() => router.push(`/portal/customer/lms/consultation/${consultation.id}/details`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ConsultationsLibrary;
