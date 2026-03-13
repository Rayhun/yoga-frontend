'use client';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikRichTextEditor from '@/components/common/form/formik/FormikRichTextEditor';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittable';
import {
  AccessSettingField,
  DifficultyField,
  IntensityField,
  VisibilitySettingField,
  FocusAreasField,
  CategoriesField,
  TagsField,
} from '@/components/lms/general/fields';
import Button from '@/components/common/Button';
import LMSQuizFormOptions from './LMSQuizFormOptions';
import { addNewQuiz, updateExistingQuiz } from '@/services/private/lms/quiz';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { LMS_DOC_STATUS_OPTIONS } from '@/utils/options';
import queryKeys from '@/utils/query-keys';

const LMSQuizForm = ({ selected }) => {
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
    explanation: selected?.explanation || '',
    quiz_number: selected?.quiz_number || '',
    status: selected?.status || '',
    difficulty: selected?.difficulty || '',
    intensity: selected?.intensity || '',
    access_setting: selected?.access_setting || '',
    visibility_setting: selected?.visibility_setting || '',
    focus_areas: selected?.focus_areas || [],
    equipments: selected?.equipments || [],
    languages: selected?.languages || [],
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
    options: (selected?.options || [{ text: '', is_correct: false }]).map(({ text, is_correct }) => ({
      text,
      is_correct,
    })),
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    explanation: Yup.string().required('Required!'),
    quiz_number: Yup.string().required('Required!'),
    status: Yup.string().required('Required!'),
    difficulty: Yup.string().required('Required!'),
    intensity: Yup.string().required('Required!'),
    access_setting: Yup.string().required('Required!'),
    visibility_setting: Yup.string().required('Required!'),
    focus_areas: Yup.array()
      .of(Yup.string().required('Required!'))
      .min(1, 'At least 1 focus area is required'),
    equipments: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 equipment is required'),
    languages: Yup.array().of(Yup.string().required('Required!')).min(1, 'At least 1 language is required'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    options: Yup.array()
      .of(
        Yup.object({
          text: Yup.string().trim().required('Required!'),
          is_correct: Yup.boolean(),
        })
      )
      .min(2, 'At least 2 options are required.')
      .test(
        'one-correct',
        'Only one option can be marked as correct.',
        options => options.filter(option => option.is_correct).length === 1
      ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateQuiz({ payload: { id: selected.id, ...values } });
        toast.success('Quiz updated successfully');
      } else {
        await addQuiz({ payload: { ...values } });
        toast.success('Quiz added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsQuizes, selected.id] : [queryKeys.lmsQuizes] },
      ]);
      router.push('/portal/admin/lms/quiz');
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
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-3">
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikField name="title" label="Title" placeholder="Title" required />
              </div>
              <div className="w-full md:w-1/2">
                <FormikField name="quiz_number" label="Quiz Number" placeholder="Quiz Number" required />
              </div>
            </div>
            <FormikRichTextEditor name="explanation" label="Explanation" placeholder="Explanation" rows={5} required />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="status"
                  label="Status"
                  placeholder="Status"
                  options={LMS_DOC_STATUS_OPTIONS}
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <DifficultyField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <IntensityField required />
              </div>
              <div className="w-full md:w-1/2">
                <AccessSettingField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <VisibilitySettingField required />
              </div>
              <div className="w-full md:w-1/2">
                <FocusAreasField required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <FormikSubmittableField
                  name="equipments"
                  label="Equipments"
                  placeholder="Equipments"
                  required
                />
              </div>
              <div className="md:w-1/2">
                <FormikSubmittableField name="languages" label="Languages" placeholder="Languages" required />
              </div>
            </div>
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="md:w-1/2">
                <CategoriesField required />
              </div>
              <div className="md:w-1/2">
                <TagsField required />
              </div>
            </div>

            <div className="my-5 flex flex-col gap-3">
              <h3 className="font-bold text-2xl text-black dark:text-white">Options</h3>
              <FieldArray name="options" render={helpers => <LMSQuizFormOptions {...helpers} />} />
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

export default LMSQuizForm;
