'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { addNewQuestion, updateExistingQuestion } from '@/services/private/faqs';

const FrequentlyAskedQuestionForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addQuestion } = useMutation({
    mutationFn: addNewQuestion,
  });
  const { mutateAsync: updateQuestion } = useMutation({
    mutationFn: updateExistingQuestion,
  });


  const initialValues = {
    title: selected?.title || '',
    description: selected?.description || '',
    ordering: selected?.ordering || 0,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Question is required'),
    description: Yup.string().required('Description is required'),
    ordering: Yup.number().required('Order is required').min(1).max(999),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateQuestion({ payload: { id: selected.id, ...values } });
        toast.success('Question updated successfully');
      } else {
        await addQuestion({ payload: { ...values } });
        toast.success('Question added successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? [queryKeys.frequentlyAskedQuestions, selected.id, queryClient.publicFrequentlyAskedQuestions]
            : [queryKeys.frequentlyAskedQuestions, queryClient.publicFrequentlyAskedQuestions],
        },
      ]);
      router.push('/portal/admin/faq');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Question Form" description="Add or edit a frequently asked question">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <FormikField name="title" label="Question" placeholder="Question" required />
            <FormikField
              name="description"
              label="Answer"
              rows={4}
              placeholder="Write answer here..."
              required
            />

            <FormikField
              name="ordering"
              label="Order"
              placeholder="Order"
              required
              min={1}
              max={999}
              type="number"
            />

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default FrequentlyAskedQuestionForm;
