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
import CoachingLibraryFilter from '../common/ListFilters';
import { getCustomerGroupCoachingList } from '@/services/private/customer/groupCoaching';
import EventCard from '../common/EventCard';

const GroupCoachingLibrary = () => {
  const router = useRouter();

  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  const { isFetching: isLoadingCoachings, data: groupCoachingResponse, failureReason } = useQuery({
    queryFn: () => getCustomerGroupCoachingList(filters),
    queryKey: [queryKeys.customerEvents, JSON.stringify(filters)],
    onError: (err) => {
      console.error('Error fetching group coaching list:', err);
    },
  });



  const filteredCoachings = useMemo(
    () =>
      (groupCoachingResponse?.data?.results?.data?.['all-events'] || []).filter(event =>
        event.title.includes(searchText)
      ),
    [groupCoachingResponse?.data?.results?.data, searchText]
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
        <CoachingLibraryFilter filters={filters} onApplyFilter={handleApplyFilter} />
      </Popup>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-12 px-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Group Coaching Sessions</h1>
                <p className="text-green-100 text-sm">Join group sessions with wellness experts</p>
              </div>
            </div>
            <p className="text-green-100 text-lg leading-relaxed">
              Achieve your personal goals with group coaching sessions led by our wellness experts
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

      <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        {/* Categories */}
        {/* <FeaturedCategories selected={filters.categories} onSelect={handleSelectFeaturedCategory} /> */}

        <div className="flex gap-4 items-center justify-end">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Group Coachings"
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
              {filteredCoachings?.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => router.push(`/portal/customer/group_coaching/${event.id}/details`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GroupCoachingLibrary;
