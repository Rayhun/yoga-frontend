'use client';
import React from 'react';
import dayjs from 'dayjs';
import { FaRegFileImage } from 'react-icons/fa6';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import Button from '@/components/common/Button';
import { ContentCatalogTagsField } from '@/components/lms/general/fields';
import { CONSULTATION_TYPES, TIME_ZONES } from '@/utils/constants';

// Program Basics is shown in five short parts (never more than six inputs each, with every
// conditional field showing). The whole step is still ONE Formik form — a part only decides which
// fields render — so values, validation and the autosave payload never depend on the part shown.
// `fields` are the Formik field names a part owns; "Next" validates just those.
export const BASICS_FOLDS = [
  { id: 'about', title: 'About', fields: ['title', 'subtitle', 'short_description', 'full_description'] },
  {
    id: 'catalog',
    title: 'Catalog',
    fields: ['category', 'level', 'duration_estimate', 'language', 'tags', 'target_audience'],
  },
  { id: 'media', title: 'Media', fields: ['thumbnail', 'promo_video', 'outcomes'] },
  {
    id: 'schedule',
    title: 'Schedule',
    fields: ['start_date', 'time_zone', 'event_type', 'is_recurring', 'recurring_dates', 'is_online', 'meeting_link', 'venue_location'],
  },
  { id: 'format', title: 'Format', fields: ['followup_support'] },
];
export const FORMAT_FOLD_INDEX = BASICS_FOLDS.length - 1;

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'career', label: 'Career' },
  { value: 'both', label: 'Career + Professional' },
  { value: 'professional', label: 'Professional' },
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// Mirrors GroupCoachingFrom.jsx's eventTypeOptions exactly (KAN-121 Workshop-parity field) —
// this is a plain, un-choiced CharField on the model (same as LMS.Event.event_type), so the
// option set lives here on the frontend, not as backend `choices=`.
const EVENT_TYPE_OPTIONS = [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Bootcamp', value: 'bootcamp' },
  { label: 'Live Event', value: 'live event' },
  { label: 'MasterClass', value: 'masterclass' },
];

// One titled group of Basics fields, laid out on the LMS form's two-column grid (a child spans both
// columns with `md:col-span-2`).
const FieldGroup = ({ title, description, children }) => (
  <div className="flex flex-col gap-4">
    <div>
      <h3 className="text-base font-bold text-black dark:text-white">{title}</h3>
      {description ? <p className="mt-0.5 text-sm text-body">{description}</p> : null}
    </div>
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>
  </div>
);

// Each part receives the section's context: current `values`, Formik's `setFieldValue`, the
// section's autosave trigger `handleBlur(values)`, `disabled`, and the thumbnail / recurring-dates
// helpers owned by ProgramBasicsSection.

// 4 inputs.
export const AboutFold = ({ disabled }) => (
  <FieldGroup title="About the program">
    <FormikField name="title" label="Title" placeholder="e.g. Menopause Wellness Coach Certification" required disabled={disabled} />
    <FormikField name="subtitle" label="Subtitle" placeholder="Optional short tagline" disabled={disabled} />
    <div className="md:col-span-2">
      <FormikField
        name="short_description"
        label="Short Description"
        placeholder="One or two sentences learners will see on the program card"
        rows={3}
        disabled={disabled}
      />
    </div>
    <div className="md:col-span-2">
      <FormikField
        name="full_description"
        label="Full Description"
        placeholder="The complete program description shown on the program's detail page"
        rows={6}
        disabled={disabled}
      />
    </div>
  </FieldGroup>
);

