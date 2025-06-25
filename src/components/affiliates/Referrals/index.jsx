'use client';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const ReferralsDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Referral Details">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Referral Link">{data?.referral_link}</DetailsRecord>
        <DetailsRecord label="Referral Code">{data?.referral_code}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ReferralsDetails;
