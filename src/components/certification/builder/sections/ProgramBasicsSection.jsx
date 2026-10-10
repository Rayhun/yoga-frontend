'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DateTimePicker from '@/components/common/form/formik/FormikDateTimePicker';
import Button from '@/components/common/Button';
import Popup from '@/components/common/popup';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';
import useLMSCategoryOptions from '@/hooks/useLMSCategoryOptions';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';
import useReportSaveStatus from '@/components/certification/builder/useReportSaveStatus';
import BuilderStepper from '@/components/certification/builder/BuilderStepper';
import { BASICS_FOLDS, FOLD_COMPONENTS, FORMAT_FOLD_INDEX } from '@/components/certification/builder/sections/basicsFolds';

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
 * The step is shown in five short parts (About / Catalog / Media / Schedule / Format — see
 * ``basicsFolds.jsx``), never more than six inputs at a time. It is still ONE Formik form: a part only
 * changes which fields render, so values, the (whole) validation schema and the autosave payload are
 * identical whichever part is showing. ``fold`` / ``onFoldChange`` are controlled by the parent (this
 * component remounts when the draft is first created, so it can't own that state). "Next" validates
 * just the current part's fields and blocks if invalid; moving between parts flushes the pending
 * autosave first. The last part's "Continue" validates the whole step (jumping to the first part with
 * an error), flushes, then calls ``onContinue`` to reveal Step 2.
 *
 * ``formatSection`` (optional) is the separate Delivery Format section (its own form and save); it is
 * shown under the Format part and stays mounted (hidden) in the other parts.
 */
const ProgramBasicsSection = ({
  initialValues,
  onSave,
  onContinue,
  fold = 0,
  onFoldChange,
  formatSection = null,
  disabled = false,
  onStatusChange,
  anchorId,
}) => {
  const { options: categoryOptions } = useLMSCategoryOptions();
  const { notifyBlur, flush, markSaved, retry, status, errorMessage, canRetry } = useSectionAutosave(onSave);
  useReportSaveStatus(onStatusChange, { status, errorMessage, canRetry, retry });
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringIndex, setEditingRecurringIndex] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const formikRef = useRef(null);

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

  // The Formik submit handler — reached only through "Continue" (the DOM form's own submit is
  // disabled below): autosave the whole step, then hand control to the parent (reveals Step 2).
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

  const touchFields = (formik, fields) =>
    formik.setTouched({ ...formik.touched, ...Object.fromEntries(fields.map(name => [name, true])) }, false);

  // Moving to another part: going forward validates the part being left (touching its fields so the
  // errors show) and blocks if invalid; either way the pending autosave is flushed first — the first
  // flush is what creates the draft, exactly as it did on "Continue".
  const goToFold = useCallback(
    async target => {
      const formik = formikRef.current;
      if (!formik || isNavigating || target === fold || target < 0 || target > FORMAT_FOLD_INDEX) return;
      setIsNavigating(true);
      try {
        if (target > fold) {
          const errors = await formik.validateForm();
          const { fields } = BASICS_FOLDS[fold];
          touchFields(formik, fields);
          if (fields.some(name => errors[name])) return;
        }
        handleBlur(formik.values);
        await flush();
        onFoldChange?.(target);
      } catch (error) {
        toastApiError(error);
      } finally {
        setIsNavigating(false);
      }
    },
    [fold, isNavigating, handleBlur, flush, onFoldChange]
  );

  // Last part: validate the whole step; if an earlier part has an error, go there and show it.
  const continueToNextStep = useCallback(async () => {
    const formik = formikRef.current;
    if (!formik || isNavigating) return;
    setIsNavigating(true);
    try {
      const errors = await formik.validateForm();
      const firstInvalid = BASICS_FOLDS.findIndex(({ fields }) => fields.some(name => errors[name]));
      if (firstInvalid !== -1) {
        touchFields(formik, BASICS_FOLDS.flatMap(({ fields }) => fields));
        onFoldChange?.(firstInvalid);
        return;
      }
      await formik.submitForm();
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating, onFoldChange]);

  const foldSteps = BASICS_FOLDS.map(item => ({ id: item.id, label: item.title, panelId: `builder-basics-${item.id}` }));
  const FoldFields = FOLD_COMPONENTS[fold];
  const isLastFold = fold === FORMAT_FOLD_INDEX;

  return (
    <SectionCard
      anchorId={anchorId}
      title="Program Basics"
      status={status}
      errorMessage={errorMessage}
      canRetry={canRetry}
      onRetry={retry}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <BuilderStepper
          steps={foldSteps}
          currentStep={BASICS_FOLDS[fold].id}
          onSelect={id => goToFold(BASICS_FOLDS.findIndex(item => item.id === id))}
          ariaLabel="Program basics sections"
          itemLabel="Section"
        />
        <p className="text-xs font-medium text-body dark:text-gray-400">
          {fold + 1} of {BASICS_FOLDS.length}
        </p>
      </div>

      <Formik
        innerRef={formikRef}
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleContinue}
      >
        {({ values, setFieldValue }) => (
          // The DOM form never submits on its own (Enter in a lone text input, e.g. the promo video,
          // would otherwise jump to Step 2 from the middle of the step).
          <Form className="flex flex-col gap-8" onBlur={() => handleBlur(values)} onSubmit={event => event.preventDefault()}>
            <div id={foldSteps[fold].panelId} role="tabpanel" aria-labelledby={`${foldSteps[fold].panelId}-tab`}>
              <FoldFields
                values={values}
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
                disabled={disabled}
                categoryOptions={categoryOptions}
                isUploadingThumbnail={isUploadingThumbnail}
                onThumbnailDrop={handleThumbnailDrop}
                openRecurringPicker={(index, value) => {
                  setEditingRecurringIndex(index);
                  setFieldValue('recurring_picker_value', value);
                  setIsRecurringModalOpen(true);
                }}
              />
            </div>

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

      {formatSection ? <div className={isLastFold ? 'mt-8' : 'hidden'}>{formatSection}</div> : null}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-stroke pt-4 dark:border-strokedark">
        {fold > 0 ? (
          <Button type="button" variant="secondary" size="lg" disabled={isNavigating} onClick={() => goToFold(fold - 1)}>
            ← Back
          </Button>
        ) : (
          <span />
        )}
        {isLastFold ? (
          <Button type="button" size="2xl" isLoading={isNavigating} onClick={continueToNextStep}>
            Continue to Content &amp; Publish →
          </Button>
        ) : (
          <Button type="button" size="lg" isLoading={isNavigating} onClick={() => goToFold(fold + 1)}>
            Next →
          </Button>
        )}
      </div>
    </SectionCard>
  );
};

export default ProgramBasicsSection;
