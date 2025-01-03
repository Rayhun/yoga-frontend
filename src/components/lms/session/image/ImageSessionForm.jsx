'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSubmittableField from '@/components/common/form/formik/FormikSubmittableField';
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
import { addNewImageSession, updateExistingImageSession } from '@/services/private/lms/session/image';
import { toastApiError } from '@/utils/helpers';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import { QUIZ_STATUS_OPTIONS } from '@/utils/options';
import queryKeys from '@/utils/query-keys';

const ImageSession = ({ selected }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selected);
  const { mutateAsync: addImageSession } = useMutation({
    mutationFn: addNewImageSession,
  });
  const { mutateAsync: updateImageSession } = useMutation({
    mutationFn: updateExistingImageSession,
  });

  const initialValues = {
    title: selected?.title || '',
    description: selected?.description || '',
    duration: selected?.duration || '',
    status: selected?.status || '',
    expert: selected?.expert || '',
    difficulty: selected?.difficulty || '',
    intensity: selected?.intensity || '',
    access_setting: selected?.access_setting || '',
    visibility_setting: selected?.visibility_setting || '',
    focus_areas: selected?.focus_areas || [],
    equipments: selected?.equipments || [],
    languages: selected?.languages || [],
    categories: selected?.categories.map(i => i.id) || [],
    tags: selected?.tags.map(i => i.id) || [],
    file: null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required!'),
    explanation: Yup.string().required('Required!'),
    duration: Yup.string().required('Required!'),
    status: Yup.string().required('Required!'),
    expert: Yup.string().required('Required!'),
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
    file: Yup.mixed().nullable(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateImageSession({ payload: { id: selected.id, ...values } });
        toast.success('Image Session updated successfully');
      } else {
        await addImageSession({ payload: { ...values } });
        toast.success('Image Session added successfully');
      }
      await queryClient.invalidateQueries([
        { queryKey: isEditMode ? [queryKeys.lmsImageSessions, selected.id] : [queryKeys.lmsImageSessions] },
      ]);
      router.push('/portal/lms/session/image');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLayoutWrapper title="Image Session Form">
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
            <FormikField name="explanation" label="Explanation" placeholder="Explanation" rows={5} required />
            <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <FormikSelect
                  name="status"
                  label="Status"
                  placeholder="Status"
                  options={QUIZ_STATUS_OPTIONS}
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

            <Button type="submit" size="2xl" className="self-start" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default ImageSession;
