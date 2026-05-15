'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import { CategoriesField, GuidedExperienceCatalogTagsField } from '@/components/lms/general/fields';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { CONSULTATION_TYPES, TIME_ZONES } from '@/utils/constants';
import queryKeys from '@/utils/query-keys';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createNewGroupCoaching, updateGroupCoaching } from '@/services/private/expert/groupCoaching';
import { ONE_MB } from '@/utils/general';
import { toastApiError } from '@/utils/helpers';
import useUserTimeZone from '@/hooks/useUserTimeZone';
import FormikMultiSelect from '../form/formik/FormikMultiSelect';
import Popup from '@/components/common/popup';
// import ZoomMeetingConnectionButton from '../ZoomMeetingConnectionButton';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { MdOutlineLightbulb } from 'react-icons/md';
// import { createEvent } from '@/services/private/lms/events';

const eventTypeOptions = [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Bootcamp', value: 'bootcamp' },
  { label: 'Live Event', value: 'live event' },
  { label: 'MasterClass', value: 'masterclass' },
];

const PRICE_OPTIONS = [
  { label: 'Free', value: 0 },
  { label: '$5', value: 5 },
  { label: '$10', value: 10 },
  { label: '$25', value: 25 },
  { label: '$50', value: 50 },
  { label: '$75', value: 75 },
  { label: '$100', value: 100 },
];

// const isDevelopmentEnvironment = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';

