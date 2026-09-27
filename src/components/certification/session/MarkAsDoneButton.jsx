'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import Button from '@/components/common/Button';
import { completeCertificationLesson } from '@/services/private/certification/catalog';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';

export const invalidateLearnerProgress = (queryClient, programId) =>
  Promise.all([
    queryClient.invalidateQueries([queryKeys.certificationLearnerLessonDetail, programId]),
    queryClient.invalidateQueries([queryKeys.certificationLearnerDetail, programId]),
    queryClient.invalidateQueries([queryKeys.certificationLearnerModuleDetail, programId]),
    queryClient.invalidateQueries([queryKeys.certificationEnrolledCertifications]),
  ]);

export const CompletedBadge = () => (
  <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-medium text-primary">
    <FaCheckCircle /> Completed
  </span>
);

const MarkAsDoneButton = ({ programId, lesson, disabled = false, disabledHint }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: markDone, isPending } = useMutation({ mutationFn: completeCertificationLesson });

  if (lesson.is_completed) return <CompletedBadge />;

  const handleClick = async () => {
    try {
      await markDone({ programId, lessonId: lesson.id });
      await invalidateLearnerProgress(queryClient, programId);
      toast.success('Lesson marked as done');
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button isLoading={isPending} disabled={disabled || isPending} onClick={handleClick}>
        Mark as done
      </Button>
      {disabled && disabledHint ? <span className="text-xs text-gray-500">{disabledHint}</span> : null}
    </div>
  );
};

export default MarkAsDoneButton;
