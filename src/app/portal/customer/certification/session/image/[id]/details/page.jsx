'use client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import ImageSessionDetails from '@/components/certification/details/ImageSessionDetails';
import { getLearnerProgramDetail } from '@/services/private/certification/catalog';
import { useSearchParams } from 'next/navigation';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const searchParams = useSearchParams();
  const programId = searchParams.get('program');
  const sessionID = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getLearnerProgramDetail({ id: programId }),
    queryKey: [queryKeys.certificationLearnerDetail, programId],
    enabled: !!programId,
    retry: false,
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const program = response?.data;
  let sessionDetails = null;

  if (program?.modules) {
    for (const mod of program.modules) {
      const found = mod.lessons?.find(l => l.id == sessionID);
      if (found) {
        sessionDetails = found;
        break;
      }
    }
  }

  if (!sessionDetails) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        Session not found.
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Image Session Details">
        {sessionDetails.is_completed ? null : (
          <button
            onClick={async () => {
              try {
                const { completeCertificationLesson } = await import('@/services/private/certification/catalog');
                await completeCertificationLesson({
                  programId,
                  lessonId: sessionID,
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
      <ImageSessionDetails data={sessionDetails} />
    </div>
  );
};

export default Page;
