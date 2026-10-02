'use client';
import React, { useCallback, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';

const validationSchema = Yup.object({
  certificate_title: Yup.string(),
  expiry_period_days: Yup.number().min(0, 'Must be 0 or more days').nullable(),
  completion_rules: Yup.string(),
  primary_issuer_name: Yup.string(),
});

// Same fix as PricingSection: FormikField type="number" leaves an empty field as '', and DRF's
// PositiveIntegerField rejects '' outright rather than treating it as null.
const toPayload = values => ({
  certificate_title: values.certificate_title,
  expiry_period_days: values.expiry_period_days === '' ? null : values.expiry_period_days,
  completion_rules: values.completion_rules,
  primary_issuer_name: values.primary_issuer_name,
});

/**
 * The mockup's 3 fields (Certificate Title, Certificate Validity, Completion Rule) plus Issuer
 * Name (`primary_issuer_name`) — not in the mockup either, but required for Publish (backend
 * pass 3's completeness check) and with no other field anywhere to collect it, so it's added
 * here rather than leaving the builder unable to publish anything. Still not the full
 * co-branding block (co-issuer name/signature/logo, primary signature image, template picker) —
 * those stay flagged separately, backend already supports them, not built here.
 *
 * ``initialValues.primary_issuer_name`` defaults to the creator's own name (Expert.public_name /
 * Institution.legal_organization_name, resolved server-side as `creator_display_name` — see
 * ProgramBuilderModal) when nothing's been saved yet, but stays freely editable.
 *
 * One mismatch worth knowing about: the mockup's "Certificate Validity" field is free text
 * ("e.g. 2 years, or Lifetime"), but the backend model stores it as `expiry_period_days` (a
 * plain integer). This renders it as a numeric days input rather than inventing a "2 years" →
 * days parser that was never confirmed — "Lifetime" maps naturally (leave blank = never
 * expires), but a creator typing "2 years" has to convert to "730" themselves. Worth flagging
 * to the client, not silently working around.
 */
const CertificateSetupSection = ({ initialValues, onSave, disabled = false }) => {
  const { notifyBlur, markSaved, status } = useSectionAutosave(onSave);

  useEffect(() => {
    markSaved(toPayload(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleBlur = useCallback(values => notifyBlur(toPayload(values)), [notifyBlur]);

  return (
    <SectionCard title="Certificate Setup" status={status}>
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values }) => (
          <Form className="flex flex-col gap-3" onBlur={() => handleBlur(values)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikField name="certificate_title" label="Certificate Title" placeholder="e.g. Menopause Wellness Coach Certification" disabled={disabled} />
              <FormikField
                type="number"
                name="expiry_period_days"
                label="Certificate Validity (days)"
                placeholder="Leave blank for lifetime / never expires"
                disabled={disabled}
              />
            </div>
            <FormikField
              name="primary_issuer_name"
              label="Issuer Name"
              placeholder="e.g. your name or organization, as it should appear on the certificate"
              disabled={disabled}
            />
            <FormikField
              name="completion_rules"
              label="Completion Rule"
              placeholder="e.g. All 6 modules + final assessment"
              rows={2}
              disabled={disabled}
            />
          </Form>
        )}
      </Formik>
    </SectionCard>
  );
};

export default CertificateSetupSection;
