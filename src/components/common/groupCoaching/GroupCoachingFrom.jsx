'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { duration } from '@mui/material';
import { CONSULTATION_TYPES, TIME_ZONES } from '@/utils/constants';
import queryKeys from '@/utils/query-keys';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createNewGroupCoaching, updateGroupCoaching } from '@/services/private/expert/groupCoaching';
import { ONE_MB } from '@/utils/general';
import { toastApiError } from '@/utils/helpers';
import useUserTimeZone from '@/hooks/useUserTimeZone';
import FormikMultiSelect from '../form/formik/FormikMultiSelect';
// import { createEvent } from '@/services/private/lms/events';

const eventTypeOptions = [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Bootcamp', value: 'bootcamp' },
  { label: 'Live Event', value: 'live event' },
];

const GroupCoachingForm = ({ initialData = {}, isEditMode = false, eventId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { userTimeZone, mappedTimeZone } = useUserTimeZone();

  const { mutateAsync: createGroupCoaching } = useMutation({
    mutationFn: createNewGroupCoaching,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: updateGroupCoaching,
  });

  const initialValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    start_date: initialData?.start_date || '',
    duration: initialData?.duration || 0,
    time_zone: initialData?.time_zone || mappedTimeZone?.value || userTimeZone,
    event_type: initialData?.event_type || '',
    price: initialData?.price || 0,
    is_online: initialData?.is_online || true,
    image: null,
    meeting_link: initialData?.meeting_link || '',
    categories: initialData?.categories?.map(i => i.id) || [],
    tags: initialData?.tags?.map(i => i.id) || [],
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Event title is required'),
    description: Yup.string().required('Description is required'),
    start_date: Yup.string().required('Start time is required'),
    duration: Yup.number().required('Duration is required'),
    time_zone: Yup.string().required('Timezone is required'),
    event_type: Yup.string().required(),
    followup_support: Yup.array().min(1, 'At least one consultation type is required').required(),
    meeting_link: Yup.string().when('is_online', {
      is: true,
      then: schema => schema.required('Meeting URL is required'),
      otherwise: schema => schema,
    }),
    price: Yup.number().required('Price is required'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    image: Yup.mixed()
      .required('Required!')
      .test('fileSize', 'File size must be less than 10 MB', value => value && value.size <= 10 * ONE_MB),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await update({ payload: { ...values }, id: eventId });
        toast.success('Group Coaching updated successfully');
      } else {
        await createGroupCoaching({ payload: { ...values } });
        toast.success('Group Coaching added successfully');
      }
      await queryClient.invalidateQueries([
        {
          queryKey: isEditMode
            ? [queryKeys.expertGroupCoachingDetails, eventId]
            : [queryKeys.expertGroupCoaching],
        },
      ]);
      router.push('/portal/teacher/profile?active_tab=group_coaching');
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
                  <DateTimePicker name="start_date" label="Start Date & Time" required />
                  <FormikSelect name="time_zone" label="Time Zone" options={TIME_ZONES} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikMultiSelect
                    name="followup_support"
                    label="Follow-up Support"
                    options={CONSULTATION_TYPES}
                    required
                  />
                  <FormikField name="duration" label="Duration" type="number" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikSelect name="event_type" label="Type" options={eventTypeOptions} required />
                  <FormikField name="price" label="Price ($)" type="number" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CategoriesField required />
                  <TagsField required />
                </div>
                <FormikSwitch name="is_online" label="Online/Offline" />
                {values?.is_online && <FormikField name="meeting_link" label="Meeting URL" required />}
                <FormikDropzone
                  name="image"
                  label="Event Image"
                  fileURLs={initialData?.image ? [initialData.image] : []}
                  required
                />
                <div className="flex justify-end items-center gap-4">
                  <Button type="button" variant="secondary" size="2xl" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" size="2xl" isLoading={isSubmitting}>
                    {isSubmitting
                      ? isEditMode
                        ? 'Updating...'
                        : 'Submitting...'
                      : isEditMode
                      ? 'Update Group Coaching'
                      : 'Submit My Group Coaching'}
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

export default GroupCoachingForm;
