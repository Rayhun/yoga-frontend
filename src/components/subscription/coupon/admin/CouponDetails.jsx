'use client';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const CouponDetails = ({ data = {} }) => {
  const discountLabel =
    data.discount_type === 'percent'
      ? `${data.discount_value}%`
      : `${data.currency || ''} ${data.discount_value}`;

  const formatDate = iso =>
    iso ? new Date(iso).toLocaleString() : '—';

  return (
    <DetailsLayoutWrapper title="Coupon">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
        <DetailsRecord label="Promotion Code">{data.promotion_code || '—'}</DetailsRecord>
        <DetailsRecord label="Coupon Type">{data.coupon_type}</DetailsRecord>
        <DetailsRecord label="Discount Type">{data.discount_type}</DetailsRecord>
        <DetailsRecord label="Discount">{discountLabel}</DetailsRecord>
        {data.product_detail && (
          <DetailsRecord label="Plan">{data.product_detail.title}</DetailsRecord>
        )}
        <DetailsRecord label="Description">{data.description || '—'}</DetailsRecord>
        <DetailsRecord label="Valid From">{formatDate(data.valid_from)}</DetailsRecord>
        <DetailsRecord label="Valid Until">{formatDate(data.valid_to)}</DetailsRecord>
        <DetailsRecord label="Status">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {data.active ? 'Active' : 'Inactive'}
          </span>
        </DetailsRecord>
        <DetailsRecord label="Created At">{formatDate(data.created_at)}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default CouponDetails;
