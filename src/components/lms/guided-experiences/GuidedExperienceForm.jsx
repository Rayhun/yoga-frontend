'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import { CategoriesField, TagsField } from '@/components/lms/general/fields';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { CONSULTATION_TYPES, TIME_ZONES } from '@/utils/constants';
import queryKeys from '@/utils/query-keys';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createGuidedExperience, updateGuidedExperience } from '@/services/private/lms/guided-experiences';
import { ONE_MB } from '@/utils/general';
import { toastApiError } from '@/utils/helpers';
import useUserTimeZone from '@/hooks/useUserTimeZone';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormLayoutWrapper from '@/components/common/form/FormLayoutWrapper';

const eventTypeOptions = [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Bootcamp', value: 'bootcamp' },
  { label: 'Live Event', value: 'live event' },
  { label: 'MasterClass', value: 'masterclass' },
];

const GuidedExperienceForm = ({ selected = {}, eventType, onSuccess }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userTimeZone, mappedTimeZone } = useUserTimeZone();
  const isEditMode = Boolean(selected?.id);

  const { mutateAsync: create } = useMutation({
    mutationFn: createGuidedExperience,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: updateGuidedExperience,
  });

  const initialValues = {
    title: selected?.title || '',
    description: selected?.description || '',
    start_date: selected?.start_date || '',
    duration: selected?.duration || 0,
    time_zone: selected?.time_zone || mappedTimeZone?.value || userTimeZone,
    event_type: selected?.event_type || eventType || '',
    price: selected?.price || 0,
    is_online: selected?.is_online ?? true,
    image: null,
    meeting_link: selected?.meeting_link || '',
    categories: selected?.categories?.map(i => i.id || i) || [],
    tags: selected?.tags?.map(i => i.id || i) || [],
    followup_support: selected?.followup_support 
      ? (Array.isArray(selected.followup_support) 
          ? selected.followup_support 
          : selected.followup_support.split(','))
      : [],
    is_zoom_event: selected?.is_zoom_event || false,
    guest_name: selected?.guest_name || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Event title is required'),
    description: Yup.string().required('Description is required'),
    start_date: Yup.string().required('Start time is required'),
    duration: Yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
    time_zone: Yup.string().required('Timezone is required'),
    event_type: Yup.string().required('Event type is required'),
    followup_support: Yup.array().min(1, 'At least one consultation type is required').required(),
    meeting_link: Yup.string().when(['is_online', 'is_zoom_event'], {
      is: (is_online, is_zoom_event) => is_online && !is_zoom_event,
      then: schema => schema.required('Meeting URL is required for online meetings'),
      otherwise: schema => schema,
    }),
    price: Yup.number().required('Price is required').min(0, 'Price must be at least $0'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    guest_name: isEditMode 
      ? Yup.string() // Optional in edit mode
      : Yup.string().required('Guest name is required'), // Required when creating
    image: isEditMode
      ? Yup.mixed()
          .nullable()
          .test('hasImage', 'Image is required', function(value) {
            // In edit mode, image is valid if:
            // 1. There's an existing image (selected?.image exists), OR
            // 2. A new image file is uploaded
            const hasExistingImage = selected?.image;
            const hasNewImage = value && value !== null;
            return hasExistingImage || hasNewImage;
          })
          .test('fileSize', 'File size must be less than 10 MB', function(value) {
            if (!value || value === null) return true; // No new image uploaded, existing image will be used
            if (typeof value === 'string') return true; // Existing image URL
            return value.size <= 10 * ONE_MB;
          })
      : Yup.mixed()
          .required('Event image is required')
          .test('fileSize', 'File size must be less than 10 MB', value => {
            if (!value) return false;
            return value.size <= 10 * ONE_MB;
          }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Prepare payload
      const payload = { ...values };
      
      if (isEditMode) {
        // For update: only include image if it's a new file (not a string URL)
        if (typeof payload.image === 'string') {
          delete payload.image;
        }
        payload.is_title = true;
        
        await update({ payload, id: selected.id });
        toast.success('Guided experience updated successfully');
        await queryClient.invalidateQueries([queryKeys.guidedExperiences, eventType]);
        await queryClient.invalidateQueries([queryKeys.guidedExperiences, selected.id]);
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.back();
        }
      } else {
        // For create: ensure event_type is set
        if (!payload.event_type && eventType) {
          payload.event_type = eventType;
        }
        
        const response = await create({ payload });
        toast.success('Guided experience created successfully');
        await queryClient.invalidateQueries([queryKeys.guidedExperiences, eventType]);
        
        if (onSuccess) {
          onSuccess(response?.data?.data?.id);
        } else {
          // Navigate to the detail page of the newly created event
          const eventId = response?.data?.data?.id;
          if (eventId) {
            const eventTypePath = eventType === 'live event' ? 'live-event' : eventType;
            router.push(`/portal/admin/lms/expert/guided-experiences/${eventTypePath}/${eventId}/details`);
          } else {
            router.back();
          }
        }
      }
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
    <FormLayoutWrapper title={isEditMode ? "Edit Guided Experience" : "Add New Guided Experience"}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => {
          return (
            <Form className="flex flex-col gap-4">
              <FormikField name="title" label="Title" required />
              {!isEditMode && (
                <FormikField name="guest_name" label="Guest Name" required placeholder="Enter guest name" />
              )}
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
                <FormikField name="duration" label="Duration (minutes)" type="number" min={1} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikSelect name="event_type" label="Type" options={eventTypeOptions} required />
                <FormikField name="price" label="Price ($)" type="number" min={0} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoriesField required />
                <TagsField required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Location
                </label>
                <ToggleButtonGroup
                  value={values.is_online}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) setFieldValue('is_online', newValue);
                  }}
                  size="small"
                  itemType="button"
                  color="primary"
                >
                  {[
                    { label: 'Online', value: true },
                    { label: 'Offline', value: false },
                  ].map(opt => (
                    <ToggleButton key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>

              {values?.is_online && (
                <FormikField
                  disabled={values?.is_zoom_event}
                  name="meeting_link"
                  label="Meeting URL"
                  placeholder="Enter your meeting url eg. Zoom, Google Meet, etc."
                  required={!values?.is_zoom_event}
                />
              )}

              <div className="flex flex-col gap-2">
                <FormikDropzone
                  name="image"
                  label="Event Image"
                  fileURLs={[]}
                  required={!isEditMode && !selected?.image}
                  maxSize={10 * ONE_MB}
                />
                {isEditMode && selected?.image && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Image
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={selected.image}
                        alt="Current event image"
                        className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }} className="text-sm text-gray-500">
                        Unable to load image preview
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select a new image above to replace the current one
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center sm:justify-end items-center gap-4 flex-wrap-reverse">
                <Button type="button" variant="secondary" size="2xl" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="2xl" isLoading={isSubmitting}>
                  {isSubmitting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Update Guided Experience'
                    : 'Create Guided Experience'}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </FormLayoutWrapper>
  );
};

export default GuidedExperienceForm;

