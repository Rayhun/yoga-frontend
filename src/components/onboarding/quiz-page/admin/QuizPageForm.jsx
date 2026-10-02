'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import FormikCheckbox from '@/components/common/form/formik/FormikCheckbox';
import { getOnboardingV2QuestionsList } from '@/services/private/onboarding/quiz-v2';
import { addNewQuizPage, updateExistingQuizPage } from '@/services/private/onboarding/quiz-page';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import React, { useMemo } from 'react';

const QuizPageForm = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);

  const { data: questionsResponse, isLoading: isLoadingQuestions } = useQuery({
    queryFn: () => getOnboardingV2QuestionsList({ limit: 500, status: 'active' }),
    queryKey: [queryKeys.onboardingQuizV2, 'all-active-questions'],
  });

  const { mutateAsync: addQuizPage } = useMutation({
    mutationFn: addNewQuizPage,
  });
  const { mutateAsync: updateQuizPage } = useMutation({
    mutationFn: updateExistingQuizPage,
  });

  const initialValues = {
    title: selected?.title || '',
    slug: selected?.slug || '',
    description: selected?.description || '',
    is_active: selected?.is_active ?? true,
    questions: (selected?.questions || []).map(q => q.id),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    slug: Yup.string().required('Required!'),
    description: Yup.string(),
    is_active: Yup.boolean(),
    questions: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one question is required'),
  });

  const questionOptions = useMemo(() => {
    const results = questionsResponse?.data?.data?.results || questionsResponse?.data?.data || [];
    const list = Array.isArray(results) ? results : [];
    return list.map(question => ({
      label: `${question.sets_key} — ${question.tag_text}`,
      value: question.id,
    }));
  }, [questionsResponse?.data?.data]);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      questions: (values.questions || []).map(id => Number(id)),
    };

    try {
      if (isEditMode) {
        await updateQuizPage({ payload: { id: selected.id, ...payload } });
        toast.success('Quiz page updated successfully');
      } else {
        await addQuizPage({ payload });
        toast.success('Quiz page added successfully');
      }
      await queryClient.invalidateQueries({ queryKey: [queryKeys.onboardingQuizPages] });
      router.push('/portal/admin/onboarding/quiz/pages');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Onboarding Quiz Page">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full xl:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full xl:w-1/2">
                <FormikField name="slug" label="Slug" placeholder="demo" required />
              </div>
            </div>
            <FormikRichTextEditor name="description" label="Description" />
            <FormikCheckbox name="is_active" label="Active" />
            <FormikMultiSelect
              name="questions"
              label="Questions"
              placeholder={isLoadingQuestions ? 'Loading questions...' : 'Select questions'}
              options={questionOptions}
              required
            />
            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="outlined" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingQuestions}>
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default QuizPageForm;
