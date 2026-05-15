'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiEdit2Line } from 'react-icons/ri';
import { FiShare2 } from 'react-icons/fi';
import { MdOutlineArrowBack } from 'react-icons/md';
import ExpertProfileAbout from './ExpertProfileAbout';
import Image from 'next/image';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';
import ShareProfileDialog from '@/components/expert/profile/ShareProfileDialog';

const actionButtonClass =
  'inline-flex items-center gap-2 justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30';

const ExpertDetails = ({ data, showBackButton = true }) => {
  const router = useRouter();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const onEdit = () => router.push(`/portal/admin/lms/expert/${data.id}/edit`);

  return (
    <div>
      <ShareProfileDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        publicUsername={data?.public_username}
        expertId={data?.id}
      />
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-3">
          {showBackButton ? (
            <div className="flex items-center">
              <button type="button" className={actionButtonClass} onClick={() => router.back()}>
                <MdOutlineArrowBack className="h-4 w-4" />
                Back
              </button>
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-4 pl-5 pr-5 text-white shadow-lg">
            <div className="absolute inset-0 bg-black opacity-10" />

            <div className="absolute right-4 top-4 z-20 flex flex-wrap items-center justify-end gap-2 sm:right-6 sm:top-6 sm:gap-3">
              {data?.is_profile_complete && (
                <button type="button" className={actionButtonClass} onClick={() => setShareDialogOpen(true)}>
                  <FiShare2 className="h-4 w-4" />
                  Share Profile
                </button>
              )}
              <button type="button" className={actionButtonClass} onClick={onEdit}>
                <RiEdit2Line className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            <div className="relative z-10 flex min-h-[3.5rem] items-center gap-4 sm:min-h-0">
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-white/20 p-0.5 ring-2 ring-white/30 backdrop-blur-sm">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <Image
                      src={data?.file || '/images/user/placeholder_profile.png'}
                      width={64}
                      height={64}
                      sizes="64px"
                      alt="profile"
                      className="h-full w-full object-cover"
                      quality={95}
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0 max-w-[calc(100%-10rem)] flex-1 sm:max-w-[calc(100%-15rem)]">
                <h3 className="truncate text-xl font-bold text-white">
                  {`${data?.first_name || ''} ${data?.last_name || ''}`}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <ExpertProfileAbout data={data} />
          <div className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm">
            <h5 className="font-bold">Files</h5>
            {data?.program_files && Array.isArray(data.program_files) && data.program_files.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {data.program_files.map((item, index) => (
                  <DetailsFileCard fileURL={item} key={index} />
                ))}
              </div>
            ) : (
              <p className="text-center font-bold text-gray-500">No files found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDetails;
