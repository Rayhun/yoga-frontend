import React from 'react';
import Spinner from '@/components/common/loader/Spinner';
import EventCard from '@/components/lms/common/EventCard';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { GoPlus } from 'react-icons/go';

const UserProfileGroupCoaching = ({
  filteredCoachings,
  isLoadingCoachings,
  setSearchText,
  onClickEvent,
  isExpertView = false,
}) => {
  const router = useRouter();
  return (
    <div className="p-6 bg-white flex flex-col gap-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">Group Coaching Events</h2>
        <div className="w-full md:w-auto flex gap-4 items-center justify-end flex-wrap-reverse">
          <input
            className="min-w-[300px] rounded-lg border border-stroke bg-transparent py-2 px-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Search Group Coaching"
            onChange={e => setSearchText(e.target.value || '')}
          />
          {isExpertView && (
            <Button
              size="lg"
              className="text-md flex gap-2"
              onClick={() => router.push('/portal/teacher/group_coaching/add')}
              Icon={GoPlus}
            >
              New Group Coaching
            </Button>
          )}
        </div>
      </div>
      {isLoadingCoachings ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCoachings.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onClickEvent(event)}
              isExpertView={isExpertView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfileGroupCoaching;
