'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const SubscriptionPlanDetails = ({ data = {} }) => {
  const router = useRouter();

  const renderFeatures = () => {
    if (!data.features || data.features.length === 0) {
      return 'No features specified';
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {data.features.map((feature, index) => (
          <li key={index} className="text-gray-700">{feature}</li>
        ))}
      </ul>
    );
  };

  const renderDiscountedVolume = () => {
    if (!data.discounted_volume || data.discounted_volume.length === 0) {
      return 'No volume discounts configured';
    }
    
    return (
      <div className="space-y-3">
        {data.discounted_volume.map((discount, index) => (
          <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Volume: {discount.volume}</span>
              <span className="text-sm text-gray-600">{discount.type}</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-semibold text-blue-600">{discount.discount}%</span>
              <span className="text-sm text-gray-500 ml-1">discount</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPrograms = () => {
    if (!data.programs || data.programs.length === 0) {
      return 'No programs assigned';
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {data.programs.map((program, index) => (
          <li key={index} className="text-gray-700">{program.title}</li>
        ))}
      </ul>
    );
  };

  return (
    <DetailsLayoutWrapper
      title="Subscription Plan"
      onEdit={() => router.push(`/portal/admin/subscription/plan/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="Subscription Type">{data.subscription_type}</DetailsRecord>
        <DetailsRecord label="Subscription Tenure">{data.subscription_tenure}</DetailsRecord>
        
        {/* Conditional pricing display based on subscription type */}
        {data.subscription_type === 'Individual' ? (
          <>
            <DetailsRecord label="Price">${data.price}</DetailsRecord>
            {data.discounted_price > 0 && (
              <DetailsRecord label="Discounted Price">${data.discounted_price}</DetailsRecord>
            )}
          </>
        ) : (
          <DetailsRecord label="Per Volume Price">${data.price}</DetailsRecord>
        )}
        
        {/* Show discounted volume for Business plans */}
        {data.subscription_type === 'Business' && (
          <DetailsRecord label="Discounted Volume">
            {renderDiscountedVolume()}
          </DetailsRecord>
        )}
        
        <DetailsRecord label="Features">
          {renderFeatures()}
        </DetailsRecord>
        
        <DetailsRecord label="Programs">
          {renderPrograms()}
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default SubscriptionPlanDetails;
