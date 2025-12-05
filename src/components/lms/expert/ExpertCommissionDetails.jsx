'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const ExpertCommissionDetails = ({ data = {} }) => {
  const router = useRouter();

  const formatValue = (value, valueType) => {
    if (valueType === 'percent') {
      return `${value}%`;
    }
    return `$${value}`;
  };

  const formatValueType = (valueType) => {
    return valueType === 'percent' ? 'Percentage' : 'Fixed Amount';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DetailsLayoutWrapper
      title="Expert Commission Details"
      onEdit={() => router.push(`/portal/admin/lms/expert/commission/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Commission Type">{data?.commission_type || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Value Type">{formatValueType(data?.commission_value_type)}</DetailsRecord>
        <DetailsRecord label="Commission Value">
          {formatValue(data?.commission_value, data?.commission_value_type)}
        </DetailsRecord>
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
        <DetailsRecord label="Commission ID">#{data?.id || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Created At">{formatDate(data?.created_at)}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ExpertCommissionDetails;
