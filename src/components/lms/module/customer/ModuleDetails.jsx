'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { BiCheck } from 'react-icons/bi';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FaTv } from 'react-icons/fa';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useModal from '@/hooks/useModal';
import PageLoader from '@/components/common/loader/PageLoader';
import LMSExpertsList from '@/components/lms/general/section/LMSExpertsList';
import ContentCard from './ContentCard';
import { getSingleModule } from '@/services/private/customer/module';
import queryKeys from '@/utils/query-keys';

const TABS = {
  JOURNEY: 'journey',
  DESCRIPTION: 'description',
  BENEFITS: 'benefits',
};

const ModuleDetails = () => {
  const params = useParams();
  const renderModal = useModal();
  const [selectedTab, setSelectedTab] = useState(TABS.JOURNEY);
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleModule({ id: params.id }),
    queryKey: [queryKeys.customerModules, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const handleViewExperts = async experts => {
    await renderModal({
      heading: 'Experts',
      content: <LMSExpertsList experts={experts} />,
      size: 'md',
    });
  };

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const moduleDetails = response?.data?.data || {};

  const moduleProgress = Math.round(
    (moduleDetails.content?.filter(i => i.completed).length / moduleDetails.content?.length) * 100
  );

  return (
    <div>
      {/* Details Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full md:w-1/2">
          <Image
            src={moduleDetails?.image || '/images/module/module-01.jpg'}
            alt="Module Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{moduleDetails.title}</h3>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white">
            <div className="flex items-center gap-3">
              <FaTv size={24} className="text-primary" />
              <span>{moduleDetails?.session_count} Sessions</span>
            </div>
          </div>

          {/* Ratings */}
          {/* <div className="flex items-center gap-2">
            <p className="text-xl">4.7</p>
            <FaStar size={24} className="text-yellow-500" />
            <p>(27 ratings)</p>
          </div> */}

          {moduleDetails?.experts?.length > 0 ? (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleViewExperts(moduleDetails?.experts)}
            >
              <AvatarGroup spacing="small" total={moduleDetails?.experts.length}>
                {moduleDetails?.experts?.map(expert => (
                  <Avatar key={expert.email} src={expert.image} />
                ))}
              </AvatarGroup>
              <p className="font-bold">Instructors:</p>
              <p className="flex gap-1 underline-offset-2 hover:underline">
                <span>{moduleDetails?.experts[0]?.name}</span>
                {moduleDetails?.experts.length > 1 ? (
                  <span>+ {moduleDetails?.experts.length - 1} more</span>
                ) : null}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Module Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col md:flex-row gap-6 md:gap-12">
        <div className="w-full md:w-3/4">
          {/* Tabs */}
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab value={TABS.JOURNEY} label="Journey" />
            <Tab value={TABS.DESCRIPTION} label="Description" />
            <Tab value={TABS.BENEFITS} label="Benefits" />
          </Tabs>
          <div className="py-5">
            {/* Journey Tab */}
            <div hidden={selectedTab !== TABS.JOURNEY}>
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moduleDetails?.content?.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Description Tab */}
            <div hidden={selectedTab !== TABS.DESCRIPTION}>
              <p className="dark:text-white">{moduleDetails?.description}</p>
            </div>

            {/* Benefits Tab */}
            <div hidden={selectedTab !== TABS.BENEFITS}>
              <h5 className="text-black-2 font-bold mb-3">What you will learn</h5>
              <ol className="list-tick list-inside grid grid-cols-2 gap-2 dark:text-white">
                {moduleDetails?.benefits?.map(benefit => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Module Details Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg text-primary font-bold">Module Progress</h3>
            <div className="flex flex-col gap-2">
              <LinearProgress className="rounded-full !h-2" value={moduleProgress} />
              <span className="text-sm text-right dark:text-white">{moduleProgress}% Complete</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg text-primary font-bold">Module Navigation</h3>
            <ol className="relative p-5 border-s-4 border-gray-200 dark:border-gray-700">
              {moduleDetails?.content?.map(item => (
                <li key={item.id} className="ms-6 mb-6">
                  <div className="absolute -start-4 bg-white rounded-full p-1 shadow-lg">
                    <BiCheck
                      size={20}
                      className={`rounded-full text-white ${item.completed ? 'bg-secondary' : 'bg-white'}`}
                    />
                  </div>
                  <h5 className="mb-1 text-md font-semibold text-gray-900 dark:text-white">{item.title}</h5>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetails;
