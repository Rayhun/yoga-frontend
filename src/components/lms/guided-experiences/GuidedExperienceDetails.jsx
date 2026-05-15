'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getUserTimeAndTimezone, toastApiError } from '@/utils/helpers';
import { duplicateGuidedExperience } from '@/services/private/lms/guided-experiences';
import queryKeys from '@/utils/query-keys';
import { getCatalogTagChipLabel } from '@/utils/catalogTag';

dayjs.extend(utc);

const GuidedExperienceDetails = ({ data = {}, eventType }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: duplicateExperience, isPending: isDuplicating } = useMutation({
    mutationFn: duplicateGuidedExperience,
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs.utc(dateString).format('MMMM DD, YYYY [at] hh:mm A');
  };

  const formatUserDate = (dateString, timeZone) => {
    if (!dateString) return 'N/A';
    
    // If timezone is available, convert to user's timezone (Calendly-style)
    if (timeZone) {
      try {
        const result = getUserTimeAndTimezone(dateString, timeZone);
        return result.formattedTimeDisplay;
      } catch (error) {
        console.error('Error converting time to user timezone:', error);
        // Fallback to UTC formatting
        return dayjs.utc(dateString).format('MMMM DD, YYYY [at] hh:mm A');
      }
    }
    
    // Fallback to UTC if no timezone
    return dayjs.utc(dateString).format('MMMM DD, YYYY [at] hh:mm A');
  };

  const getEventTypeLabel = (type) => {
    const types = {
      workshop: 'Workshop',
      bootcamp: 'Bootcamp',
      'live event': 'Live Event',
      masterclass: 'Masterclass',
    };
    return types[type] || type || 'N/A';
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getEditPath = () => {
    const eventTypePath = eventType === 'live event' ? 'live-event' : eventType;
    return `/portal/admin/lms/expert/guided-experiences/${eventTypePath}/${data.id}/edit`;
  };

  const handleCopy = async () => {
    try {
      const response = await duplicateExperience({ id: data.id });
      const copiedEvent = response?.data?.data;
      const itemEventType = copiedEvent?.event_type || eventType;
      const eventTypePath = itemEventType === 'live event' ? 'live-event' : itemEventType;

      toast.success('Guided experience copied successfully');
      await queryClient.invalidateQueries([queryKeys.guidedExperiences, eventType]);

      if (copiedEvent?.id) {
        router.push(`/portal/admin/lms/expert/guided-experiences/${eventTypePath}/${copiedEvent.id}/edit`);
      }
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <DetailsLayoutWrapper 
      title="Guided Experience Details"
      onEdit={() => router.push(getEditPath())}
      customActions={
        <button
          className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-1 text-sm text-center font-medium text-primary hover:bg-primary hover:text-white disabled:opacity-60"
          onClick={handleCopy}
          disabled={isDuplicating}
        >
          {isDuplicating ? 'Copying...' : 'Copy'}
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title || 'N/A'}</DetailsRecord>
        
        {data.guest_name && (
          <DetailsRecord label="Guest Name">{data.guest_name}</DetailsRecord>
        )}
        
        <DetailsRecord label="Event Type">
          {getEventTypeLabel(data.event_type)}
        </DetailsRecord>

        <DetailsRecord label="Description">
          <ControllableRichText>{data.description || 'No description provided'}</ControllableRichText>
        </DetailsRecord>

        <DetailsRecord label={data.guest_name ? 'Guest' : 'Expert'}>
          {data.guest_name ? (
            data.guest_name
          ) : data.created_by ? (
            <div className="flex items-center gap-2">
              <span>
                {data.created_by.first_name || ''} {data.created_by.last_name || ''}
              </span>
              {data.created_by.email && (
                <span className="text-gray-500 text-sm">({data.created_by.email})</span>
              )}
            </div>
          ) : (
            'N/A'
          )}
        </DetailsRecord>

        <DetailsRecord label="Start Date & Time">
          {(() => {
            const originalTime = formatDate(data.start_date);
            const userTime = formatUserDate(data.start_date, data.time_zone || 'N/A');
            const isSame = originalTime === userTime;
            
            return (
              <>
                {originalTime}
                {!isSame && (
                  <span className="text-gray-500 text-sm"> ({userTime} in your timezone)</span>
                )}
              </>
            );
          })()}
        </DetailsRecord>

        <DetailsRecord label="Duration">
          {data.duration ? `${data.duration} minutes` : 'N/A'}
        </DetailsRecord>

        <DetailsRecord label="Time Zone">
          {data.time_zone || 'N/A'}
        </DetailsRecord>

        <DetailsRecord label="Price">
          {data.price ? `$${data.price}` : 'Free'}
        </DetailsRecord>

        <DetailsRecord label="Active Status">
          {getStatusBadge(data.is_active)}
        </DetailsRecord>

        {data.image && (
          <DetailsRecord label="Image">
            <DetailsFileCard fileURL={data.image} isImage />
          </DetailsRecord>
        )}

        {data.meeting_link && (
          <DetailsRecord label="Meeting Link">
            <a
              href={data.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {data.meeting_link}
            </a>
          </DetailsRecord>
        )}

        {data.recording_link && (
          <DetailsRecord label="Recording Link">
            <a
              href={data.recording_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {data.recording_link}
            </a>
          </DetailsRecord>
        )}

        {data.followup_support && (
          <DetailsRecord label="Follow-up Support">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(data.followup_support) ? (
                data.followup_support.map((support, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {support}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {data.followup_support}
                </span>
              )}
            </div>
          </DetailsRecord>
        )}

        <MultiValueDetailsRecord
          label="Categories"
          data={data.categories}
          getChipLabel={item => item.name || item}
        />

        <MultiValueDetailsRecord
          label="Tags"
          data={data.tags}
          getChipLabel={getCatalogTagChipLabel}
        />

        {data.is_online !== undefined && (
          <DetailsRecord label="Online Event">
            {data.is_online ? 'Yes' : 'No'}
          </DetailsRecord>
        )}

        {data.zoom_meeting_id && (
          <DetailsRecord label="Zoom Meeting ID">
            {data.zoom_meeting_id}
          </DetailsRecord>
        )}
      </div>
    </DetailsLayoutWrapper>
  );
};

export default GuidedExperienceDetails;

