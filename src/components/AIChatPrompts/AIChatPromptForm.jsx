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
import FormikSelect from '../common/form/formik/FormikSelect';
import { createAIChatPromptType, updateAIChatPrompt } from '@/services/private/ai-prompts';

const CHAT_TYPE_OPTIONS = [
  { label: 'FAQs', value: 'faqs' },
  { label: 'Coach', value: 'coach' },
];

const AIChatPromptsForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { mutateAsync: addPrompt } = useMutation({
    mutationFn: createAIChatPromptType,
  });
  const { mutateAsync: updatePrompt } = useMutation({
    mutationFn: updateAIChatPrompt,
  });

  const initialValues = {
    title: selected?.title || '',
    prompt: selected?.prompt || '',
    chat_type: selected?.chat_type || '',
    gpt_model: selected?.gpt_model || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    prompt: Yup.string().required('Prompt is required'),
    chat_type: Yup.string().required('Chat Type is required'),
    gpt_model: Yup.string().required('GPT Model is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updatePrompt({ payload: { id: selected.id, ...values } });
        toast.success('AI Chat prompt updated successfully');
      } else {
        await addPrompt({ payload: { ...values } });
        toast.success('AI Chat prompt added successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode ? [queryKeys.aiPromptsList, selected.id] : [queryKeys.aiPromptsList],
        },
      ]);
      router.push('/portal/admin/ai-prompts');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="AI Chat Prompt Form" description="Add or edit a AI Chat Prompt">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <FormikField name="title" label="Title" placeholder="Title" required />
            <FormikField name="prompt" label="Prompt" placeholder="Prompt..." required rows={4} />

            <div className='grid grid-cols-2 gap-4'>
              <FormikSelect name="chat_type" label="Chat Type" options={CHAT_TYPE_OPTIONS} />

              <FormikField name="gpt_model" label="GPT Model" placeholder="GPT Model" required />
            </div>

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default AIChatPromptsForm;
