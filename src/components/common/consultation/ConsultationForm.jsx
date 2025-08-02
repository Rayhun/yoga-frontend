'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createNewConsultation, updateExistingConsultation } from '@/services/private/expert/consultation';
import { toastApiError } from '@/utils/helpers';
import FormikMultiSelect from '../form/formik/FormikMultiSelect';
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
import queryKeys from '@/utils/query-keys';
import { CONSULTATION_TYPES } from '@/utils/constants';
import { ONE_MB } from '@/utils/general';

const ConsultationForm = ({ initialData = {}, isEditMode = false, consultationId = null }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: createConsultation } = useMutation({
    mutationFn: createNewConsultation,
  });

  const { mutateAsync: updateConsultation } = useMutation({
    mutationFn: updateExistingConsultation,
  });

  const initialValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 0,
    price: initialData?.price || 0,
    calender_link: initialData?.calender_link || '',
    consultation_type: initialData?.consultation_type?.split(',') || [],
    followup_support: initialData?.followup_support || [],
    followup_duration: initialData?.followup_duration || '',
    categories: initialData?.categories?.map(i => i.id) || [],
    tags: initialData?.tags?.map(i => i.id) || [],
    image: initialData?.image || null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    duration: Yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
    price: Yup.number().required('Price is required').min(0, 'Price must be at least $0'),
    calender_link: Yup.string().required('Calender Link is required'),
    consultation_type: Yup.array().min(1, 'At least one consultation type is required').required(),
    followup_support: Yup.array().min(1, 'At least one consultation type is required').required(),
    followup_duration: Yup.number().required('Follow up Duration is required').min(1, 'Duration must be at least 1 minute'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one tag is required'),
    image: Yup.mixed().required('Image is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateConsultation({ payload: { ...values }, id: consultationId });
        toast.success('Personal Consultation updated successfully');
      } else {
        await createConsultation({ payload: { ...values } });
        toast.success('Personal Consultation added successfully');
      }

      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? [queryKeys.expertConsultationDetails, selected.id]
            : [queryKeys.expertConsultations],
        },
      ]);
      router.push('/portal/teacher/profile?active_tab=consult');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-6.5">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => {
            return (
              <Form className="flex flex-col gap-4">
                <FormikField name="title" label="Title" required />
                <FormikField name="description" label="Description" rows={4} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikField name="duration" label="Duration (mins)" type="number" min={1} required />
                  <FormikField name="price" label="Price ($)" type="number" min={0} required />

                  <FormikField name="calender_link" label="Calendar Link" required />

                  <FormikMultiSelect
                    name="consultation_type"
                    label="Consultation Type"
                    options={CONSULTATION_TYPES}
                    required
                  />
                  <FormikMultiSelect
                    name="followup_support"
                    label="Follow-up Support"
                    options={CONSULTATION_TYPES}
                    required
                  />

                  <FormikField
                    name="followup_duration"
                    label="Followup Duration (mins)"
                    type="number"
                    min={1}
                    required
                  />
                  <CategoriesField required />
                  <TagsField required />
                </div>

                <FormikDropzone
                  name="image"
                  label="Image"
                  required
                  fileURLs={initialData?.image ? [initialData.image] : []}
                  maxSize={10 * ONE_MB}
                />

                <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
                  <Button type="button" variant="secondary" size="2xl" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" size="2xl" isLoading={isSubmitting}>
                    {isSubmitting
                      ? isEditMode
                        ? 'Updating...'
                        : 'Submitting...'
                      : isEditMode
                      ? 'Update Consultation'
                      : 'Submit My Consultation'}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default ConsultationForm;
