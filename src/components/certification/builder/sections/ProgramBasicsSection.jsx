'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { FaRegFileImage } from 'react-icons/fa6';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import FormikMultiSelect from '@/components/common/form/formik/FormikMultiSelect';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import Button from '@/components/common/Button';
import Popup from '@/components/common/popup';
import { ContentCatalogTagsField } from '@/components/lms/general/fields';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';
import { CONSULTATION_TYPES, TIME_ZONES } from '@/utils/constants';
import useLMSCategoryOptions from '@/hooks/useLMSCategoryOptions';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';

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

const validationSchema = Yup.object({
  title: Yup.string().trim().required('Title is required'),
  short_description: Yup.string(),
  category: Yup.mixed().nullable(),
  duration_estimate: Yup.string(),
  target_audience: Yup.string().oneOf(['career', 'professional', 'both']),
  thumbnail: Yup.string().nullable(),
  subtitle: Yup.string(),
  full_description: Yup.string(),
  level: Yup.string().nullable(),
  language: Yup.string(),
  promo_video: Yup.string().url('Must be a valid URL'),
  outcomes: Yup.string(),
  tags: Yup.array().of(Yup.number()),
  start_date: Yup.string().nullable(),
  time_zone: Yup.string().nullable(),
  event_type: Yup.string().nullable(),
  is_online: Yup.boolean(),
  meeting_link: Yup.string(),
  venue_location: Yup.string(),
  is_recurring: Yup.boolean(),
  recurring_dates: Yup.array().of(Yup.string()),
  followup_support: Yup.array(),
});

// Only these go to the backend — `file` (the dropzone's transient field, see below) is
// deliberately excluded so a raw File object never gets JSON-serialized into a PATCH body.
const toPayload = values => ({
  title: values.title,
  short_description: values.short_description,
  category: values.category,
  duration_estimate: values.duration_estimate,
  target_audience: values.target_audience,
  thumbnail: values.thumbnail,
  subtitle: values.subtitle,
  full_description: values.full_description,
  level: values.level,
  language: values.language,
  promo_video: values.promo_video,
  outcomes: values.outcomes,
  tags: values.tags || [],
  start_date: values.start_date || null,
  time_zone: values.time_zone,
  event_type: values.event_type,
  is_online: values.is_online,
  meeting_link: values.is_online ? values.meeting_link : '',
  venue_location: values.is_online ? '' : values.venue_location,
  is_recurring: values.is_recurring,
  recurring_dates: values.recurring_dates || [],
  followup_support: (values.followup_support || []).join(','),
});

