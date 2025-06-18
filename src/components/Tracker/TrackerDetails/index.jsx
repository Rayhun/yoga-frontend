'use client';
import { PiMoon } from 'react-icons/pi';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useParams } from 'next/navigation';
import { adminGetGoalsTrackerDetails } from '@/services/private/customer/goal';

const ratings = [
  { label: 'Poor', icon: '😴', value: 'poor' },
  { label: 'Below Average', icon: '😟', value: 'below average' },
  { label: 'Average', icon: '😦', value: 'average' },
  { label: 'Good', icon: '😃', value: 'good' },
  { label: 'Excellent', icon: '☺️', value: 'excellent' },
];

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const SleepTracker = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const { id } = useParams();

  const { isFetching, data: tracker } = useQuery({
    queryFn: () => adminGetGoalsTrackerDetails(id),
    queryKey: [queryKeys.adminGetGoalsTrackerDetails, id],
  });

  const trackerData = tracker?.data?.data?.tracker || {};

  if (!isFetching && !trackerData) return <div className="text-center">No data available</div>;

  return (
    <LoadingWrapper isLoading={isFetching}>
      <div className="max-w-5xl mx-auto px-6 y-2">
        <h1 className="text-2xl font-bold mb-4">Goal Details</h1>
        <div className="space-y-4 mb-6">
          <Section>
            <h1 className="text-lg font-bold mb-2">Title</h1>
            <div>{tracker?.data?.data?.title}</div>
          </Section>
          <Section>
            <h1 className="text-lg font-bold mb-2">Concern</h1>
            <div>{tracker?.data?.data?.concern}</div>
          </Section>
        </div>
        <div className="bg-green-600 text-white py-6 px-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center text-lg gap-2">
            <span className="text-lg">{trackerData?.icon || <PiMoon size={20} />}</span>
            <span className="font-semibold">{trackerData?.title}</span>
          </div>
        </div>
        <div className="bg-white rounded-b-xl p-6 shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{trackerData?.description}</h2>
          </div>
          <p className="text-md font-medium text-green-600 mb-4 flex items-center gap-1">
            {dayjs(trackerData.created_at).format('dddd MMMM D')}
            {dayjs(trackerData.created_at).isSame(dayjs(), 'day') ? ' (Today)' : ''}
          </p>
          <div className="grid grid-cols-5 gap-3 mb-10">
            {ratings.map(({ label, icon }, index) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setSelectedOption(`option_${index + 1}`);
                }}
                className={`rounded-xl py-10 px-2 flex flex-col items-center bg-gray-100 hover:bg-orange-100 transition ${
                  selectedOption === `option_${index + 1}` ? 'border-2 border-orange-300 bg-orange-100' : ''
                }`}
              >
                <span className="text-2xl">{trackerData[`option_${index + 1}_icon`] || icon}</span>
                <span className="text-sm font-bold mt-1">
                  {trackerData[`option_${index + 1}_title`] || label}
                </span>
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="bg-gray-100 text-lg font-bold text-orange-300 p-4 text-center rounded-xl capitalize mb-4">
              {trackerData[`${selectedOption}_description`] || 'No description available'}
            </div>
          )}
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default SleepTracker;
