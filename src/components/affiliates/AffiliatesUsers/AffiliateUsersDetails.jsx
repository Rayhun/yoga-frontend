'use client';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { Chip } from '@mui/material';

const DURATION_OPTIONS = {
  1: '1-month',
  3: '3-month',
  6: '6-month',
  12: '12-month',
  0: 'Forever',
};

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

const AffiliateUsersDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Affiliate User Details">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{`${data?.first_name} ${data?.last_name}`}</DetailsRecord>
        <DetailsRecord label="Email">{data?.email}</DetailsRecord>
        <DetailsRecord label="Pay Email">{data?.paypal_email}</DetailsRecord>
        <DetailsRecord label="Business Model"><span className='capitalize'>{data?.business_model}</span></DetailsRecord>
        <DetailsRecord label="Payout Duration">{DURATION_OPTIONS[data?.payout_duration] || "N/A"}</DetailsRecord>
        <DetailsRecord label="Commission Type">{data?.commission_type_name || "N/A"}</DetailsRecord>
        <DetailsRecord label="Percentage">{data?.percentage ? `${data?.percentage}%`: "N/A"}</DetailsRecord>
        <DetailsRecord label="Refferral Code">{data?.referral_code || "N/A"}</DetailsRecord>
        <DetailsRecord label="Refferral Count">{data?.referral_count || "N/A"}</DetailsRecord>
        <DetailsRecord label="Refferral Links">
          <a href={data?.referral_link} target="_blank" rel="noopener noreferrer" className="flex flex-wrap gap-2">
            {data?.referral_link?.map(link => (
              <ProfileChip key={link} label={link} />
            ))}
          </a>
        </DetailsRecord>
        <DetailsRecord label="Channels">
          <span className="flex flex-wrap gap-2">
            {data?.channels?.map(channel => (
              <ProfileChip key={channel} label={channel} />
            ))}
          </span>
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default AffiliateUsersDetails;