// 6 inputs.
export const CatalogFold = ({ values, setFieldValue, handleBlur, disabled, categoryOptions }) => (
  <FieldGroup title="Catalog" description="Where and how learners find this program.">
    <FormikSelect name="category" label="Category" placeholder="Select category" options={categoryOptions || []} disabled={disabled} />
    <FormikSelect name="level" label="Level" placeholder="Select level" options={LEVEL_OPTIONS} disabled={disabled} />
    <FormikField name="duration_estimate" label="Duration Estimate" placeholder="e.g. 6–8 hours" disabled={disabled} />
    <FormikField name="language" label="Language" placeholder="e.g. English" disabled={disabled} />
    <ContentCatalogTagsField
      context="certification_program"
      name="tags"
      label="Tags"
      modalTitle="Select tags"
      triggerPlaceholder="Select tags"
      disabled={disabled}
      onChange={next => handleBlur({ ...values, tags: next })}
    />
    <div className="flex flex-col gap-2">
      <span id="target-audience-label" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Target Learner Type
      </span>
      <div role="group" aria-labelledby="target-audience-label" className="flex flex-wrap gap-2">
        {TARGET_AUDIENCE_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={values.target_audience === option.value}
            onClick={() => {
              setFieldValue('target_audience', option.value);
              handleBlur({ ...values, target_audience: option.value });
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
              values.target_audience === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 text-gray-600 dark:border-strokedark dark:text-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400">Controls where this program appears in learner discovery &amp; filters.</p>
    </div>
  </FieldGroup>
);

// 3 inputs.
export const MediaFold = ({ values, setFieldValue, disabled, isUploadingThumbnail, onThumbnailDrop }) => (
  <FieldGroup title="Media">
    <FormikDropzone
      name="file"
      label={isUploadingThumbnail ? 'Thumbnail (uploading…)' : 'Thumbnail'}
      fileURLs={values.thumbnail ? [values.thumbnail] : []}
      Icon={FaRegFileImage}
      disabled={disabled || isUploadingThumbnail}
      onDrop={files => onThumbnailDrop(files, values, setFieldValue)}
    />
    <div className="flex flex-col gap-4">
      <FormikField name="promo_video" label="Promo Video (link)" placeholder="https://" disabled={disabled} />
      <FormikField name="outcomes" label="Outcomes" placeholder="One outcome per line" rows={5} disabled={disabled} />
    </div>
  </FieldGroup>
);

// 6 inputs with everything showing: start date, time zone, type, the recurring toggle, the
// online/offline toggle, and the meeting link (online) or venue (offline). The recurring-dates
// list and its "Add Date & Time" button are not inputs; the date picker they open is a popup.
export const ScheduleFold = ({ values, setFieldValue, handleBlur, disabled, openRecurringPicker }) => (
  <FieldGroup title="Schedule">
    <DateTimePicker name="start_date" label="Start Date & Time" disabled={disabled} />
    <FormikSelect name="time_zone" label="Time Zone" placeholder="Select time zone" options={TIME_ZONES} disabled={disabled} />
    <FormikSelect name="event_type" label="Type" placeholder="Select type" options={EVENT_TYPE_OPTIONS} disabled={disabled} />
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Make it recurring</label>
      <ToggleButtonGroup
        value={values.is_recurring}
        exclusive
        disabled={disabled}
        onChange={(_, newValue) => {
          if (newValue === null) return;
          setFieldValue('is_recurring', newValue);
          const nextRecurringDates = newValue ? values.recurring_dates : [];
          if (!newValue) setFieldValue('recurring_dates', nextRecurringDates);
          handleBlur({ ...values, is_recurring: newValue, recurring_dates: nextRecurringDates });
        }}
        size="small"
        color="primary"
      >
        <ToggleButton value={false}>No</ToggleButton>
        <ToggleButton value={true}>Yes</ToggleButton>
      </ToggleButtonGroup>
    </div>

    {values.is_recurring && (
      <div className="md:col-span-2 rounded-xl border border-gray-200 dark:border-strokedark p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recurring schedule</h4>
          <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => openRecurringPicker(null, '')}>
            Add Date & Time
          </Button>
        </div>
        {(values.recurring_dates || []).map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {dayjs(item).isValid() ? dayjs(item).format('MMM D, YYYY h:mm A') : item}
            </p>
            <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => openRecurringPicker(index, item)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => {
                const nextRecurringDates = (values.recurring_dates || []).filter((_, i) => i !== index);
                setFieldValue('recurring_dates', nextRecurringDates);
                handleBlur({ ...values, recurring_dates: nextRecurringDates });
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    )}

    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery</label>
      <ToggleButtonGroup
        value={values.is_online}
        exclusive
        disabled={disabled}
        onChange={(_, newValue) => {
          if (newValue === null) return;
          setFieldValue('is_online', newValue);
          handleBlur({ ...values, is_online: newValue });
        }}
        size="small"
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

    {values.is_online ? (
      <FormikField
        name="meeting_link"
        label="Meeting URL"
        placeholder="Enter your meeting url e.g. Zoom, Google Meet, etc."
        disabled={disabled}
      />
    ) : (
      <FormikField name="venue_location" label="Venue Location" placeholder="Enter your venue location" disabled={disabled} />
    )}
  </FieldGroup>
);

// 1 input here; the Delivery Format section (format, platform — its own form and save) is shown
// beneath it by the section, for 3 in total.
export const FormatFold = ({ disabled }) => (
  <FieldGroup title="Format">
    <div className="md:col-span-2">
      <FormikMultiSelect name="followup_support" label="Follow-up Support" options={CONSULTATION_TYPES} disabled={disabled} />
    </div>
  </FieldGroup>
);

export const FOLD_COMPONENTS = [AboutFold, CatalogFold, MediaFold, ScheduleFold, FormatFold];