/**
 * Step 1 of the two-step Program Builder (KAN-121) — "Workshop/Program-style information".
 * Three field groups:
 *
 * 1. The original confirmed Basics fields (Title, Short Description, Category, Duration
 *    Estimate, Target Learner Type, Thumbnail).
 * 2. Fields the backend model/serializer already supported but this section didn't expose yet
 *    (Subtitle, Full Description, Level, Language, Promo Video, Outcomes) — no migration
 *    needed, purely a frontend gap being closed.
 * 3. New Workshop-parity fields with no prior Program Builder equivalent (Start Date, Time
 *    Zone, Event Type, Online/Offline + Meeting Link/Venue, Recurring dates, Follow-up
 *    Support) — new columns added to `Certification.CertificationProgram` directly (KAN-121);
 *    deliberately NOT an FK/coupling to `LMS.Event` — only the field *types* are mirrored, and
 *    the interaction patterns (ToggleButtonGroup, recurring-dates popup) copy
 *    `GroupCoachingFrom.jsx`'s UI exactly, per the confirmed "style example only" interpretation.
 *
 * Program's existing single `tags` M2M + `category` FK stay as-is — not expanded to Workshop's
 * 4-dimension tag structure (culture_experience/categories/tags/languages). `tags` (feedback
 * point 9) uses `ContentCatalogTagsField` with `context="certification_program"` — a new Tag
 * registry context (see `Tag/registry.py`) scoped to what a course-level entity should offer
 * (phase/goal/modality/language required; challenge/symptom/experience/cultural/intensity/format
 * optional; a handful of demographic namespaces soft) — distinct from LMS's own `"program"`
 * context since `CertificationProgram` is a separate model in a separate app.
 *
 * Thumbnail reuses the exact public-upload pattern `ProgramForm.jsx` uses for
 * `LMS.Program.image` (`uploadLMSFile` → `POST /LMS/file/upload/` → `file_link`), not KAN-87's
 * private-document flow — this is a public catalog image, not an application document. The
 * dropzone's own Formik field (`file`) is transient/local only: upload happens immediately on
 * drop (autosave has no "submit button" moment to defer to, unlike ProgramForm.jsx), and once it
 * resolves, `thumbnail` (the field that's actually persisted) is set to the returned URL and an
 * explicit save is triggered — the same "discrete action saves immediately" treatment used for
 * Target Learner Type, Online/Offline, Recurring, and the recurring-dates list below.
 *
 * ``onSave`` is create-or-update agnostic — the parent (ProgramBuilderModal) decides whether a
 * blur here calls POST /programs/ (first save, no id yet) or PATCH /programs/{id}/basics/.
 *
 * ``onContinue`` (optional) renders a "Continue to Step 2 →" submit button — validates the step,
 * flushes any pending autosave, then hands control back to the parent to reveal Step 2. Doesn't
 * change the autosave mechanics at all (still onBlur/notifyBlur/flush exactly as shipped in
 * KAN-89/90) — this is an additional affordance on top, not a replacement.
 */
