'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
  const [selectedChatType, setSelectedChatType] = useState(selected?.chat_type || '');
  const [uploadedFile, setUploadedFile] = useState(null);

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
    temprature: selected?.temprature || '',
    max_tokens: selected?.max_tokens || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    prompt: Yup.string().when('chat_type', {
      is: 'faqs',
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required('Prompt is required'),
    }),
    chat_type: Yup.string().required('Chat Type is required'),
    gpt_model: Yup.string().required('GPT Model is required'),
    temprature: Yup.string().required('Temprature is required'),
    max_tokens: Yup.string().required('Maximum Token is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const submitData = { ...values };
      
      // If chat type is faqs and file is uploaded, handle file upload logic here
      if (selectedChatType === 'faqs' && uploadedFile) {
        // You can add file upload logic here
        // For now, we'll just add a note about the file
        submitData.prompt = `File uploaded: ${uploadedFile.name}`;
      }

      if (isEditMode) {
        await updatePrompt({ payload: { id: selected.id, ...submitData } });
        toast.success('AI Chat prompt updated successfully');
      } else {
        await addPrompt({ payload: { ...submitData } });
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
  };

  return (
    <FormLayoutWrapper title="AI Chat Prompt Form" description="Add or edit a AI Chat Prompt">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="flex flex-col gap-3">
            <FormikField name="title" label="Title" placeholder="Title" required />
            
            {/* Conditionally render prompt field or file upload based on chat type */}
            {selectedChatType === 'faqs' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Upload FAQs File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadedFile && (
                  <p className="text-sm text-green-600">File selected: {uploadedFile.name}</p>
                )}
              </div>
            ) : (
              <FormikField name="prompt" label="Prompt" placeholder="Prompt..." required rows={4} />
            )}

            <div className='grid grid-cols-2 gap-4'>
              <FormikSelect 
                name="chat_type" 
                label="Chat Type" 
                options={CHAT_TYPE_OPTIONS}
                onChange={(value) => {
                  setSelectedChatType(value);
                  setFieldValue('chat_type', value);
                  // Clear the other field when switching
                  if (value === 'faqs') {
                    setFieldValue('prompt', '');
                  } else {
                    setUploadedFile(null);
                  }
                }}
              />

              <FormikField name="gpt_model" label="GPT Model" placeholder="GPT Model" required />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormikField name="temprature" label="Temprature" required />
              <FormikField name="max_tokens" label="Maximum Token" required />
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
