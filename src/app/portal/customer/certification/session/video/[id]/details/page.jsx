'use client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import VideoSessionDetails from '@/components/certification/details/VideoSessionDetails';
import { getLearnerLessonDetail, completeCertificationLesson } from '@/services/private/certification/catalog';
import { useSearchParams } from 'next/navigation';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const searchParams = useSearchParams();
  const programId = searchParams.get('program');
  const lessonId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getLearnerLessonDetail({ programId, lessonId }),
    queryKey: [queryKeys.certificationLearnerLessonDetail, programId, lessonId],
    enabled: !!programId && !!lessonId,
    retry: false,
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const sessionDetails = response?.data;

  if (!sessionDetails || sessionDetails.status === 'error') {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        Session not found.
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Video Session Details">
        {sessionDetails.is_completed ? null : (
          <button
            onClick={async () => {
              try {
                await completeCertificationLesson({
                  programId,
                  lessonId,
                });
                refetch();
              } catch (error) {
                console.error(error);
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          >
            Mark As Done
          </button>
        )}
      </PageHeader>
      <VideoSessionDetails data={sessionDetails} programId={programId} />
    </div>
  );
};

export default Page;
