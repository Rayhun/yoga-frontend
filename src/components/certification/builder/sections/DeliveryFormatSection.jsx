'use client';
import React, { useCallback, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';
import useReportSaveStatus from '@/components/certification/builder/useReportSaveStatus';

const FORMAT_OPTIONS = [
  { value: 'self_paced', label: 'Self-Paced' },
  { value: 'cohort', label: 'Cohort' },
  { value: 'hybrid', label: 'Hybrid' },
];

const validationSchema = Yup.object({
  delivery_format: Yup.string().oneOf(['self_paced', 'cohort', 'hybrid']).nullable(),
  platform_name: Yup.string(),
});

/**
 * Only the fields confirmed by the mockup's Delivery Format section (Format, Platform/Host).
 * The model also has live_session_count/recordings_available/downloadables_available —
 * not exposed here yet, same "build to the mockup, not the model ceiling" discipline as Basics.
 */
const DeliveryFormatSection = ({ initialValues, onSave, disabled = false, onStatusChange, anchorId }) => {
  const { notifyBlur, markSaved, retry, status, errorMessage, canRetry } = useSectionAutosave(onSave);
  useReportSaveStatus(onStatusChange, { status, errorMessage, canRetry, retry });

  useEffect(() => {
    markSaved(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleBlur = useCallback(values => notifyBlur(values), [notifyBlur]);

  return (
    <SectionCard
      anchorId={anchorId}
      title="Delivery Format"
      subtitle="Part of Schedule & format — saves on its own."
      status={status}
      errorMessage={errorMessage}
      canRetry={canRetry}
      onRetry={retry}
    >
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values }) => (
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-4" onBlur={() => handleBlur(values)}>
            <FormikSelect name="delivery_format" label="Format" placeholder="Select format" options={FORMAT_OPTIONS} disabled={disabled} />
            <FormikField name="platform_name" label="Platform / Host" placeholder="e.g. YouTube, Vimeo" disabled={disabled} />
          </Form>
        )}
      </Formik>
    </SectionCard>
  );
};

export default DeliveryFormatSection;
