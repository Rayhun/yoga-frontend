'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaRegFileImage } from 'react-icons/fa6';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikDropzone from '@/components/common/form/formik/FormikDropzone';
import { uploadLMSFile } from '@/services/private/lms';
import { toastApiError } from '@/utils/helpers';
import useLMSCategoryOptions from '@/hooks/useLMSCategoryOptions';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'career', label: 'Career' },
  { value: 'both', label: 'Career + Professional' },
  { value: 'professional', label: 'Professional' },
];

const validationSchema = Yup.object({
  title: Yup.string().trim().required('Title is required'),
  short_description: Yup.string(),
  category: Yup.mixed().nullable(),
  duration_estimate: Yup.string(),
  target_audience: Yup.string().oneOf(['career', 'professional', 'both']),
  thumbnail: Yup.string().nullable(),
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
});

/**
 * Only the fields confirmed by coach_dashboard_v9.html's Program Basics section (Title, Short
 * Description, Category, Duration Estimate, Target Learner Type), plus a thumbnail upload — not
 * in that mockup either, but flagged separately (catalog cards need an image) and added ahead of
 * Backend pass 3 rather than waiting. The backend model/serializer support more (subtitle,
 * full_description, language, promo_video, outcomes, tags) — still intentionally not exposed
 * here, same "build to what's confirmed" discipline as the Certificate Setup gap.
 *
 * Thumbnail reuses the exact public-upload pattern `ProgramForm.jsx` uses for
 * `LMS.Program.image` (`uploadLMSFile` → `POST /LMS/file/upload/` → `file_link`), not KAN-87's
 * private-document flow — this is a public catalog image, not an application document. The
 * dropzone's own Formik field (`file`) is transient/local only: upload happens immediately on
 * drop (autosave has no "submit button" moment to defer to, unlike ProgramForm.jsx), and once it
 * resolves, `thumbnail` (the field that's actually persisted) is set to the returned URL and an
 * explicit save is triggered — the same "discrete action saves immediately" treatment already
 * used for the Target Learner Type buttons below.
 *
 * ``onSave`` is create-or-update agnostic — the parent (ProgramBuilderModal) decides whether a
 * blur here calls POST /programs/ (first save, no id yet) or PATCH /programs/{id}/basics/.
 */
const ProgramBasicsSection = ({ initialValues, onSave, disabled = false }) => {
  const { options: categoryOptions } = useLMSCategoryOptions();
  const { notifyBlur, flush, markSaved, status } = useSectionAutosave(onSave);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

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
        // already a discrete, resolved action (same "explicit save" treatment described above
        // for Target Learner Type), and flushing now means a save failure lands in this
        // try/catch instead of only setting SectionCard's easy-to-miss status text.
        await flush();
      } catch (error) {
        toastApiError(error);
      } finally {
        setIsUploadingThumbnail(false);
      }
    },
    [handleBlur, flush]
  );

  return (
    <SectionCard title="Program Basics" status={status}>
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-3" onBlur={() => handleBlur(values)}>
            <FormikField name="title" label="Title" placeholder="e.g. Menopause Wellness Coach Certification" required disabled={disabled} />
            <FormikField
              name="short_description"
              label="Short Description"
              placeholder="One or two sentences learners will see on the program card"
              rows={3}
              disabled={disabled}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikSelect name="category" label="Category" placeholder="Select category" options={categoryOptions || []} disabled={disabled} />
              <FormikField name="duration_estimate" label="Duration Estimate" placeholder="e.g. 6–8 hours" disabled={disabled} />
            </div>

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
          </Form>
        )}
      </Formik>
    </SectionCard>
  );
};

export default ProgramBasicsSection;
