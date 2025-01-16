'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { MdViewModule } from 'react-icons/md';
import { FaStar, FaPlay, FaTv } from 'react-icons/fa';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useModal from '@/hooks/useModal';
import PageLoader from '@/components/common/loader/PageLoader';
import ProgramExpertsList from './ProgramExpertsList';
import { getSingleProgram } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const CustomerProgramDetails = () => {
  const params = useParams();
  const renderModal = useModal();
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleProgram({ id: params.id }),
    queryKey: [queryKeys.lmsPrograms, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const handleViewExperts = async () => {
    // await renderModal({
    //   heading: 'Experts',
    //   content: (
    //     <ProgramExpertsList
    //       experts={[
    //         {
    //           name: 'Paul Huckett',
    //           university: 'Johns Hopkins University',
    //           courses: '5 Courses',
    //           learners: '12,734 learners',
    //           image: '/images/program/program-01.jpg',
    //         },
    //         {
    //           name: 'Michael J. Reese',
    //           university: 'Johns Hopkins University',
    //           courses: '1 Course',
    //           learners: '4,764 learners',
    //           image: '/images/program/program-01.jpg',
    //         },
    //         {
    //           name: 'Dr. Olysha Magruder',
    //           university: 'Johns Hopkins University',
    //           courses: '1 Course',
    //           learners: '4,764 learners',
    //           image: '/images/program/program-01.jpg',
    //         },
    //       ]}
    //     />
    //   ),
    //   size: 'md',
    // });
  };

  const programDetails = response?.data?.data || {};

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2">
        <Image
          src={programDetails?.image || '/images/program/program-01.jpg'}
          alt="Program Image"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full rounded-lg shadow-lg"
        />
      </div>

      {/* Right Section - Details */}
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white">
          <div className="flex items-center gap-3">
            <FaTv size={24} className="text-primary" />
            <span>5 Sessions</span>
          </div>
          <div className="flex items-center gap-3">
            <MdViewModule size={24} className="text-primary" />
            <span>25 Modules</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xl">4.7</p>
          <FaStar size={24} className="text-yellow-500" />
          <p>(27 ratings)</p>
        </div>

        <div className="flex">
          <AvatarGroup spacing="small" total={10} classes="cursor-pointer" onClick={handleViewExperts}>
            <Avatar className="cursor-pointer" alt="Expert 1" src="/images/program/program-01.jpg" />
            <Avatar className="cursor-pointer" alt="Expert 2" src="/images/program/program-01.jpg" />
            <Avatar className="cursor-pointer" alt="Expert 3" src="/images/program/program-01.jpg" />
            <Avatar className="cursor-pointer" alt="Expert 4" src="/images/program/program-01.jpg" />
          </AvatarGroup>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 w-full md:w-auto bg-gray-100 text-gray-800 p-4 rounded-md shadow hover:bg-gray-200">
            <FaPlay /> Intro
          </button>
          <button className="w-full md:w-auto bg-primary text-white p-4 rounded-md shadow hover:bg-primary/80">
            Begin Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProgramDetails;
