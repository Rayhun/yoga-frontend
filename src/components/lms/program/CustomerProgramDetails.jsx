'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { BiCheck } from 'react-icons/bi';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { MdViewModule } from 'react-icons/md';
import { FaTv } from 'react-icons/fa';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useModal from '@/hooks/useModal';
import PageLoader from '@/components/common/loader/PageLoader';
import LMSExpertsList from '@/components/lms/general/section/LMSExpertsList';
import { getSingleProgram } from '@/services/private/customer/program';
import queryKeys from '@/utils/query-keys';

const TABS = {
  JOURNEY: 'journey',
  DESCRIPTION: 'description',
  BENEFITS: 'benefits',
};

const getContentRef = item => {
  let label = 'Item';
  let href = '#';

  if (item.content_type === 'module') {
    label = 'Module';
    href = `/portal/customer/lms/module/${item.id}/details`;
  } else if (item.content_type === 'session') {
    if (item.session_type === 'Image') {
      label = 'Session';
      href = `/portal/customer/lms/session/image/${item.id}/details`;
    } else if (item.session_type === 'Audio') {
      label = 'Session';
      href = `/portal/customer/lms/session/audio/${item.id}/details`;
    } else if (item.session_type === 'Video') {
      label = 'Session';
      href = `/portal/customer/lms/session/video/${item.id}/details`;
    }
  } else if (item.content_type === 'quiz') {
    label = 'Quiz';
    href = `/portal/customer/lms/quiz/${item.id}/details`;
  }
  return { label, href };
};

const CustomerProgramDetails = () => {
  const params = useParams();
  const renderModal = useModal();
  const [selectedTab, setSelectedTab] = useState(TABS.JOURNEY);
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleProgram({ id: params.id }),
    queryKey: [queryKeys.customerPrograms, params.id],
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

  const programDetails = response?.data?.data || {};

  const programProgress = Math.round(
    (programDetails.content?.filter(i => i.completed).length / programDetails.content?.length) * 100
  );

  return (
    <div>
      {/* Details Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full md:w-1/2">
          <Image
            src={programDetails?.image || '/images/program/program-01.jpg'}
            alt="Program Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{programDetails.title}</h3>
          {/* Stats */}
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

          {/* Ratings */}
          {/* <div className="flex items-center gap-2">
            <p className="text-xl">4.7</p>
            <FaStar size={24} className="text-yellow-500" />
            <p>(27 ratings)</p>
          </div> */}

          {programDetails?.experts.length > 0 ? (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleViewExperts(programDetails?.experts)}
            >
              <AvatarGroup spacing="small" total={programDetails?.experts.length}>
                {programDetails?.experts?.map(expert => (
                  <Avatar key={expert.email} src={expert.image} />
                ))}
              </AvatarGroup>
              <p className="font-bold">Instructors:</p>
              <p className="flex gap-1 underline-offset-2 hover:underline">
                <span>{programDetails?.experts[0]?.name}</span>
                {programDetails?.experts.length > 1 ? (
                  <span>+ {programDetails?.experts.length - 1} more</span>
                ) : null}
              </p>
            </div>
          ) : null}

          {/* Begin Program Button */}
          <div className="flex flex-col gap-3">
            <button className="w-full md:w-auto bg-primary text-white p-4 rounded-md shadow hover:bg-primary/80">
              Begin Program
            </button>
          </div>
        </div>
      </div>

      {/* Program Content */}
      <div className="py-6 my-5 text-gray-800 dark:text-gray-200 flex flex-col md:flex-row gap-6 md:gap-12">
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
                {programDetails?.content.map(item => {
                  const itemRef = getContentRef(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition"
                    >
                      {/* Course Image */}
                      <div className="relative">
                        <Image
                          width={0}
                          height={0}
                          src={programDetails?.image}
                          alt="image"
                          sizes="100vw"
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                        {/* Completion Icon */}
                        {item.completed ? (
                          <div className="absolute -bottom-4 left-2 bg-white rounded-full p-1 shadow-lg">
                            <BiCheck size={24} className="bg-secondary rounded-full text-white" />
                          </div>
                        ) : null}
                      </div>

                      {/* Course Info */}
                      <div className="p-4">
                        <h2 className="text-lg font-bold line-clamp-1 text-gray-900 dark:text-white">
                          {item.title}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-1 dark:text-gray-400 mt-2">
                          {item.description}
                        </p>

                        {/* Details */}
                        <div className="flex gap-2 items-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                          <FaTv />
                          <span>{item.total_item || 0}</span>
                        </div>

                        {/* Action Button */}
                        <Link href={itemRef.href}>
                          <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/80 transition">
                            {item.completed ? 'View' : 'Start'} {itemRef.label}
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Tab */}
            <div hidden={selectedTab !== TABS.DESCRIPTION}>
              <p className="dark:text-white">{programDetails?.description}</p>
            </div>

            {/* Benefits Tab */}
            <div hidden={selectedTab !== TABS.BENEFITS}>
              <ol className="list-disc list-inside dark:text-white">
                {programDetails?.benefits?.map(benefit => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Program Details Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg text-primary font-bold">Program Progress</h3>
            <div className="flex flex-col gap-2">
              <LinearProgress
                variant="determinate"
                color="warning"
                className="rounded-full h-3"
                value={programProgress}
                classes={{
                  bar: 'bg-secondary',
                }}
              />
              <span className="text-sm text-right dark:text-white">{programProgress}% Complete</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg text-primary font-bold">Program Navigation</h3>
            <ol className="relative p-5 border-s-4 border-gray-200 dark:border-gray-700">
              {programDetails?.content.map(item => (
                <li key={item.id} className="ms-6 mb-6">
                  <div className="absolute -start-4 bg-white rounded-full p-1 shadow-lg">
                    <BiCheck
                      size={20}
                      className={`rounded-full text-white ${item.completed ? 'bg-secondary' : 'bg-white'}`}
                    />
                  </div>
                  <h5 className="mb-1 text-md font-semibold text-gray-900 dark:text-white">{item.title}</h5>
                  <p className="w-full mb-2 text-sm font-normal leading-none line-clamp-2 text-gray-400 dark:text-gray-500">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProgramDetails;
