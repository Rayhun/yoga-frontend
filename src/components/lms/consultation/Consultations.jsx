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

const ConsultationsLibrary = () => {
  const router = useRouter();

  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});

  const { isFetching: isLoadingCoachings, data: groupCoachingResponse } = useQuery({
    queryFn: () => getCustomerConsultationsList(filters),
    queryKey: [queryKeys.customerConsultations, JSON.stringify(filters)],
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
        <ListFilter filters={filters} onApplyFilter={handleApplyFilter} />
      </Popup>

      {/* Hero Section */}
      {/* <div className="bg-white rounded-md py-12 px-6 md:px-12 flex flex-col md:flex-row items-center dark:bg-boxdark dark:text-white">
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
      </div> */}

      <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
        {/* Categories */}
        {/* <FeaturedCategories selected={filters.categories} onSelect={handleSelectFeaturedCategory} /> */}

        <div className="flex gap-4 items-center justify-end">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
              {filteredCoachings?.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => router.push(`/portal/customer/lms/consultation/${event.id}/details`)}
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