const GroupCoachingForm = ({ initialData = {}, isEditMode = false, eventId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParamUtils();
  const isZoomConnected = searchParams.get('is_zoom_connected') === 'true';

  const { userTimeZone, mappedTimeZone } = useUserTimeZone();

  const { mutateAsync: createGroupCoaching } = useMutation({
    mutationFn: createNewGroupCoaching,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: updateGroupCoaching,
  });
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringIndex, setEditingRecurringIndex] = useState(null);

  const initialValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    start_date: initialData?.start_date || '',
    duration: initialData?.duration || 0,
    time_zone: initialData?.time_zone || mappedTimeZone?.value || userTimeZone,
    event_type: initialData?.event_type || '',
    price: PRICE_OPTIONS.some(opt => opt.value === Number(initialData?.price)) ? Number(initialData.price) : 0,
    is_online: initialData?.is_online ?? true,
    image: isEditMode && initialData?.image ? initialData.image : null,
    meeting_link: initialData?.meeting_link || '',
    categories: initialData?.categories?.map(i => i.id) || [],
    tags: initialData?.tags?.map(i => i.id) || [],
    followup_support: initialData?.followup_support
      ? (Array.isArray(initialData.followup_support)
          ? initialData.followup_support
          : initialData.followup_support.split(','))
      : [],
    is_zoom_event: initialData?.is_zoom_event || false,
    is_recurring: initialData?.is_recurring || false,
    recurring_dates: Array.isArray(initialData?.recurring_dates)
      ? initialData.recurring_dates
          .map(date => (dayjs(date).isValid() ? dayjs(date).format('YYYY-MM-DDTHH:mm') : ''))
          .filter(Boolean)
      : [],
    recurring_picker_value: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Event title is required'),
    description: Yup.string().required('Description is required'),
    start_date: Yup.string()
      .required('Start time is required')
      .test(
        'not-in-past',
        'Start time cannot be in the past. Please choose current or future date/time.',
        value => !!value && dayjs(value).isValid() && !dayjs(value).isBefore(dayjs())
      ),
    is_recurring: Yup.boolean(),
    recurring_dates: Yup.array().when('is_recurring', {
      is: true,
      then: schema =>
        schema
          .of(
            Yup.string().test(
              'recurring-not-in-past',
              'Recurring date/time cannot be in the past',
              value => !!value && dayjs(value).isValid() && !dayjs(value).isBefore(dayjs())
            )
          )
          .min(1, 'At least one recurring date/time is required'),
      otherwise: schema => schema,
    }),
    duration: Yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
    time_zone: Yup.string().required('Timezone is required'),
    event_type: Yup.string().required(),
    followup_support: Yup.array().min(1, 'At least one consultation type is required').required(),
    meeting_link: Yup.string().when(['is_online', 'is_zoom_event'], {
      is: (is_online, is_zoom_event) => is_online && !is_zoom_event,
      then: schema => schema.required('Meeting URL is required for Zoom online meetings'),
      otherwise: schema => schema,
    }),
    venue_location: Yup.string().when(['is_online'], {
      is: (is_online) => !is_online,
      then: schema => schema.required('Venue location is required'),
      otherwise: schema => schema,
    }),
    price: Yup.number().required('Price is required').min(0, 'Price must be at least $0'),
    categories: Yup.array()
      .of(Yup.number().required('Required!'))
      .min(1, 'At least one category is required'),
    tags: Yup.array().of(Yup.number().required('Required!')).min(1, 'At least 1 tag is required'),
    image: isEditMode
      ? Yup.mixed()
          .nullable()
          .test('hasImage', 'Image is required', function(value) {
            const hasExistingImage = initialData?.image;
            const hasNewImage = value && value !== null && typeof value !== 'string';
            return hasExistingImage || hasNewImage;
          })
          .test('fileSize', 'File size must be less than 10 MB', function(value) {
            if (!value || value === null || typeof value === 'string') return true;
            return value.size <= 10 * ONE_MB;
          })
      : Yup.mixed()
          .required('Event image is required')
          .test('fileSize', 'File size must be less than 10 MB', value => value && value.size <= 10 * ONE_MB),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values };
      delete payload.recurring_picker_value;
      if (payload.is_recurring) {
        payload.recurring_dates = (payload.recurring_dates || [])
          .filter(Boolean)
          .map(date => dayjs(date).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'));
        if (!payload.start_date && payload.recurring_dates.length > 0) {
          payload.start_date = payload.recurring_dates[0];
        }
      } else {
        payload.recurring_dates = [];
      }
      if (isEditMode) {
        if (typeof payload.image === 'string') delete payload.image;
        await update({ payload, id: eventId });
        toast.success('Group Coaching updated successfully');
      } else {
        await createGroupCoaching({ payload });
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
          {({ isSubmitting, values, setFieldValue, errors, touched, setFieldTouched }) => {
            return (
              <Form className="flex flex-col gap-4" noValidate>
                <FormikField name="title" label="Title" required />
                <FormikField name="description" label="Description" rows={4} required />
                <DateTimePicker name="start_date" label="Start Date & Time" required />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Make it recurring</label>
                  <ToggleButtonGroup
                    value={values.is_recurring}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setFieldValue('is_recurring', newValue);
                        if (!newValue) setFieldValue('recurring_dates', []);
                      }
                    }}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value={false}>No</ToggleButton>
                    <ToggleButton value={true}>Yes</ToggleButton>
                  </ToggleButtonGroup>
                </div>

                {values.is_recurring && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recurring schedule</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingRecurringIndex(null);
                          setFieldValue('recurring_picker_value', '');
                          setIsRecurringModalOpen(true);
                        }}
                      >
                        Add Date & Time
                      </Button>
                    </div>
                    {(values.recurring_dates || []).map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-center">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {dayjs(item).isValid() ? dayjs(item).format('MMM D, YYYY h:mm A') : item}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingRecurringIndex(index);
                            setFieldValue('recurring_picker_value', item);
                            setIsRecurringModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setFieldValue(
                              'recurring_dates',
                              (values.recurring_dates || []).filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {touched?.recurring_dates && errors?.recurring_dates && (
                      <p className="text-sm text-red-500">
                        {typeof errors.recurring_dates === 'string'
                          ? errors.recurring_dates
                          : 'Please fix recurring date/time values'}
                      </p>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikSelect name="time_zone" label="Time Zone" options={TIME_ZONES} required />
                  <FormikField name="duration" label="Duration (minutes)" type="number" min={1} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikMultiSelect
                    name="followup_support"
                    label="Follow-up Support"
                    options={CONSULTATION_TYPES}
                    required
                  />
                  <FormikSelect name="event_type" label="Type" options={eventTypeOptions} required />
                </div>

                {/* PRICING */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Pricing
                  </h3>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-3 py-2.5 flex gap-2.5">
                    <MdOutlineLightbulb className="w-5 h-5 flex-shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      Have a Guided Experience you&apos;d price above $100? Break it into smaller, bite-size sessions — your clients will love the flexibility, and you&apos;ll reach more of them.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 after:content-['*'] after:text-red-500 after:ml-1">
                      Select your price
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_OPTIONS.map((opt) => {
                        const isSelected = Number(values.price) === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setFieldValue('price', opt.value); setFieldTouched('price', true); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border shadow-sm ${
                              isSelected
                                ? 'bg-green-600 border-green-600 text-white shadow-md ring-2 ring-green-600/20'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {touched?.price && errors?.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CategoriesField required />
                  <GuidedExperienceCatalogTagsField required />
                </div>
                {/* <FormikSwitch name="is_online" label="Is Online Event?" /> */}
                {/* <FormikRadioGroup
                  name="is_online"
                  label="Event Type"
                  options={[
                    { label: 'Online', value: true },
                    { label: 'Offline', value: false },
                  ]}
                  required
                /> */}

                <ToggleButtonGroup
                  value={values.is_online}
                  exclusive
                  onChange={(_, newValue) => {
                    // only set when the button actually changes
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

                {values?.is_online ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <FormikField
                      disabled={values?.is_zoom_event}
                      name="meeting_link"
                      label="Meeting URL"
                      placeholder="Enter your meeting url eg. Zoom, Google Meet, etc."
                      required
                    />
                    {/* {isDevelopmentEnvironment ? (
                      isZoomConnected ? (
                        <FormikSwitch name="is_zoom_event" label="Zoom Meeting" />
                      ) : (
                        <div className="mt-4">
                          <ZoomMeetingConnectionButton />
                        </div>
                      )
                    ) : null} */}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <FormikField disabled={values?.venue_location} name="venue_location" label="Venue Location" placeholder="Enter your venue location" required />
                  </div>
                )}
                <FormikDropzone
                  name="image"
                  label="Event Image"
                  fileURLs={initialData?.image ? [initialData.image] : []}
                  required
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
                      ? 'Update Guided Experience'
                      : 'Submit Guided Experience'}
                  </Button>
                </div>
                <Popup
                  heading="Pick recurring date & time"
                  open={isRecurringModalOpen}
                  onClose={() => setIsRecurringModalOpen(false)}
                  size="md"
                >
                  <div className="flex flex-col gap-4">
                    <DateTimePicker name="recurring_picker_value" label="Date & Time" required />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setIsRecurringModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          const picked = values.recurring_picker_value;
                          if (!picked) return;
                          const current = [...(values.recurring_dates || [])];
                          if (editingRecurringIndex === null) {
                            current.push(picked);
                          } else {
                            current[editingRecurringIndex] = picked;
                          }
                          setFieldValue('recurring_dates', current);
                          setFieldValue('recurring_picker_value', '');
                          setEditingRecurringIndex(null);
                          setIsRecurringModalOpen(false);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default GroupCoachingForm;
