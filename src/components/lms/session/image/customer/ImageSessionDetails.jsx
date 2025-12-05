'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const ImageSessionDetails = ({ data: sessionDetails }) => {
  return (
    <div>
      {/* Details Card */}
      <div className="flex flex-col gap-7 p-8 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full">
          <Image
            src={sessionDetails?.content_link}
            alt="Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{sessionDetails.title}</h3>
          <ControllableRichText className="dark:text-white">{sessionDetails?.description || 'No description provided'}</ControllableRichText>
        </div>
      </div>
    </div>
  );
};

export default ImageSessionDetails;
