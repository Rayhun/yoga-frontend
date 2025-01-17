'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { BiCheck } from 'react-icons/bi';
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
    await renderModal({
      heading: 'Experts',
      content: (
        <ProgramExpertsList
          experts={[
            {
              name: 'Paul Huckett',
              title: 'Professor',
              image: '/images/program/program-01.jpg',
            },
            {
              name: 'Michael J. Reese',
              title: 'Professor',
              image: '/images/program/program-01.jpg',
            },
            {
              name: 'Dr. Olysha Magruder',
              title: 'Professor',
              image: '/images/program/program-01.jpg',
            },
          ]}
        />
      ),
      size: 'md',
    });
  };

  const programDetails = response?.data?.data || {};

  const PROGRAM_CONTENT = [
    {
      id: 1,
      title: 'Design for the first 15 seconds',
      description: "A quick overview of landing your audience's attention in the first 15 seconds.",
      time: '15 min',
      progress: 'Complete',
    },
    {
      id: 2,
      title: 'Building interest, stoking desire',
      description: 'Learn how to build interest and stoke desire effectively.',
      time: '20 min',
      progress: 'In Progress',
    },
    {
      id: 3,
      title: 'User behavior 101',
      description: 'Understanding the first 30 seconds of user behavior.',
      time: '10 min',
      progress: 'Not Started',
    },
    {
      id: 4,
      title: 'Design as a conversation',
      description: 'Design principles to create meaningful conversations.',
      time: '18 min',
      progress: 'Complete',
    },
    {
      id: 5,
      title: 'Selecting imagery that impacts',
      description: 'Tips for selecting imagery that aligns with your message.',
      time: '22 min',
      progress: 'Not Started',
    },
    {
      id: 6,
      title: 'Where to go from here',
      description: 'Plan your next steps with actionable insights.',
      time: '25 min',
      progress: 'Complete',
    },
  ];

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

      {/* Program Content */}
      <div className="py-6 my-5 text-gray-800 dark:text-gray-200 flex flex-col md:flex-row gap-6 md:gap-12">
        {/* Content Cards */}
        <div className="w-full md:w-3/4">
          <h3 className="text-xl text-primary font-bold mb-4">Content</h3>
          <section className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAM_CONTENT.map(content => (
              <div
                key={content.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition"
              >
                {/* Course Image */}
                <div className="relative">
                  <Image
                    width={0}
                    height={0}
                    src={programDetails.image}
                    alt="image"
                    sizes="100vw"
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  {/* Completion Icon */}
                  {content.progress === 'Complete' && (
                    <div className="absolute -bottom-4 left-2 bg-white rounded-full p-1 shadow-lg">
                      <BiCheck size={24} className="bg-green-500 rounded-full text-white" />
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h2 className="text-lg font-bold line-clamp-1 text-gray-900 dark:text-white">
                    {content.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400 mt-2">
                    {content.description}
                  </p>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 00-1 1v10a1 1 0 001 1h4v-2H4V6h2v1a1 1 0 002 0V6h8v6h-4v2h4a1 1 0 001-1V5a1 1 0 00-1-1h-2V3a1 1 0 00-1-1H6zM8 14h4v2H8v-2z" />
                      </svg>
                      {content.time}
                    </span>
                    <span>{content.topics} Topics</span>
                    <span>{content.quizzes} Quiz</span>
                  </div>

                  {/* Start Button */}
                  <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/80 transition">
                    Start Module
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Program Timeline */}
        <div className="w-full md:w-1/4">
          <h3 className="text-xl text-primary font-bold mb-4">Timeline</h3>

          <ol class="relative p-5 border-s border-gray-200 dark:border-gray-700">
            <li class="ms-6 mb-6">
              <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <BiCheck />
              </span>
              <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Content Heading</h3>
              <p class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel incidunt quae ratione aperiam
              </p>
            </li>
            <li class="ms-6 mb-6">
              <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <BiCheck />
              </span>
              <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Content Heading</h3>
              <p class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel incidunt quae ratione aperiam
              </p>
            </li>
            <li class="ms-6 mb-6">
              <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <BiCheck />
              </span>
              <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Content Heading</h3>
              <p class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel incidunt quae ratione aperiam
              </p>
            </li>
            <li class="ms-6 mb-6">
              <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <BiCheck />
              </span>
              <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Content Heading</h3>
              <p class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel incidunt quae ratione aperiam
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CustomerProgramDetails;