const ProgramBasicsSection = ({ initialValues, onSave, onContinue, disabled = false }) => {
  const { options: categoryOptions } = useLMSCategoryOptions();
  const { notifyBlur, flush, markSaved, status } = useSectionAutosave(onSave);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringIndex, setEditingRecurringIndex] = useState(null);

  // `recurring_picker_value` is a transient, UI-only field (the popup's date/time input) — never
  // sent to the backend (excluded from toPayload), so it's defaulted here rather than requiring
  // every caller of this section to know about it.
  const formInitialValues = { recurring_picker_value: '', tags: [], ...initialValues };

  useEffect(() => {
    markSaved(toPayload(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleBlur = useCallback(
    values => {
      notifyBlur(toPayload(values));
    },
    [notifyBlur]
  );

  const handleThumbnailDrop = useCallback(
    async (files, values, setFieldValue) => {
      const file = files?.[0];
      if (!file) return;
      // Basics' own save creates the program on its first call (see ProgramBuilderModal); with
      // no title yet that create 400s ("This field may not be blank."), and — since notifyBlur
      // only *schedules* a save 700ms out — that failure previously surfaced nowhere but a
      // small "Could not save" label, so the upload looked like it silently did nothing.
      if (!values.title?.trim()) {
        toast.error('Add a title first, then upload a thumbnail.');
        return;
      }
      setIsUploadingThumbnail(true);
      try {
        const { data } = await uploadLMSFile({ file });
        setFieldValue('thumbnail', data?.file_link);
        handleBlur({ ...values, thumbnail: data?.file_link });
        // Flush immediately rather than waiting out the usual debounce — a dropped file is
        // already a discrete, resolved action, and flushing now means a save failure lands in
        // this try/catch instead of only setting SectionCard's easy-to-miss status text.
        await flush();
      } catch (error) {
        toastApiError(error);
      } finally {
        setIsUploadingThumbnail(false);
      }
    },
    [handleBlur, flush]
  );

  const handleContinue = useCallback(
    async values => {
      try {
        handleBlur(values);
        await flush();
        onContinue?.();
      } catch (error) {
        toastApiError(error);
      }
    },
    [handleBlur, flush, onContinue]
  );

  return (
    <SectionCard title="Program Basics" status={status}>
      <Formik
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleContinue}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="flex flex-col gap-3" onBlur={() => handleBlur(values)}>
            <FormikField name="title" label="Title" placeholder="e.g. Menopause Wellness Coach Certification" required disabled={disabled} />
            <FormikField name="subtitle" label="Subtitle" placeholder="Optional short tagline" disabled={disabled} />
            <FormikField
              name="short_description"
              label="Short Description"
              placeholder="One or two sentences learners will see on the program card"
              rows={3}
              disabled={disabled}
            />
            <FormikField
              name="full_description"
              label="Full Description"
              placeholder="The complete program description shown on the program's detail page"
              rows={6}
              disabled={disabled}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikSelect name="category" label="Category" placeholder="Select category" options={categoryOptions || []} disabled={disabled} />
              <FormikSelect name="level" label="Level" placeholder="Select level" options={LEVEL_OPTIONS} disabled={disabled} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikField name="duration_estimate" label="Duration Estimate" placeholder="e.g. 6–8 hours" disabled={disabled} />
              <FormikField name="language" label="Language" placeholder="e.g. English" disabled={disabled} />
            </div>
            <FormikField name="promo_video" label="Promo Video (link)" placeholder="https://" disabled={disabled} />
            <FormikField
              name="outcomes"
              label="Outcomes"
              placeholder="One outcome per line"
              rows={3}
              disabled={disabled}
            />

            <ContentCatalogTagsField
              context="certification_program"
              name="tags"
              label="Tags"
              modalTitle="Select tags"
              triggerPlaceholder="Select tags"
              disabled={disabled}
              onChange={next => handleBlur({ ...values, tags: next })}
            />

            <FormikDropzone
              name="file"
              label={isUploadingThumbnail ? 'Thumbnail (uploading…)' : 'Thumbnail'}
              fileURLs={values.thumbnail ? [values.thumbnail] : []}
              Icon={FaRegFileImage}
              disabled={disabled || isUploadingThumbnail}
              onDrop={files => handleThumbnailDrop(files, values, setFieldValue)}
            />

            <div>
              <label className="mb-1 block font-medium text-black dark:text-white">Target Learner Type</label>
              <div className="flex flex-wrap gap-2">
                {TARGET_AUDIENCE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setFieldValue('target_audience', option.value);
                      handleBlur({ ...values, target_audience: option.value });
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      values.target_audience === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 text-gray-600 dark:border-strokedark dark:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">Controls where this program appears in learner discovery &amp; filters.</p>
            </div>

            <div className="border-t border-gray-200 dark:border-strokedark" />

            <DateTimePicker name="start_date" label="Start Date & Time" disabled={disabled} />

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
              <div className="rounded-xl border border-gray-200 dark:border-strokedark p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recurring schedule</h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={disabled}
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
                      disabled={disabled}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikSelect name="time_zone" label="Time Zone" placeholder="Select time zone" options={TIME_ZONES} disabled={disabled} />
              <FormikSelect name="event_type" label="Type" placeholder="Select type" options={EVENT_TYPE_OPTIONS} disabled={disabled} />
            </div>

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

            <FormikMultiSelect
              name="followup_support"
              label="Follow-up Support"
              options={CONSULTATION_TYPES}
              disabled={disabled}
            />

            {onContinue && (
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSubmitting} disabled={disabled}>
                  Continue to Step 2 →
                </Button>
              </div>
            )}

            <Popup
              heading="Pick recurring date & time"
              open={isRecurringModalOpen}
              onClose={() => setIsRecurringModalOpen(false)}
              size="md"
            >
              <div className="flex flex-col gap-4">
                <DateTimePicker name="recurring_picker_value" label="Date & Time" />
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
                      handleBlur({ ...values, recurring_dates: current });
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Popup>
          </Form>
        )}
      </Formik>
    </SectionCard>
  );
};

export default ProgramBasicsSection;
