'use client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useConfirm from '@/hooks/useConfirm';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Button from '@/components/common/Button';
import { completeProgramContent } from '@/services/private/customer/program';

const CompleteContentButton = ({ payload = {}, onSuccess = () => null, children }) => {
  const searchParams = useSearchParamUtils();
  const confirm = useConfirm();

  const targetProgram = searchParams.get('program');
  const targetModule = searchParams.get('module');

  const { isPending, mutateAsync: markAsComplete } = useMutation({
    mutationFn: completeProgramContent,
  });

  const handleCompleteContent = async () => {
    await confirm({ message: 'Are you sure you want to mark content as completed?' });
    try {
      await markAsComplete({
        ...payload,
        id: targetProgram,
        module: targetModule,
      });
      onSuccess();
      toast.success('Content marked as completed successfully');
    } catch (error) {
      toast.error('Something went wrong in marking content as completed');
    }
  };

  return (
    <Button disabled={isPending} onClick={handleCompleteContent}>
      {children}
    </Button>
  );
};

export default CompleteContentButton;
