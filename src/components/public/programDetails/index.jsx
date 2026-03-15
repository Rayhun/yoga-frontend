'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { MdViewModule } from 'react-icons/md';
import { FaTv } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import ContentCard from '@/components/lms/program/customer/ContentCard';
import { getPublicProgramDetail } from '@/services/public/expert';
import queryKeys from '@/utils/query-keys';
import Button from '@/components/common/Button';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import useGeoLocation from '@/hooks/useGeoLocation';
import { toast } from 'react-toastify';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const TABS = {
  JOURNEY: 'journey',
  DESCRIPTION: 'description',
  BENEFITS: 'benefits',
};

const PublicProgramDetails = () => {
  const params = useParams();
  const router = useRouter();
  const programId = params?.programId;
  const [selectedTab, setSelectedTab] = useState(TABS.JOURNEY);

  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';

  const { data: response, isLoading } = useQuery({
    queryFn: () => getPublicProgramDetail({ id: programId }),
    queryKey: [queryKeys.publicExpertProgramDetails, programId],
    enabled: !!programId,
  });

  const programDetails = response?.data?.data || {};

  const displayedContent = useMemo(() => {
    if (!programDetails?.content || selectedTab !== TABS.JOURNEY) return [];
    return programDetails.content;
  }, [programDetails?.content, selectedTab]);

  if (isLoading) return <PageLoader />;

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const handlePublicBuyNow = () => {
    if (isGeoLoading) {
      toast.info('Detecting your location...');
      return;
    }

    if (!isDev && (!countryCode || !ALLOWED_COUNTRIES.includes(countryCode))) {
      toast.error('We currently only support purchases from the United States, Canada, and India.');
      return;
    }

    router.push(`/payment/guest/program/${programId}`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        <div className="w-full md:w-1/2">
          <Image
            src={programDetails?.image || '/images/content/default.png'}
            alt="Program Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{programDetails?.title}</h3>

          <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white">
            <div className="flex items-center gap-3">
              <FaTv size={24} className="text-primary" />
              <span>{programDetails?.session_count} Sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <MdViewModule size={24} className="text-primary" />
              <span>{programDetails?.modules_count} Modules</span>
            </div>
          </div>

          {programDetails?.experts && programDetails.experts.length > 0 ? (
            <div className="flex items-center gap-2">
              <AvatarGroup spacing="small" total={programDetails?.experts.length}>
                {programDetails?.experts?.map(expert => (
                  <Avatar key={expert.email} src={expert.image} />
                ))}
              </AvatarGroup>
              <p className="font-bold">Instructors:</p>
              <p className="flex gap-1">
                <span>{programDetails?.experts[0]?.name}</span>
                {programDetails?.experts.length > 1 ? (
                  <span>+ {programDetails?.experts.length - 1} more</span>
                ) : null}
              </p>
            </div>
          ) : null}

          <Button
            variant="primary"
            size="2xl"
            onClick={handlePublicBuyNow}
            disabled={isGeoLoading}
          >
            {isGeoLoading ? 'Loading...' : 'Buy Now'}
          </Button>
        </div>
      </div>

      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col gap-6">
        <div className="w-full">
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab value={TABS.JOURNEY} label="Journey" />
            <Tab value={TABS.DESCRIPTION} label="Description" />
            <Tab value={TABS.BENEFITS} label="Benefits" />
          </Tabs>
          <div className="py-5">
            <div hidden={selectedTab !== TABS.JOURNEY}>
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedContent.map(item => (
                  <ContentCard key={item.id} item={item} isEnrolled={false} />
                ))}
              </div>
            </div>

            <div hidden={selectedTab !== TABS.DESCRIPTION}>
              <ControllableRichText className="dark:text-white">
                {programDetails?.description || 'No description provided'}
              </ControllableRichText>
            </div>

            <div hidden={selectedTab !== TABS.BENEFITS}>
              <h5 className="text-black-2 font-bold mb-3">What you will learn</h5>
              <ol className="list-tick list-inside grid grid-cols-2 gap-2 dark:text-white">
                {programDetails?.benefits?.map(benefit => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProgramDetails;
