'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatExpertName = expert => {
  const name = `${expert?.first_name || ''} ${expert?.last_name || ''}`.trim();
  return name || expert?.email || `Expert #${expert?.id}`;
};

const HomeCoachDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Home Coach Configuration"
      onEdit={() => router.push(`/portal/admin/lms/expert/home-coach/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Configuration ID">#{data?.id || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Status">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data?.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {data?.is_active ? 'Active' : 'Inactive'}
          </span>
        </DetailsRecord>
        <DetailsRecord label="Experts">
          {data?.experts?.length ? (
            <ul className="list-disc pl-5 space-y-1">
              {data.experts.map(expert => (
                <li key={expert.id}>{formatExpertName(expert)}</li>
              ))}
            </ul>
          ) : (
            'No experts selected'
          )}
        </DetailsRecord>
        <DetailsRecord label="Created At">{formatDate(data?.created_at)}</DetailsRecord>
        <DetailsRecord label="Updated At">{formatDate(data?.updated_at)}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default HomeCoachDetails;
