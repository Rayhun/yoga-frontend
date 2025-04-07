'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import { TagsField } from '@/components/lms/general/fields';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
// import { createEvent } from '@/services/private/lms/events';

const recurrenceOptions = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const eventTypeOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
];

const EventForm = ({ initialData = {}, isEdit = false }) => {
  const router = useRouter();

  const initialValues = {
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    start_time: initialData.start_time || '',
    end_time: initialData.end_time || '',
    timezone: initialData.timezone || '',
    recurrence: initialData.recurrence || 'none',
    type: initialData.type || 'free',
    price: initialData.price || '',
    capacity: initialData.capacity || '',
    zoom_integration: initialData.zoom_integration || false,
    zoom_meeting_id: initialData.zoom_meeting_id || '',
    host: initialData.host || '',
    image: null,
    tags: initialData.tags || [],
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Event title is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    start_time: Yup.string().required('Start time is required'),
    end_time: Yup.string().required('End time is required'),
    timezone: Yup.string().required('Timezone is required'),
    type: Yup.string().required(),
    price: Yup.number().when('type', {
      is: 'paid',
      then: Yup.number().required('Price is required for paid events'),
      otherwise: Yup.number().notRequired(),
    }),
    capacity: Yup.number().required('Capacity is required'),
    zoom_meeting_id: Yup.string(),
    host: Yup.string(),
    tags: Yup.array().of(Yup.string()),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createEvent(values);
      toast.success('Event saved successfully');
      router.push('/portal/teacher/events');
    } catch (error) {
      toast.error('Error saving event');
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
          {({ isSubmitting, values }) => (
            <Form className="flex flex-col gap-4">
              <FormikField name="title" label="Event Title" required />
              <FormikField name="description" label="Description" rows={4} required />
              <FormikField name="category" label="Category" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePicker name="start_time" label="Start Date & Time" required />
                <DateTimePicker name="end_time" label="End Date & Time" required />
              </div>
              <FormikField name="timezone" label="Time Zone" required />
              <FormikSelect name="recurrence" label="Recurrence" options={recurrenceOptions} />
              <FormikSelect name="type" label="Event Type" options={eventTypeOptions} required />
              {values.type === 'paid' && (
                <FormikField name="price" label="Price" type="number" required />
              )}
              <FormikField name="capacity" label="Capacity" type="number" required />
              <FormikSwitch name="zoom_integration" label="Zoom Integration" />
              {values.zoom_integration && (
                <FormikField name="zoom_meeting_id" label="Zoom Meeting ID" disabled />
              )}
              <FormikField name="host" label="Host (auto-filled)" disabled />
              <FormikDropzone name="image" label="Event Image" />
              <TagsField name="tags" label="Tags" placeholder="Add tags..." />
              <div className="flex gap-2 justify-end">
                <Button type="submit" isLoading={isSubmitting}>
                  {isEdit ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EventForm;
