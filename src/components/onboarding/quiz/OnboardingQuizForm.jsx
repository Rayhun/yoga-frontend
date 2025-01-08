'use client';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import Button from '@/components/common/Button';
import OnboardingQuizFormOptions from './OnboardingQuizFormOptions';
import { addNewQuiz, updateExistingQuiz } from '@/services/private/onboarding/quiz';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import queryKeys from '@/utils/query-keys';
import { ONBOARDING_QUIZ_CONTENT_TYPE_OPTIONS } from '@/utils/options';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';
import { uploadLMSFile } from '@/services/private/lms';

const OnboardingQuizForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addQuiz } = useMutation({
    mutationFn: addNewQuiz,
  });
  const { mutateAsync: updateQuiz } = useMutation({
    mutationFn: updateExistingQuiz,
  });

  const initialValues = {
    title: selected?.title || '',
    screen_type: selected?.screen_type || ONBOARDING_QUIZ_CONTENT_TYPE.text,
    description: selected?.description || '',
    is_required: selected?.is_required || false,
    options: (selected?.options || [{ content: '' }]).map(i => ({
      content: selected?.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.text ? i.text : null,
    })),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    description: Yup.string().required('Required!'),
    is_required: Yup.boolean(),
    options: Yup.array()
      .of(
        Yup.object({
          content: Yup.mixed(),
        })
      )
      .min(2, 'At least 2 options are required.'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const isImageTypeQuiz = values.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.image;
      let payload = {
        ...values,
        options: values.options.map(option => ({ text: isImageTypeQuiz ? undefined : option.content })),
      };

      if (isImageTypeQuiz) {
        const uploadedImagesResponse = await Promise.all(
          values.options.map(option => uploadLMSFile({ file: option.content }))
        );
        uploadedImagesResponse?.forEach((imgResponse, i) => {
          payload.options[i].image = imgResponse?.data?.file_link || null;
        });
      }

      if (isEditMode) {
        await updateQuiz({ payload: { id: selected.id, ...payload } });
        toast.success('Quiz updated successfully');
      } else {
        await addQuiz({ payload: { ...payload } });
        toast.success('Quiz added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.onboardingQuiz, selected.id] : [queryKeys.onboardingQuiz] },
      ]);
      router.push('/portal/onboarding/quiz');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Quiz Form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row md:items-center">
              <div className="w-full md:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="screen_type"
                  label="Type"
                  options={ONBOARDING_QUIZ_CONTENT_TYPE_OPTIONS}
                  onChange={() => setFieldValue('options', [])}
                  required
                />
              </div>
            </div>
            <div className="flex">
              <FormikCheckbox name="is_required" label="Is Required?" />
            </div>
            <FormikField name="description" label="Description" placeholder="Description" rows={5} required />

            <div className="my-5 flex flex-col gap-3">
              <h3 className="font-bold text-2xl text-black dark:text-white">Options</h3>
              <FieldArray name="options" render={helpers => <OnboardingQuizFormOptions {...helpers} />} />
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

export default OnboardingQuizForm;
