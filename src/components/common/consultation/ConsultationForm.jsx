'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createNewConsultation } from '@/services/private/expert/consultation';
import { toastApiError } from '@/utils/helpers';
import FormikMultiSelect from '../form/formik/FormikMultiSelect';
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
import queryKeys from '@/utils/query-keys';

const consultationTypeOptions = [
  { label: 'Chat', value: 'chat' },
  { label: 'Audio', value: 'audio' },
  { label: 'Video', value: 'video' },
];

const ConsultationForm = ({ initialData = {}, isEditMode = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: createConsultation } = useMutation({
    mutationFn: createNewConsultation,
  });

  const initialValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 0,
    price: initialData?.price || 0,
    calendar_link: initialData?.calendar_link || '',
    consultation_type: initialData?.consultation_type || [],
    follow_up_support: initialData?.follow_up_support || [],
    followup_duration: initialData?.followup_duration || '',
    categories: initialData?.categories?.map(i => i.id) || [],
    tags: initialData?.tags?.map(i => i.id) || [],
    image: null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    duration: Yup.number().required('Duration is required'),
    price: Yup.number().required('Price is required'),
    calendar_link: Yup.string().required('Calendar Link is required'),
    consultation_type: Yup.array().min(1, 'At least one consultation type is required').required(),
    follow_up_support: Yup.array(),
    followup_duration: Yup.number(),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least one tag is required'),
    image: Yup.mixed().required('Image is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        // Update existing consultation logic can go here
        console.log('On Edit Mode');
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
      router.push('/portal/teacher/profile');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
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
                  <FormikField name="duration" label="Duration" type="number" required />
                  <FormikField name="price" label="Price" type="number" required />

                  <FormikField name="calendar_link" label="Calendar Link" required />

                  <FormikMultiSelect
                    name="consultation_type"
                    label="Consultation Type"
                    options={consultationTypeOptions}
                    required
                  />
                  <FormikMultiSelect
                    name="follow_up_support"
                    label="Follow-up Support (optional)"
                    options={consultationTypeOptions}
                  />

                  <FormikField name="followup_duration" label="Followup Duration (optional)" type="number" />
                  <CategoriesField required />
                  <TagsField required />
                </div>

                <FormikDropzone name="image" label="Image" required />

                <div className="flex justify-between items-center mt-5">
                  <Button type="button" variant="secondary" size="2xl" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" size="2xl" isLoading={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
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
