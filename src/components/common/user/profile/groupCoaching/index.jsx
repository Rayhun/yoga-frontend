import React from 'react';
import Spinner from '@/components/common/loader/Spinner';
import EventCard from '@/components/lms/common/EventCard';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { GoPlus } from 'react-icons/go';
import { FiSearch } from 'react-icons/fi';

const UserProfileGroupCoaching = ({
  filteredCoachings,
  isLoadingCoachings,
  setSearchText,
  onClickEvent,
  isExpertView = false,
  isZoomConnected = false,
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-white dark:from-emerald-950/20 dark:via-green-950/10 dark:to-gray-900 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 p-6 shadow-sm">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Guided Experiences</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredCoachings?.length || 0} {filteredCoachings?.length === 1 ? 'experience' : 'experiences'} available
            </p>
          </div>
          <div className="w-full md:w-auto flex gap-3 items-center justify-end flex-wrap-reverse">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-none min-w-[280px]">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/30 transition-all duration-200"
                placeholder="Search Guided Experiences"
                onChange={e => setSearchText(e.target.value || '')}
              />
            </div>
            {isExpertView && (
              <Button
                size="lg"
                className="text-md flex gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() =>
                  router.push(`/portal/teacher/group_coaching/add?is_zoom_connected=${isZoomConnected}`)
                }
                Icon={GoPlus}
              >
                New Guided Experience
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {isLoadingCoachings ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      ) : filteredCoachings && filteredCoachings.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center mb-4">
            <FiSearch className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No experiences found</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
            Try adjusting your search or filter criteria to find more guided experiences.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfileGroupCoaching;
