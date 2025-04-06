'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import ContentCard from './ContentCard';
import { getSingleProgram, enrollProgram } from '@/services/private/customer/program';
import queryKeys from '@/utils/query-keys';
import Link from 'next/link';

const TABS = {
  JOURNEY: 'journey',
  DESCRIPTION: 'description',
  BENEFITS: 'benefits',
};

const ProgramDetails = () => {
  const params = useParams();
  const renderModal = useModal();
  const programID = params.id;
  const [selectedTab, setSelectedTab] = useState(TABS.JOURNEY);
  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getSingleProgram({ id: programID }),
    queryKey: [queryKeys.customerPrograms, programID],
  });
  const { mutateAsync: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: enrollProgram,
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

  const handleEnrollProgram = async () => {
    try {
      await enroll({ id: programID });
      refetch();
      toast.success('Program enrolled successfully');
    } catch (error) {
      toast.error('Something went wrong in enrolling the program');
    }
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
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
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

          {/* Enrollment */}
          {programDetails?.is_enroll ? (
            <div className="!absolute !top-3 !right-0 px-4 py-2 rounded-tl-xl rounded-bl-xl bg-orange-500 text-white">
              {programDetails?.status}
            </div>
          ) : programDetails?.is_paid && programDetails?.price ? (
            <Link href={`/payment/program/${programID}`}>
              <div
                className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 text-center rounded-md shadow hover:bg-primary/80"
              >
                {'Buy Now'}
              </div>
            </Link>
          ) : (
            <button
              className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 rounded-md shadow hover:bg-primary/80"
              disabled={isEnrolling}
              onClick={handleEnrollProgram}
            >
              {isEnrolling ? 'Enrolling' : 'Begin Program'}
            </button>
          )}
        </div>
      </div>

      {/* Program Content */}
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
                {programDetails?.content.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Description Tab */}
            <div hidden={selectedTab !== TABS.DESCRIPTION}>
              <p className="dark:text-white">{programDetails?.description}</p>
            </div>

            {/* Benefits Tab */}
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

        {/* Program Details Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg text-primary font-bold">Program Progress</h3>
            <div className="flex flex-col gap-2">
              <LinearProgress className="rounded-full !h-2" value={programProgress} />
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
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
